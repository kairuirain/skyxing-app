// 平台检测：用于在 Tauri 运行时区分 Android / Windows / 其他桌面端。
// 检测依据为 WebView 的 User-Agent（Tauri Android → "Android"，
// Tauri Windows WebView2 → "Windows NT"），可在首屏同步判定、无闪烁。
export function isAndroid() {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

export function isWindows() {
  if (typeof navigator === 'undefined') return false;
  return /Windows NT/i.test(navigator.userAgent);
}
