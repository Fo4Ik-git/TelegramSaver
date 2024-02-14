import {Component, OnInit} from '@angular/core';
import {SideBarMenuComponent} from "../side-bar-menu/side-bar-menu.component";
import {AuthenticationComponent} from "../authentication/authentication.component";
import {DeviceDetectorService} from "ngx-device-detector";
import {ConfigService} from "../../config/config.service";
import {TelegramService} from "../../services/telegram.service";
import {HttpClientModule} from "@angular/common/http";
import {Messages} from "../api/Messages";
import {Contacts} from "../api/Contacts";
import {InputUser} from "../api/Data/InputUser";
import {Photos} from "../api/Photos";
import {Upload} from "../api/Upload";
import {InputUserPhoto} from "../api/Data/InputUserPhoto/InputUserPhoto";
import { SplitterModule } from 'primeng/splitter';
import {telegramConfig} from "../../config/telegram.config";
@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    SideBarMenuComponent,
    AuthenticationComponent,
    HttpClientModule,
    SplitterModule
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent implements OnInit {
  authorization: any = localStorage.getItem('authorization') || null;
  user: any = JSON.parse(localStorage.getItem('user') || '{}');
  botUser: any = JSON.parse(localStorage.getItem('botUser') || '{}');
  isMobile!: boolean;
  userConfig: any = JSON.parse(localStorage.getItem('userConfig') || '{}');
  telegramConfig = telegramConfig;
  userProfilePhoto !: string;
  messages = new Messages(this.telegramService);
  contacts = new Contacts(this.telegramService);
  photos = new Photos(this.telegramService);
  upload = new Upload(this.telegramService);

  protected readonly JSON = JSON;

  constructor(private deviceService: DeviceDetectorService,
              private telegramService: TelegramService,
              private configService: ConfigService) {


  }

  async ngOnInit() {


    this.configService.applyTheme();


    this.isMobile = this.deviceService.isMobile();

    if (this.authorization) {
      this.userConfig.user.userProfilePhoto = await this.photos.getUserProfilePhoto(
        new InputUserPhoto(this.user.id, this.user.access_hash, this.user.photo.photo_id));
      this.userProfilePhoto = this.userConfig.user.userProfilePhoto;
    }

    this.configService.saveConfig(this.userConfig)
  }

  async startBot() {

    let ResolvedPeer = await this.contacts.resolveUsername(this.userConfig.bot_username);
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

  changeTheme() {
    this.configService.changeTheme();
  }

}
