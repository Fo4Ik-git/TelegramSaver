import {Component, Input, OnInit} from '@angular/core';
import {TelegramService} from "../../services/telegram.service";
import {Buffer} from "buffer";
import {QRCodeModule} from "angularx-qrcode";
import {InputTextModule} from 'primeng/inputtext';
import {NgIf} from "@angular/common";
import {Auth} from "../api/Auth";

interface SignInParams {
  phone_code: string;
  phone_number: string;
  phone_code_hash: string;
}

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    QRCodeModule,
    InputTextModule,
    NgIf
  ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent implements OnInit {

  signInParams: SignInParams = {} as SignInParams;
  authorization: any = localStorage.getItem('authorization') || null;
  qrCodeLink: string = '';
  //get from parent
  @Input() isMobile!: boolean;
  showTelegramCode: boolean = false;
  auth = new Auth(this.telegramService)
  protected readonly JSON = JSON;

  constructor(private telegramService: TelegramService) {
  }

  async ngOnInit(): Promise<void> {

    this.telegramService.loginToken = (await this.auth.exportLoginToken()).token;
    let base64Token;
    try {
      base64Token = this.getBase64Token();
    } catch (e) {
      base64Token = this.getBase64Token();
    }
    this.qrCodeLink = 'tg://login?token=' + base64Token;
  }

  getBase64Token() {
    return Buffer.from(this.telegramService.loginToken).toString('base64');
  }

  async onSendPhoneNumber(phone: string) {
    this.signInParams.phone_number = phone;
    const {phone_code_hash} = await this.auth.sendCode(phone);

    this.signInParams.phone_code_hash = phone_code_hash;
    this.showTelegramCode = true;
  }

  async onSignIn(code: string) {
    this.signInParams.phone_code = code;

    let authorization = (await this.auth.signIn(this.signInParams));
    localStorage.setItem('authorization', authorization);
    let user = authorization.user;
    localStorage.setItem('user', JSON.stringify(user));

    window.location.reload();
  }
}
