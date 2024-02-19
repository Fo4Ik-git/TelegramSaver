export class InputFile {
  parts!: number;
  name!: string;
  md5_checksum!: string;
  id: number;
  _ = 'inputFile';


  constructor(name: string, md5_checksum: string, parts: number = 1,  id: number = Math.floor(Math.random() * 1000000000)) {
    this.parts = parts;
    this.name = name;
    this.md5_checksum = md5_checksum;
    this.id = id;
  }

  toString() {
    return `InputFile {id: ${this.id}, name: ${this.name}, parts: ${this.parts}, md5_checksum: ${this.md5_checksum} }`;
  }

}
