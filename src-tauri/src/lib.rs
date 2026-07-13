#[cfg(desktop)]
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    println!("[SKYXING] Initializing Tauri builder...");

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|_app| {
            println!("[SKYXING] Setup phase started");

            #[cfg(desktop)]
            {
                // 列出所有可用窗口
                let window_labels: Vec<String> = _app
                    .webview_windows()
                    .keys()
                    .cloned()
                    .collect();
                println!("[SKYXING] Available webview windows: {:?}", window_labels);

                // 尝试获取 "main" 窗口
                match _app.get_webview_window("main") {
                    Some(window) => {
                        println!("[SKYXING] Found 'main' window, configuring...");

                        // 设置窗口标题
                        if let Err(e) = window.set_title("SkyXing") {
                            eprintln!("[SKYXING] Failed to set window title: {}", e);
                        }

                        // 确保窗口可见
                        if let Err(e) = window.show() {
                            eprintln!("[SKYXING] Failed to show window: {}", e);
                        }

                        // 将窗口置于前台
                        if let Err(e) = window.set_focus() {
                            eprintln!("[SKYXING] Failed to focus window: {}", e);
                        }

                        println!("[SKYXING] Window configured successfully");
                    }
                    None => {
                        eprintln!("[SKYXING] ERROR: 'main' window not found!");
                        eprintln!("[SKYXING] Available windows: {:?}", window_labels);

                        // 尝试获取第一个可用窗口作为后备
                        if let Some(label) = window_labels.first() {
                            eprintln!("[SKYXING] Falling back to window: {}", label);
                            if let Some(window) = _app.get_webview_window(label) {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        } else {
                            eprintln!("[SKYXING] CRITICAL: No windows available at all!");
                        }
                    }
                }
            }

            println!("[SKYXING] Setup phase completed");
            Ok(())
        })
        .on_window_event(|window, event| {
            match event {
                tauri::WindowEvent::Destroyed => {
                    println!("[SKYXING] Window destroyed: {}", window.label());
                }
                tauri::WindowEvent::CloseRequested { api, .. } => {
                    println!("[SKYXING] Window close requested: {}", window.label());
                    // 不阻止关闭
                    let _ = api;
                }
                tauri::WindowEvent::Focused(focused) => {
                    println!("[SKYXING] Window {} focus: {}", window.label(), focused);
                }
                _ => {}
            }
        });

    println!("[SKYXING] Starting Tauri event loop...");

    let context = tauri::generate_context!();
    println!("[SKYXING] Context generated, app identifier: {:?}", context.config().identifier);

    builder
        .run(context)
        .expect("error while running tauri application");

    println!("[SKYXING] Tauri event loop ended");
}
