import {TelegramService} from "../../services/telegram.service";
import {telegramConfig} from "../../config/telegram.config";

export class Contacts {

  config = telegramConfig
  mtProto: any;

  constructor(private telegramService: TelegramService) {
    this.mtProto = this.telegramService.mtProto;
  }

  public async call(method: any, params: {} = {}, options: {} = {}) {
    try {
      return await this.mtProto.call(method, params, options);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async resolveUsername(username: string) {
    console.log("resolveUsername", username)
    return this.call('contacts.resolveUsername', {
      username: username.replace('@', '')
    });

  }

}
