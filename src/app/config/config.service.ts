import {Injectable} from '@angular/core';
import {telegramConfig, userConfig} from "./telegram.config";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  userConfig: any = JSON.parse(localStorage.getItem('userConfig') || '{}');
  telegramConfig = telegramConfig;
  userDefaultConfig = userConfig;

  constructor() {
    if (Object.keys(this.userConfig).length === 0) {
      this.userConfig = this.saveConfig();
    }
    this.userConfig = JSON.parse(localStorage.getItem('userConfig') || '{}');
  }

  changeTheme() {
    this.userConfig.style.theme = this.userConfig.style.theme === 'dark' ? 'light' : 'dark';
    this.saveConfig(this.userConfig);
    this.applyTheme();
  }

  applyTheme() {
    if (this.userConfig.style.theme !== null || this.userConfig.style.theme !== undefined) {
      document.body.setAttribute('data-theme', this.userConfig.style.theme);
    }
  }

  saveConfig(config: any = this.userDefaultConfig) {
    localStorage.setItem('userConfig', JSON.stringify(config));
    return localStorage.getItem('userConfig');
    // window.location.reload();
  }
}
