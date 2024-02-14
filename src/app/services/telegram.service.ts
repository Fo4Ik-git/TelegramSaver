import {Injectable} from '@angular/core';

// @ts-ignore
import MTProto from '@mtproto/core/envs/browser';
import {ConfigService} from "../config/config.service";
import {telegramConfig} from "../config/telegram.config";


@Injectable({
  providedIn: 'root'
})
export class TelegramService {

  // public config: any = JSON.parse(localStorage.getItem('config') || '{}');
  userConfig: any = JSON.parse(localStorage.getItem('userConfig') || '{}');
  telegramConfig = telegramConfig
  public mtProto: any;

  constructor(private configService: ConfigService) {

    localStorage.removeItem('config')
    if (!localStorage.getItem('config')) {
      this.configService.saveConfig();
    }

    this.mtProto = new MTProto({
      api_id: this.telegramConfig.api_id,
      api_hash: this.telegramConfig.api_hash,
      // test: true
    });
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

  /*
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
*/
}
