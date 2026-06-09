export function htmlToMarkdown(html: string): string {
  let md = html;

  // Code blocks before inline code
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    return '\n```\n' + text + '\n```\n';
  });

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');

  // Blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) =>
    inner.split('\n').map((l: string) => '> ' + l.replace(/<[^>]+>/g, '').trim()).filter(Boolean).join('\n') + '\n'
  );

  // Bold / Italic
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  md = md.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '$1');
  md = md.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<strike[^>]*>([\s\S]*?)<\/strike>/gi, '~~$1~~');

  // Inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

  // Lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/ul>|<\/ol>/gi, '\n');
  md = md.replace(/<ul[^>]*>|<ol[^>]*>/gi, '');

  // Horizontal rule
  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n');

  // Paragraphs and breaks
  md = md.replace(/<\/p>/gi, '\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<\/div>/gi, '\n');

  // Strip all remaining tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode entities
  md = md
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Collapse excessive blank lines
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

export function markdownToHtml(md: string): string {
  let html = md;

  // Escape to prevent XSS on raw angle brackets
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```[\w]*\n([\s\S]*?)```/gm, (_, code) =>
    `<pre style="background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;overflow:auto;margin:8px 0;"><code>${code.trim()}</code></pre>`
  );

  // Headings
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:2px solid #e5e7eb;margin:12px 0;" />');

  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote style="border-left:4px solid #6366f1;padding:8px 16px;background:#f0f0ff;margin:8px 0;font-style:italic;color:#4b5563;">$1</blockquote>');

  // Bold / italic combos
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Inline code (restore &lt;/&gt; inside code tags to literal)
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em;">$1</code>');

  // Images before links
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;height:auto;border-radius:4px;margin:8px 0;" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#6366f1;text-decoration:underline;">$1</a>');

  // Unordered lists
  html = html.replace(/(^- .+(\n|$))+/gm, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('');
    return `<ul style="list-style:disc;padding-left:24px;margin:4px 0;">${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/(^\d+\. .+(\n|$))+/gm, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol style="list-style:decimal;padding-left:24px;margin:4px 0;">${items}</ol>`;
  });

  // Paragraphs
  html = html.replace(/\n\n(.+?)(?=\n\n|$)/gs, (_, text) => {
    if (/^<(h[1-6]|ul|ol|pre|blockquote|hr)/.test(text.trim())) return '\n\n' + text;
    return `\n\n<p>${text}</p>`;
  });

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  return html.trim();
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
