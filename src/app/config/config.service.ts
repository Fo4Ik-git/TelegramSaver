import {Injectable} from '@angular/core';
import {telegramConfig} from "./telegram.config";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  config: any = JSON.parse(localStorage.getItem('config') || '{}');
  configDefault = telegramConfig

  constructor() {
    if (!localStorage.getItem('config')) {
      this.saveConfig();
    }
    this.config = JSON.parse(localStorage.getItem('config') || '{}');
  }

  changeTheme() {
    this.config.style.theme = this.config.style.theme === 'dark' ? 'light' : 'dark';
    this.saveConfig(this.config)
    window.location.reload();
  }

  applyTheme() {
    document.body.setAttribute('data-theme', this.config.style.theme);
  }

  saveConfig(config: any = this.configDefault) {
    localStorage.setItem('config', JSON.stringify(config));
  }
}
