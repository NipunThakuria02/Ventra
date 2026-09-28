import React from 'react';
import type { RiskStatus } from '../types';

interface StatusBadgeProps {
  status: RiskStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true
}) => {
  const getBadgeClass = (s: RiskStatus) => {
    switch (s) {
      case 'green':
        return 'badge-green';
      case 'amber':
        return 'badge-amber';
      case 'red':
        return 'badge-red';
      case 'critical':
        return 'badge-critical';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getLabel = (s: RiskStatus) => {
    switch (s) {
      case 'green':
        return 'LOW RISK (GREEN)';
      case 'amber':
        return 'ELEVATED (AMBER)';
      case 'red':
        return 'HIGH RISK (RED)';
      case 'critical':
        return 'CRITICAL RISK';
      default:
        return 'UNKNOWN';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded',
    md: 'px-2.5 py-1 text-xs font-bold rounded-md tracking-wider uppercase',
    lg: 'px-3 py-1.5 text-sm font-extrabold rounded-md tracking-wider uppercase'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${getBadgeClass(status)} shadow-xs`}>
      <span className={`w-2 h-2 rounded-full ${
        status === 'green' ? 'bg-[#557A61]' :
        status === 'amber' ? 'bg-[#B07A32]' :
        status === 'red' ? 'bg-[#A95145]' :
        status === 'critical' ? 'bg-[#7F302B]' : 'bg-gray-400'
      }`} />
      {showLabel && getLabel(status)}
    </span>
  );
};
