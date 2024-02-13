import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  static theme = 'dark';

  constructor() { }

  themeSwitch() {
    ConfigService.theme = ConfigService.theme === 'dark' ? 'light' : 'dark';
  }

  applyTheme() {
    document.body.setAttribute('data-theme', ConfigService.theme);
  }
}
