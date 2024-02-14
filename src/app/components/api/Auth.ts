import {TelegramService} from "../../services/telegram.service";
import {telegramConfig} from "../../config/telegram.config";

export class Auth {
  public config: any = JSON.parse(localStorage.getItem('config') || '{}');
  configDefault = telegramConfig;
  mtProto: any;

  constructor(private telegramService: TelegramService) {

    this.mtProto = this.telegramService.mtProto;

    if (!this.config) {
      this.config = this.configDefault;
      localStorage.setItem('config', JSON.stringify(this.config));
    }

    this.mtProto.updates.on('updateShort', async (updateInfo: any) => {
      switch (updateInfo.update._) {
        case 'updateLoginToken': {
          let authorization = (await this.exportLoginToken()).authorization;
          localStorage.setItem('authorization', authorization);

          console.log("authorization", authorization)

          let user = authorization.user;
          localStorage.setItem('user', JSON.stringify(user));

          window.location.reload();
          break;
        }
      }
    });
  }


  public async call(method: any, params: {} = {}, options: {} = {}) {
    try {
      return await this.mtProto.call(method, params, options);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async sendCode(phone: string) {
    return this.call('auth.sendCode', {
      phone_number: phone,
      settings: {
        _: 'codeSettings',
      },
    });
  }

  // @ts-ignore
  public async signIn({phone_code, phone_number, phone_code_hash}) {
    return this.call('auth.signIn', {
      phone_number: phone_number,
      phone_code_hash: phone_code_hash,
      phone_code: phone_code,
    });
  }

  public async exportLoginToken() {
    try {
      return await this.call('auth.exportLoginToken', {
        api_id: this.config.api_id,
        api_hash: this.config.api_hash,
        except_ids: []
      });
    } catch (e) {
      console.error(e);
    }
  }

}
