from typing import Dict, List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

class TreatmentRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.treatment_database = []
        self.initialize_treatment_database()

    def initialize_treatment_database(self):
        """Initialise la base de données des traitements."""
        # Dans un environnement de production, ceci serait chargé depuis une base de données
        self.treatment_database = [
            {
                'condition': 'hypertension',
                'symptoms': 'tension artérielle élevée, maux de tête, fatigue',
                'treatments': [
                    {
                        'name': 'Inhibiteurs de l\'enzyme de conversion',
                        'description': 'Médicaments qui aident à réduire la tension artérielle',
                        'effectiveness': 0.85,
                        'side_effects': 'Toux sèche, étourdissements'
                    },
                    {
                        'name': 'Modification du style de vie',
                        'description': 'Régime pauvre en sel, exercice régulier',
                        'effectiveness': 0.70,
                        'side_effects': 'Aucun'
                    }
                ]
            },
            {
                'condition': 'diabète type 2',
                'symptoms': 'glycémie élevée, soif excessive, fatigue',
                'treatments': [
                    {
                        'name': 'Metformine',
                        'description': 'Médicament qui aide à contrôler la glycémie',
                        'effectiveness': 0.80,
                        'side_effects': 'Troubles digestifs'
                    },
                    {
                        'name': 'Régime et exercice',
                        'description': 'Contrôle de l\'alimentation et activité physique régulière',
                        'effectiveness': 0.75,
                        'side_effects': 'Aucun'
                    }
                ]
            }
        ]

    def get_condition_similarity(self, patient_symptoms: str, condition_data: Dict) -> float:
        """Calcule la similarité entre les symptômes du patient et une condition."""
        texts = [patient_symptoms, condition_data['symptoms']]
        tfidf_matrix = self.vectorizer.fit_transform(texts)
        return cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

    def recommend_treatments(self, patient_data: Dict) -> List[Dict]:
        """Recommande des traitements basés sur les symptômes et l'historique du patient."""
        patient_symptoms = patient_data.get('symptoms', '')
        patient_history = patient_data.get('medical_history', '')
        
        recommendations = []
        
        # Calcul des similarités avec les conditions connues
        for condition in self.treatment_database:
            similarity = self.get_condition_similarity(patient_symptoms, condition)
            
            if similarity > 0.3:  # Seuil de similarité minimum
                for treatment in condition['treatments']:
                    # Vérification des contre-indications
                    if self.check_contraindications(treatment, patient_history):
                        recommendations.append({
                            'condition': condition['condition'],
                            'confidence': float(similarity),
                            'treatment': treatment
                        })
        
        # Tri par niveau de confiance
        recommendations.sort(key=lambda x: x['confidence'], reverse=True)
        return recommendations

    def check_contraindications(self, treatment: Dict, patient_history: str) -> bool:
        """Vérifie les contre-indications d'un traitement avec l'historique du patient."""
        # Cette fonction devrait être développée avec une base de données complète
        # des contre-indications médicales
        return True  # Pour l'exemple, nous retournons toujours True

    def get_treatment_effectiveness(self, treatment_name: str, condition: str) -> float:
        """Récupère l'efficacité historique d'un traitement pour une condition donnée."""
        for condition_data in self.treatment_database:
            if condition_data['condition'] == condition:
                for treatment in condition_data['treatments']:
                    if treatment['name'] == treatment_name:
                        return treatment['effectiveness']
        return 0.0
