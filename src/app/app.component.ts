import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {TranslateService} from "@ngx-translate/core";
import {ConfigService} from "./config/config.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TelegramSaver';

  constructor(private translate: TranslateService, private configService: ConfigService) {

    let userConfig = JSON.parse(localStorage.getItem('userConfig') || '{}');
    if (Object.keys(userConfig).length === 0) {
      userConfig = this.configService.saveConfig();
    }

    translate.setDefaultLang('en');
    let browserLang = translate.getBrowserLang();
    this.configService.userDefaultConfig.user.lang_code = browserLang || 'en';

    if (userConfig.style.theme === null || userConfig.style.theme === undefined) userConfig.style.theme = 'dark';

    document.documentElement.setAttribute('data-theme', userConfig.style.theme);


  }


}
