import { Component } from '@angular/core';
import { UserService } from '../../service/localStorage/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SettingItemComponent } from '../../component/setting-item/setting-item.component';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    CommonModule,
    SettingItemComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})

export class SettingsComponent {
  isDarkMode = false;
  fromDate = '';
  toDate = '';
  amount: number | null = null;
  errorMessages = {
    fromDate: '',
    toDate: '',
    amount: ''
  };

  constructor(public userService: UserService,) { }

  toggleTheme(): void {
    const savedTheme = this.userService.getValue<string>('theme_mode');
    if (savedTheme === 'dark') {
      this.isDarkMode = false;
    }
    else {
      this.isDarkMode = true;
    }
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    this.userService.update('theme_mode', this.isDarkMode ? 'dark' : 'light');
  }
}
