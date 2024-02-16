export class InputPeerUser {
  user_id!: number;
  access_hash!: number;
  _ = 'inputPeerUser';


  constructor(user_id: number, access_hash: number) {
    this.user_id = user_id;
    this.access_hash = access_hash;
  }
}
