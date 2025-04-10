import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
from typing import Dict, List, Optional
import pandas as pd

class HealthRiskPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.feature_columns = [
            'age', 'bmi', 'blood_pressure_systolic', 'blood_pressure_diastolic',
            'heart_rate', 'cholesterol', 'glucose', 'smoking', 'alcohol',
            'physical_activity'
        ]

    def preprocess_data(self, patient_data: Dict) -> np.ndarray:
        """Prétraite les données du patient pour la prédiction."""
        # Calcul de l'âge à partir de la date de naissance
        birth_date = pd.to_datetime(patient_data.get('date_of_birth'))
        age = (pd.Timestamp.now() - birth_date).days / 365.25

        # Création du vecteur de caractéristiques
        features = np.array([
            age,
            patient_data.get('bmi', 0),
            patient_data.get('blood_pressure_systolic', 0),
            patient_data.get('blood_pressure_diastolic', 0),
            patient_data.get('heart_rate', 0),
            patient_data.get('cholesterol', 0),
            patient_data.get('glucose', 0),
            1 if patient_data.get('smoking', False) else 0,
            1 if patient_data.get('alcohol', False) else 0,
            patient_data.get('physical_activity', 0)
        ]).reshape(1, -1)

        return self.scaler.transform(features)

    def predict_health_risks(self, patient_data: Dict) -> Dict[str, float]:
        """Prédit les risques de santé pour un patient."""
        features = self.preprocess_data(patient_data)
        risk_probabilities = self.model.predict_proba(features)[0]
        
        risks = {
            'cardiovascular': risk_probabilities[0],
            'diabetes': risk_probabilities[1],
            'respiratory': risk_probabilities[2]
        }
        
        return risks

    def get_risk_factors(self, patient_data: Dict) -> List[Dict[str, str]]:
        """Identifie les principaux facteurs de risque."""
        risk_factors = []
        
        # Vérification des facteurs de risque courants
        if patient_data.get('bmi', 0) > 30:
            risk_factors.append({
                'factor': 'IMC élevé',
                'recommendation': 'Consultation avec un nutritionniste recommandée'
            })
            
        if patient_data.get('blood_pressure_systolic', 0) > 140:
            risk_factors.append({
                'factor': 'Tension artérielle élevée',
                'recommendation': 'Suivi régulier de la tension et consultation cardiologique'
            })
            
        if patient_data.get('smoking'):
            risk_factors.append({
                'factor': 'Tabagisme',
                'recommendation': 'Programme d'aide à l'arrêt du tabac recommandé'
            })
            
        return risk_factors

    def save_model(self, path: str):
        """Sauvegarde le modèle entraîné."""
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler
        }, path)

    def load_model(self, path: str):
        """Charge un modèle entraîné."""
        saved_model = joblib.load(path)
        self.model = saved_model['model']
        self.scaler = saved_model['scaler']
