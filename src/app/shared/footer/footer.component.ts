import { Component } from '@angular/core';
import { ConfigService } from '../../service/config/config.service';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  appVersion: string = "";
  constructor(private configService: ConfigService) {
    this.appVersion = this.configService.getVersion();
  }
}
