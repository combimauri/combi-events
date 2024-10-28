export interface AdditionalQuestion {
  answer: string;
  key: string;
  label: string;
  options?: string[];
  required: boolean;
  type: 'text' | 'select';
}
