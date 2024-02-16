import {InputDocument} from "../InputDocument/InputDocument";
import {query} from "@angular/animations";

export class InputMediaDocument{
  id !: InputDocument;
  spoiler?: boolean = true;
  flags?: number;
  ttl_seconds?: number;
  query?: string;
  _ = 'inputMediaDocument';


  constructor(id: InputDocument, spoiler?: boolean, flags?: number, ttl_seconds?: number, query?: string) {
    this.id = id;
    this.spoiler = spoiler;
    this.flags = flags;
    this.ttl_seconds = ttl_seconds;
    this.query = query;
  }
}
