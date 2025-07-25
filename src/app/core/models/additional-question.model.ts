export interface AdditionalQuestion {
  answer?: string | string[];
  key: string;
  label: string;
  description?: string;
  multiple?: boolean;
  options?: string[];
  required: boolean;
  type: 'text' | 'select' | 'info';
  dependsOn?: { question: string; answer: string };
  visible?: boolean;
}
