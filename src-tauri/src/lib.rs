pub mod phenoblend;
pub mod errors;
mod hpoa;


use ontolius::ontology::OntologyTerms;
use tauri::{AppHandle, Emitter, Runtime, WindowEvent};
use tauri_plugin_dialog::{DialogExt};
use std::{collections::HashMap, fs, sync::{Arc, Mutex}};
use tauri_plugin_fs::{init};
use ga4ghphetools::tauri::{pick_file_and_process, load_ontology, OntologyLoadEvent};
use crate::{hpoa::disease_model, phenoblend::PhenoblendSingleton};

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
            load_hpo,
            load_hpoas
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

