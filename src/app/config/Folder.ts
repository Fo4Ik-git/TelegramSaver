export interface Folder {
  name: string;
  files?: any[];
  folders?: Folder[];
  path: string;
  isEditing: boolean;
}
