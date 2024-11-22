export interface User {
  id: string;
  omsNumber: string;
  role: 'patient' | 'doctor' | 'admin';
  name: string;
}

export interface Symptom {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  commonlyAssociatedWith: string[];
  requiresImmediateAttention: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiagnosticMethod {
  id: string;
  name: string;
  description: string;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  recommendations: string;
}

export interface DiagnosisTemplate {
  id: string;
  name: string;
  icdCode: string;
  icdLink: string;
  description: string;
  symptoms: {
    name: string;
    description: string;
  }[];
  diagnosticMethods: {
    name: string;
    description: string;
  }[];
  treatments: {
    name: string;
    description: string;
    recommendations: string;
  }[];
}

export interface PatientDiagnosis {
  id: string;
  patientId: string;
  doctorId: string;
  doctor?: User;
  diagnosisId: string;
  template?: DiagnosisTemplate;
  selectedSymptoms: string[];
  selectedDiagnostics: string[];
  selectedTreatment: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  updatedAt: {
    seconds: number;
    nanoseconds: number;
  };
}