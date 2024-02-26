import {TelegramService} from "../../../services/telegram.service";
import {telegramConfig} from "../../../config/telegram.config";
import {ConfigService} from "../../../config/config.service";
import {Account} from "./Account";

export class Auth {
  public config: any = JSON.parse(localStorage.getItem('config') || '{}');
  configDefault = telegramConfig;
  mtProto: any;
  configService = new ConfigService();
  account = new Account(this.telegramService);

  constructor(private telegramService: TelegramService) {

    this.mtProto = this.telegramService.mtProto;

    if (!this.config) {
      this.config = this.configDefault;
      localStorage.setItem('config', JSON.stringify(this.config));
    }



  }

  async sendCode(phone: string) {
    return this.telegramService.call('auth.sendCode', {
      phone_number: phone,
      settings: {
        _: 'codeSettings',
      },
    });
  }

  // @ts-ignore
  async signIn({phone_code, phone_number, phone_code_hash}) {
    return this.telegramService.call('auth.signIn', {
      phone_number: phone_number,
      phone_code_hash: phone_code_hash,
      phone_code: phone_code,
    });
  }

  async exportLoginToken() {
    return await this.telegramService.call('auth.exportLoginToken', {
      api_id: this.configDefault.api_id,
      api_hash: this.configDefault.api_hash,
      except_ids: []
    });
  }

  async twoFactorAuth(password: string) {

    const {srp_id, current_algo, srp_B} = await this.account.getPassword();
    const {g, p, salt1, salt2} = current_algo;

    const {A, M1} = await this.telegramService.mtProto.crypto.getSRPParams({
      g,
      p,
      salt1,
      salt2,
      gB: srp_B,
      password,
    });

    const checkPasswordResult = await this.checkPassword({srp_id, A, M1});
  }



  private async checkPassword({srp_id, A, M1}: { srp_id: bigint, A: Uint8Array, M1: Uint8Array }) {
    // return this.telegramService.call('auth.checkPassword', password);

    return this.telegramService.call('auth.checkPassword', {
      password: {
        _: 'inputCheckPasswordSRP',
        srp_id,
        A,
        M1,
      },
    });
  }


}
