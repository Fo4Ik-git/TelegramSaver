import {InputPeerUser} from "../InputPeer/InputPeerUser";

export class InputPeerPhotoFileLocation {


  big?: boolean;
  peer!: InputPeerUser;
  photo_id!: number;
  _ = 'inputPeerPhotoFileLocation';

  constructor(peer: InputPeerUser, photo_id: number, big?: boolean) {
    this.big = big;
    this.peer = peer;
    this.photo_id = photo_id;
  }
}
