import { Injectable } from '@angular/core';
import {Folder} from "../config/Folder";
import {MenuItem} from "primeng/api";

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
  navigationItems: MenuItem[] = [];

  folderHistory: string[] = [];
  historyIndex: number = 0;

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

  findFolder(root: Folder, path: string): Folder | null {
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

    return {icon: 'pi pi-home', routerLink: '/'}
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
  createFolders(path: string) {
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
}
