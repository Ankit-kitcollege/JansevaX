import React from 'react';
import { Flame } from 'lucide-react';

export default function PriorityBadge({ score, tier }) {
  const getStyle = (val) => {
    if (val >= 76) return { bg: 'bg-rose-500/15 text-rose-400 border-rose-500/40', text: 'CRITICAL' };
    if (val >= 51) return { bg: 'bg-orange-500/15 text-orange-400 border-orange-500/40', text: 'HIGH' };
    if (val >= 26) return { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/40', text: 'MEDIUM' };
    return { bg: 'bg-slate-500/15 text-slate-400 border-slate-500/40', text: 'LOW' };
  };

  const info = getStyle(score || 0);

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg border ${info.bg}`} title={`Transparent Priority Score: ${score}/100`}>
      <Flame className="w-3.5 h-3.5" />
      <span>{info.text}</span>
      <span className="opacity-75 font-mono">({score})</span>
    </div>
  );
}
