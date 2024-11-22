import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { DiagnosisTemplate, PatientDiagnosis } from '../types';
import { DiagnosisHistoryList } from '../components/DiagnosisHistoryList';

export const PatientProfile = () => {
  const { user } = useAuth();
  const [diagnoses, setDiagnoses] = useState<PatientDiagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      if (!user?.id) return;

      try {
        const diagnosesQuery = query(
          collection(db, 'diagnoses'),
          where('patientId', '==', user.id)
        );
        const diagnosesSnapshot = await getDocs(diagnosesQuery);
        
        const diagnosesData = await Promise.all(
          diagnosesSnapshot.docs.map(async (diagnosisDoc) => {
            const data = diagnosisDoc.data();
            let template = null;
            let doctor = null;

            if (data.diagnosisId) {
              const templateDoc = await getDoc(doc(db, 'diagnosisTemplates', data.diagnosisId));
              if (templateDoc.exists()) {
                template = { id: templateDoc.id, ...templateDoc.data() } as DiagnosisTemplate;
              }
            }

            if (data.doctorId) {
              const doctorDoc = await getDoc(doc(db, 'users', data.doctorId));
              if (doctorDoc.exists()) {
                doctor = { id: doctorDoc.id, ...doctorDoc.data() } as User;
              }
            }

            return {
              id: diagnosisDoc.id,
              ...data,
              template,
              doctor,
              selectedSymptoms: data.selectedSymptoms || [],
              selectedDiagnostics: data.selectedDiagnostics || [],
              selectedTreatment: data.selectedTreatment || ''
            } as PatientDiagnosis;
          })
        );

        setDiagnoses(diagnosesData);
        setError(null);
      } catch (err) {
        setError('Ошибка при загрузке диагнозов');
        console.error('Error fetching diagnoses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnoses();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Личный кабинет пациента</h2>
      
      {diagnoses.length > 0 ? (
        <DiagnosisHistoryList diagnoses={diagnoses} />
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          У вас пока нет активных диагнозов
        </div>
      )}
    </div>
  );
};