// 极简全局错误发布订阅：window 级错误通过 reportError 推送给订阅者（全局弹窗）。
let listeners = [];
let current = null;

export function subscribeError(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function getCurrentError() {
  return current;
}

export function reportError(err) {
  const normalized = err && err.message ? err : new Error(typeof err === 'string' ? err : 'Unknown error');
  current = normalized;
  listeners.forEach((l) => {
    try {
      l(current);
    } catch {
      /* ignore */
    }
  });
}

export function clearError() {
  current = null;
  listeners.forEach((l) => {
    try {
      l(null);
    } catch {
      /* ignore */
    }
  });
}
