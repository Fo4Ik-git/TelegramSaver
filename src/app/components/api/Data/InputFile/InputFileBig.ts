export class InputFileBig {
  parts!: number;
  name!: string;
  id!: number;
  _ = 'inputFileBig';


  constructor(name: string, parts: number, id: number = Math.floor(Math.random() * 1000000000)) {
    this.parts = parts;
    this.name = name;
    this.id = id;
  }
}
