from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from database import get_db
import schemas
from ai_models.risk_prediction import HealthRiskPredictor
from ai_models.treatment_recommendation import TreatmentRecommender

router = APIRouter()
risk_predictor = HealthRiskPredictor()
treatment_recommender = TreatmentRecommender()

@router.post("/ai/predict-health-risks/{patient_id}")
async def predict_health_risks(
    patient_id: int,
    patient_data: Dict,
    db: Session = Depends(get_db)
):
    """Prédit les risques de santé pour un patient donné."""
    try:
        risks = risk_predictor.predict_health_risks(patient_data)
        risk_factors = risk_predictor.get_risk_factors(patient_data)
        
        return {
            "patient_id": patient_id,
            "risks": risks,
            "risk_factors": risk_factors,
            "recommendations": [
                factor["recommendation"] for factor in risk_factors
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la prédiction des risques: {str(e)}"
        )

@router.post("/ai/recommend-treatment/{patient_id}")
async def recommend_treatment(
    patient_id: int,
    patient_data: Dict,
    db: Session = Depends(get_db)
):
    """Recommande des traitements pour un patient basés sur ses symptômes."""
    try:
        recommendations = treatment_recommender.recommend_treatments(patient_data)
        
        return {
            "patient_id": patient_id,
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la recommandation de traitement: {str(e)}"
        )

@router.get("/ai/analysis/patient-trends/{patient_id}")
async def analyze_patient_trends(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """Analyse les tendances de santé d'un patient au fil du temps."""
    try:
        # Récupération de l'historique des données du patient
        # Cette partie serait implémentée avec l'accès à la base de données
        
        return {
            "patient_id": patient_id,
            "trends": {
                "blood_pressure": {
                    "trend": "stable",
                    "data": [
                        {"date": "2025-01-01", "value": 120},
                        {"date": "2025-02-01", "value": 122},
                        {"date": "2025-03-01", "value": 118}
                    ]
                },
                "glucose_levels": {
                    "trend": "improving",
                    "data": [
                        {"date": "2025-01-01", "value": 110},
                        {"date": "2025-02-01", "value": 105},
                        {"date": "2025-03-01", "value": 100}
                    ]
                }
            },
            "analysis": "Les indicateurs de santé montrent une tendance stable avec une amélioration des niveaux de glucose."
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'analyse des tendances: {str(e)}"
        )

@router.get("/ai/analysis/population-health")
async def analyze_population_health(
    db: Session = Depends(get_db)
):
    """Analyse les tendances de santé de la population globale."""
    try:
        # Cette fonction analyserait les données de tous les patients
        # pour identifier des tendances générales
        
        return {
            "trends": {
                "most_common_conditions": [
                    {"condition": "hypertension", "percentage": 25},
                    {"condition": "diabète", "percentage": 15},
                    {"condition": "obésité", "percentage": 20}
                ],
                "age_distribution": {
                    "18-30": 20,
                    "31-50": 40,
                    "51-70": 30,
                    "70+": 10
                },
                "treatment_effectiveness": {
                    "hypertension_treatments": 85,
                    "diabetes_treatments": 80,
                    "obesity_interventions": 70
                }
            },
            "recommendations": [
                "Augmenter les programmes de prévention pour l'hypertension",
                "Développer des interventions ciblées pour la gestion du diabète",
                "Mettre en place des programmes d'éducation nutritionnelle"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'analyse de la population: {str(e)}"
        )
