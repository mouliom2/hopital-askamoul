import React from 'react';

interface HealthRiskCardProps {
  risk: HealthRisk;
}

export const HealthRiskCard: React.FC<HealthRiskCardProps> = ({ risk }) => {
  const getSeverityStyle = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return { bg: 'bg-red-100 text-red-800', bar: 'bg-red-500' };
      case 'medium':
        return { bg: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' };
      default:
        return { bg: 'bg-green-100 text-green-800', bar: 'bg-green-500' };
    }
  };

  const severityStyle = getSeverityStyle(risk.severity);

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-900 capitalize">
          {risk.risk_type}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityStyle.bg}`}>
          {Math.round(risk.probability * 100)}%
        </span>
      </div>
      <div className="relative pt-1">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${risk.probability * 100}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${severityStyle.bar}`}
          />
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Facteurs de risque:</h4>
        <ul className="space-y-1">
          {risk.factors.map((factor: string, idx: number) => (
            <li key={idx} className="text-sm text-gray-600 flex items-start">
              <span className="mr-2">•</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
