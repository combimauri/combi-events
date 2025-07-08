import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoggerService } from '@core/services';
import { LoadingState } from '@core/states';
import { DragAndDropDirective } from '@shared/directives';

@Component({
  selector: 'combi-upload-box',
  standalone: true,
  imports: [
    DragAndDropDirective,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div
      combiDragAndDrop
      class="upload-box"
      [class.upload-box--enabled]="!loading() && !selectedFile()"
      [enabled]="!loading() && !selectedFile()"
      (click)="fileInput.click()"
      (selectFiles)="handleSelectFiles($event)"
    >
      @if (selectedFile(); as file) {
        <span class="upload-box__file-data">
          {{ file.name }}
          @if (!loading()) {
            <button
              mat-icon-button
              aria-label="Delete file icon"
              (click)="selectedFile.set(null)"
              [disabled]="loading()"
            >
              <mat-icon>delete</mat-icon>
            </button>
          } @else {
            <mat-spinner [diameter]="24"></mat-spinner>
          }
        </span>
      } @else {
        <mat-icon
          aria-hidden="false"
          aria-label="Upload file icon"
          fontIcon="cloud_upload"
          class="upload-box__upload-icon"
        ></mat-icon>
        <p>Haz click, o arrastra y suelta tu comprobante de pago aquí.</p>
      }
    </div>
    <input
      #fileInput
      type="file"
      accept="image/*,.pdf"
      hidden
      [disabled]="loading() || selectedFile()"
      (change)="handleInputChange($event)"
    />
  `,
  styles: `
    :host {
      max-width: 100%;
      width: 400px;
    }

    .upload-box {
      align-items: center;
      background-color: #ffffff;
      border-radius: 8px;
      border: 2px solid transparent;
      box-shadow:
        0 4px 8px rgba(0, 0, 0, 0.1),
        0 6px 20px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      min-height: 200px;
      justify-content: space-around;
      padding: 20px;
      position: relative;
      text-align: center;
      transition: all 0.3s ease;
      word-wrap: anywhere;

      &.upload-box--enabled:hover,
      &.upload-box--enabled.drag-and-drop {
        border-color: #2196f3;
        background-color: #e3f2fd;
        box-shadow:
          0 6px 12px rgba(0, 0, 0, 0.15),
          0 8px 25px rgba(0, 0, 0, 0.12);
        cursor: pointer;
      }

      .upload-box__file-data {
        align-items: center;
        display: flex;
        justify-content: center;
      }

      .upload-box__upload-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadBoxComponent {
  loading = inject(LoadingState).loading;

  selectFile = output<File | null>();
  protected selectedFile = signal<File | null>(null);
  protected selectFileEffect = effect(() =>
    this.selectFile.emit(this.selectedFile()),
  );

  #logger = inject(LoggerService);

  handleInputChange(event: Event): void {
    const files = (event.target as HTMLInputElement).files;

    if (files) {
      this.handleSelectFiles(files);
    }
  }

  handleSelectFiles(files: FileList | null): void {
    if (this.loading() || !files || !files.length) {
      return;
    }

    const file = files[0];

    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      this.selectedFile.set(file);
    } else {
      this.#logger.handleError(
        'El comprobante de pago debe ser una imagen o un pdf.',
      );
    }
  }
}
