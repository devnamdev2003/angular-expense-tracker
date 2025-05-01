import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-modal',
  templateUrl: './custom-modal.component.html',
  standalone: true,
  imports: []
})
export class CustomModalComponent {
  @Input() modalId!: string;
  @Input() title: string = 'Modal Title';
  @Input() onClose: () => void = () => { };
}
