import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * A reusable modal component for forms.
 * 
 * This component displays a modal with a customizable label
 * and provides an output event to notify when the modal is closed.
 */
@Component({
  selector: 'app-form-model',
  imports: [CommonModule],
  templateUrl: './form-model.component.html',
  styleUrl: './form-model.component.css'
})
export class FormModelComponent {

  /**
   * The label text displayed in the form modal.
   * 
   * This property should be provided by the parent component.
   */
  @Input() label: string = '';

  /** Alignment of the label text: 'left', 'center', or 'right'.
   * 
   * Default is 'left'.
   */
  @Input() labelAlignment: 'left' | 'center' | 'right' = 'left';

  /**
   * Event emitted when the modal is closed.
   * 
   * The parent component can listen to this event
   * to perform actions such as hiding the modal.
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Closes the modal and emits the `close` event.
   * 
   * This method is typically called when the user
   * clicks a close button or dismisses the modal.
   */
  closeModel(): void {
    this.close.emit();
  }

}
