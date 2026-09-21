import React from 'react';

export default function StatusBadge({ status }) {
  const getStyle = (st) => {
    switch (st) {
      case 'SUBMITTED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'UNDER_REVIEW':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'VERIFIED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'ASSIGNED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'IN_PROGRESS':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse';
      case 'RESOLVED':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'CITIZEN_VERIFICATION':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/40 ring-1 ring-yellow-500/30';
      case 'CLOSED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'REOPENED':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const label = status ? status.replace(/_/g, ' ') : 'UNKNOWN';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-lg border ${getStyle(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
}
