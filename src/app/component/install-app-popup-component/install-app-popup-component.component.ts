import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfigService } from '../../service/config/config.service';

/**
 * Component that displays a popup prompting the user to install the app as a PWA.
 * 
 * This component shows a modal with the app name and an install button when 
 * `showInstallButton` is set to true. It uses the `ConfigService` to retrieve 
 * the application name and emits an event when the user clicks install.
 */
@Component({
  selector: 'app-install-app-popup-component',
  imports: [CommonModule],
  templateUrl: './install-app-popup-component.component.html',
  styleUrl: './install-app-popup-component.component.css',
  standalone: true,
})
export class InstallAppPopupComponentComponent {

  /**
   * Controls the visibility of the install popup.
   * 
   * When set to true, the popup will be displayed.
   */
  @Input() showInstallButton: boolean = false;

  /**
   * The application name fetched from `ConfigService`.
   * Displayed inside the popup UI.
   */
  appName: string;

  /**
   * Event emitted when the user clicks on the "Install" button.
   * 
   * The parent component can listen to this event to trigger
   * the actual PWA installation flow.
   */
  @Output() installApp = new EventEmitter<void>();

  /**
   * Creates an instance of the install popup component.
   *
   * @param configService Service to fetch configuration values such as the app name.
   */
  constructor(private configService: ConfigService) {
    this.appName = this.configService.getAppName();
  }

  /**
   * Handles the click event of the "Install" button.
   * 
   * Emits the `installApp` event to notify the parent component
   * that the installation process should be triggered.
   */
  onClickinstallApp() {
    this.installApp.emit();
  }

  /**
   * Dismisses the install popup.
   * 
   * Sets `showInstallButton` to false, hiding the popup from view.
   */
  dismissInstall() {
    this.showInstallButton = false;
  }
}
