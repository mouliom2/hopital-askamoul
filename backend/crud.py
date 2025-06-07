from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime
import models, schemas
from typing import List, Optional
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Fonctions utilisateurs
def get_user(db: Session, user_id: int):
    """Récupérer un utilisateur par ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """Récupérer un utilisateur par email"""
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Récupérer la liste des utilisateurs"""
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    """Créer un nouvel utilisateur"""
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserCreate):
    """Mettre à jour un utilisateur"""
    db_user = get_user(db, user_id)
    if db_user:
        for key, value in user_update.dict(exclude_unset=True).items():
            if key == "password":
                value = pwd_context.hash(value)
                key = "hashed_password"
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    """Supprimer un utilisateur"""
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False

# Fonctions patients
def get_patient(db: Session, patient_id: int):
    """Récupérer un patient par ID"""
    return db.query(models.Patient).filter(models.Patient.id == patient_id).first()

def get_patients(db: Session, skip: int = 0, limit: int = 100):
    """Récupérer la liste des patients"""
    return db.query(models.Patient).offset(skip).limit(limit).all()

def create_patient(db: Session, patient: schemas.PatientCreate):
    """Créer un nouveau patient"""
    db_patient = models.Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def update_patient(db: Session, patient_id: int, patient_update: schemas.PatientCreate):
    """Mettre à jour un patient"""
    db_patient = get_patient(db, patient_id)
    if db_patient:
        for key, value in patient_update.dict(exclude_unset=True).items():
            setattr(db_patient, key, value)
        db.commit()
        db.refresh(db_patient)
    return db_patient

def delete_patient(db: Session, patient_id: int):
    """Supprimer un patient"""
    db_patient = get_patient(db, patient_id)
    if db_patient:
        db.delete(db_patient)
        db.commit()
        return True
    return False

def search_patients(db: Session, search_term: str, skip: int = 0, limit: int = 100):
    """Rechercher des patients par nom"""
    return db.query(models.Patient).filter(
        models.Patient.full_name.ilike(f"%{search_term}%")
    ).offset(skip).limit(limit).all()

# Fonctions rendez-vous
def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    """Créer un nouveau rendez-vous"""
    db_appointment = models.Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def get_appointment(db: Session, appointment_id: int):
    """Récupérer un rendez-vous par ID"""
    return db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    """Récupérer la liste des rendez-vous"""
    return db.query(models.Appointment).offset(skip).limit(limit).all()

def get_patient_appointments(db: Session, patient_id: int):
    """Récupérer les rendez-vous d'un patient"""
    return db.query(models.Appointment).filter(models.Appointment.patient_id == patient_id).all()

def get_doctor_appointments(db: Session, doctor_id: int, date: Optional[datetime] = None):
    """Récupérer les rendez-vous d'un médecin"""
    query = db.query(models.Appointment).filter(models.Appointment.doctor_id == doctor_id)
    if date:
        query = query.filter(func.date(models.Appointment.datetime) == date.date())
    return query.all()

def get_appointments_by_date(db: Session, date: datetime):
    """Récupérer les rendez-vous d'une date donnée"""
    return db.query(models.Appointment).filter(
        func.date(models.Appointment.datetime) == date.date()
    ).all()

def update_appointment(db: Session, appointment_id: int, appointment_update: dict):
    """Mettre à jour un rendez-vous"""
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        for key, value in appointment_update.items():
            setattr(db_appointment, key, value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def delete_appointment(db: Session, appointment_id: int):
    """Supprimer un rendez-vous"""
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
        return True
    return False

# Fonctions dossiers médicaux
def create_medical_record(db: Session, record: schemas.MedicalRecordCreate):
    """Créer un nouveau dossier médical"""
    db_record = models.MedicalRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_medical_record(db: Session, record_id: int):
    """Récupérer un dossier médical par ID"""
    return db.query(models.MedicalRecord).filter(models.MedicalRecord.id == record_id).first()

def get_medical_records(db: Session, skip: int = 0, limit: int = 100):
    """Récupérer la liste des dossiers médicaux"""
    return db.query(models.MedicalRecord).offset(skip).limit(limit).all()

def get_patient_medical_records(db: Session, patient_id: int):
    """Récupérer les dossiers médicaux d'un patient"""
    return db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).order_by(models.MedicalRecord.date.desc()).all()

def update_medical_record(db: Session, record_id: int, record_update: schemas.MedicalRecordCreate):
    """Mettre à jour un dossier médical"""
    db_record = get_medical_record(db, record_id)
    if db_record:
        for key, value in record_update.dict(exclude_unset=True).items():
            setattr(db_record, key, value)
        db.commit()
        db.refresh(db_record)
    return db_record

def delete_medical_record(db: Session, record_id: int):
    """Supprimer un dossier médical"""
    db_record = get_medical_record(db, record_id)
    if db_record:
        db.delete(db_record)
        db.commit()
        return True
    return False

# Fonctions statistiques
def get_dashboard_stats(db: Session):
    """Récupérer les statistiques pour le tableau de bord"""
    from datetime import datetime, timedelta
    
    today = datetime.now().date()
    
    stats = {
        "total_patients": db.query(models.Patient).count(),
        "total_users": db.query(models.User).count(),
        "total_appointments": db.query(models.Appointment).count(),
        "appointments_today": db.query(models.Appointment).filter(
            func.date(models.Appointment.datetime) == today
        ).count(),
        "pending_appointments": db.query(models.Appointment).filter(
            models.Appointment.status == "scheduled"
        ).count(),
        "completed_appointments": db.query(models.Appointment).filter(
            models.Appointment.status == "completed"
        ).count(),
        "cancelled_appointments": db.query(models.Appointment).filter(
            models.Appointment.status == "cancelled"
        ).count(),
        "total_medical_records": db.query(models.MedicalRecord).count()
    }
    
    return stats

def get_appointments_statistics(db: Session, days: int = 30):
    """Récupérer les statistiques des rendez-vous sur une période"""
    from datetime import datetime, timedelta
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    
    appointments = db.query(models.Appointment).filter(
        func.date(models.Appointment.datetime) >= start_date,
        func.date(models.Appointment.datetime) <= end_date
    ).all()
    
    stats = {}
    for appointment in appointments:
        date_str = appointment.datetime.strftime('%Y-%m-%d')
        if date_str not in stats:
            stats[date_str] = {"scheduled": 0, "completed": 0, "cancelled": 0}
        stats[date_str][appointment.status] += 1
    
    return stats

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifier un mot de passe"""
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(db: Session, email: str, password: str):
    """Authentifier un utilisateur"""
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user