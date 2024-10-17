import { Pipe, PipeTransform } from '@angular/core';
import { AdditionalQuestion } from '@core/models';

@Pipe({
  name: 'questionLabel',
  standalone: true,
})
export class QuestionLabelPipe implements PipeTransform {
  transform(key: string | unknown, questions: AdditionalQuestion[]): unknown {
    return questions.find((question) => question.key === key)?.label || key;
  }
}
