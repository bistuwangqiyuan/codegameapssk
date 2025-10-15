/**
 * Hint Button Component
 * Provides progressive hints for challenges
 */

import { useState } from 'react';

interface HintButtonProps {
  challengeId?: string;
  lessonId?: string;
  currentCode?: string;
}

export default function HintButton({ challengeId, lessonId, currentCode }: HintButtonProps) {
  const [hintLevel, setHintLevel] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const getHint = async () => {
    if (!challengeId && !lessonId) return;

    setIsLoading(true);
    const nextLevel = hintLevel + 1;

    try {
      const response = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          lessonId,
          currentCode,
          hintLevel: nextLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get hint');
      }

      const data = await response.json();
      setHint(data.hint);
      setHintLevel(nextLevel);
      setShowHint(true);
    } catch (error) {
      console.error('Get hint error:', error);
      setHint('Sorry, I encountered an error getting a hint. Please try again.');
      setShowHint(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Hint Button */}
      <button
        onClick={getHint}
        disabled={isLoading || hintLevel >= 3}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 ${
          hintLevel >= 3
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md'
        }`}
        aria-label="Get hint"
      >
        {isLoading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Getting hint...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span>{hintLevel === 0 ? 'Get Hint' : `Hint ${hintLevel + 1}/3`}</span>
          </>
        )}
      </button>

      {/* Hint Display */}
      {showHint && hint && (
        <div className="absolute top-full mt-2 w-80 bg-yellow-50 border-2 border-yellow-300 rounded-xl shadow-xl p-4 z-50 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {hintLevel}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 leading-relaxed">{hint}</p>
              {hintLevel < 3 && (
                <p className="text-xs text-yellow-700 mt-2">Need more help? Click the hint button again!</p>
              )}
            </div>
            <button
              onClick={() => setShowHint(false)}
              className="w-6 h-6 rounded-full hover:bg-yellow-200 flex items-center justify-center text-gray-600 transition-colors flex-shrink-0"
              aria-label="Close hint"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Hint counter */}
      {hintLevel > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {hintLevel}
        </div>
      )}
    </div>
  );
}

