// 平台检测：用于在 Tauri 运行时区分 Android 与桌面（Windows/Web）端。
// Android 端使用 Material 规范的底部导航栏，桌面端继续使用侧边栏。
// 检测依据为 WebView 的 User-Agent（Tauri Android 的 UA 含 "Android"，
// Tauri Windows 的 WebView2 UA 含 "Windows NT"），可在首屏同步判定、无闪烁。
export function isAndroid() {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}
