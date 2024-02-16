import {TelegramService} from "../../services/telegram.service";

export class Help{

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

  async getCountriesList(lang_cde: string = 'en', hash:number = 0){
    return this.call('help.getCountriesList', {
      lang_code: lang_cde,
      hash: hash
    });
  }

}
