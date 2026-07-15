/**
 * 轻量 Markdown → HTML 转换器
 * 支持常用语法，同时保留内嵌 HTML（透传不作处理）
 */

function escapeHTML(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
  return text.replace(/[&<>"']/g, c => map[c]);
}

export function markdownToHTML(md) {
  if (!md || typeof md !== 'string') return '';
  let html = md;
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code${lang ? ` class="language-${lang}"` : ''}>${escapeHTML(code.trim())}</code></pre>`);
    return `\`\`\`CODEBLOCK_${idx}\`\`\``;
  });
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHTML(code)}</code>`);
    return `\`INLINECODE_${idx}\``;
  });
  const lines = html.split('\n');
  const result = [];
  let inParagraph = false;
  function closeParagraph() { if (inParagraph) { result.push('</p>'); inParagraph = false; } }
  function processInline(text) {
    if (!text) return '';
    let t = text.replace(/`INLINECODE_(\d+)`/g, (_, idx) => inlineCodes[parseInt(idx)] || '');
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/__(.+?)__/g, '<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
    t = t.replace(/_(.+?)_/g, '<em>$1</em>');
    t = t.replace(/~~(.+?)~~/g, '<del>$1</del>');
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
    return t;
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) { closeParagraph(); continue; }
    if (/^```CODEBLOCK_(\d+)```$/.test(trimmed)) { closeParagraph(); result.push(codeBlocks[parseInt(RegExp.$1)]); continue; }
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) { closeParagraph(); result.push('<hr />'); continue; }
    if (/^(#{1,6})\s+(.+)$/.test(trimmed)) { closeParagraph(); const l = RegExp.$1.length; result.push(`<h${l}>${processInline(RegExp.$2)}</h${l}>`); continue; }
    if (/^>\s+(.+)$/.test(trimmed)) { closeParagraph(); result.push(`<blockquote>${processInline(RegExp.$1)}</blockquote>`); continue; }
    if (/^[-*]\s+(.+)$/.test(trimmed)) { closeParagraph(); result.push(`<li>${processInline(RegExp.$1)}</li>`); continue; }
    if (/^\d+\.\s+(.+)$/.test(trimmed)) { closeParagraph(); result.push(`<li>${processInline(RegExp.$1)}</li>`); continue; }
    if (!inParagraph) { result.push('<p>'); inParagraph = true; } else { result.push('\n'); }
    result.push(processInline(trimmed));
  }
  closeParagraph();
  return result.join('')
    .replace(/(?:<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/g, '<ul>$&</ul>');
}

export function rewriteExternalLinks(html) {
  if (!html) return '';
  return html.replace(
    /<a\s+([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi,
    (match, before, url, after) => {
      return `<a ${before}href="/link?url=${encodeURIComponent(url)}"${after}>`;
    }
  );
}

export function looksLikeHTML(content) {
  return /^\s*</.test(content);
}

export function prepareArticleContent(content) {
  if (!content) return '';
  const isHTML = looksLikeHTML(content);
  let html = isHTML ? content : markdownToHTML(content);
  html = rewriteExternalLinks(html);
  return html;
}
