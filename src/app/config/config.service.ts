import {Injectable} from '@angular/core';
import {telegramConfig, userConfig} from "./telegram.config";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  config: any = JSON.parse(localStorage.getItem('userConfig') || '{}');
  telegramConfig = telegramConfig;
  userDefaultConfig = userConfig;

  constructor() {
    if (!localStorage.getItem('userConfig')) {
      this.saveConfig();
    }
    this.config = JSON.parse(localStorage.getItem('userConfig') || '{}');
  }

  changeTheme() {
    this.config.style.theme = this.config.style.theme === 'dark' ? 'light' : 'dark';
    this.saveConfig(this.config);
    this.applyTheme();
  }

  applyTheme() {
    document.body.setAttribute('data-theme', this.config.style.theme);
  }

  saveConfig(config: any = this.userDefaultConfig) {
    localStorage.setItem('userConfig', JSON.stringify(config));
    // window.location.reload();
  }
}
