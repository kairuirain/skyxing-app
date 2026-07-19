// 在 Tauri 中用系统浏览器打开外链；在浏览器预览中回退到 window.open
export function openExternal(url) {
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  if (isTauri) {
    import('@tauri-apps/plugin-opener')
      .then((m) => m.openUrl(url))
      .catch(() => window.open(url, '_blank'));
  } else {
    window.open(url, '_blank');
  }
}
