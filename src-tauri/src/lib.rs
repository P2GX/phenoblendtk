pub mod phenoblend;

mod hpoa;
mod hpo;
mod model;
mod blend;
mod util;
use serde::{self,Serialize};

use fenominal::OntologyMatch;
use fenominal::FenominalSentence;
use ga4ghphetools::dto::hpo_term_dto::HpoTermDuplet;
use ga4ghphetools::tauri::models::HierarchyMapItem;
use ontolius::ontology::OntologyTerms;
use tauri::{AppHandle, Emitter, WindowEvent};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use ga4ghphetools::tauri::{pick_file_and_process, load_ontology, OntologyLoadEvent};
use phenopackets::schema::v2::Phenopacket;

use crate::blend::dto::UpsetPlotPayload;
use crate::blend::dto::SpreadPlotPayload;
use crate::{blend::dto::PresenceMatrixPayload, phenoblend::PhenoblendSingleton};
use crate::model::status::InitializationStatusDto;
use crate::hpoa::disease_model::GeneDiseaseAssociation;


struct AppState {
    phenoblendtk: Mutex<PhenoblendSingleton>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState {
        phenoblendtk: Mutex::new(PhenoblendSingleton::new()),
    });

    tauri::Builder::default()
        .manage(app_state)
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())     
        .invoke_handler(tauri::generate_handler![
            autocomplete_gene_symbol,
            check_initialization_status,
            get_hpo_autocomplete,
            get_hpo_modifiers,
            get_hpo_parent_and_children_terms,
            get_overlap_plot,
            get_spread_plot_payload,
            get_upset_plot_payload,
            ingest_phenopacket,
            load_hpo,
            load_hpoas,
            load_gene_disease_associations,
            mine_clinical_text,
            perform_hpo_autocomplete
        ])
        .setup(|app| {
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                window.emit("close-requested", ()).unwrap_or_default();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}




#[tauri::command]
fn ingest_phenopacket(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
    ppkt: String
) -> Result<(), String> {
    let state_handle = state.inner().clone();
    let mut singleton = state_handle.phenoblendtk.lock().unwrap();
    let _ = app.emit("ppkt-load-event", OntologyLoadEvent::loading());
    let mut json_value: serde_json::Value = serde_json::from_str(&ppkt)
        .map_err(|e| format!("Invalid JSON syntax structure: {}", e))?;
    // 2. Safely inject the missing field into the vitalStatus block if it exists
    if let Some(subject) = json_value.get_mut("subject") {
        if let Some(vital_status) = subject.get_mut("vitalStatus") {
            if vital_status.get("survivalTimeInDays").is_none() {
                // Insert a fallback integer value to satisfy the strict parser
                vital_status["survivalTimeInDays"] = serde_json::Value::from(0);
            }
        }
    }

    // 3. Now convert the sanitized JSON value into the official Phenopacket type
    let phenopacket: Phenopacket = serde_json::from_value(json_value)
        .map_err(|e| format!("Phenopacket Schema validation error: {}", e))?;
    singleton.ingest_ppkt(phenopacket)?;
    Ok(())
}
/// Load the Human Phenotype Ontology (HPO)
#[tauri::command]
async fn load_hpo(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let state_handle = state.inner().clone();
    let _ = app.emit("hpo-load-event", OntologyLoadEvent::loading());
    pick_file_and_process(app, "hpo-load-event", move |hpo_json_path, app_handle| async move {
        match load_ontology(&hpo_json_path) {
            Ok(ontology) => {
                let mut singleton = state_handle.phenoblendtk.lock().unwrap();
                let n_terms = ontology.len();
                singleton.set_hpo(ontology, &hpo_json_path);
                let _ = app_handle.emit(
                    "hpo-load-event", 
                    OntologyLoadEvent::success("HPO loaded".to_string(), n_terms)
                );
            },
            Err(e) => { 
                let _ = app_handle.emit("hpo-load-event", OntologyLoadEvent::error(e.to_string()));
            }
        }
    });

    Ok(())
}


#[tauri::command]
async fn load_hpoas(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
 let state_handle = state.inner().clone();
    let _ = app.emit("maxo-load-event", OntologyLoadEvent::loading());
    pick_file_and_process(app, "hpoa-load-event", move |hpoa_path, app_handle| async move {
        match crate::hpoa::hpoa_ingest::load_hpoa_d(&hpoa_path) {
            Ok(disease_model_map) => {
                let mut singleton = state_handle.phenoblendtk.lock().unwrap();
                let n_terms = disease_model_map.len();
                singleton.set_hpoa_d(disease_model_map, &hpoa_path);
                let _ = app_handle.emit(
                    "hpoa-load-event", 
                    OntologyLoadEvent::success("HPOAs loaded".to_string(), n_terms)
                );
            },
            Err(e) => { 
                let _ = app_handle.emit("hpoa-load-event", OntologyLoadEvent::error(e.to_string()));
            }
        }
    });

    Ok(())
}


#[tauri::command]
async fn load_gene_disease_associations(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
 let state_handle = state.inner().clone();
    let _ = app.emit("g2d-load-event", OntologyLoadEvent::loading());
    pick_file_and_process(app, "g2d-load-event", move |g2d_path, app_handle| async move {
        match crate::hpoa::gene_to_disease::load_gene_disease_associations(&g2d_path) {
            Ok(g2d) => {
                let mut singleton = state_handle.phenoblendtk.lock().unwrap();
                let n_terms = g2d.len();
                singleton.set_gene_to_disease(g2d, &g2d_path);
                let _ = app_handle.emit(
                    "g2d-load-event", 
                    OntologyLoadEvent::success("gene to disease loaded".to_string(), n_terms)
                );
                println!("emitting g2d");
            },
            Err(e) => { 
                let _ = app_handle.emit("g2d-load-event", OntologyLoadEvent::error(e.to_string()));
            }
        }
    });

    Ok(())
}

#[tauri::command]
fn get_overlap_plot(
    state: tauri::State<'_, Arc<AppState>>,
    annotations: HashMap<String, Vec<GeneDiseaseAssociation>>
) -> Result<PresenceMatrixPayload, String> {
    let state_handle = state.inner().clone();
    let mut singleton = state_handle.phenoblendtk.lock().map_err(|e| e.to_string())?;
    singleton.calculate_presence_matrix(annotations)
}

#[tauri::command]
fn get_upset_plot_payload(
    state: tauri::State<'_, Arc<AppState>>,
    annotations: HashMap<String, Vec<GeneDiseaseAssociation>>
) -> Result<UpsetPlotPayload, String> {
     let state_handle = state.inner().clone();
    let mut singleton = state_handle.phenoblendtk.lock().map_err(|e| e.to_string())?;
    singleton.get_upset_plot_payload(annotations)
}

#[tauri::command]
fn get_spread_plot_payload( state: tauri::State<'_, Arc<AppState>>,
    annotations: HashMap<String, Vec<GeneDiseaseAssociation>>
) -> Result<SpreadPlotPayload, String> {
     let state_handle = state.inner().clone();
    let mut singleton = state_handle.phenoblendtk.lock().map_err(|e| e.to_string())?;
    singleton.get_spread_plot_payload(annotations)
  }


/// This function supplies the autocompletion candidates for angular for the HPO
/// The JavaScript ensures that query is at least 3 letters
#[tauri::command]
fn get_hpo_autocomplete(
    state: tauri::State<'_, Arc<AppState>>,
    query: String
) -> Vec<OntologyMatch> {
    let singleton = match state.phenoblendtk.lock() {
        Ok(s) => s,
        Err(_) => return vec![],
    };

    // If query is too short, don't even bother searching
    if query.len() < 3 {
        return vec![];
    }
    singleton.search_hpo(&query, 20)
}

#[tauri::command]
async fn mine_clinical_text(
    state: tauri::State<'_, Arc<AppState>>,
    text: String,
) -> Result<Vec<FenominalSentence>, String> {
    let singleton = match state.phenoblendtk.lock() {
        Ok(s) => s,
        Err(_) => return Err("Failed to acquire application state lock".to_string()),
    };
    singleton
        .mine_clinical_text(&text)
}


#[tauri::command]
async fn check_initialization_status(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<InitializationStatusDto, String> {
    let singleton = state.phenoblendtk.lock()
        .map_err(|_| "Failed to lock state".to_string())?;

    Ok(InitializationStatusDto {
        hpo_loaded: singleton.hpo.is_some(),
        hpo_terms: singleton.hpo.as_ref().map(|h| h.len()).unwrap_or(0), // adjust based on your ontology structure length method
        hpoa_loaded: singleton.omim_disease_models.is_some(),
        hpoa_diseases: singleton.omim_disease_models.as_ref().map(|m| m.len()).unwrap_or(0),
        g2d_loaded: singleton.gene_to_disease_d.is_some(),
        n_genes: singleton.gene_to_disease_d.as_ref().map(|g| g.len()).unwrap_or(0),
    })
}



#[tauri::command]
async fn get_hpo_parent_and_children_terms(
    state: tauri::State<'_, Arc<AppState>>,
    term_id: &str,
) -> Result<HierarchyMapItem, String> {
    let singleton = state.phenoblendtk.lock()
        .map_err(|_| "Failed to lock state".to_string())?;
    singleton.get_hpo_parent_and_children_terms(term_id)
}

/// format matching the TypeScript `HpoTermMinimal` interface in ng-hpo-uikit.
#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HpoTermMinimalDto {
    pub term_id: String,
    pub label: String,
}

impl From<HpoTermDuplet> for HpoTermMinimalDto {
    fn from(d: HpoTermDuplet) -> Self {
        HpoTermMinimalDto {
            term_id: d.hpo_id,
            label: d.hpo_label,
        }
    }
}

#[tauri::command]
async fn get_hpo_modifiers(
    state: tauri::State<'_, Arc<AppState>>
) -> Result<Vec<HpoTermMinimalDto>, String> {
    let singleton = state.phenoblendtk.lock()
        .map_err(|_| "Failed to lock state".to_string())?;
    let duplets = singleton.get_modifiers()?;

    Ok(duplets.into_iter().map(HpoTermMinimalDto::from).collect())
}




#[tauri::command]
async fn perform_hpo_autocomplete(state: tauri::State<'_, Arc<AppState>>, query: String) -> Result<Vec<OntologyMatch>, String> {
    let singleton = state.phenoblendtk.lock()
        .map_err(|_| "Failed to lock state".to_string())?;
    singleton.perform_hpo_autocomplete(query)
}


#[tauri::command]
async fn autocomplete_gene_symbol(
    state: tauri::State<'_, Arc<AppState>>,
    query: &str,
) -> Result<Vec<GeneDiseaseAssociation>, String> {
    let singleton = state.phenoblendtk.lock()
        .map_err(|_| "Failed to lock state".to_string())?;
    let limit = 20;
    singleton.autocomplete_gene_symbol(query, limit)
}