import {TelegramService} from "../../../services/telegram.service";

export class Help{

  mtProto: any;

  constructor(private telegramService: TelegramService) {
    this.mtProto = this.telegramService.mtProto;
  }

  async getCountriesList(lang_cde: string = 'en', hash:number = 0){
    return this.telegramService.call('help.getCountriesList', {
      lang_code: lang_cde,
      hash: hash
    });
  }

}
