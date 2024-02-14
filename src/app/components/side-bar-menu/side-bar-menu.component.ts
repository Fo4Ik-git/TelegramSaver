import {Component, Input} from '@angular/core';
import {AvatarModule} from "primeng/avatar";
import {ConfigService} from "../../config/config.service";

@Component({
  selector: 'app-side-bar-menu',
  standalone: true,
  imports: [
    AvatarModule
  ],
  templateUrl: './side-bar-menu.component.html',
  styleUrl: './side-bar-menu.component.scss'
})
export class SideBarMenuComponent {
  @Input() isMobile!: boolean;
  @Input() userProfilePhoto!: string;
  @Input() user!: any;

  config: any = localStorage.getItem('config') || null;

  constructor(private configService: ConfigService) {

    this.configService.saveConfig(this.config)
  }

}
