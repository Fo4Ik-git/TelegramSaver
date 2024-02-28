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
import {ProgressServiceService} from "../../services/progress-service.service";
import {ToolbarModule} from "primeng/toolbar";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {FormsModule} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {AdminPanelComponent} from "../admin-panel/admin-panel.component";
import {Folder} from "../../config/Folder";
import {FolderService} from "../../services/folder.service";
import {InputMediaDocument} from "../api/Data/InputMedia/InputMediaDocument";
import {InputDocument} from "../api/Data/InputDocument/InputDocument";
import {FilesService} from "../../services/files.service";
import {UploadService} from "../../services/upload.service";


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
    DialogModule,
    AdminPanelComponent,
  ],
  providers: [MessageService],
  templateUrl: './file-explorer.component.html',
  styleUrl: './file-explorer.component.scss'
})
export class FileExplorerComponent implements OnInit {

  messages = new Messages(this.telegramService, this.progressService);
  contacts = new Contacts(this.telegramService);

  telegramConfig = telegramConfig;
  user = JSON.parse(localStorage.getItem('user') || '{}');
  userConfig = JSON.parse(localStorage.getItem('userConfig') || '{}');

  folders: Folder[] = [];


  @Input() isMobile!: boolean;

  maxFileSize!: number;


  home: MenuItem | undefined;
  //TODO ADMIN DELETE
  displayDialog: boolean = false;
  //Private
  protected readonly JSON = JSON;


  constructor(private telegramService: TelegramService,
              private progressService: ProgressServiceService,
              protected folderService: FolderService,
              protected filesService: FilesService,
              protected uploadService: UploadService,
              private messageService: MessageService) {
    this.telegramService.messageService = this.messageService;
  }

  @HostListener("dragover", ["$event"]) onDragOver(event: any) {
    event.preventDefault();

    // Check if the user is dragging files
    if (event.dataTransfer && event.dataTransfer.types.indexOf('Files') !== -1) {
      if (!this.uploadService.isOnDrugOverCalled) {
        this.uploadService.isOnDrugOverCalled = true;
        this.uploadService.timeoutId = setTimeout(() => {
          this.uploadService.isOnDrugOverCalled = false;
        }, 3000);
      }
    }
  }

  @HostListener("onSelect", ["$event"]) onSelect(event: any) {
    clearTimeout(this.uploadService.timeoutId);
  }

  @HostListener('window:keydown', ['$event'])
  keyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Control':
        this.filesService.ctrlPressed = true;
        break;
      case 'Shift':
        this.filesService.multiSelectMode = true;
        break;
      case 'x':
        if (this.filesService.ctrlPressed) {
          this.filesService.isCopy = false;
          this.filesService.copiedFiles = this.filesService.selectedFiles;
        }
        break;
      case 'v':
        if (this.filesService.ctrlPressed) {
          this.fileDropToFolder(this.folderService.currentFolder);
        }
        break;
      case 'c':
        if (this.filesService.ctrlPressed) {
          this.filesService.isCopy = true;
          this.filesService.copiedFiles = this.filesService.selectedFiles;
        }
        break;
      case 'Delete':
        this.filesService.deleteFiles();
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.filesService.ctrlPressed = false;
    }
    if (event.key === 'Shift') {
      this.filesService.multiSelectMode = false;
      this.filesService.firstSelectedFile = null;
    }
  }

  ngOnInit() {
    this.folderService.folderHistory.push(this.folderService.rootFolder.path);
    this.maxFileSize = this.user.premium ? 4 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024;
    this.filesService.getBotMessages();
    this.folderService.getNavigationItems();
  }


  openFileInput() {
    let input = document.getElementById('fileInput');
    input?.click();
  }

  finishEditing(folder: any) {
    folder.isEditing = false;
  }

  async fileDropToFolder(folder: Folder) {

    if (this.filesService.copiedFiles.length !== 0) {
      this.filesService.selectedFiles = this.filesService.copiedFiles;
    }

    if (this.filesService.selectedFiles) {
      for (let file of this.filesService.selectedFiles) {
        file.folder = folder.path;
        folder.files.push(file);
        // this.folders.find((f: Folder) => f.path === file.folder)?.files?.push(file);
      }
      this.folderService.currentFolder.files = this.folderService.currentFolder.files.filter((file: any) => !this.filesService.selectedFiles.includes(file));

      let files = this.filesService.selectedFiles.map((file: any) => file);
      let BotPeer = await this.contacts.resolveUsername(this.telegramConfig.bot_username);

      for (let file of files) {
        let text = await this.messages.sendMedia(
          new InputPeerUser(
            BotPeer.users[0].id,
            BotPeer.users[0].access_hash
          ),
          new InputMediaDocument(
            new InputDocument(
              file.media.document.id,
              file.media.document.access_hash,
              file.media.document.file_reference
            )
          ),
          this.uploadService.getMessageText(file, folder)
        )
        if (!this.filesService.isCopy) {
          await this.messages.deleteMessages([file.id]);
        }
      }
      //TODO save path to folder
      window.location.reload();
    }
  }

  dragStart(file: any) {
    if (!this.filesService.selectedFiles.includes(file)) {
      this.filesService.selectedFiles = [file];
    }
  }

  protected showAdminPanel(): void {
    this.displayDialog = true;
  }

  protected getItems() {
    //TODO Add commands
    let items: MenuItem[] = [
      {
        label: 'New Folder',
        icon: 'pi pi-fw pi-plus',
      },

    ];

    if (this.filesService.selectedFiles.length > 0) {
      items.push({
        label: 'Delete',
        icon: 'pi pi-fw pi-trash',
      });
      items.push({
        label: 'Rename',
        icon: 'pi pi-fw pi-pencil',
      });
      items.push({
        label: 'Download',
        icon: 'pi pi-fw pi-download',
      });
      if (this.filesService.selectedFiles && this.filesService.selectedFiles.length > 1) {
        items = items.filter((item: any) => item.label !== 'New Folder');
        items = items.filter((item: any) => item.label !== 'Rename');
      }
    }


    return items;
  }


}
