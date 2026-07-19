import { useState, useEffect } from 'react';
import SubPageHeader from '../components/SubPageHeader';
import Loading from '../components/Loading';
import { ShieldAlert, FileSignature } from 'lucide-react';

const CONTENT_URLS = {
  privacy: 'https://skyxing.dpdns.org/privacy.html',
  terms: 'https://skyxing.dpdns.org/terms.html',
};

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// 跨域抓取 HTML：Tauri 端使用原生 HTTP 插件绕过浏览器 CORS，Web 端用普通 fetch
async function fetchText(url) {
  if (isTauri) {
    const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
    const resp = await tauriFetch(url);
    return resp.text();
  }
  const resp = await fetch(url);
  return resp.text();
}

/** 从协议 HTML 页面中提取纯文本内容（保持与 app 现有样式一致） */
function extractText(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const wrap = doc.querySelector('.wrap');
    if (!wrap) throw new Error('Content not found');
    const parts = [];
    for (const el of wrap.children) {
      const tag = el.tagName.toLowerCase();
      if (tag === 'h2') parts.push('\n' + el.textContent.trim() + '\n');
      else if (tag === 'p') parts.push(el.textContent.trim());
      // skip header/back link
    }
    return parts.join('\n\n');
  } catch {
    const body = html.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n').trim();
    return body || '加载失败';
  }
}

export default function PrivacyPage() {
  const [tab, setTab] = useState('privacy');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setContent('');
    fetchText(CONTENT_URLS[tab])
      .then(html => setContent(extractText(html)))
      .catch(() => setContent('加载失败，请稍后重试'))
      .finally(() => setLoading(false));
  }, [tab]);

  const TABS = [
    { key: 'privacy', label: '隐私政策', icon: ShieldAlert },
    { key: 'terms', label: '服务条款', icon: FileSignature },
  ];

  return (
    <div className="min-h-full flex flex-col">
      <SubPageHeader title="隐私条款和用户协议" />

      <div className="px-4 pt-3">
        <div className="flex gap-2 bg-[var(--win-pane)] p-1 rounded-xl">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-colors ' +
                  (active ? 'bg-[var(--win-card)] text-[var(--win-accent)] shadow-sm' : 'text-[var(--win-text-secondary)]')
                }
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto win-scroll px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loading /></div>
        ) : (
          <article className="text-[13px] leading-relaxed text-[var(--win-text-secondary)] whitespace-pre-wrap animate-fadeInUp">
            {content}
          </article>
        )}
        <p className="text-[11px] text-[var(--win-text-tertiary)] mt-6 text-center">内容来源：skyxing.dpdns.org</p>
      </div>
    </div>
  );
}
