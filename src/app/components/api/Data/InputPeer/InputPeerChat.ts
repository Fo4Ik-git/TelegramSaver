export class InputPeerChat {
  chat_id!: number;
  _ = 'inputPeerChat';


  constructor(chat_id: number) {
    this.chat_id = chat_id;
  }
}
