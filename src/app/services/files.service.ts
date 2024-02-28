import {Injectable} from '@angular/core';
import {FolderService} from "./folder.service";
import {InputPeerUser} from "../components/api/Data/InputPeer/InputPeerUser";
import {TelegramService} from "./telegram.service";
import {Messages} from "../components/api/client/Messages";
import {Contacts} from "../components/api/client/Contacts";
import {telegramConfig} from '../config/telegram.config';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  messages = new Messages(this.telegramService);
  contacts = new Contacts(this.telegramService);
  telegramConfig = telegramConfig;

  user = JSON.parse(localStorage.getItem('user') || '{}');

  telegramFiles: any;

  selectedFiles: any[] = [];
  copiedFiles: any[] = [];
  uploadedFiles: any[] = [];

  searchQuery: string = '';
  multiSelectMode = false;
  firstSelectedFile: any = null;

  ctrlPressed: boolean = false;
  isCopy: boolean = false;

  constructor(private folderService: FolderService,
              private telegramService: TelegramService) {
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

          this.folderService.createFolders(message.folder);
          break;
        }
      }
    }

    this.distributeFiles();
  }

  displayedFiles() {
    if (this.searchQuery) {
      return this.folderService.currentFolder.files.filter((file: any) => file.name.includes(this.searchQuery));
    } else {
      return this.folderService.currentFolder.files;
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

  async deleteFiles() {
    console.log("deleteFiles");
    for (let file of this.selectedFiles) {
      // console.log("file", file.name + " " + file.id);
      this.messages.deleteMessages([file.id]);
    }
    /*//get selected files id and delete them
    let ids = this.selectedFiles.map((file: any) => file.id);
    await this.messages.deleteMessages(ids);*/
  }

  private distributeFiles() {
    for (let file of this.telegramFiles) {
      // Получаем путь к папке из файла
      let folderPath = this.getFolderFromMessage(file.message);

      // Находим папку в rootFolder
      let folder = this.folderService.findFolder(this.folderService.rootFolder, folderPath);

      // Если папка найдена, добавляем файл в папку
      if (folder) {
        folder.files.push(file);
      }
    }
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
