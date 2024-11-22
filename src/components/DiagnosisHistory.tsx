import React from 'react';
import type { PatientDiagnosis } from '../types';

interface DiagnosisHistoryProps {
  diagnosis: PatientDiagnosis;
}

export const DiagnosisHistory: React.FC<DiagnosisHistoryProps> = ({ diagnosis }) => {
  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{diagnosis.template?.name}</h4>
          <p className="text-sm text-gray-500">
            {new Date(diagnosis.createdAt.seconds * 1000).toLocaleDateString()}
          </p>
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
  );
};