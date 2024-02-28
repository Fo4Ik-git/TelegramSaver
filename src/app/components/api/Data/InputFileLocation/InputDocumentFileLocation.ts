import {InputFileLocation} from "./InputFileLocation";

export class InputDocumentFileLocation extends InputFileLocation {
  id!: bigint;
  access_hash!: bigint;
  file_reference!: Uint8Array;
  thumb_size!: string;

  constructor(id: bigint, access_hash: bigint, file_reference: Uint8Array, thumb_size: string) {
    super();
    this.id = id;
    this.access_hash = access_hash;
    this.file_reference = file_reference;
    this.thumb_size = thumb_size;
  }
}
