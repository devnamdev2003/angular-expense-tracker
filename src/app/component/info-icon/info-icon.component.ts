import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-icon',
  imports: [],
  templateUrl: './info-icon.component.html',
  styleUrl: './info-icon.component.css'
})
export class InfoIconComponent {
  @Input() message: string = 'Info tooltip';
}
