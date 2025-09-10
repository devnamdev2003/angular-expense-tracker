import { Component, Input } from '@angular/core';

/**
 * A reusable component to display a single setting item.
 * 
 * This component can be used inside settings screens or
 * preferences pages to show a label or related content.
 */
@Component({
  selector: 'app-setting-item',
  templateUrl: './setting-item.component.html',
  standalone: true,
  imports: []
})
export class SettingItemComponent {

  /**
   * The text label for the setting item.
   * 
   * This property should be provided by the parent component.
   */
  @Input() label!: string;

}
