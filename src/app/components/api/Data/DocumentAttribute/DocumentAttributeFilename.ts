export class DocumentAttributeFilename {
  file_name!: string;
  _ = 'documentAttributeFilename';


  constructor(file_name: string) {
    this.file_name = file_name;
  }

  getAttribute() {
    return {
      _: this._,
      file_name: this.file_name
    }
  }
}
