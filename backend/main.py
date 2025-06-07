from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
import crud, models, schemas
from database import engine, get_db
from datetime import datetime, timedelta
import uvicorn
import ai_routes

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Système de Gestion Hospitalière")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes d'IA
app.include_router(ai_routes.router, tags=["AI"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Routes utilisateurs
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Créer un nouvel utilisateur"""
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Récupérer la liste des utilisateurs"""
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    """Récupérer un utilisateur par ID"""
    user = crud.get_user(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Routes patients
@app.post("/patients/", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    """Créer un nouveau patient"""
    return crud.create_patient(db=db, patient=patient)

@app.get("/patients/", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Récupérer la liste des patients"""
    patients = crud.get_patients(db, skip=skip, limit=limit)
    return patients

@app.get("/patients/{patient_id}", response_model=schemas.Patient)
def read_patient(patient_id: int, db: Session = Depends(get_db)):
    """Récupérer un patient par ID"""
    patient = crud.get_patient(db, patient_id=patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.put("/patients/{patient_id}", response_model=schemas.Patient)
def update_patient(patient_id: int, patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    """Mettre à jour un patient"""
    db_patient = crud.get_patient(db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    for key, value in patient.dict().items():
        setattr(db_patient, key, value)
    
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    """Supprimer un patient"""
    db_patient = crud.get_patient(db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db.delete(db_patient)
    db.commit()
    return {"message": "Patient deleted successfully"}

# Routes rendez-vous
@app.post("/appointments/", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    """Créer un nouveau rendez-vous"""
    return crud.create_appointment(db=db, appointment=appointment)

@app.get("/appointments/", response_model=List[schemas.Appointment])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Récupérer la liste des rendez-vous"""
    appointments = crud.get_appointments(db, skip=skip, limit=limit)
    return appointments

@app.get("/appointments/{appointment_id}", response_model=schemas.Appointment)
def read_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """Récupérer un rendez-vous par ID"""
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@app.put("/appointments/{appointment_id}", response_model=schemas.Appointment)
def update_appointment(appointment_id: int, appointment_data: Dict, db: Session = Depends(get_db)):
    """Mettre à jour un rendez-vous"""
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    for key, value in appointment_data.items():
        if key == 'datetime' and isinstance(value, str):
            value = datetime.fromisoformat(value)
        setattr(db_appointment, key, value)
    
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@app.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """Supprimer un rendez-vous"""
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db.delete(db_appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}

@app.get("/patients/{patient_id}/appointments/", response_model=List[schemas.Appointment])
def read_patient_appointments(patient_id: int, db: Session = Depends(get_db)):
    """Récupérer les rendez-vous d'un patient"""
    appointments = crud.get_patient_appointments(db, patient_id=patient_id)
    return appointments

# Routes dossiers médicaux
@app.post("/medical-records/", response_model=schemas.MedicalRecord)
def create_medical_record(record: schemas.MedicalRecordCreate, db: Session = Depends(get_db)):
    """Créer un nouveau dossier médical"""
    return crud.create_medical_record(db=db, record=record)

@app.get("/medical-records/", response_model=List[schemas.MedicalRecord])
def read_medical_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Récupérer la liste des dossiers médicaux"""
    records = db.query(models.MedicalRecord).offset(skip).limit(limit).all()
    return records

@app.get("/patients/{patient_id}/medical-records/", response_model=List[schemas.MedicalRecord])
def read_patient_medical_records(patient_id: int, db: Session = Depends(get_db)):
    """Récupérer les dossiers médicaux d'un patient"""
    records = crud.get_patient_medical_records(db, patient_id=patient_id)
    return records

# Route statistiques tableau de bord
@app.get("/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Récupérer les statistiques du tableau de bord"""
    try:
        total_patients = db.query(models.Patient).count()
        total_appointments = db.query(models.Appointment).count()
        
        # Rendez-vous d'aujourd'hui
        today = datetime.now().date()
        appointments_today = db.query(models.Appointment).filter(
            models.Appointment.datetime >= datetime.combine(today, datetime.min.time()),
            models.Appointment.datetime < datetime.combine(today + timedelta(days=1), datetime.min.time())
        ).count()
        
        # Rendez-vous en attente
        pending_appointments = db.query(models.Appointment).filter(
            models.Appointment.status == "scheduled"
        ).count()
        
        return {
            "totalPatients": total_patients,
            "appointmentsToday": appointments_today,
            "pendingAppointments": pending_appointments,
            "totalAppointments": total_appointments
        }
    except Exception as e:
        print(f"Erreur lors du calcul des statistiques: {e}")
        return {
            "totalPatients": 0,
            "appointmentsToday": 0,
            "pendingAppointments": 0,
            "totalAppointments": 0
        }

# Route de test de connectivité
@app.get("/health")
async def health_check():
    """Vérifier l'état de l'API"""
    return {"status": "healthy", "timestamp": datetime.now()}

# Route pour les données de démonstration
@app.post("/demo/populate")
async def populate_demo_data(db: Session = Depends(get_db)):
    """Peupler la base de données avec des données de démonstration"""
    try:
        # Créer des utilisateurs de démonstration
        demo_users = [
            {"email": "dr.laurent@hopital.fr", "full_name": "Dr. Sophie Laurent", "role": "Médecin", "password": "demo123"},
            {"email": "infirmier.bernard@hopital.fr", "full_name": "Marc Bernard", "role": "Infirmier", "password": "demo123"},
            {"email": "admin@hopital.fr", "full_name": "Julie Petit", "role": "Administration", "password": "demo123"}
        ]
        
        for user_data in demo_users:
            existing_user = crud.get_user_by_email(db, user_data["email"])
            if not existing_user:
                user_create = schemas.UserCreate(**user_data)
                crud.create_user(db, user_create)
        
        # Créer des patients de démonstration
        demo_patients = [
            {
                "full_name": "Jean Dupont",
                "date_of_birth": datetime(1980, 5, 15),
                "gender": "M",
                "contact_number": "01 23 45 67 89",
                "address": "123 Rue de la Paix, 75001 Paris",
                "medical_history": "Hypertension légère"
            },
            {
                "full_name": "Marie Martin",
                "date_of_birth": datetime(1975, 8, 22),
                "gender": "F",
                "contact_number": "01 23 45 67 90",
                "address": "456 Avenue des Champs, 75008 Paris",
                "medical_history": "Diabète type 2"
            },
            {
                "full_name": "Pierre Durand",
                "date_of_birth": datetime(1990, 12, 3),
                "gender": "M",
                "contact_number": "01 23 45 67 91",
                "address": "789 Boulevard Saint-Germain, 75006 Paris",
                "medical_history": ""
            }
        ]
        
        created_patients = []
        for patient_data in demo_patients:
            patient_create = schemas.PatientCreate(**patient_data)
            patient = crud.create_patient(db, patient_create)
            created_patients.append(patient)
        
        # Créer des rendez-vous de démonstration
        if created_patients:
            demo_appointments = [
                {
                    "patient_id": created_patients[0].id,
                    "doctor_id": 1,  # Dr. Laurent
                    "datetime": datetime.now() + timedelta(days=1, hours=9),
                    "status": "scheduled",
                    "notes": "Consultation de suivi"
                },
                {
                    "patient_id": created_patients[1].id,
                    "doctor_id": 1,
                    "datetime": datetime.now() + timedelta(days=2, hours=14),
                    "status": "scheduled",
                    "notes": "Contrôle diabète"
                }
            ]
            
            for apt_data in demo_appointments:
                apt_create = schemas.AppointmentCreate(**apt_data)
                crud.create_appointment(db, apt_create)
        
        return {"message": "Données de démonstration créées avec succès"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création des données: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)