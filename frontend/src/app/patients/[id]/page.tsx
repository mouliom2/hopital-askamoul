'use client';

import { useState, useEffect } from 'react';
import { Patient, Appointment, MedicalRecord } from '@/types';

export default function PatientDetailsPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const [patientRes, appointmentsRes, recordsRes] = await Promise.all([
          fetch(`http://localhost:8000/patients/${params.id}`),
          fetch(`http://localhost:8000/patients/${params.id}/appointments/`),
          fetch(`http://localhost:8000/patients/${params.id}/medical-records/`)
        ]);

        if (!patientRes.ok) throw new Error('Patient non trouvé');

        const patientData = await patientRes.json();
        const appointmentsData = await appointmentsRes.json();
        const recordsData = await recordsRes.json();

        setPatient(patientData);
        setAppointments(appointmentsData);
        setMedicalRecords(recordsData);
      } catch (err) {
        setError('Erreur lors du chargement des données du patient');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [params.id]);

  if (isLoading) return <div className="text-center p-4">Chargement...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!patient) return <div className="text-center p-4">Patient non trouvé</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Informations du Patient
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Nom Complet</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.full_name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Date de Naissance</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(patient.date_of_birth).toLocaleDateString()}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Genre</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.gender}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Contact</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.contact_number}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Adresse</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.address}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Antécédents Médicaux</dt>
              <dd className="mt-1 text-sm text-gray-900">{patient.medical_history || 'Aucun'}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Rendez-vous</h4>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {appointments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <li key={appointment.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(appointment.datetime).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Status: {appointment.status}</p>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500">{appointment.notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 p-4">Aucun rendez-vous</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Dossiers Médicaux</h4>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {medicalRecords.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {medicalRecords.map((record) => (
                <li key={record.id} className="px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-900 mt-2">
                      <span className="font-medium">Diagnostic:</span> {record.diagnosis}
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      <span className="font-medium">Traitement:</span> {record.treatment}
                    </p>
                    {record.prescription && (
                      <p className="text-sm text-gray-900 mt-1">
                        <span className="font-medium">Prescription:</span> {record.prescription}
                      </p>
                    )}
                    {record.notes && (
                      <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 p-4">Aucun dossier médical</p>
          )}
        </div>
      </div>
    </div>
  );
}
