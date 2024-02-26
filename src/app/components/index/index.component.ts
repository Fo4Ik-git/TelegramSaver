import {Component, OnInit} from '@angular/core';
import {SideBarMenuComponent} from "../side-bar-menu/side-bar-menu.component";
import {AuthenticationComponent} from "../authentication/authentication.component";
import {DeviceDetectorService} from "ngx-device-detector";
import {ConfigService} from "../../config/config.service";
import {TelegramService} from "../../services/telegram.service";
import {HttpClientModule} from "@angular/common/http";
import {Messages} from "../api/client/Messages";
import {Contacts} from "../api/client/Contacts";
import {InputUser} from "../api/Data/InputUser";
import {Photos} from "../api/client/Photos";
import {Upload} from "../api/client/Upload";
import {InputUserPhoto} from "../api/Data/InputUserPhoto/InputUserPhoto";
import {SplitterModule} from 'primeng/splitter';
import {telegramConfig} from "../../config/telegram.config";
import {Help} from "../api/client/Help";
import {FileExplorerComponent} from "../file-explorer/file-explorer.component";
import {ContextMenuModule} from "primeng/contextmenu";

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    SideBarMenuComponent,
    AuthenticationComponent,
    HttpClientModule,
    SplitterModule,
    FileExplorerComponent,
    ContextMenuModule
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent implements OnInit {
  authorization: any = localStorage.getItem('authorization') || null;
  user: any = JSON.parse(localStorage.getItem('user') || '{}');
  botUser: any = JSON.parse(localStorage.getItem('botUser') || '{}');
  isMobile!: boolean;
  userConfig!: any;
  telegramConfig = telegramConfig;
  userProfilePhoto !: string;
  messages = new Messages(this.telegramService);
  contacts = new Contacts(this.telegramService);
  photos = new Photos(this.telegramService);
  upload = new Upload(this.telegramService);
  help = new Help(this.telegramService);

  protected readonly JSON = JSON;

  constructor(private deviceService: DeviceDetectorService,
              private telegramService: TelegramService,
              private configService: ConfigService) {
    (window as any).cmd = { isAdmin: (arg: boolean) => this.isAdmin(arg) };
  }

  async ngOnInit() {
    this.userConfig = JSON.parse(localStorage.getItem('userConfig') || '{}');


    this.isMobile = this.deviceService.isMobile();

    if (this.authorization) {
      let photo = await this.photos.getUserProfilePhoto(
        new InputUserPhoto(this.user.id, this.user.access_hash, this.user.photo.photo_id));
      this.userProfilePhoto = photo;
    }

  }

  async startBot() {

    let ResolvedPeer = await this.contacts.resolveUsername(this.telegramConfig.bot_username);
    this.messages.startBot(
      new InputUser(
        ResolvedPeer.users[0].id,
        ResolvedPeer.users[0].access_hash
      ),
      new InputUser(
        this.user.id,
        this.user.access_hash
      ),
      'naskad'
    )

    //filter messages only media != null
  }

  isAdmin(isAdmin: boolean = false) {
    this.userConfig.user.isAdmin = isAdmin;
    localStorage.setItem('userConfig', JSON.stringify(this.userConfig));
    window.location.reload();
  }
}
