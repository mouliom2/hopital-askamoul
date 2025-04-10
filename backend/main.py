from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
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
    allow_origins=["*"],
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
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

# Routes patients
@app.post("/patients/", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    return crud.create_patient(db=db, patient=patient)

@app.get("/patients/", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patients = crud.get_patients(db, skip=skip, limit=limit)
    return patients

@app.get("/patients/{patient_id}", response_model=schemas.Patient)
def read_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = crud.get_patient(db, patient_id=patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

# Routes rendez-vous
@app.post("/appointments/", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    return crud.create_appointment(db=db, appointment=appointment)

@app.get("/appointments/", response_model=List[schemas.Appointment])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    appointments = crud.get_appointments(db, skip=skip, limit=limit)
    return appointments

@app.get("/patients/{patient_id}/appointments/", response_model=List[schemas.Appointment])
def read_patient_appointments(patient_id: int, db: Session = Depends(get_db)):
    appointments = crud.get_patient_appointments(db, patient_id=patient_id)
    return appointments

# Routes dossiers médicaux
@app.post("/medical-records/", response_model=schemas.MedicalRecord)
def create_medical_record(record: schemas.MedicalRecordCreate, db: Session = Depends(get_db)):
    return crud.create_medical_record(db=db, record=record)

@app.get("/patients/{patient_id}/medical-records/", response_model=List[schemas.MedicalRecord])
def read_patient_medical_records(patient_id: int, db: Session = Depends(get_db)):
    records = crud.get_patient_medical_records(db, patient_id=patient_id)
    return records

# Route statistiques tableau de bord
@app.get("/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    try:
        return {
            "totalPatients": len(crud.get_patients(db)),
            "appointmentsToday": len([a for a in crud.get_appointments(db) 
                if a.datetime.date() == datetime.now().date()]),
            "pendingAppointments": len([a for a in crud.get_appointments(db) 
                if a.status == "scheduled"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
