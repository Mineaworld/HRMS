import React from 'react';
import { IconProps } from '@phosphor-icons/react';

export type MetricAccent = 'blue' | 'purple' | 'green' | 'orange' | 'cyan';

interface MetricCardProps {
  value: string | number;
  title: string;
  comparison: string;
  icon: React.ComponentType<IconProps>;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  title,
  comparison,
  icon: Icon,
}) => {
  return (
    <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-slate-300 transition-colors">
      {/* Header: Label & Icon */}
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs font-medium text-slate-600">{title}</span>
        <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-100">
          <Icon weight="duotone" className="w-4 h-4 text-slate-600" />
        </div>
      </div>

      {/* Metric Figure & Context */}
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{comparison}</p>
      </div>
    </div>
  );
};
