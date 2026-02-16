import React, { useState, useCallback } from 'react';
import type { Question } from '../../../types/types';
import { usePermission } from '../../../contexts/PermissionContext';

interface QuestionAnswerContentProps {
  questions: Question[];
  answers: Record<string, string>;
  className?: string;
}

// Exception to the stateless ContentRenderer pattern: multi-question navigation requires local state.
export const QuestionAnswerContent: React.FC<QuestionAnswerContentProps> = ({
  questions,
  answers,
  className = '',
}) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!questions || questions.length === 0) {
    return null;
  }

  const hasAnyAnswer = Object.keys(answers || {}).length > 0;
  const total = questions.length;

  // When pending (no answers yet), render interactive form so user can click options
  if (!hasAnyAnswer) {
    return <PendingQuestionForm questions={questions} total={total} className={className} />;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {questions.map((q, idx) => {
        const answer = answers?.[q.question];
        const answerLabels = answer ? answer.split(', ') : [];
        const skipped = !answer;
        const isExpanded = expandedIdx === idx;

        return (
          <div
            key={idx}
            className="rounded-lg border border-gray-150 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              className="w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                answerLabels.length > 0
                  ? 'bg-blue-100 dark:bg-blue-900/40'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                {answerLabels.length > 0 ? (
                  <svg className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {q.header && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-blue-800/40">
                      {q.header}
                    </span>
                  )}
                  {total > 1 && (
                    <span className="text-[10px] tabular-nums text-gray-400 dark:text-gray-500">
                      {idx + 1}/{total}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">
                  {q.question}
                </div>

                {!isExpanded && answerLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {answerLabels.map((lbl) => {
                      const isCustom = !q.options.some(o => o.label === lbl);
                      return (
                        <span
                          key={lbl}
                          className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                        >
                          {lbl}
                          {isCustom && (
                            <span className="text-[9px] text-blue-400 dark:text-blue-500 font-normal">(custom)</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}

                {!isExpanded && skipped && hasAnyAnswer && (
                  <span className="inline-block mt-1 text-[10px] text-gray-400 dark:text-gray-500 italic">
                    Skipped
                  </span>
                )}
              </div>

              <svg
                className={`w-3.5 h-3.5 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="px-3 pb-2.5 pt-0.5 border-t border-gray-100 dark:border-gray-700/40">
                <div className="space-y-1 ml-6.5">
                  {q.options.map((opt) => {
                    const wasSelected = answerLabels.includes(opt.label);
                    return (
                      <div
                        key={opt.label}
                        className={`flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-[12px] ${
                          wasSelected
                            ? 'bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/40'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        <div className={`mt-0.5 flex-shrink-0 w-3.5 h-3.5 ${q.multiSelect ? 'rounded-[3px]' : 'rounded-full'} border-[1.5px] flex items-center justify-center ${
                          wasSelected
                            ? 'border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {wasSelected && (
                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={wasSelected ? 'text-gray-900 dark:text-gray-100 font-medium' : ''}>
                            {opt.label}
                          </span>
                          {opt.description && (
                            <span className={`block text-[11px] mt-0.5 ${
                              wasSelected ? 'text-blue-600/70 dark:text-blue-300/70' : 'text-gray-400 dark:text-gray-600'
                            }`}>
                              {opt.description}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {answerLabels.filter(lbl => !q.options.some(o => o.label === lbl)).map(lbl => (
                    <div
                      key={lbl}
                      className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-[12px] bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/40"
                    >
                      <div className={`mt-0.5 flex-shrink-0 w-3.5 h-3.5 ${q.multiSelect ? 'rounded-[3px]' : 'rounded-full'} border-[1.5px] border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-500 flex items-center justify-center`}>
                        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-900 dark:text-gray-100 font-medium">{lbl}</span>
                        <span className="text-[10px] text-blue-500 dark:text-blue-400 ml-1">(custom)</span>
                      </div>
                    </div>
                  ))}

                  {skipped && hasAnyAnswer && (
                    <div className="text-[11px] text-gray-400 dark:text-gray-500 italic px-2.5 py-1">
                      No answer provided
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Interactive form shown when AskUserQuestion is pending (no answers yet).
 * Options are real clickable buttons. Submit sends the answer via PermissionContext.
 */
const PendingQuestionForm: React.FC<{
  questions: Question[];
  total: number;
  className: string;
}> = ({ questions, total, className }) => {
  const permission = usePermission();
  const [selections, setSelections] = useState<Record<number, Set<string>>>({});
  const [otherTexts, setOtherTexts] = useState<Record<number, string>>({});
  const [usingOther, setUsingOther] = useState<Record<number, boolean>>({});

  const handleOptionToggle = useCallback((qIdx: number, label: string, multiSelect: boolean) => {
    setSelections(prev => {
      const next = { ...prev };
      if (multiSelect) {
        const current = new Set(prev[qIdx] || []);
        if (current.has(label)) current.delete(label);
        else current.add(label);
        next[qIdx] = current;
      } else {
        next[qIdx] = new Set([label]);
        setUsingOther(p => ({ ...p, [qIdx]: false }));
      }
      return next;
    });
  }, []);

  const handleOtherToggle = useCallback((qIdx: number, multiSelect: boolean) => {
    setUsingOther(prev => {
      const next = { ...prev, [qIdx]: !prev[qIdx] };
      if (!multiSelect && next[qIdx]) {
        setSelections(p => ({ ...p, [qIdx]: new Set() }));
      }
      return next;
    });
  }, []);

  const buildAnswers = useCallback((): Record<string, string> => {
    const result: Record<string, string> = {};
    questions.forEach((q, idx) => {
      const parts: string[] = [];
      const selected = selections[idx];
      if (selected && selected.size > 0) parts.push(...Array.from(selected));
      if (usingOther[idx] && otherTexts[idx]?.trim()) parts.push(otherTexts[idx].trim());
      if (parts.length > 0) result[q.question] = parts.join(', ');
    });
    return result;
  }, [questions, selections, usingOther, otherTexts]);

  const hasAnySelection = useCallback((): boolean => {
    for (let idx = 0; idx < questions.length; idx++) {
      if (selections[idx] && selections[idx].size > 0) return true;
      if (usingOther[idx] && otherTexts[idx]?.trim()) return true;
    }
    return false;
  }, [questions, selections, usingOther, otherTexts]);

  // Find the matching pending AskUserQuestion request
  const pendingRequest = permission?.pendingPermissionRequests.find(
    r => r.toolName === 'AskUserQuestion',
  );

  const handleSubmit = useCallback(() => {
    if (!permission || !pendingRequest) return;
    const answersMap = buildAnswers();
    permission.handlePermissionDecision(pendingRequest.requestId, {
      allow: true,
      updatedInput: { questions, answers: answersMap },
    });
  }, [permission, pendingRequest, buildAnswers, questions]);

  const handleSkip = useCallback(() => {
    if (!permission || !pendingRequest) return;
    permission.handlePermissionDecision(pendingRequest.requestId, {
      allow: true,
      updatedInput: { questions, answers: {} },
    });
  }, [permission, pendingRequest, questions]);

  return (
    <div className={`space-y-3 ${className}`}>
      {questions.map((q, qIdx) => (
        <div key={qIdx}>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {q.header && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-blue-800/40">
                {q.header}
              </span>
            )}
            {total > 1 && (
              <span className="text-[10px] tabular-nums text-gray-400 dark:text-gray-500">
                {qIdx + 1}/{total}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-700 dark:text-gray-300 mb-2 leading-snug font-medium">
            {q.question}
          </div>
          {q.multiSelect && (
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5">Select all that apply</div>
          )}

          <div className="space-y-1">
            {q.options.map((opt) => {
              const isSelected = selections[qIdx]?.has(opt.label) ?? false;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleOptionToggle(qIdx, opt.label, q.multiSelect || false)}
                  className={`w-full text-left flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-[12px] border transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : 'border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                  }`}
                >
                  <div className={`mt-0.5 flex-shrink-0 w-3.5 h-3.5 ${q.multiSelect ? 'rounded-[3px]' : 'rounded-full'} border-[1.5px] flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && (
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={isSelected ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                      {opt.label}
                    </span>
                    {opt.description && (
                      <span className={`block text-[11px] mt-0.5 ${
                        isSelected ? 'text-blue-600/70 dark:text-blue-300/70' : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {opt.description}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Other option */}
            <button
              type="button"
              onClick={() => handleOtherToggle(qIdx, q.multiSelect || false)}
              className={`w-full text-left flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-[12px] border transition-colors duration-150 cursor-pointer ${
                usingOther[qIdx]
                  ? 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                  : 'border-dashed border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
              }`}
            >
              <div className={`mt-0.5 flex-shrink-0 w-3.5 h-3.5 ${q.multiSelect ? 'rounded-[3px]' : 'rounded-full'} border-[1.5px] flex items-center justify-center transition-colors ${
                usingOther[qIdx]
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {usingOther[qIdx] && (
                  <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={usingOther[qIdx] ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                Other...
              </span>
            </button>

            {usingOther[qIdx] && (
              <input
                type="text"
                value={otherTexts[qIdx] || ''}
                onChange={(e) => setOtherTexts(prev => ({ ...prev, [qIdx]: e.target.value }))}
                placeholder="Type your answer..."
                autoFocus
                className="w-full text-[12px] rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900/60 text-gray-900 dark:text-gray-100 px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && hasAnySelection()) handleSubmit();
                }}
              />
            )}
          </div>
        </div>
      ))}

      {/* Submit / Skip buttons */}
      {pendingRequest && (
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasAnySelection()}
            className={`inline-flex items-center rounded-md text-xs font-medium px-3 py-1.5 transition-colors ${
              hasAnySelection()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center rounded-md text-xs font-medium px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
};
