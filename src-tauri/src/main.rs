// 在 release 构建中隐藏控制台（命令行）窗口，以 GUI 模式运行
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // 设置 panic hook，确保崩溃信息能被捕获
    std::panic::set_hook(Box::new(|info| {
        let msg = if let Some(s) = info.payload().downcast_ref::<&str>() {
            s.to_string()
        } else if let Some(s) = info.payload().downcast_ref::<String>() {
            s.clone()
        } else {
            "Unknown panic".to_string()
        };

        let location = info
            .location()
            .map(|l| format!("{}:{}:{}", l.file(), l.line(), l.column()))
            .unwrap_or_else(|| "unknown location".to_string());

        let full_msg = format!("[SKYXING PANIC] at {}: {}", location, msg);
        eprintln!("{}", full_msg);

        // 写入日志文件
        if let Ok(mut path) = std::env::current_exe() {
            path.set_file_name("skyxing_crash.log");
            let _ = std::fs::write(&path, &full_msg);
            eprintln!("[SKYXING] Crash log written to: {:?}", path);
        }
    }));

    println!("[SKYXING] Application starting...");
    skyxing_lib::run();
    println!("[SKYXING] Application exited normally.");
}
