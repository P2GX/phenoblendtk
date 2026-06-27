pub mod phenoblend;
pub mod errors;
mod hpoa;
mod hpo;
mod model;
mod blend;


use ontolius::ontology::OntologyTerms;
use tauri::{AppHandle, Emitter, Runtime, WindowEvent};
use std::sync::{Arc, Mutex};
use ga4ghphetools::tauri::{pick_file_and_process, load_ontology, OntologyLoadEvent};
use phenopackets::schema::v2::Phenopacket;

use crate::{blend::dto::PresenceMatrixPayload, phenoblend::PhenoblendSingleton};

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
            get_presence_matrix,
            ingest_phenopacket,
            load_hpo,
            load_hpoas,
            load_gene_disease_associations
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
    payload: String
) -> Result<(), String> {
    let state_handle = state.inner().clone();
    let mut singleton = state_handle.phenoblendtk.lock().unwrap();
    let _ = app.emit("ppkt-load-event", OntologyLoadEvent::loading());
    let mut json_value: serde_json::Value = serde_json::from_str(&payload)
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
            Err(_) => { 
                let _ = app_handle.emit("hpo-load-event", OntologyLoadEvent::cancel());
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
                singleton.set_hpoa_d(disease_model_map);
                let _ = app_handle.emit(
                    "hpoa-load-event", 
                    OntologyLoadEvent::success("HPOAs loaded".to_string(), n_terms)
                );
            },
            Err(_) => { 
                let _ = app_handle.emit("hpoa-load-event", OntologyLoadEvent::cancel());
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
    pick_file_and_process(app, "g2d-load-event", move |hpoa_path, app_handle| async move {
        match crate::hpoa::gene_to_disease::load_gene_disease_associations(&hpoa_path) {
            Ok(g2d) => {
                let mut singleton = state_handle.phenoblendtk.lock().unwrap();
                let n_terms = g2d.len();
                singleton.set_gene_to_disease(g2d);
                let _ = app_handle.emit(
                    "g2d-load-event", 
                    OntologyLoadEvent::success("gene to disease loaded".to_string(), n_terms)
                );
            },
            Err(_) => { 
                let _ = app_handle.emit("g2d-load-event", OntologyLoadEvent::cancel());
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn get_presence_matrix(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<PresenceMatrixPayload, String> {
    let state_handle = state.inner().clone();
    let mut singleton = state_handle.phenoblendtk.lock().unwrap();
    singleton.calculate_presence_matrix()
}