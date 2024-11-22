import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import type { DiagnosisTemplate } from '../types';

interface DiagnosisListProps {
  diagnoses: DiagnosisTemplate[];
  onEdit: (diagnosis: DiagnosisTemplate) => void;
  onDelete: (id: string) => void;
}

export const DiagnosisList: React.FC<DiagnosisListProps> = ({
  diagnoses,
  onEdit,
  onDelete
}) => {
  return (
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
                onClick={() => onEdit(diagnosis)}
                className="p-2 text-blue-600 hover:text-blue-800"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={() => onDelete(diagnosis.id)}
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
                {diagnosis.symptoms.map((symptom, index) => (
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
                {diagnosis.diagnosticMethods.map((method, index) => (
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
                {diagnosis.treatments.map((treatment, index) => (
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
  );
};