import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import type { User, DiagnosisTemplate, PatientDiagnosis } from '../types';
import toast from 'react-hot-toast';
import { DiagnosisForm } from '../components/DiagnosisForm';
import { DiagnosisHistoryList } from '../components/DiagnosisHistoryList';

export const DoctorProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [diagnosisTemplates, setDiagnosisTemplates] = useState<DiagnosisTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DiagnosisTemplate | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedDiagnostics, setSelectedDiagnostics] = useState<string[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [patientDiagnoses, setPatientDiagnoses] = useState<PatientDiagnosis[]>([]);

  const fetchPatientDiagnoses = useCallback(async (patientId: string) => {
    if (!patientId) {
      setPatientDiagnoses([]);
      return;
    }

    try {
      const diagnosesQuery = query(
        collection(db, 'diagnoses'),
        where('patientId', '==', patientId)
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
      
      setPatientDiagnoses(diagnosesData);
    } catch (error) {
      console.error('Error fetching patient diagnoses:', error);
      toast.error('Ошибка при загрузке диагнозов пациента');
      setPatientDiagnoses([]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const patientsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'patient')
        );
        const patientsSnapshot = await getDocs(patientsQuery);
        const patientsData = patientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        setPatients(patientsData);

        const templatesSnapshot = await getDocs(collection(db, 'diagnosisTemplates'));
        const templatesData = templatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DiagnosisTemplate[];
        setDiagnosisTemplates(templatesData);
      } catch (error) {
        toast.error('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      setLoading(true);
      fetchPatientDiagnoses(selectedPatient).finally(() => setLoading(false));
    }
  }, [selectedPatient, fetchPatientDiagnoses]);

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = diagnosisTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setSelectedSymptoms([]);
      setSelectedDiagnostics([]);
      setSelectedTreatment('');
    }
  }, [diagnosisTemplates]);

  const resetForm = useCallback(() => {
    setSelectedTemplate(null);
    setSelectedSymptoms([]);
    setSelectedDiagnostics([]);
    setSelectedTreatment('');
  }, []);

  const handleDelete = async (diagnosisId: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'diagnoses', diagnosisId));
      toast.success('Диагноз успешно удален');
      await fetchPatientDiagnoses(selectedPatient);
    } catch (error) {
      console.error('Error deleting diagnosis:', error);
      toast.error('Ошибка при удалении диагноза');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedTemplate || !selectedTreatment) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      setLoading(true);
      const timestamp = serverTimestamp();
      const diagnosisData = {
        patientId: selectedPatient,
        doctorId: user?.id,
        diagnosisId: selectedTemplate.id,
        selectedSymptoms,
        selectedDiagnostics,
        selectedTreatment,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      await addDoc(collection(db, 'diagnoses'), diagnosisData);
      await fetchPatientDiagnoses(selectedPatient);
      toast.success('Диагноз успешно добавлен');
      resetForm();
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      toast.error('Ошибка при сохранении диагноза');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Кабинет врача</h2>
      
      <DiagnosisForm
        patients={patients}
        diagnosisTemplates={diagnosisTemplates}
        selectedPatient={selectedPatient}
        selectedTemplate={selectedTemplate}
        selectedSymptoms={selectedSymptoms}
        selectedDiagnostics={selectedDiagnostics}
        selectedTreatment={selectedTreatment}
        onPatientSelect={setSelectedPatient}
        onTemplateSelect={handleTemplateSelect}
        onSymptomsChange={setSelectedSymptoms}
        onDiagnosticsChange={setSelectedDiagnostics}
        onTreatmentChange={setSelectedTreatment}
        onSubmit={handleSubmit}
      />

      {selectedPatient && patientDiagnoses.length > 0 && (
        <DiagnosisHistoryList 
          diagnoses={patientDiagnoses}
          currentUserId={user?.id}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};