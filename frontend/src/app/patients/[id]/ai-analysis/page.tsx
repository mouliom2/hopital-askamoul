'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HealthRiskCard } from '@/components/HealthRiskCard';
import { HealthTrendChart } from '@/components/HealthTrendChart';
import { TreatmentRecommendationCard } from '@/components/TreatmentRecommendationCard';

interface AIAnalysisData {
  risks: HealthRisk[];
  trends: HealthTrend[];
  recommendations: TreatmentRecommendation[];
}

interface HealthRisk {
  risk_type: string;
  severity: 'low' | 'medium' | 'high';
  probability: number;
  factors: string[];
}

interface HealthTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'worsening';
  data: {
    date: string;
    value: number;
  }[];
  analysis: string;
}

interface TreatmentRecommendation {
  condition: string;
  confidence: number;
  treatment: {
    name: string;
    description: string;
    effectiveness: number;
    side_effects: string[];
    contraindications: string[];
  };
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function PatientAIAnalysisPage({ params }: PageProps) {
  const [activeTab, setActiveTab] = React.useState<'risks' | 'trends' | 'recommendations'>('risks');
  const [data, setData] = React.useState<AIAnalysisData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [risksRes, trendsRes, recommendationsRes] = await Promise.all([
          fetch(`/api/ai/predict-health-risks/${params.id}`),
          fetch(`/api/ai/analysis/patient-trends/${params.id}`),
          fetch(`/api/ai/recommend-treatment/${params.id}`)
        ]);

        if (!risksRes.ok || !trendsRes.ok || !recommendationsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [risks, trends, recommendations] = await Promise.all([
          risksRes.json(),
          trendsRes.json(),
          recommendationsRes.json()
        ]);

        setData({ risks, trends, recommendations });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retour
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['risks', 'trends', 'recommendations'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab === 'risks' && 'Risques de santé'}
                {tab === 'trends' && 'Tendances'}
                {tab === 'recommendations' && 'Recommandations'}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'risks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.risks.map((risk: HealthRisk, index: number) => (
              <HealthRiskCard key={index} risk={risk} />
            ))}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-8">
            {data.trends.map((trend: HealthTrend, index: number) => (
              <HealthTrendChart key={index} trend={trend} />
            ))}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {data.recommendations.map((recommendation: TreatmentRecommendation, index: number) => (
              <TreatmentRecommendationCard key={index} recommendation={recommendation} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
