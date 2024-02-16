export class InputDocument{
  id!:number;
  access_hash!:number;
  file_reference!:Uint8Array;
  _ = 'inputDocument';


  constructor(id: number, access_hash: number, file_reference: Uint8Array) {
    this.id = id;
    this.access_hash = access_hash;
    this.file_reference = file_reference;
  }
}
