import {TelegramService} from "../../../services/telegram.service";
import {InputUser} from "../Data/InputUser";
import {InputPeerPhotoFileLocation} from "../Data/InputFileLocation/InputPeerPhotoFileLocation";
import {InputPeerUser} from "../Data/InputPeer/InputPeerUser";
import {Upload} from "./Upload";
import {InputUserPhoto} from "../Data/InputUserPhoto/InputUserPhoto";

export class Photos {
  mtProto: any;

  upload = new Upload(this.telegramService);

  constructor(private telegramService: TelegramService) {
    this.mtProto = this.telegramService.mtProto;

  }


  /**
   * This method is used to get the photos of a specific user.
   *
   * @param {InputUser} user - The user whose photos are to be fetched.
   * @param {number} [offset=0] - The offset from where to start fetching the photos. Default is 0.
   * @param {number} [max_id=0] - The maximum ID of the photos to fetch. Default is 0.
   * @param {number} [limit=-1] - The maximum number of photos to fetch. Default is -1, which means all photos.
   *
   * @returns {Promise} - A Promise that resolves with the user's photos if the method call is successful, or rejects with an error if the method call fails.
   *
   * @throws {Error} - If the method call to the Telegram API fails, an error is thrown.
   */
  public async getUserPhotos(user: InputUser, offset: number = 0, max_id: number = 0, limit: number = -1) {
    return this.telegramService.call('photos.getUserPhotos', {
      user_id: {
        _: 'inputUser',
        user_id: user.user_id,
        access_hash: user.access_hash
      },
      offset: offset,
      max_id: max_id,
      limit: limit
    });
  }

  public async getUserProfilePhoto(user: InputUserPhoto ){
    let photo = await this.getUserPhotos(new InputUser(
        user.user_id,
        user.access_hash
      )
    );

    let file = photo.photos.find((photoFind: { id: number; }) =>
      photoFind.id === user.user_photo_id
    );

    let url = await this.upload.getFile(
      new InputPeerPhotoFileLocation(
        new InputPeerUser(
          user.user_id,
          user.access_hash
        ),
        file.id,
        true
      )
    );

    return URL.createObjectURL(new Blob([url.bytes.buffer], {type: 'image/png'}))
  }

}
