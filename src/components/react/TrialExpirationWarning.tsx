/**
 * Trial Expiration Warning Component
 * Displays warning when guest trial is expiring soon
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrialExpirationWarningProps {
  daysRemaining: number;
  onRegister?: () => void;
  onDismiss?: () => void;
  autoShow?: boolean;
}

export default function TrialExpirationWarning({
  daysRemaining,
  onRegister,
  onDismiss,
  autoShow = true,
}: TrialExpirationWarningProps) {
  const [isVisible, setIsVisible] = useState(autoShow);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this warning in current session
    const dismissed = sessionStorage.getItem('trial-warning-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('trial-warning-dismissed', 'true');
    onDismiss?.();
  };

  const handleRegister = () => {
    onRegister?.();
  };

  if (isDismissed || daysRemaining > 7) {
    return null;
  }

  const urgencyLevel = daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'warning' : 'info';

  const bgColor = {
    critical: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColor = {
    critical: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900',
  };

  const iconColor = {
    critical: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-2xl px-4"
        >
          <div
            className={`${bgColor[urgencyLevel]} border-2 rounded-xl shadow-xl p-4 flex items-start gap-4`}
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              {urgencyLevel === 'critical' ? (
                <svg
                  className={`w-6 h-6 ${iconColor[urgencyLevel]}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : (
                <svg
                  className={`w-6 h-6 ${iconColor[urgencyLevel]}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className={`font-bold mb-1 ${textColor[urgencyLevel]}`}>
                {urgencyLevel === 'critical'
                  ? '⏰ Trial Expiring Soon!'
                  : '📅 Trial Ending Soon'}
              </h3>
              <p className={`text-sm mb-3 ${textColor[urgencyLevel]}`}>
                Your free trial ends in{' '}
                <strong className="font-bold">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                </strong>
                . Register now to keep your progress and continue learning!
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleRegister}
                  className={`px-4 py-2 rounded-lg font-semibold text-white transition-all transform hover:scale-105 shadow-md ${
                    urgencyLevel === 'critical'
                      ? 'bg-red-600 hover:bg-red-700'
                      : urgencyLevel === 'warning'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Create Free Account
                </button>
                <button
                  onClick={handleDismiss}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    urgencyLevel === 'critical'
                      ? 'text-red-700 hover:bg-red-100'
                      : urgencyLevel === 'warning'
                      ? 'text-yellow-700 hover:bg-yellow-100'
                      : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Remind Me Later
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
                urgencyLevel === 'critical'
                  ? 'hover:bg-red-100 text-red-500'
                  : urgencyLevel === 'warning'
                  ? 'hover:bg-yellow-100 text-yellow-500'
                  : 'hover:bg-blue-100 text-blue-500'
              }`}
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

