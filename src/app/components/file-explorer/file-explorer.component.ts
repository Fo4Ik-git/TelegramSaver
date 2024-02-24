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
  folders: Folder[] = [];
  rootFolder: Folder = {
    name: 'root',
    files: [],
    folders: [],
    path: '/',
    isEditing: false
  }
  folderHistory: string[] = [];
  historyIndex: number = 0;

  currentFolder: Folder = this.rootFolder;
  selectedFiles: any[] = [];
  uploadedFiles: any[] = [];
  items = clickItems;

  @Input() isMobile!: boolean;
  isOnDrugOverCalled = false;
  maxFileSize!: number;
  searchQuery: string = '';
  multiSelectMode = false;
  firstSelectedFile: any = null;
  navigationItems: MenuItem[] = [];
  home: MenuItem | undefined;
  //TODO ADMIN DELETE
  displayDialog: boolean = false;
  //Private
  protected readonly JSON = JSON;
  private ctrlPressed: boolean = false;
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
    this.folderHistory.push(this.rootFolder.path);
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

    this.distributeFiles();
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
        this.currentFolder.path
      );
    } else {
      for (let file of this.uploadedFiles) {
        this.messages.sendMediaToUser(
          this.telegramConfig.bot_username,
          file.file,
          this.currentFolder.path
        );
      }
    }


    this.uploadedFiles = [];
    this.isOnDrugOverCalled = false;
    this.getBotMessages();
  }

  getNavigationItems() {
    // Разделяем currentFolder.path на отдельные папки
    this.navigationItems = [];

    let folders = this.currentFolder.path.split('/').filter(folder => folder);

    // Добавляем каждую папку в this.navigationItems
    for (let folder of folders) {
      if (folder) { // Проверяем, что имя папки не пустое
        this.navigationItems.push({
          label: folder,
        });
      }
    }

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
      return this.currentFolder.files.filter((file: any) => file.name.includes(this.searchQuery));
    } else {
      return this.currentFolder.files;
    }
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

  public createFolder() {

    this.currentFolder.folders.push(
      {
        name: 'New Folder',
        files: [],
        folders: [],
        isEditing: true,
        path: this.currentFolder.path === '/' ? this.currentFolder.path + 'New Folder' : this.currentFolder.path + '/New Folder'
      }
    );
  }

  finishEditing(folder: any) {
    folder.isEditing = false;
  }

  fileDropToFolder(folder: Folder) {
    if (this.selectedFiles) {
      for (let file of this.selectedFiles) {
        file.folder = folder.path;
        folder.files.push(file);
        // this.folders.find((f: Folder) => f.path === file.folder)?.files?.push(file);
      }
      this.currentFolder.files = this.currentFolder.files.filter((file: any) => !this.selectedFiles.includes(file));
      //TODO Update files in telegram
    }

  }

  dragStart(file: any) {
    if (!this.selectedFiles.includes(file)) {
      this.selectedFiles = [file];
    }
  }

  openFolder(folder: Folder) {
    // Если мы идем назад или вперед, мы не хотим добавлять папку в историю
    if (this.historyIndex < this.folderHistory.length - 1) {
      this.folderHistory = this.folderHistory.slice(0, this.historyIndex + 1);
    }

    this.folderHistory.push(folder.path);
    this.historyIndex++;

    this.currentFolder = folder;
    this.getNavigationItems();
  }

  goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      let folder = this.findFolder(this.rootFolder, this.folderHistory[this.historyIndex]);
      if (folder !== null) {
        this.currentFolder = folder;
        this.getNavigationItems();
      }
    }
  }

  goForward() {
    if (this.historyIndex < this.folderHistory.length - 1) {
      this.historyIndex++;
      let folder = this.findFolder(this.rootFolder, this.folderHistory[this.historyIndex]);
      if (folder !== null) {
        this.currentFolder = folder;
        this.getNavigationItems();
      }
    }
  }

  protected showAdminPanel(): void {
    this.displayDialog = true;
  }

  private createFolders(path: string) {
    let parts = path.split('/');
    let currentPath = '';
    let currentFolderArray = this.rootFolder.folders;

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

  private distributeFiles() {
    for (let file of this.telegramFiles) {
      // Получаем путь к папке из файла
      let folderPath = this.getFolderFromMessage(file.message);

      // Находим папку в rootFolder
      let folder = this.findFolder(this.rootFolder, folderPath);

      // Если папка найдена, добавляем файл в папку
      if (folder) {
        folder.files.push(file);
      }
    }
  }

  private findFolder(root: Folder, path: string): Folder | null {
    if (root.path === path) {
      return root;
    }

    for (let folder of root.folders) {
      let found = this.findFolder(folder, path);
      if (found) {
        return found;
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
