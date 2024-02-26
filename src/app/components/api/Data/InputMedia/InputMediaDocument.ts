import {InputDocument} from "../InputDocument/InputDocument";
import {InputMedia} from "./InputMedia";

export class InputMediaDocument extends InputMedia{
  _: string = 'inputMediaDocument';
  flags?: number;
  spoiler?: boolean;
  id!: InputDocument;
  ttl_seconds?: number;
  query?: string;

  constructor(id: InputDocument, optional?:{flags?: number, spoiler?: boolean, ttl_seconds?: number, query?: string}) {
    super();
    this.flags = optional?.flags;
    this.spoiler = optional?.spoiler;
    this.id = id;
    this.ttl_seconds = optional?.ttl_seconds;
    this.query = optional?.query;
  }

}
