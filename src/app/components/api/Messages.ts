import {TelegramService} from "../../services/telegram.service";
import {telegramConfig} from "../../config/telegram.config";
import {InputUser} from "./Data/InputUser";

export class Messages {
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


  public async startBot(bot: InputUser,
                        user: InputUser,
                        bot_username: string,
                        start_param: string = 'start',
                        random_id: number = Math.floor(Math.random() * 1000000)) {
    console.log("startBot", bot, user, bot_username, start_param, random_id)
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

}
