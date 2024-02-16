import {TelegramService} from "../../../services/telegram.service";
import {telegramConfig} from "../../../config/telegram.config";
import {InputUser} from "../Data/InputUser";
import {Contacts} from "./Contacts";
import {InputPeerUser} from "../Data/InputPeer/InputPeerUser";
import {InputPeerChat} from "../Data/InputPeer/InputPeerChat";
import {InputMediaUploadedDocument} from "../Data/InputMedia/InputMediaUploadedDocument";
import {InputFile} from "../Data/InputFile/InputFile";
import {InputFileBig} from "../Data/InputFile/InputFileBig";
import {Md5} from "ts-md5/dist/esm/md5";
import {DocumentAttributeFilename} from "../Data/DocumentAttribute/DocumentAttributeFilename";
import {Upload} from "./Upload";

export class Messages {
  config = telegramConfig
  contacts = new Contacts(this.telegramService);
  upload = new Upload(this.telegramService);
  telegramConfig = telegramConfig;
  mtProto: any;

  constructor(private telegramService: TelegramService) {
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
                  media: InputMediaUploadedDocument,
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
    }

    return this.telegramService.call('messages.sendMedia', {
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
      },
      message: message,
      random_id: random_id
    });
  }


  async sendMediaToUser(username: string, file: File, message: string = '') {
    let ResolveUsername = await this.contacts.resolveUsername(username);
    let fileReader = new FileReader();

    fileReader.readAsArrayBuffer(file);
    fileReader.onload = async (e) => {
      if (fileReader.result) {
        let arrayBuffer = fileReader.result;
        let uint8Array = new Uint8Array(arrayBuffer as ArrayBuffer);

        let inputFile: InputFile | InputFileBig;
        if (file.size > 10 * 1024 * 1024) {
          inputFile = new InputFileBig(
            file.name,
            Math.ceil(file.size / 10 * 1024 * 1024)
          );
          //TODO : upload big file

        } else {
          let md5 = new Md5()
          inputFile = new InputFile(
            file.name,
            md5.appendStr(uint8Array.toString()).end()?.toString() as string
          );

          let saveFilePart = await this.upload.saveFilePart(
            inputFile.id,
            uint8Array
          );
        }

        let inputMediaUploadedDocument = new InputMediaUploadedDocument(
          inputFile,
          file.type,
          [new DocumentAttributeFilename(file.name)]
        )

        let uploadMedia = await this.uploadMedia(
          new InputPeerUser(
            ResolveUsername.users[0].id,
            ResolveUsername.users[0].access_hash
          ),
          inputMediaUploadedDocument
        );

        let sendMedia = this.sendMedia(
          new InputPeerUser(
            ResolveUsername.users[0].id,
            ResolveUsername.users[0].access_hash
          ),
          inputMediaUploadedDocument,
          message
        );
      }
    }
  }
}
