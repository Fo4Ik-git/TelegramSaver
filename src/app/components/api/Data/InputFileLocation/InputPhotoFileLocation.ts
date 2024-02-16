export class InputPhotoFileLocation {
  id: number;
  access_hash: number;
  file_reference: Uint8Array;
  thumb_size: string;
  _ = 'inputPhotoFileLocation';


  constructor(id: number, access_hash: number, file_reference: Uint8Array, thumb_size: string) {
    this.id = id;
    this.access_hash = access_hash;
    this.file_reference = file_reference;
    this.thumb_size = thumb_size;
  }
}
