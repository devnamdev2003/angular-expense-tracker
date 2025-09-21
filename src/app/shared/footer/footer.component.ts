import { Component } from '@angular/core';
import { ConfigService } from '../../service/config/config.service';

/**
 * Footer component that displays application information such as version.
 *
 * Features:
 * - Retrieves the app version from {@link ConfigService}.
 * - Displays static footer content alongside dynamic version info.
 */
@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  /**
   * Stores the current application version retrieved from {@link ConfigService}.
   */
  appVersion: string = '';

  /**
   * Creates an instance of FooterComponent.
   *
   * Retrieves the current app version from {@link ConfigService} and
   * stores it in {@link appVersion} for display in the template.
   *
   * @param configService Service providing configuration and version info.
   */
  constructor(private configService: ConfigService) {
    this.appVersion = this.configService.getVersion();
  }
}
