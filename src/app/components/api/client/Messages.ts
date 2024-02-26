import {TelegramService} from "../../../services/telegram.service";
import {telegramConfig} from "../../../config/telegram.config";
import {InputUser} from "../Data/InputUser";
import {Contacts} from "./Contacts";
import {InputPeerUser} from "../Data/InputPeer/InputPeerUser";
import {InputPeerChat} from "../Data/InputPeer/InputPeerChat";
import {InputMediaUploadedDocument} from "../Data/InputMedia/InputMediaUploadedDocument";
import {Upload} from "./Upload";
import {ProgressServiceService} from "../../../services/progress-service.service";
import {DocumentAttributeFilename} from "../Data/DocumentAttribute/DocumentAttributeFilename";
import {InputFile} from "../Data/InputFile/InputFile";
import {InputFileBig} from "../Data/InputFile/InputFileBig";
import {Md5} from "ts-md5/dist/esm/md5";
import {ChangeDetectorRef} from "@angular/core";
import {InputMediaDocument} from "../Data/InputMedia/InputMediaDocument";
import {InputMedia} from "../Data/InputMedia/InputMedia";

/*
const uploadObservable: Observable<any> = from(filePartsArray).pipe(
  // Используйте mergeMap для параллельной загрузки файлов
  mergeMap((filePart) => {
    return this.uploadFilePart(filePart);
  }, 5) // 5 - количество параллельных операций
);
*/

export class Messages {
  config = telegramConfig
  contacts = new Contacts(this.telegramService);
  upload = new Upload(this.telegramService);
  telegramConfig = telegramConfig;
  mtProto: any;
  private changeDetectorRef!: ChangeDetectorRef;

  constructor(private telegramService: TelegramService, private progressService?: ProgressServiceService) {
    this.mtProto = this.telegramService.mtProto;
  }


  async startBot(bot: InputUser,
                 user: InputUser,
                 start_param: string = 'start',
                 random_id: number = Math.floor(Math.random() * 1000000)) {

    return this.telegramService.call('messages.startBot', {
      bot: {
        _: 'inputUser',
        user_id: bot.user_id,
        access_hash: bot.access_hash
      },
      peer: {
        _: 'inputPeerUser',
        user_id: user.user_id,
        access_hash: user.access_hash
      },
      random_id: random_id,
      start_param: start_param
    });
  }

  async getHistory(peer: InputPeerUser | InputPeerChat,
                   limit: number = -1,
                   offset_id?: number,
                   offset_date?: number,
                   add_offset?: number,
                   max_id?: number,
                   min_id?: number,
                   hash?: number) {
    switch (peer.constructor) {

      case InputPeerUser: {
        let peerUser = peer as InputPeerUser;
        return (await this.telegramService.call('messages.getHistory', {
          peer: {
            _: 'inputPeerUser',
            user_id: peerUser.user_id,
            access_hash: peerUser.access_hash
          },
          offset_id: offset_id,
          offset_date: offset_date,
          add_offset: add_offset,
          limit: limit,
          max_id: max_id,
          min_id: min_id,
          hash: hash
        }));
      }
      case InputPeerChat: {
        let peerChat = peer as InputPeerChat;
        return (await this.telegramService.call('messages.getHistory', {
          peer: {
            _: 'inputPeerChat',
            chat_id: peerChat.chat_id,
          },
          offset_id: offset_id,
          offset_date: offset_date,
          add_offset: add_offset,
          limit: limit,
          max_id: max_id,
          min_id: min_id,
          hash: hash
        }));
      }
    }
  }

  /*async uploadMedia(peer: InputPeerUser | InputPeerChat, media: InputMediaDocument | InputMediaEmpty) {

    //get peer constructor
    let peerData: any;
    let mediaData: any;

    switch (peer.constructor) {
      case InputPeerUser: {
        peerData = peer as InputPeerUser;
        break;
      }
      case InputPeerChat: {
        peerData = peer as InputPeerChat;
        break;
      }
    }

    switch (media.constructor) {
      case InputMediaDocument: {
        mediaData = media as InputMediaDocument;
        break;
      }
      case InputMediaEmpty: {
        mediaData = media as InputMediaEmpty;
        break;
      }
    }

    return this.call('messages.uploadMedia', {
      peer: {
        _: peerData._,
        user_id: peerData?.user_id,
        access_hash: peerData?.access_hash,
        chat_id: peerData?.chat_id
      },
      media: {
        _: mediaData._,
        flags: mediaData?.flags,
        spoiler: mediaData?.spoiler,
        id: {
          _: mediaData?.id._,
          id: mediaData?.id?.id,
          access_hash: mediaData?.id?.access_hash,
          file_reference: mediaData?.id?.file_reference
        },
        ttl_seconds: mediaData?.ttl_seconds,
        query: mediaData?.query
      }
    });
  }
*/

  //TODO : fix up
  async uploadMedia(peer: InputPeerUser, media: InputMediaUploadedDocument) {
    let peerData: any;
    let mediaData: any;
    switch (peer.constructor) {
      case InputPeerUser: {
        peerData = peer as InputPeerUser;
        break;
      }
    }

    switch (media.constructor) {
      case InputMediaUploadedDocument: {
        mediaData = media as InputMediaUploadedDocument;
        break;
      }
    }

    return this.telegramService.call('messages.uploadMedia', {
      peer: {
        _: peerData._,
        user_id: peerData.user_id,
        access_hash: peerData.access_hash,
      },
      media: {
        _: mediaData._,
        file: {
          _: mediaData.file._,
          id: mediaData.file.id,
          parts: mediaData.file.parts,
          name: mediaData.file.name,
        },
        mime_type: mediaData.mime_type,
        attributes: mediaData.attributes,
        stickers: mediaData.stickers,
        ttl_seconds: mediaData.ttl_seconds
      }
    });
  }

