export class InputFile {
  parts!: number;
  name!: string;
  id: number;
  _ = 'inputFile';


  constructor(name: string,parts: number = 1,  id: number = Math.floor(Math.random() * 1000000000)) {
    this.parts = parts;
    this.name = name;
    this.id = id;
  }

}
