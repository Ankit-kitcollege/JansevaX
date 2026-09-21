import React, { useState } from 'react';
import { CheckCircle2, XCircle, MessageSquare, Sparkles } from 'lucide-react';

export default function VerificationModal({ isOpen, onSubmitVerification, onClose }) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAction = async (result) => {
    setSubmitting(true);
    await onSubmitVerification(result, feedback);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">Citizen Resolution Verification</h3>
          <p className="text-xs text-slate-300">
            The assigned department marked this problem as resolved. Please confirm whether the issue has actually been fixed to your satisfaction.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" /> Optional Feedback / Notes
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="E.g., Road resurfaced smoothly / Garbage completely cleared"
            rows={2}
            className="w-full bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => handleAction('YES_RESOLVED')}
            disabled={submitting}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> YES, RESOLVED
          </button>
          <button
            onClick={() => handleAction('NO_REOPENED')}
            disabled={submitting}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-colors"
          >
            <XCircle className="w-4 h-4" /> NO, STILL EXISTS
          </button>
        </div>
      </div>
    </div>
  );
}
