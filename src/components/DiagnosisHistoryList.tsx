import React from 'react';
import type { PatientDiagnosis } from '../types';
import { User, Trash2 } from 'lucide-react';

interface DiagnosisHistoryListProps {
  diagnoses: PatientDiagnosis[];
  currentUserId?: string;
  onDelete?: (diagnosisId: string) => Promise<void>;
}

export const DiagnosisHistoryList: React.FC<DiagnosisHistoryListProps> = ({ 
  diagnoses,
  currentUserId,
  onDelete
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">История диагнозов пациента</h3>
      <div className="space-y-4">
        {diagnoses.map((diagnosis) => (
          <div key={diagnosis.id} className="border-t pt-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold">{diagnosis.template?.name}</h4>
                <p className="text-sm text-gray-500">
                  {diagnosis.createdAt?.seconds ? 
                    new Date(diagnosis.createdAt.seconds * 1000).toLocaleDateString() :
                    'Дата не указана'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-gray-600">
                  <User size={16} className="mr-2" />
                  <span className="text-sm">
                    {diagnosis.doctor?.name || 'Врач не указан'}
                  </span>
                </div>
                {onDelete && currentUserId === diagnosis.doctorId && (
                  <button
                    onClick={() => onDelete(diagnosis.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Удалить диагноз"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h5 className="font-medium">Симптомы:</h5>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {diagnosis.selectedSymptoms?.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium">Методы диагностики:</h5>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {diagnosis.selectedDiagnostics?.map((method, index) => (
                    <li key={index}>{method}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium">Назначенное лечение:</h5>
                <p className="text-sm text-gray-600">{diagnosis.selectedTreatment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};