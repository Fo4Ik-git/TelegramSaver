import {Component, Input, OnInit} from '@angular/core';
import {TelegramService} from "../../services/telegram.service";
import {Buffer} from "buffer";
import {QRCodeModule} from "angularx-qrcode";
import {InputTextModule} from 'primeng/inputtext';
import {NgClass, NgIf, NgOptimizedImage} from "@angular/common";
import {Auth} from "../api/Auth";
import {Help} from '../api/Help';
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import { ConfigService } from '../../config/config.service';

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
    NgIf,
    DropdownModule,
    FormsModule,
    NgOptimizedImage,
    NgClass,
    ToastModule
  ],
  providers: [MessageService],
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
  help = new Help(this.telegramService)
  loginToken: any;
  countries: any = [];
  selectedCountry: any;
  telegramCodeValue: string = '';
  protected readonly JSON = JSON;

  constructor(private telegramService: TelegramService,
              private configService: ConfigService,
              private messageService: MessageService,) {
  }

  async ngOnInit(): Promise<void> {
    this.getCountries();

    this.loginToken = (await this.auth.exportLoginToken()).token;

    let base64Token;
    try {
      base64Token = this.getBase64Token();
    } catch (e) {
      base64Token = this.getBase64Token();
    }
    this.qrCodeLink = 'tg://login?token=' + base64Token;
  }

  async getCountries() {
    let tgCountries = (await this.help.getCountriesList('en', 0)).countries;
    this.countries = tgCountries.map((country: {
      default_name: any;
      country_codes: { country_code: any; }[];
      iso2: any;
    }) => ({
      name: country.default_name,
      phone_code: '+' + country.country_codes[0].country_code,
      code: country.iso2,
      user_phone: '+' + country.country_codes[0].country_code,
    }))
    this.getUserCountry();
  }

  async getUserCountry() {
    //get browser country
    let response = await fetch('https://ipapi.co/json/');
    let data = await response.json();
    let country = data.country;
    let countryData = this.countries.find((c: { code: any; }) => c.code === country);
    this.selectedCountry = countryData;
  }

  getBase64Token() {
    return Buffer.from(this.loginToken).toString('base64');
  }

  async onSendPhoneNumber(phone: string) {
    if (phone.length < 5) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Phone number invalid!'});
      return;
    }
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
    this.configService.saveConfig();

    window.location.reload();
  }
}
