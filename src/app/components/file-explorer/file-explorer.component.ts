import {Component, HostListener, Input, OnInit} from '@angular/core';
import {ContextMenuModule} from "primeng/contextmenu";
import {TelegramService} from "../../services/telegram.service";
import {Messages} from "../api/client/Messages";
import {Contacts} from "../api/client/Contacts";
import {clickItems, telegramConfig} from '../../config/telegram.config';
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
import {DialogModule} from "primeng/dialog";
import {AdminPanelComponent} from "../admin-panel/admin-panel.component";
import {Folder} from "../../config/Folder";


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
  upload = new Upload(this.telegramService);
  contacts = new Contacts(this.telegramService);
  telegramConfig = telegramConfig;
  user = JSON.parse(localStorage.getItem('user') || '{}');
  userConfig = JSON.parse(localStorage.getItem('userConfig') || '{}');

  telegramFiles: any;
  files: any;
  folders: Folder[] = [];
  selectedFiles: any[] = [];
  uploadedFiles: any[] = [];
  items = clickItems;

  @Input() isMobile!: boolean;
  isOnDrugOverCalled = false;
  maxFileSize!: number;
  progress: number = 0;
  folder: string = '/';
  searchQuery: string = '';
  touchStartTimestamp: number | null = null;
  multiSelectMode = false;
  firstSelectedFile: any = null;
  navigationItems: MenuItem[] | undefined;
  home: MenuItem | undefined;
  //TODO ADMIN DELETE
  selectedFilter: 'all' | 'files' | 'folders' | 'none' = 'all';
  selectedFolder: string = '/';
  displayDialog: boolean = false;
  //Private
  protected readonly JSON = JSON;
  private ctrlPressed: boolean = false;
  private timeoutId: any;
  private selectionRectangle: HTMLElement | null = null;
  private initialPoint = {x: 0, y: 0};

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

  @HostListener('window:keydown', ['$event'])
  keyDown(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.ctrlPressed = true;
    }
    if (event.key === 'Shift') {
      this.multiSelectMode = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.ctrlPressed = false;
    }
    if (event.key === 'Shift') {
      this.multiSelectMode = false;
      this.firstSelectedFile = null;
    }
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
          message.folder = this.getFolderFromMessage(message.message);

          this.createFolders(message.folder);
          break;
        }
      }
    }
    this.files = this.telegramFiles;


    //create folders if its not /
    /* for (let file of this.telegramFiles) {
       if (file.folder !== '/') {
         let folder = this.folders.find((folder: any) => folder.name === file.folder);
         if (!folder) {
           this.folders.push({
             name: file.folder,
             files: [file],
             isEditing: false,
             path: file.folder
           });
         } else {
           folder.files.push(file);
         }
       }
     }*/
    // console.log(messages);
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
      return this.files.filter((file: any) => file.name.includes(this.searchQuery));
    } else {
      return this.files;
    }
  }

  onTouchStart() {
    this.touchStartTimestamp = Date.now();
  }

  onTouchEnd(file: any) {
    const touchEndTimestamp = Date.now();
    if (this.touchStartTimestamp && touchEndTimestamp - this.touchStartTimestamp > 150) {
      this.multiSelectMode = true;
      this.toggleFileSelection(file);
    } else {
      this.multiSelectMode = false;
      this.selectedFiles = [file];
    }
    this.touchStartTimestamp = null;
  }

  toggleFileSelection(file: any) {
    if (this.ctrlPressed) {
      const index = this.selectedFiles.indexOf(file);
      if (index > -1) {
        this.selectedFiles.splice(index, 1);
      } else {
        this.selectedFiles.push(file);
      }
    } else {
      if (this.firstSelectedFile !== null && this.multiSelectMode) {
        const firstIndex = this.displayedFiles().indexOf(this.firstSelectedFile);
        const lastIndex = this.displayedFiles().indexOf(file);
        const startIndex = Math.min(firstIndex, lastIndex);
        const endIndex = Math.max(firstIndex, lastIndex);
        this.selectedFiles = this.displayedFiles().slice(startIndex, endIndex + 1);
      } else {
        if (this.selectedFiles.includes(file)) {
          this.selectedFiles = [];
          this.firstSelectedFile = null;
        } else {
          this.selectedFiles = [file];
          this.firstSelectedFile = file;
        }
      }
    }
  }

  isFileSelected(file: any) {
    return this.selectedFiles.includes(file);
  }

  clearSelection(event: Event) {
    if (event.target === event.currentTarget) {
      this.selectedFiles = [];
    }
  }

  createFolder() {
    this.folders.push({
      name: 'New Folder',
      files: [],
      isEditing: true,
      path: this.folder
    });
  }

  finishEditing(folder: any) {
    folder.isEditing = false;
  }

  fileDropToFolder(folder: Folder) {
    if (this.selectedFiles) {
      for (let file of this.selectedFiles) {
        file.folder = folder.path;
        folder.files?.push(file);
        // this.folders.find((f: Folder) => f.path === file.folder)?.files?.push(file);
      }
      this.files = this.files.filter((file: any) => !this.selectedFiles.includes(file));
      //TODO Update files in telegram
    }

  }

  dragStart(file: any) {
    if (!this.selectedFiles.includes(file)) {
      this.selectedFiles.push(file);
    }
  }

  //ADMIN



  protected showAdminPanel(): void {
    this.displayDialog = true;
  }


  private createFolders(path: string) {
    let parts = path.split('/');
    let currentPath = '';
    let currentFolderArray = this.folders;

    for (let part of parts) {
      if (part) {
        currentPath += '/' + part;
        let folder = currentFolderArray.find((folder: Folder) => folder.path === currentPath);
        if (!folder) {
          folder = {
            name: part,
            files: [],
            folders: [],
            isEditing: false,
            path: currentPath
          };
          currentFolderArray.push(folder);
        }
        if (!folder.folders) {
          folder.folders = [];
        }
        currentFolderArray = folder.folders;
      }
    }
  }

  private writeFilesToFolders() {
    // Проходим по всем файлам
    for (let file of this.files) {
      // Находим папку, которая соответствует папке файла
      let folder = this.findFolderByPath(file.folder);
      if (folder) {
        // Если папка найдена, добавляем файл в папку
        if (!folder.files) {
          folder.files = [];
        }
        folder.files.push(file);
      }
    }
  }

  private findFolderByPath(path: string, folders: Folder[] = this.folders): Folder | null {
    for (let folder of folders) {
      if (folder.path === path) {
        return folder;
      } else if (folder.folders) {
        let foundFolder = this.findFolderByPath(path, folder.folders);
        if (foundFolder) {
          return foundFolder;
        }
      }
    }
    return null;
  }

  private getFolderFromMessage(message: any) {
    let parts = message.split(';');
    let folderPart = parts.find((part: string) => part.trim().startsWith('folder:'));
    let folderPath = folderPart ? folderPart.split(':')[1].trim().replace(/"/g, '') : null;

    if (folderPath === null) {
      folderPath = '/';
    }

    return folderPath;
  }
}
