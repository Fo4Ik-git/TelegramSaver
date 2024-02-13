import {Injectable} from '@angular/core';
import {telegramConfig} from "../config/telegram.config";

// @ts-ignore
import MTProto from '@mtproto/core/envs/browser';


@Injectable({
  providedIn: 'root'
})
export class TelegramService {

  public config = telegramConfig;
  public mtProto: any;
  public loginToken!: string;

  constructor() {
    this.mtProto = new MTProto({
      api_id: this.config.api_id,
      api_hash: this.config.api_hash,
      // test: true
    });

    /*this.mtProto.updates.on('updateShort', async (updateInfo: any) => {
      switch (updateInfo.update._) {
        case 'updateLoginToken': {
          let authorization = (await this.exportLoginToken()).authorization;
          localStorage.setItem('authorization', authorization);
          let user = authorization.user;
          localStorage.setItem('user', JSON.stringify(user));
          window.location.reload();
          break;
        }
      }
    });*/
  }


  /*public async getHistory(username: string) {
    console.log(`-> getHistory of ${username}`);
    const resolvedGroup = await this.call('contacts.resolveUsername', {
      username: username.replace('@', '')
    });

    const hash = resolvedGroup.chats[0].access_hash;
    const id = resolvedGroup.chats[0].id;

    return (await this.call('messages.getHistory', {
      peer: {
        _: 'inputPeerChannel',
        channel_id: id,
        access_hash: hash
      },
      max_id: 0,
      offset: 0,
      limit: 10
    })).messages;
  }*/

  /*public async startBot(bot: InputUser) {
    return this.call('messages.startBot', {
      bot: {
        _: 'inputUser',
        user_id: this.config.bot_id,
        access_hash: 0
      },
      peer: {
        _: 'inputPeerUser',
        user_id: this.user.id,
        access_hash: this.user.access_hash
      },
      random_id: 123,
      start_param: 'start'
    });
  }

  public async sendMessage(message: string, random_id: number) {
    return this.call('messages.sendMessage', {
      peer: {
        _: 'inputPeerUser',
        user_id: this.config.bot_id,
        access_hash: 0
      },
      message: message,
      random_id: random_id,
    });
  }

  public async importBotAuthorization() {
    return this.call('authentication.importBotAuthorization', {
      api_id: this.config.api_id,
      api_hash: this.config.api_hash,
      bot_auth_token: this.config.bot_token
    });
  }*/
}
