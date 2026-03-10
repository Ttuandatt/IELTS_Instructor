const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function normalizeHtml(source?: any): string {
  if (!source) return '';
  if (typeof source === 'string') {
    return source;
  }
  return '';
}

export function buildReadingHtml(payload: any): string {
  if (!payload) return '';
  const parts: string[] = [];
  const passageHtml = normalizeHtml(payload?.passage?.html);
  const passageText = payload?.passage?.text;

  if (passageHtml) {
    parts.push(`<section class="reading-passage">${passageHtml}</section>`);
  } else if (passageText) {
    parts.push(`<section class="reading-passage"><p>${escapeHtml(passageText)}</p></section>`);
  }

  const questions = Array.isArray(payload?.questions) ? payload.questions : [];
  if (questions.length) {
    const questionBlocks = questions
      .map((item: any) => {
        const content = normalizeHtml(item?.html);
        const fallback = item?.text ? `<p>${escapeHtml(item.text)}</p>` : '';
        const inner = content || fallback;
        if (!inner) return '';
        return `<div class="reading-question" data-q="${item?.number ?? ''}">${inner}</div>`;
      })
      .filter(Boolean)
      .join('\n');

    if (questionBlocks) {
      parts.push('<hr />');
      parts.push(`<section class="reading-questions">${questionBlocks}</section>`);
    }
  }

  return parts.join('\n');
}
