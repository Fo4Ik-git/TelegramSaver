import {TelegramService} from "../../../services/telegram.service";
import {Messages} from "./Messages";
import {Contacts} from "./Contacts";
import {InputPeerUser} from "../Data/InputPeer/InputPeerUser";
import { telegramConfig } from "../../../config/telegram.config";

export class Bots{

  messages = new Messages(this.telegramService);
  contacts = new Contacts(this.telegramService);
  telegramConfig = telegramConfig;
  constructor(private telegramService: TelegramService) {
  }





}
