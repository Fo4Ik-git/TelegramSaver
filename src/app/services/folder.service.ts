import { Injectable } from '@angular/core';
import {Folder} from "../config/Folder";

@Injectable({
  providedIn: 'root'
})
export class FolderService {

  rootFolder: Folder = {
    name: 'root',
    files: [],
    folders: [],
    path: '/',
    isEditing: false
  }

  currentFolder: Folder = this.rootFolder;

  constructor() { }

  createFolder() {
    console.log('createFolder');
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
}
