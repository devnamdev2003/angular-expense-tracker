import { Component } from '@angular/core';
import { GlobalLoaderService } from '../../service/global-loader/global-loader.service';
import { CommonModule } from '@angular/common';

/**
 * Global loader component to display a full-screen loading indicator.
 *
 * Features:
 * - Shows a loading message with optional custom text.
 * - Can be controlled globally via {@link GlobalLoaderService}.
 */
@Component({
  selector: 'app-global-loader',
  imports: [CommonModule],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.css'
})
export class GlobalLoaderComponent {

  /**
   * Indicates whether the loader is currently visible.
   */
  isVisible = false;

  /**
   * Text message displayed on the loader.
   */
  message = '';

  /**
   * Creates an instance of GlobalLoaderComponent.
   *
   * Registers this component with the {@link GlobalLoaderService}
   * to allow global show/hide control.
   *
   * @param globalLoaderService Service for managing the global loader state.
   */
  constructor(private globalLoaderService: GlobalLoaderService) {
    this.globalLoaderService.register(this);
  }

  /**
   * Shows the global loader with an optional custom message.
   *
   * @param text Optional message to display; defaults to "Loading...".
   */
  show(text: string = 'Loading...'): void {
    this.message = text;
    this.isVisible = true;
  }

  /**
   * Hides the global loader.
   */
  hide(): void {
    this.isVisible = false;
  }
}
