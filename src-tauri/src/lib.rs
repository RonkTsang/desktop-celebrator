// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn set_ignore_cursor_events(window: tauri::Window, ignore: bool) -> Result<(), String> {
    window.set_ignore_cursor_events(ignore).map_err(|e| e.to_string())
}

mod server;

mod git_utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            server::start_server(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_ignore_cursor_events, git_utils::install_git_hooks])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
