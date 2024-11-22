import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { PlusCircle, Trash2, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { DiagnosisTemplate } from '../types';

export const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [diagnoses, setDiagnoses] = useState<DiagnosisTemplate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [diagnosisData, setDiagnosisData] = useState<Omit<DiagnosisTemplate, 'id'>>({
    name: '',
    icdCode: '',
    icdLink: '',
    description: '',
    symptoms: [],
    diagnosticMethods: [],
    treatments: []
  });

  // Temporary states for new items
  const [newSymptom, setNewSymptom] = useState({ name: '', description: '' });
  const [newMethod, setNewMethod] = useState({ name: '', description: '' });
  const [newTreatment, setNewTreatment] = useState({ name: '', description: '', recommendations: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchDiagnoses = async () => {
      try {
        const diagnosesSnapshot = await getDocs(collection(db, 'diagnosisTemplates'));
        const diagnosesData = diagnosesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DiagnosisTemplate[];
        setDiagnoses(diagnosesData);
      } catch (error) {
        toast.error('Ошибка при загрузке диагнозов');
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnoses();
  }, [user, navigate]);

  const resetForm = () => {
    setDiagnosisData({
      name: '',
      icdCode: '',
      icdLink: '',
      description: '',
      symptoms: [],
      diagnosticMethods: [],
      treatments: []
    });
    setNewSymptom({ name: '', description: '' });
    setNewMethod({ name: '', description: '' });
    setNewTreatment({ name: '', description: '', recommendations: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleAddDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await updateDoc(doc(db, 'diagnosisTemplates', editingId), diagnosisData);
        toast.success('Диагноз обновлен');
      } else {
        await addDoc(collection(db, 'diagnosisTemplates'), diagnosisData);
        toast.success('Диагноз добавлен');
      }
      
      // Refresh diagnoses list
      const diagnosesSnapshot = await getDocs(collection(db, 'diagnosisTemplates'));
      const diagnosesData = diagnosesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DiagnosisTemplate[];
      setDiagnoses(diagnosesData);
      
      resetForm();
    } catch (error) {
      toast.error(isEditing ? 'Ошибка при обновлении диагноза' : 'Ошибка при добавлении диагноза');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'diagnosisTemplates', id));
      setDiagnoses(diagnoses.filter(d => d.id !== id));
      toast.success('Диагноз удален');
    } catch (error) {
      toast.error('Ошибка при удалении диагноза');
    }
  };

  const handleEdit = (diagnosis: DiagnosisTemplate) => {
    setDiagnosisData({
      name: diagnosis.name,
      icdCode: diagnosis.icdCode,
      icdLink: diagnosis.icdLink,
      description: diagnosis.description,
      symptoms: diagnosis.symptoms || [],
      diagnosticMethods: diagnosis.diagnosticMethods || [],
      treatments: diagnosis.treatments || []
    });
    setIsEditing(true);
    setEditingId(diagnosis.id);
  };

  const addSymptom = () => {
    if (newSymptom.name) {
      setDiagnosisData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, newSymptom]
      }));
      setNewSymptom({ name: '', description: '' });
    }
  };

  const addMethod = () => {
    if (newMethod.name) {
      setDiagnosisData(prev => ({
        ...prev,
        diagnosticMethods: [...prev.diagnosticMethods, newMethod]
      }));
      setNewMethod({ name: '', description: '' });
    }
  };

  const addTreatment = () => {
    if (newTreatment.name) {
      setDiagnosisData(prev => ({
        ...prev,
        treatments: [...prev.treatments, newTreatment]
      }));
      setNewTreatment({ name: '', description: '', recommendations: '' });
    }
  };

  const removeSymptom = (index: number) => {
    setDiagnosisData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  const removeMethod = (index: number) => {
    setDiagnosisData(prev => ({
      ...prev,
      diagnosticMethods: prev.diagnosticMethods.filter((_, i) => i !== index)
    }));
  };

  const removeTreatment = (index: number) => {
    setDiagnosisData(prev => ({
      ...prev,
      treatments: prev.treatments.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Управление диагнозами</h2>

      <form onSubmit={handleAddDiagnosis} className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Название диагноза"
            value={diagnosisData.name}
            onChange={(e) => setDiagnosisData(prev => ({ ...prev, name: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Код МКБ"
            value={diagnosisData.icdCode}
            onChange={(e) => setDiagnosisData(prev => ({ ...prev, icdCode: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <input
            type="url"
            placeholder="Ссылка МКБ"
            value={diagnosisData.icdLink}
            onChange={(e) => setDiagnosisData(prev => ({ ...prev, icdLink: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <textarea
            placeholder="Описание диагноза"
            value={diagnosisData.description}
            onChange={(e) => setDiagnosisData(prev => ({ ...prev, description: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Symptoms Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Симптомы</h3>
          <div className="space-y-2 mb-4">
            {diagnosisData.symptoms.map((symptom, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div>
                  <p className="font-medium">{symptom.name}</p>
                  <p className="text-sm text-gray-600">{symptom.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSymptom(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Название симптома"
              value={newSymptom.name}
              onChange={(e) => setNewSymptom(prev => ({ ...prev, name: e.target.value }))}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Описание симптома"
              value={newSymptom.description}
              onChange={(e) => setNewSymptom(prev => ({ ...prev, description: e.target.value }))}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addSymptom}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusCircle size={20} />
            </button>
          </div>
        </div>

        {/* Diagnostic Methods Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Методы диагностики</h3>
          <div className="space-y-2 mb-4">
            {diagnosisData.diagnosticMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div>
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeMethod(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Название метода"
              value={newMethod.name}
              onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Описание метода"
              value={newMethod.description}
              onChange={(e) => setNewMethod(prev => ({ ...prev, description: e.target.value }))}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addMethod}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusCircle size={20} />
            </button>
          </div>
        </div>

        {/* Treatments Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Курсы лечения</h3>
          <div className="space-y-2 mb-4">
            {diagnosisData.treatments.map((treatment, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div>
                  <p className="font-medium">{treatment.name}</p>
                  <p className="text-sm text-gray-600">{treatment.description}</p>
                  <p className="text-sm text-gray-600">{treatment.recommendations}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeTreatment(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Название курса лечения"
              value={newTreatment.name}
              onChange={(e) => setNewTreatment(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Описание курса лечения"
              value={newTreatment.description}
              onChange={(e) => setNewTreatment(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Рекомендации"
                value={newTreatment.recommendations}
                onChange={(e) => setNewTreatment(prev => ({ ...prev, recommendations: e.target.value }))}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addTreatment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusCircle size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Отмена
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEditing ? 'Обновить диагноз' : 'Добавить диагноз'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {diagnoses.map((diagnosis) => (
          <div key={diagnosis.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{diagnosis.name}</h3>
                <p className="text-gray-600">{diagnosis.icdCode}</p>
                <a
                  href={diagnosis.icdLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Ссылка МКБ
                </a>
                <p className="mt-2">{diagnosis.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(diagnosis)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => handleDelete(diagnosis.id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Симптомы:</h4>
                <ul className="list-disc list-inside">
                  {(diagnosis.symptoms || []).map((symptom, index) => (
                    <li key={index} className="text-gray-700">
                      {symptom.name}
                      {symptom.description && (
                        <p className="text-sm text-gray-500 ml-4">{symptom.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Методы диагностики:</h4>
                <ul className="list-disc list-inside">
                  {(diagnosis.diagnosticMethods || []).map((method, index) => (
                    <li key={index} className="text-gray-700">
                      {method.name}
                      {method.description && (
                        <p className="text-sm text-gray-500 ml-4">{method.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Курсы лечения:</h4>
                <ul className="list-disc list-inside">
                  {(diagnosis.treatments || []).map((treatment, index) => (
                    <li key={index} className="text-gray-700">
                      {treatment.name}
                      {treatment.description && (
                        <p className="text-sm text-gray-500 ml-4">{treatment.description}</p>
                      )}
                      {treatment.recommendations && (
                        <p className="text-sm text-gray-500 ml-4">
                          Рекомендации: {treatment.recommendations}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};