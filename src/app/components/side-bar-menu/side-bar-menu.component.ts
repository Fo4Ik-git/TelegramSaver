import {Component, ElementRef, Input, OnInit, Renderer2} from '@angular/core';
import {AvatarModule} from "primeng/avatar";
import {ConfigService} from "../../config/config.service";
import {NgClass} from "@angular/common";
import {ImageModule} from "primeng/image";
import {MenubarModule} from "primeng/menubar";
import {MenuItem} from "primeng/api";

@Component({
  selector: 'app-side-bar-menu',
  standalone: true,
  imports: [
    AvatarModule,
    NgClass,
    ImageModule,
    MenubarModule
  ],
  templateUrl: './side-bar-menu.component.html',
  styleUrl: './side-bar-menu.component.scss'
})
export class SideBarMenuComponent implements OnInit {
  @Input() isMobile!: boolean;
  @Input() userProfilePhoto!: string;
  @Input() user!: any;
  // @Output() uploadRequested = new EventEmitter;
  isDarkTheme!: boolean; // Замените на логику определения темы
  userConfig: any = JSON.parse(localStorage.getItem('userConfig') || '{}');
  items: MenuItem[] | undefined;

  constructor(private configService: ConfigService, private renderer: Renderer2, private el: ElementRef) {

  }

  ngOnInit(): void {
    this.userConfig.style.theme === 'dark' ? this.isDarkTheme = true : this.isDarkTheme = false;
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.configService.changeTheme()
  }

  open(window: string) {
    switch (window) {
      case 'settings': {

      }
    }
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }

  openUpload() {
    /*let input = document.getElementById('fileInput');
    console.log(input);
    input?.click();*/

    //get input element
    let input = this.renderer.selectRootElement('#fileInput');
    input?.click();
  }
}
