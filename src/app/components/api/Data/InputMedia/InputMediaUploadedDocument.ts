import {InputFile} from "../InputFile/InputFile";
import {InputFileBig} from "../InputFile/InputFileBig";
import {DocumentAttributeFilename} from "../DocumentAttribute/DocumentAttributeFilename";
import {DocumentAttributeVideo} from "../DocumentAttribute/DocumentAttributeVideo";

export class InputMediaUploadedDocument {
  flags?: number;
  nosound_video?: boolean;
  force_file?: boolean;
  spoiler?: boolean;
  file!: InputFile | InputFileBig;
  thumb?: InputFile | InputFileBig;
  mime_type!: string;
  attributes!: (DocumentAttributeFilename)[];
  stickers?: any; //TODO : add stickers
  ttl_seconds?: number;
  _: string = 'inputMediaUploadedDocument';


  constructor(file: InputFile | InputFileBig,
              mime_type: string,
              attributes: (DocumentAttributeFilename)[],
              flags?: number, nosound_video?: boolean, force_file?: boolean, spoiler?: boolean,
              thumb?: InputFile | InputFileBig,
              stickers?: any,
              ttl_seconds?: number) {
    this.flags = flags;
    this.nosound_video = nosound_video;
    this.force_file = force_file;
    this.spoiler = spoiler;
    this.file = file;
    this.thumb = thumb;
    this.mime_type = mime_type;
    this.attributes = attributes ?? [];
    this.stickers = stickers;
    this.ttl_seconds = ttl_seconds;
  }

  toString() {
    return JSON.stringify(this);
  }
}
