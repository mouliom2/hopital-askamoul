'use client';

import { FC } from 'react';

interface Treatment {
  name: string;
  description: string;
  effectiveness: number;
  side_effects: string[];
  contraindications: string[];
}

interface TreatmentRecommendation {
  condition: string;
  confidence: number;
  treatment: Treatment;
}

interface TreatmentRecommendationCardProps {
  recommendation: TreatmentRecommendation;
}

export const TreatmentRecommendationCard: FC<TreatmentRecommendationCardProps> = ({ recommendation: rec }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{rec.condition}</h3>
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Confiance: {Math.round(rec.confidence * 100)}%
          </div>
        </div>
      </div>
      <div className="mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Traitement recommandé</h4>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">{rec.treatment.name}</p>
            <p className="text-sm text-gray-600">{rec.treatment.description}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Efficacité du traitement</h4>
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {rec.treatment.effectiveness}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
              <div
                style={{ width: `${rec.treatment.effectiveness}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
              />
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Effets secondaires potentiels</h4>
          <ul className="bg-white rounded-lg p-3 border border-gray-200">
            {rec.treatment.side_effects.map((effect: string, idx: number) => (
              <li key={idx} className="text-sm text-gray-600 flex items-center py-1">
                <span className="mr-2 text-yellow-500">•</span>
                {effect}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
