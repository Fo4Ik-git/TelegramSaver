import {TelegramService} from "../../../services/telegram.service";
import {telegramConfig} from "../../../config/telegram.config";

export class Contacts {

  config = telegramConfig
  mtProto: any;

  constructor(private telegramService: TelegramService) {
    this.mtProto = this.telegramService.mtProto;
  }


  public async resolveUsername(username: string) {
    return this.telegramService.call('contacts.resolveUsername', {
      username: username.replace('@', '')
    });

  }

}
