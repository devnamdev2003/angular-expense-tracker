import { Injectable } from '@angular/core';
import { GlobalLoaderComponent } from '../../shared/global-loader/global-loader.component';

/**
 * Service to control the global loading indicator component.
 *
 * Features:
 * - Allows showing and hiding a global loader with optional custom message.
 * - Connects with {@link GlobalLoaderComponent} to display the loader UI.
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalLoaderService {

  /** Reference to the registered global loader component */
  private globalLoaderComponent!: GlobalLoaderComponent;

  /**
   * Registers the global loader component instance.
   *
   * @param component The {@link GlobalLoaderComponent} instance to control.
   */
  register(component: GlobalLoaderComponent): void {
    this.globalLoaderComponent = component;
  }
  
  /**
   * Shows the global loader with an optional message.
   *
   * @param text Optional loading message; defaults to "Loading...".
   */
  show(text: string = "Loading..."): void {
    this.globalLoaderComponent?.show(text);
  }

  /**
   * Hides the global loader.
   */
  hide(): void {
    this.globalLoaderComponent?.hide();
  }
}
