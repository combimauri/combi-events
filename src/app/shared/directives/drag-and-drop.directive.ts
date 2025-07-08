import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[combiDragAndDrop]',
  standalone: true,
})
export class DragAndDropDirective {
  enabled = input(true);
  selectFiles = output<FileList>();

  #renderer = inject(Renderer2);
  #element = inject(ElementRef);

  @HostListener('dragover', ['$event'])
  onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.enabled()) {
      this.#renderer.addClass(this.#element.nativeElement, 'drag-and-drop');
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.enabled()) {
      this.resetBorderStyle();
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.enabled()) {
      const files = evt.dataTransfer?.files;

      if (files) {
        this.selectFiles.emit(files);
        this.resetBorderStyle();
      }
    }
  }

  private resetBorderStyle(): void {
    this.#renderer.removeClass(this.#element.nativeElement, 'drag-and-drop');
  }
}
