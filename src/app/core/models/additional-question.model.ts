export interface AdditionalQuestion {
  answer?: string | string[];
  key: string;
  label: string;
  multiple?: boolean;
  options?: string[];
  required: boolean;
  type: 'text' | 'select' | 'info';
}
