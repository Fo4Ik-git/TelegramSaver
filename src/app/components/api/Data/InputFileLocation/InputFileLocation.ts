export class InputFileLocation {
  volume_id!:number;
  local_id!:number;
  secret!:number;
  file_reference!:Uint8Array;


  constructor(volume_id: number, local_id: number, secret: number, file_reference: Uint8Array) {
    this.volume_id = volume_id;
    this.local_id = local_id;
    this.secret = secret;
    this.file_reference = file_reference;
  }
}
