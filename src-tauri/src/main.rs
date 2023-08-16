// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;

fn main() {
    std::env::set_var("GDK_BACKEND", "x11");

    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
