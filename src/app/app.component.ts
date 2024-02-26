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
    this.translate.setDefaultLang('en');
    let browserLang = this.translate.getBrowserLang();
    this.configService.userDefaultConfig.user.lang_code = browserLang || 'en';
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}
