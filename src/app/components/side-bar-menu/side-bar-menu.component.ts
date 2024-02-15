import {Component, Input, OnInit} from '@angular/core';
import {AvatarModule} from "primeng/avatar";
import {ConfigService} from "../../config/config.service";
import {NgClass} from "@angular/common";
import {ImageModule} from "primeng/image";

@Component({
  selector: 'app-side-bar-menu',
  standalone: true,
  imports: [
    AvatarModule,
    NgClass,
    ImageModule
  ],
  templateUrl: './side-bar-menu.component.html',
  styleUrl: './side-bar-menu.component.scss'
})
export class SideBarMenuComponent implements OnInit {
  @Input() isMobile!: boolean;
  @Input() userProfilePhoto!: string;
  @Input() user!: any;
  isDarkTheme!: boolean; // Замените на логику определения темы
  userConfig: any = JSON.parse(localStorage.getItem('userConfig') || '{}');

  constructor(private configService: ConfigService) {

  }

  ngOnInit(): void {
    this.userConfig.style.theme === 'dark' ? this.isDarkTheme = true : this.isDarkTheme = false;
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.configService.changeTheme()
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }

}
