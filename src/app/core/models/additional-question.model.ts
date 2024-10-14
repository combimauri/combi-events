export interface AdditionalQuestion {
  key: string;
  label: string;
  type: 'text' | 'select';
  required: boolean;
  options?: string[];
  answer: string;
}
