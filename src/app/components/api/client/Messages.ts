import {TelegramService} from "../../services/telegram.service";
import {telegramConfig} from "../../config/telegram.config";
import {InputUser} from "./Data/InputUser";
import {Contacts} from "./Contacts";
import {InputPeerUser} from "./Data/InputPeer/InputPeerUser";
import {InputPeerChat} from "./Data/InputPeer/InputPeerChat";
import {InputMediaUploadedDocument} from "./Data/InputMedia/InputMediaUploadedDocument";

export class Messages {
  config = telegramConfig
  contats = new Contacts(this.telegramService);
  mtProto: any;

  constructor(private telegramService: TelegramService) {
    this.mtProto = this.telegramService.mtProto;
  }


  async call(method: any, params: {} = {}, options: {} = {}) {
    try {
      return await this.mtProto.call(method, params, options);
    } catch (e) {
      return Promise.reject(e);
    }
  }


  async startBot(bot: InputUser,
                 user: InputUser,
                 start_param: string = 'start',
                 random_id: number = Math.floor(Math.random() * 1000000)) {

    return this.call('messages.startBot', {
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
        return (await this.call('messages.getHistory', {
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
        return (await this.call('messages.getHistory', {
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

    console.log('peer', peer);
    console.log('media', media);

    return this.call('messages.uploadMedia', {
      peer: {
        _: peer._,
        user_id: peer.user_id,
        access_hash: peer.access_hash,
      },
      media: {
        _: media._,
        file: {
          _: media.file._,
          id: media.file.id,
          parts: media.file.parts,
          name: media.file.name,
        },
        mime_type: media.mime_type,
        attributes: media.attributes,
        stickers: media.stickers,
        ttl_seconds: media.ttl_seconds
      }
    });
  }

  async sendMedia(peer: InputPeerUser | InputPeerChat,
                  media: InputMediaUploadedDocument,
                  message: string = '',
                  random_id: number = Math.floor(Math.random() * 1000000)) {

    //get peer constructor
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

    return this.call('messages.sendMedia', {
      peer:{
        _: peerData._,
        user_id: peerData.user_id,
        access_hash: peerData.access_hash,
      },
      media: {
        _: media._,
        file: {
          _: media.file._,
          id: media.file.id,
          parts: media.file.parts,
          name: media.file.name,
        },
        mime_type: media.mime_type,
        attributes: media.attributes,
        stickers: media.stickers,
        ttl_seconds: media.ttl_seconds
      },
      message: message,
      random_id: random_id
    });

  }
}
