export interface StandardValidationError {
  code: string;
  message: string;
  field: string | null;
  value: any | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'structure' | 'coherence' | 'business' | 'critical' | 'context';
  stopsExecution: boolean;
}

export interface ExternalApiValidationResponse {
  success: boolean;
  message: string;
  errors: StandardValidationError[];
  warnings: StandardValidationError[];
  canContinue: boolean;
  timestamp: string;
}
