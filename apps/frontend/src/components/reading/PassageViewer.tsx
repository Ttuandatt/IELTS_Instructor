'use client';

import React, { useMemo } from 'react';
import type { ParsedPassage } from '@/types/hybrid-parser';

interface Props {
  passage: ParsedPassage;
  answers?: Record<string, string>;
  onBlankChange?: (blankId: string, value: string) => void;
  readOnly?: boolean;
}

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

function resolveAssetUrl(url: string): string {
  if (/^https?:/i.test(url)) return url;
  return `${BACKEND_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Renders passage body_html, replacing <span class="ielts-blank" data-blank-id="..."/>
 *  with controlled <input> elements. For PDF uploads, embeds the file via iframe. */
export default function PassageViewer({ passage, answers = {}, onBlankChange, readOnly }: Props) {
  const segments = useMemo(() => splitOnBlanks(passage.body_html), [passage.body_html]);

  if (passage.source_pdf_url) {
    return (
      <div className="passage-viewer h-full flex flex-col">
        {passage.title && (
          <h2 className="text-xl font-bold mb-3 px-1 shrink-0">{passage.title}</h2>
        )}
        <iframe
          src={`${resolveAssetUrl(passage.source_pdf_url)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          title={passage.title || 'Passage PDF'}
          className="flex-1 w-full border border-gray-200 rounded-lg bg-white"
        />
      </div>
    );
  }

  return (
    <div className="passage-viewer prose prose-sm max-w-none text-gray-800 leading-relaxed">
      {passage.title && <h2 className="text-xl font-bold mb-4">{passage.title}</h2>}
      {segments.map((seg, i) =>
        seg.kind === 'html' ? (
          <span key={i} dangerouslySetInnerHTML={{ __html: seg.html }} />
        ) : (
          <input
            key={i}
            type="text"
            value={answers[seg.blankId] ?? ''}
            onChange={(e) => onBlankChange?.(seg.blankId, e.target.value)}
            readOnly={readOnly}
            className="inline-block mx-1 px-2 py-0.5 border-b-2 border-blue-400 bg-blue-50 rounded-t text-sm min-w-[80px] focus:outline-none focus:bg-white focus:border-blue-600"
            placeholder={seg.blankId.replace('blank_q', '')}
          />
        ),
      )}
    </div>
  );
}

type Segment =
  | { kind: 'html'; html: string }
  | { kind: 'blank'; blankId: string };

function splitOnBlanks(html: string): Segment[] {
  const re = /<span\s+class="ielts-blank"\s+data-blank-id="([^"]+)"[^>]*>\s*<\/span>/gi;
  const out: Segment[] = [];
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index > cursor) out.push({ kind: 'html', html: html.slice(cursor, m.index) });
    out.push({ kind: 'blank', blankId: m[1] });
    cursor = m.index + m[0].length;
  }
  if (cursor < html.length) out.push({ kind: 'html', html: html.slice(cursor) });
  return out;
}
