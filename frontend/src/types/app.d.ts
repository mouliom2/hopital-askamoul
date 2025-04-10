declare global {
  interface Window {
    // Add any global window properties here
  }

  // Common interfaces used across the application
  interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
  }

  interface Patient {
    id: number;
    full_name: string;
    date_of_birth: string;
    gender: string;
    contact_number: string;
    address: string;
    medical_history: string;
    created_at: string;
  }

  interface Appointment {
    id: number;
    patient_id: number;
    doctor_id: number;
    datetime: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes: string;
  }

  interface MedicalRecord {
    id: number;
    patient_id: number;
    doctor_id: number;
    diagnosis: string;
    treatment: string;
    prescription: string;
    notes: string;
    created_at: string;
  }

  interface HealthRisk {
    risk_type: string;
    probability: number;
    severity: 'low' | 'medium' | 'high';
    factors: string[];
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

  interface HealthTrend {
    metric: string;
    trend: 'improving' | 'stable' | 'worsening';
    data: Array<{
      date: string;
      value: number;
    }>;
    analysis: string;
  }

  interface AIAnalysisData {
    risks: HealthRisk[];
    trends: HealthTrend[];
    recommendations: TreatmentRecommendation[];
  }
}

export {};
