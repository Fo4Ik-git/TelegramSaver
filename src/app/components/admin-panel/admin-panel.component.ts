import {Component, Input, TemplateRef, ViewChild} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgTemplateOutlet} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {NgxJsonViewerModule} from "ngx-json-viewer";
import {Folder} from "../../config/Folder";

type ActiveComponentType = 'files' | 'folders' | 'file' | 'folder' | 'user';


@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    NgIf,
    NgTemplateOutlet,
    FormsModule,
    NgForOf,
    NgClass,
    NgxJsonViewerModule
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent {
  @Input() rootFolder: any;

  @ViewChild('files', {read: TemplateRef, static: true}) filesTemplate!: TemplateRef<any>;
  @ViewChild('folders', {read: TemplateRef, static: true}) foldersTemplate!: TemplateRef<any>;
  @ViewChild('file', {read: TemplateRef, static: true}) fileTemplate!: TemplateRef<any>;
  @ViewChild('folder', {read: TemplateRef, static: true}) folderTemplate!: TemplateRef<any>;
  @ViewChild('user', {read: TemplateRef, static: true}) userTemplate!: TemplateRef<any>;


  activeComponent: ActiveComponentType = 'files';
  selectedFile: any;
  selectedFolder: any;
  filesQuery: string = '';
  foldersQuery: string = '';
  userData = JSON.parse(localStorage.getItem('user') || '{}');

  switchComponent(component: ActiveComponentType) {
    this.activeComponent = component;
  }

  getTemplate() {
    switch (this.activeComponent) {
      case 'files':
        return this.filesTemplate;
      case 'folders':
        return this.foldersTemplate;
      case 'folder':
        return this.folderTemplate;
      case 'user':
        return this.userTemplate;
      default:
        return this.fileTemplate;
    }
  }

  displayedFiles() {
    if (this.filesQuery) {
      return this.rootFolder.files.filter((file: any) => file.name.includes(this.filesQuery));
    } else {
      return this.rootFolder.files;
    }
  }

  displayedFolders() {
    if (this.foldersQuery) {
      return this.rootFolder.folders.filter((folder: any) => folder.name.includes(this.foldersQuery));
    } else {
      return this.getAllFolders();
    }
  }

  getAllFolders(folders: Folder[] = this.rootFolder.folders): Folder[] {
    let allFolders: Folder[] = [];

    for (let folder of folders) {
      allFolders.push(folder);

      if (folder.folders) {
        allFolders = allFolders.concat(this.getAllFolders(folder.folders));
      }
    }

    return allFolders;
  }
}
