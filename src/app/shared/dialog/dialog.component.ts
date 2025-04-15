import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule], // ✅ Register it here
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})

export class DialogComponent {
  @Input() title: string = '';
  @Input() submitText: string = 'Submit';
  @Input() modalId: string = '';

  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<Event>();

  show: boolean = false;

  openModal() {
    this.show = true;
  }

  closeModal() {
    this.show = false;
    this.onClose.emit();
  }

  submit(event: Event) {
    event.preventDefault();
    this.onSubmit.emit(event);
  }
}
