import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-setting-item',
  templateUrl: './setting-item.component.html',
  standalone: true,
  imports: []
})
export class SettingItemComponent {
  @Input() label!: string;
}
