import React from 'react';
import { PlusCircle } from 'lucide-react';
import type { DiagnosisTemplate, User } from '../types';

interface DiagnosisFormProps {
  patients: User[];
  diagnosisTemplates: DiagnosisTemplate[];
  selectedPatient: string;
  selectedTemplate: DiagnosisTemplate | null;
  selectedSymptoms: string[];
  selectedDiagnostics: string[];
  selectedTreatment: string;
  onPatientSelect: (patientId: string) => void;
  onTemplateSelect: (templateId: string) => void;
  onSymptomsChange: (symptoms: string[]) => void;
  onDiagnosticsChange: (diagnostics: string[]) => void;
  onTreatmentChange: (treatment: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const DiagnosisForm: React.FC<DiagnosisFormProps> = ({
  patients,
  diagnosisTemplates,
  selectedPatient,
  selectedTemplate,
  selectedSymptoms,
  selectedDiagnostics,
  selectedTreatment,
  onPatientSelect,
  onTemplateSelect,
  onSymptomsChange,
  onDiagnosticsChange,
  onTreatmentChange,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-white shadow rounded-lg p-6 mb-8">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Пациент
        </label>
        <select
          value={selectedPatient}
          onChange={(e) => onPatientSelect(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Выберите пациента</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name} - {patient.omsNumber}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Шаблон диагноза
        </label>
        <select
          value={selectedTemplate?.id || ''}
          onChange={(e) => onTemplateSelect(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Выберите шаблон диагноза</option>
          {diagnosisTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} ({template.icdCode})
            </option>
          ))}
        </select>
      </div>

      {selectedTemplate && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Симптомы</h3>
            <div className="space-y-2">
              {selectedTemplate.symptoms.map((symptom, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.includes(symptom.name)}
                    onChange={(e) => {
                      const newSymptoms = e.target.checked
                        ? [...selectedSymptoms, symptom.name]
                        : selectedSymptoms.filter(s => s !== symptom.name);
                      onSymptomsChange(newSymptoms);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">
                    {symptom.name}
                    {symptom.description && (
                      <span className="text-sm text-gray-500 ml-2">
                        - {symptom.description}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Методы диагностики</h3>
            <div className="space-y-2">
              {selectedTemplate.diagnosticMethods.map((method, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedDiagnostics.includes(method.name)}
                    onChange={(e) => {
                      const newDiagnostics = e.target.checked
                        ? [...selectedDiagnostics, method.name]
                        : selectedDiagnostics.filter(m => m !== method.name);
                      onDiagnosticsChange(newDiagnostics);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">
                    {method.name}
                    {method.description && (
                      <span className="text-sm text-gray-500 ml-2">
                        - {method.description}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Курс лечения</h3>
            <div className="space-y-2">
              {selectedTemplate.treatments.map((treatment, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name="treatment"
                    value={treatment.name}
                    checked={selectedTreatment === treatment.name}
                    onChange={(e) => onTreatmentChange(e.target.value)}
                    className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">
                    {treatment.name}
                    {treatment.description && (
                      <div className="text-sm text-gray-500 ml-6">
                        <p>{treatment.description}</p>
                        {treatment.recommendations && (
                          <p className="mt-1">Рекомендации: {treatment.recommendations}</p>
                        )}
                      </div>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <PlusCircle size={20} />
          Добавить диагноз
        </button>
      </div>
    </form>
  );
};