import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'combi-timeline-item',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="timeline-item">
      <div class="timeline-item__date">
        <b>{{ date() | date: 'd MMM' }}</b>
        <span>{{ date() | date: 'HH:mm' }}</span>
      </div>
      <span class="timeline-item__line"></span>
      <ng-content />
    </div>
  `,
  styles: `
    .timeline-item {
      display: flex;

      .timeline-item__date {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        width: 54px;
      }

      .timeline-item__line {
        border-left: 2px dashed #9119ff;
        margin: 1rem 1rem 0;

        @media (min-width: 960px) {
          margin: 1rem 2rem 0;
        }

        &::before {
          background-color: #9119ff;
          border-radius: 50%;
          content: '';
          display: block;
          height: 10px;
          margin-left: -6px;
          width: 10px;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineItemComponent {
  readonly date = input.required<Date>();
}