  async sendMedia(peer: InputPeerUser | InputPeerChat,
                  media: InputMedia,
                  message: string = '',
                  random_id: number = Math.floor(Math.random() * 1000000)) {

    //get peer constructor
    let peerData: any;
    let mediaData: any;

    switch (peer.constructor) {
      case InputPeerUser: {
        peerData = peer as InputPeerUser;
        break;
      }
      case InputPeerChat: {
        peerData = peer as InputPeerChat;
        break;
      }
    }

    switch (media.constructor) {
      case InputMediaUploadedDocument: {
        mediaData = media as InputMediaUploadedDocument;
        break;
      }
      case InputMediaDocument: {
        mediaData = media as InputMediaDocument;
        break;
      }
    }

    return this.telegramService.call('messages.sendMedia', {
      peer: {
        _: peerData._,
        user_id: peerData.user_id,
        access_hash: peerData.access_hash,
      },
      media: {
        /*_: mediaData._,
        file: {
          _: mediaData.file._,
          id: mediaData.file.id,
          parts: mediaData.file.parts,
          name: mediaData.file.name,
        },
        mime_type: mediaData.mime_type,
        attributes: mediaData.attributes,
        stickers: mediaData.stickers,
        ttl_seconds: mediaData.ttl_seconds*/
        ...mediaData
      },
      message: message,
      random_id: random_id
    });
  }


  async deleteMessages(id: number[]) {
    return this.telegramService.call('messages.deleteMessages', {
      id: id
    });

  }

  async editMessage(peer: InputPeerUser | InputPeerChat, id: number, optional:{no_webpage?: boolean,
                    invert_media?: boolean, message?: string, media?: InputMediaUploadedDocument, schedule_date?: number}) {
    let peerData: any;
    switch (peer.constructor) {
      case InputPeerUser: {
        peerData = peer as InputPeerUser;
        break;
      }
      case InputPeerChat: {
        peerData = peer as InputPeerChat;
        break;
      }
    }
    return this.telegramService.call('messages.editMessage', {
      peer: {
        _: peerData._,
        user_id: peerData.user_id,
        access_hash: peerData.access_hash,
      },
      id: id,
      message: optional.message,
      media: optional.media,
      no_webpage: optional.no_webpage,
      invert_media: optional.invert_media,
      schedule_date: optional.schedule_date
    });
  }


  async sendMediaToUser(username: string, file: File, message: string = '') {
    const resolveUsername = await this.contacts.resolveUsername(username);
    const uint8Array = await this.readArrayBufferFromFile(file);


    const inputFile = this.createInputFile(file, uint8Array);

    await this.uploadFileParts(inputFile, uint8Array, inputFile.parts);

    const inputMediaUploadedDocument = new InputMediaUploadedDocument(
      inputFile,
      file.type,
      [new DocumentAttributeFilename(file.name)]
    );

    const inputPeerUser = new InputPeerUser(
      resolveUsername.users[0].id,
      resolveUsername.users[0].access_hash
    );

    const uploadMediaResponse = await this.uploadMedia(inputPeerUser, inputMediaUploadedDocument);

    const sendMediaResponse = this.sendMedia(inputPeerUser, inputMediaUploadedDocument, message);

    this.telegramService.messageService?.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: ''
    });
  }

  async readArrayBufferFromFile(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = (e) => {
        if (fileReader.result) {
          const arrayBuffer = fileReader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          resolve(uint8Array);
        } else {
          reject(new Error("Error reading file"));
        }
      };

      fileReader.readAsArrayBuffer(file);
    });
  }

  createInputFile(file: File, uint8Array: Uint8Array): InputFile | InputFileBig {
    const parts = Math.ceil(uint8Array.length / (512 * 1024));

    if (file.size >= 10 * 1024 * 1024) {
      console.log("Big file");
      return new InputFileBig(file.name, parts);
    } else {
      console.log("Small file");
      const md5 = new Md5();
      const md5Hash = md5.appendStr(uint8Array.toString()).end()?.toString() as string;
      return new InputFile(file.name, parts);
    }
  }

  async uploadFileParts(inputFile: InputFile | InputFileBig, uint8Array: Uint8Array, parts: number) {
    //add timer start


    this.telegramService.messageService?.add({
      severity: 'info',
      summary: 'File Uploading...',
      detail: 'Please do not close the window'
    });

    const uploadPromises = Array.from({length: parts}, async (_, i) => {
      const start = i * 512 * 1024;
      const end = (i + 1) * 512 * 1024;

      return inputFile.constructor === InputFileBig ?
        this.upload.saveBigFilePart(inputFile.id, i, parts, uint8Array.slice(start, end)) :
        this.upload.saveFilePart(inputFile.id, uint8Array.slice(start, end), i);
    });

    await Promise.all(uploadPromises);


    console.timeEnd(`upload file ${inputFile.id} parts`);
  }


}
