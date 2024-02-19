import {TelegramService} from "../../../services/telegram.service";
import {telegramConfig} from "../../../config/telegram.config";
import {ConfigService} from "../../../config/config.service";

export class Auth {
  public config: any = JSON.parse(localStorage.getItem('config') || '{}');
  configDefault = telegramConfig;
  mtProto: any;
  configService = new ConfigService();

  constructor(private telegramService: TelegramService) {

    this.mtProto = this.telegramService.mtProto;

    if (!this.config) {
      this.config = this.configDefault;
      localStorage.setItem('config', JSON.stringify(this.config));
    }


    this.mtProto.updates.on('updateShort', async (updateInfo: any) => {
      console.log('updateShort:', updateInfo);

      switch (updateInfo.update._) {
        case 'updateLoginToken': {
          //TODO FIX error_message: 'SESSION_PASSWORD_NEEDED' 2FA add


          let authorization = (await this.exportLoginToken()).authorization;
          console.log('authorization:', authorization);
          localStorage.setItem('authorization', authorization);

          let user = authorization.user;
          localStorage.setItem('user', JSON.stringify(user));
          this.configService.saveConfig();

          window.location.reload();
          break;
        }
      }
    });
  }

  public async sendCode(phone: string) {
    return this.telegramService.call('auth.sendCode', {
      phone_number: phone,
      settings: {
        _: 'codeSettings',
      },
    });
  }

  // @ts-ignore
  public async signIn({phone_code, phone_number, phone_code_hash}) {
    return this.telegramService.call('auth.signIn', {
      phone_number: phone_number,
      phone_code_hash: phone_code_hash,
      phone_code: phone_code,
    });
  }

  public async exportLoginToken() {
    try {
      return await this.telegramService.call('auth.exportLoginToken', {
        api_id: this.configDefault.api_id,
        api_hash: this.configDefault.api_hash,
        except_ids: []
      });
    } catch (e) {
      console.error(e);
    }
  }

}
