import React from 'react';
import { AlertTriangle, ThumbsUp, PlusCircle, MapPin, X } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DuplicateModal({ isOpen, duplicateInfo, onSupportExisting, onSubmitNewAnyway, onClose }) {
  if (!isOpen || !duplicateInfo) return null;

  const existing = duplicateInfo.existingReport;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">Similar Problem Reported Nearby</h3>
              <p className="text-xs text-amber-300 font-medium">Duplicate Prevention Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-amber-950/30 border border-amber-800/40 p-3 rounded-xl">
          {duplicateInfo.message}
        </p>

        {/* Existing Report Preview Card */}
        {existing && (
          <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Nearby Active Report</span>
              <StatusBadge status={existing.status} />
            </div>
            <h4 className="text-sm font-bold text-white">{existing.title}</h4>
            <p className="text-xs text-slate-300 line-clamp-2">{existing.description}</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span className="truncate">{existing.address}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => onSupportExisting(existing?.id)}
            className="w-full sm:w-1/2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <ThumbsUp className="w-4 h-4" /> Support Existing Report
          </button>
          <button
            onClick={onSubmitNewAnyway}
            className="w-full sm:w-1/2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Submit Separate Report
          </button>
        </div>
      </div>
    </div>
  );
}
