import {Component, HostListener, Input, OnInit} from '@angular/core';
import {ContextMenuModule} from "primeng/contextmenu";
import {TelegramService} from "../../services/telegram.service";
import {Messages} from "../api/client/Messages";
import {Contacts} from "../api/client/Contacts";
import {telegramConfig} from '../../config/telegram.config';
import {InputPeerUser} from "../api/Data/InputPeer/InputPeerUser";
import {NgClass, NgForOf, NgIf, NgTemplateOutlet} from "@angular/common";
import {DragDropModule} from 'primeng/dragdrop';
import {FileUploadModule} from "primeng/fileupload";
import {MenuItem, MessageService} from 'primeng/api';
import {ToastModule} from "primeng/toast";
import {Upload} from '../api/client/Upload';
import {ProgressServiceService} from "../../services/progress-service.service";
import {ToolbarModule} from "primeng/toolbar";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [
    ContextMenuModule,
    NgIf,
    DragDropModule,
    FileUploadModule,
    ToastModule,
    NgForOf,
    ToolbarModule,
    BreadcrumbModule,
    NgClass,
    NgTemplateOutlet,
    FormsModule,
  ],
  providers: [MessageService],
  templateUrl: './file-explorer.component.html',
  styleUrl: './file-explorer.component.scss'
})
export class FileExplorerComponent implements OnInit {

  messages = new Messages(this.telegramService, this.progressService);
  upload = new Upload(this.telegramService);
  contacts = new Contacts(this.telegramService);
  telegramConfig = telegramConfig;
  user = JSON.parse(localStorage.getItem('user') || '{}');

  telegramFiles: any;
  uploadedFiles: any[] = [];

  @Input() isMobile!: boolean;
  isOnDrugOverCalled = false;
  maxFileSize!: number;
  progress: number = 0;
  folder: string = 'root';
  searchQuery: string = '';

  navigationItems: MenuItem[] | undefined;
  home: MenuItem | undefined;

  protected readonly JSON = JSON;
  private timeoutId: any;

  constructor(private telegramService: TelegramService,
              private progressService: ProgressServiceService,
              private messageService: MessageService) {
    this.telegramService.messageService = this.messageService;
  }

  @HostListener("dragover", ["$event"]) onDragOver(event: any) {
    event.preventDefault();

    // Check if the user is dragging files
    if (event.dataTransfer && event.dataTransfer.types.indexOf('Files') !== -1) {
      if (!this.isOnDrugOverCalled) {
        this.isOnDrugOverCalled = true;
        this.timeoutId = setTimeout(() => {
          this.isOnDrugOverCalled = false;
        }, 3000);
      }
    }
  }

  @HostListener("onSelect", ["$event"]) onSelect(event: any) {
    clearTimeout(this.timeoutId);
  }

  ngOnInit() {
    this.maxFileSize = this.user.premium ? 4 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024;
    this.getBotMessages();
    this.getNavigationItems();
  }

  async getBotMessages() {
    let ResolvedPeer = await this.contacts.resolveUsername(this.telegramConfig.bot_username)
    let messages = await this.messages.getHistory(
      new InputPeerUser(
        ResolvedPeer.users[0].id,
        ResolvedPeer.users[0].access_hash
      )
    );

    //filter messages only media != null
    this.telegramFiles = messages.messages.filter((message: any) => message.media != null && message.from_id.user_id === this.user.id);
    //add to files new value 'name' with value of attributes[i]._ == 'documentAttributeFilename'
    for (let message of this.telegramFiles) {
      let attributes = message.media.document.attributes;
      for (let i = 0; i < attributes.length; i++) {
        if (attributes[i]._ == 'documentAttributeFilename') {
          message.name = attributes[i].file_name;
          break;
        }
      }
    }
    console.log(messages);
  }

  onDrag(event: any) {
    event.preventDefault();
    clearTimeout(this.timeoutId);

    if (!this.isOnDrugOverCalled) this.isOnDrugOverCalled = true;

    let files = event.target.files || event.dataTransfer.files;

    for (let file of files) {
      if (file.size > 500 * 1024 * 1024) {
        this.uploadedFiles.push({
          file: null,
          name: file.name,
          size: this.formatFileSize(file.size),
          src: 'assets/images/file.png'
        })
        this.onUpload(file)
        file = null;
      }

      if (file) {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.uploadedFiles.push({
            file: file,
            name: file.name,
            src: e.target.result,
            size: this.formatFileSize(file.size)
          });
        }
        reader.readAsDataURL(file);
      }
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' Bytes';
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes < 1073741824) {
      return (bytes / 1048576).toFixed(2) + ' MB';
    } else {
      return (bytes / 1073741824).toFixed(2) + ' GB';
    }
  }

  async onUpload(file?: File) {
    this.progressService?.progress$.subscribe(progress => {
      // Update the progress bar in your component
      this.progress = progress;
    });


    /*let uploadPromises = [];

    if (file) {
      uploadPromises.push(this.messages.sendMediaToUser(
        this.telegramConfig.bot_username,
        file,
        this.folder
      ));
    } else {
      uploadPromises = Array.from(this.uploadedFiles).map(file =>
        this.messages.sendMediaToUser(
          this.telegramConfig.bot_username,
          file.file,
          this.folder
        )
      );
    }

    await Promise.all(uploadPromises);*/

    if (file) {
      this.messages.sendMediaToUser(
        this.telegramConfig.bot_username,
        file,
        this.folder
      );
    } else {
      for (let file of this.uploadedFiles) {
        this.messages.sendMediaToUser(
          this.telegramConfig.bot_username,
          file.file,
          this.folder,
        );
      }
    }


    this.uploadedFiles = [];
    this.isOnDrugOverCalled = false;
    this.progress = 0;

    this.getBotMessages();
  }

  getNavigationItems() {
    /*for (let file of this.telegramFiles) {
      this.navigationItems?.push({
        label: file.name,
      })
    }*/
    this.home = {icon: 'pi pi-home', routerLink: '/'}

  }

  onCancel() {
    this.isOnDrugOverCalled = false;
    this.uploadedFiles = [];
  }

  removeFile(i: number) {
    this.uploadedFiles.splice(i, 1);
  }

  openFileInput() {
    let input = document.getElementById('fileInput');
    input?.click();
  }

  displayedFiles() {
    if (this.searchQuery) {
      return this.telegramFiles.filter((file: any) => file.name.includes(this.searchQuery));
    } else {
      return this.telegramFiles;
    }
  }
}
