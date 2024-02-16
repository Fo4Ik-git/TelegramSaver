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
    /*console.log("userConfig length", Object.keys(this.userConfig).length)
    if (Object.keys(this.userConfig).length === 0) {
      this.userConfig = this.saveConfig();
    }*/
    // this.applyTheme(this.userConfig.style.theme);
  }

  changeTheme() {
    console.log("change theme", this.userConfig.style.theme)
    this.userConfig.style.theme = this.userConfig.style.theme === 'dark' ? 'light' : 'dark';
    this.saveConfig(this.userConfig);
    this.applyTheme(this.userConfig.style.theme);
  }

  applyTheme(theme: string) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      // document.documentElement.classList.remove('light');
      // document.documentElement.classList.add('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      // document.documentElement.classList.remove('dark');
      // document.documentElement.classList.add('light');
    }
  }

  saveConfig(config: any = this.userDefaultConfig) {
    localStorage.setItem('userConfig', JSON.stringify(config));
    return localStorage.getItem('userConfig');
  }
}
