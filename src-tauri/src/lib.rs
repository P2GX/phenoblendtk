
use tauri::{AppHandle, Emitter, Runtime, WindowEvent};
use tauri_plugin_dialog::{DialogExt};
use std::{collections::HashMap, fs, sync::{Arc, Mutex}};
use tauri_plugin_fs::{init};

struct AppState {
    phenoboard: Mutex<String>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState {
        phenoboard: Mutex::new(String::new()),
    });

    tauri::Builder::default()
        .manage(app_state)
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(init())     
        .invoke_handler(tauri::generate_handler![
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

