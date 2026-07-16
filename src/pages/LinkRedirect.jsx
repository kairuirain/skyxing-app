import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ExternalLink, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function LinkRedirect() {
  const [searchParams] = useSearchParams();
  const targetUrl = searchParams.get('url') || '';
  const [confirmed, setConfirmed] = useState(false);

  if (!targetUrl) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-gray-500 text-lg">缺少链接参数</p>
        <Link to="/" className="btn-primary mt-4 inline-block">返回首页</Link>
      </div>
    );
  }

  const decodedUrl = decodeURIComponent(targetUrl);
  const hostname = (() => { try { return new URL(decodedUrl).hostname; } catch { return '未知域名'; } })();

  const handleConfirm = () => {
    setConfirmed(true);
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      import('@tauri-apps/plugin-opener').then((m) => m.openUrl(decodedUrl)).catch(() => window.open(decodedUrl, '_blank'));
    } else {
      window.open(decodedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 text-amber-600 mb-5">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">外部链接提醒</h1>
        <p className="text-gray-500 text-sm mb-4">您即将离开 SkyXing，前往以下链接：</p>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4 text-left">
          <p className="text-xs text-gray-400 mb-1">目标链接</p>
          <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">{decodedUrl}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-left text-xs text-amber-800">
          <p className="font-medium mb-1">⚠️ 安全提醒</p>
          <ul className="space-y-1 text-amber-700">
            <li>• 目标域名：<strong>{hostname}</strong> — 非 SkyXing 官方域名</li>
            <li>• 本平台无法验证该链接的内容和安全性</li>
            <li>• 请勿在未知网站输入您的 SkyXing 账号密码</li>
          </ul>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-outline btn-sm"><ArrowLeft size={14} className="mr-1"/>返回</Link>
          <button onClick={handleConfirm} disabled={confirmed} className="btn-primary btn-sm">
            <ExternalLink size={14} className="mr-1"/>{confirmed ? '已打开' : '继续访问'}
          </button>
        </div>
      </div>
    </div>
  );
}
