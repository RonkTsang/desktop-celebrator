use std::fs;
use std::process::Command;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn install_git_hooks(app: AppHandle) -> Result<String, String> {
    let home_dir = app.path().home_dir().map_err(|e| e.to_string())?;
    let hooks_dir = home_dir.join(".celebrator").join("hooks");

    fs::create_dir_all(&hooks_dir).map_err(|e| e.to_string())?;

    let hook_path = hooks_dir.join("post-commit");
    let script = r#"#!/bin/sh
# Desktop Celebrator Hook
(curl -s -X POST http://127.0.0.1:23333/trigger \
    -H "Content-Type: application/json" \
    -d '{"type": "success"}' > /dev/null &)
"#;

    fs::write(&hook_path, script).map_err(|e| e.to_string())?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&hook_path).map_err(|e| e.to_string())?.permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&hook_path, perms).map_err(|e| e.to_string())?;
    }

    // Configure git global hooks path
    let output = Command::new("git")
        .args(&["config", "--global", "core.hooksPath", hooks_dir.to_str().unwrap()])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok("Git hooks installed successfully".to_string())
}
