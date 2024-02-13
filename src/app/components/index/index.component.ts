import {Component} from '@angular/core';
import {SideBarMenuComponent} from "../side-bar-menu/side-bar-menu.component";
import {AuthenticationComponent} from "../authentication/authentication.component";
import {DeviceDetectorService} from "ngx-device-detector";
import {ConfigService} from "../../config/config.service";
import {TelegramService} from "../../services/telegram.service";
import {telegramConfig} from "../../config/telegram.config";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {Messages} from "../api/Messages";
import {Contacts} from "../api/Contacts";
import {InputUser} from "../api/Data/InputUser";

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    SideBarMenuComponent,
    AuthenticationComponent,
    HttpClientModule
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent {
  authorization: any = localStorage.getItem('authorization') || null;
  user: any = JSON.parse(localStorage.getItem('user') || '{}');
  botUser: any = JSON.parse(localStorage.getItem('botUser') || '{}');
  isMobile!: boolean;
  public config = telegramConfig;
  messages = new Messages(this.telegramService);
  contacts = new Contacts(this.telegramService);
  protected readonly JSON = JSON;

  constructor(private deviceService: DeviceDetectorService,
              private telegramService: TelegramService,
              private http: HttpClient,
              private configService: ConfigService) {
    this.isMobile = this.deviceService.isMobile();

    this.configService.applyTheme();
  }

  async startBot() {

    let ResolvedPeer = await this.contacts.resolveUsername(this.config.bot_username);
    console.log("ResolvedPeer", ResolvedPeer);

    this.messages.startBot(
      new InputUser(
        ResolvedPeer.users[0].id,
        ResolvedPeer.users[0].access_hash
      ),
      new InputUser(
        this.user.id,
        this.user.access_hash
      ),
      this.botUser.username,
      'naskad'
    )
  }

  /*async sendMessage() {
    if (this.authorization) {
      let update = (await this.telegramService.sendMessage('Hello from Angular', this.config.bot_id));
    }
  }

  async startBot() {
    if (this.authorization) {
      let intupUser = new InputUser(
        this.config.bot_id,
        0
      );
      let update = (await this.telegramService.startBot(intupUser));
    }
  }
*/

}
