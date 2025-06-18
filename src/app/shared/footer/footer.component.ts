import { Component } from '@angular/core';
import { AppVersionService } from '../../service/util/app-version/app-version.service';
@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  appVersion: string = "";
  constructor(private appVersionService: AppVersionService) {
    this.appVersion = this.appVersionService.getVersion();
  }
}
