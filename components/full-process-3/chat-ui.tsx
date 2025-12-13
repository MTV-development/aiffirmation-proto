'use client';

import type { ChatMessage, QuickReply } from './types';

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl px-4 py-3 shadow-sm border bg-slate-700 dark:bg-slate-800 border-slate-600 dark:border-slate-700">
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-300 animate-[bounce_1s_ease-in-out_infinite]" />
          <span className="w-2 h-2 rounded-full bg-gray-300 animate-[bounce_1s_ease-in-out_0.15s_infinite]" />
          <span className="w-2 h-2 rounded-full bg-gray-300 animate-[bounce_1s_ease-in-out_0.3s_infinite]" />
        </span>
      </div>
    </div>
  );
}

function Bubble({ role, children }: { role: 'assistant' | 'user'; children: React.ReactNode }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[min(640px,100%)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border whitespace-pre-wrap break-words',
          isUser
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-slate-700 dark:bg-slate-800 border-slate-600 dark:border-slate-700 text-gray-100',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  );
}

export function ChatTranscript({
  messages,
  onQuickReply,
  isTyping,
}: {
  messages: ChatMessage[];
  onQuickReply: (reply: QuickReply) => void;
  isTyping?: boolean;
}) {
  const lastQuickReplyMsgId = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      if (m.role === 'assistant' && m.quickReplies && m.quickReplies.length > 0) return m.id;
    }
    return null;
  })();

  return (
    <div className="space-y-3">
      {messages.map((m) => {
        // Split assistant messages on \n\n into separate bubbles
        const paragraphs = m.role === 'assistant' ? m.text.split('\n\n').filter(Boolean) : [m.text];

        return (
          <div key={m.id} className="space-y-2">
            {paragraphs.map((paragraph, idx) => (
              <Bubble key={`${m.id}-${idx}`} role={m.role}>{paragraph}</Bubble>
            ))}
            {m.role === 'assistant' &&
              m.id === lastQuickReplyMsgId &&
              m.quickReplies &&
              m.quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {m.quickReplies.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onQuickReply(r)}
                    className={[
                      'px-3 py-2 rounded-full text-sm border transition-colors',
                      r.selected
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : r.value === '__more__'
                          ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                          : r.value === '__finish__'
                            ? 'border-gray-400 dark:border-gray-500 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500'
                            : 'border-gray-400 dark:border-gray-500 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500',
                    ].join(' ')}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {isTyping && <TypingIndicator />}
    </div>
  );
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <button
        onClick={onSend}
        disabled={disabled}
        className="px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  );
}


