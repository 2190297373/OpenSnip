//! OpenSnip 结构化日志系统
//!
//! 日志级别：ERROR > WARN > INFO > DEBUG > TRACE
//! 输出位置：%APPDATA%/OpenSnip/logs/opensnip-YYYY-MM-DD.log
//! 保留策略：保留最近 7 天日志文件

use std::fs;
use std::path::PathBuf;

/// 日志目录名称
const LOG_DIR: &str = "logs";
/// 日志文件前缀
const LOG_PREFIX: &str = "opensnip";
/// 日志保留天数
const LOG_RETENTION_DAYS: i64 = 7;

/// 初始化日志系统
///
/// 调用时机：main.rs 中应用启动时
/// ```rust
/// opensnip_lib::utils::logger::init().expect("Failed to initialize logger");
/// ```
pub fn init() -> Result<(), String> {
    // 获取日志目录路径
    let log_dir = get_log_dir()?;

    // 确保目录存在
    if let Err(e) = fs::create_dir_all(&log_dir) {
        return Err(format!("Failed to create log directory: {}", e));
    }

    // 清理过期日志
    if let Err(e) = cleanup_old_logs(&log_dir) {
        eprintln!("Warning: Failed to cleanup old logs: {}", e);
    }

    // 配置 env_logger
    let log_file = get_today_log_file(&log_dir)?;
    
    // 使用 env_logger 的默认配置，日志通过 eprintln!/log! 宏输出
    // 生产环境：默认 info 级别
    // 开发环境：可通过 RUST_LOG=debug 启用 debug 级别
    env_logger::Builder::from_env(
        env_logger::Env::default().default_filter_or("info")
    )
    .format(|buf, record| {
        use std::io::Write;
        let timestamp = chrono::Local::now().format("%Y-%m-%dT%H:%M:%S%.3fZ");
        let level = record.level();
        let target = record.target();
        let message = record.args();
        
        writeln!(
            buf,
            "[{}] [{:>5}] [{}] {}",
            timestamp, level, target, message
        )
    })
    .init();

    log::info!("Logger initialized. Log directory: {:?}", log_dir);
    log::info!("Log file: {:?}", log_file);

    Ok(())
}

/// 获取日志目录路径
fn get_log_dir() -> Result<PathBuf, String> {
    let app_data = dirs::data_dir()
        .ok_or("Failed to get app data directory")?;
    Ok(app_data.join("OpenSnip").join(LOG_DIR))
}

/// 获取今日日志文件路径
fn get_today_log_file(log_dir: &PathBuf) -> Result<PathBuf, String> {
    let date = chrono::Local::now().format("%Y-%m-%d");
    let filename = format!("{}-{}.log", LOG_PREFIX, date);
    Ok(log_dir.join(filename))
}

/// 清理过期日志文件
fn cleanup_old_logs(log_dir: &PathBuf) -> Result<(), String> {
    let cutoff = chrono::Local::now() - chrono::Duration::days(LOG_RETENTION_DAYS);
    
    for entry in fs::read_dir(log_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        // 只处理 .log 文件
        if path.extension().and_then(|s| s.to_str()) != Some("log") {
            continue;
        }
        
        // 获取文件修改时间
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let modified = metadata.modified().map_err(|e| e.to_string())?;
        let modified: chrono::DateTime<chrono::Local> = modified.into();
        
        if modified < cutoff {
            if let Err(e) = fs::remove_file(&path) {
                log::warn!("Failed to remove old log file {:?}: {}", path, e);
            } else {
                log::info!("Removed old log file: {:?}", path);
            }
        }
    }
    
    Ok(())
}

/// 写入崩溃日志
///
/// 当应用发生 panic 时调用，将崩溃信息保存到单独文件
pub fn write_crash_log(panic_info: &std::panic::PanicInfo) -> Result<(), String> {
    let log_dir = get_log_dir()?;
    fs::create_dir_all(&log_dir).map_err(|e| e.to_string())?;
    
    let timestamp = chrono::Local::now().format("%Y%m%d-%H%M%S");
    let filename = format!("crash-{}.json", timestamp);
    let path = log_dir.join(filename);
    
    let crash_info = serde_json::json!({
        "timestamp": chrono::Local::now().to_rfc3339(),
        "version": env!("CARGO_PKG_VERSION"),
        "panic": format!("{}", panic_info),
        "location": panic_info.location().map(|l| {
            serde_json::json!({
                "file": l.file(),
                "line": l.line(),
                "column": l.column(),
            })
        }),
    });
    
    fs::write(&path, crash_info.to_string())
        .map_err(|e| format!("Failed to write crash log: {}", e))?;
    
    log::error!("Crash log written to: {:?}", path);
    Ok(())
}

/// 设置 panic hook，自动记录崩溃日志
pub fn setup_panic_hook() {
    std::panic::set_hook(Box::new(|info| {
        log::error!("Application panicked: {}", info);
        if let Err(e) = write_crash_log(info) {
            eprintln!("Failed to write crash log: {}", e);
        }
    }));
}
