export class Account{

  constructor(private telegramService: any) {
  }

  async getPassword() {
    return this.telegramService.call('account.getPassword');
  }

}
