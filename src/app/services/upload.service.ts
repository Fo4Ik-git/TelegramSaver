import { Injectable } from '@angular/core';
import {FilesService} from "./files.service";
import {TelegramService} from "./telegram.service";
import {Messages} from "../components/api/client/Messages";
import { telegramConfig } from '../config/telegram.config';
import { FolderService } from './folder.service';



interface MessageText {
  folder: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  messages = new Messages(this.telegramService);
  telegramConfig = telegramConfig;

  isOnDrugOverCalled = false;


  timeoutId: any;

  constructor(private filesService: FilesService,
              private folderService: FolderService,
              private telegramService: TelegramService) { }

  onCancel() {
    this.isOnDrugOverCalled = false;
    this.filesService.uploadedFiles = [];
  }

  removeFile(i: number) {
    this.filesService.uploadedFiles.splice(i, 1);
  }

  onDrag(event: any) {
    event.preventDefault();
    clearTimeout(this.timeoutId);

    if (!this.isOnDrugOverCalled) this.isOnDrugOverCalled = true;

    let files = event.target.files || event.dataTransfer.files;

    for (let file of files) {
      if (file.size > 500 * 1024 * 1024) {
        this.filesService.uploadedFiles.push({
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
          this.filesService.uploadedFiles.push({
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
        this.getMessageText(file, this.folderService.currentFolder)
      );
    } else {
      for (let file of this.filesService.uploadedFiles) {
        this.messages.sendMediaToUser(
          this.telegramConfig.bot_username,
          file.file,
          this.getMessageText(file, this.folderService.currentFolder)
        );
      }
    }


    this.filesService.uploadedFiles = [];
    // TODO update files in folder
    this.isOnDrugOverCalled = false;
    this.filesService.getBotMessages();
  }

  getMessageText(file: any, folder: any): string {
    let messageText: MessageText = {
      folder: folder.path,
      name: file.name
    };
    return Object.entries(messageText)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }
}
