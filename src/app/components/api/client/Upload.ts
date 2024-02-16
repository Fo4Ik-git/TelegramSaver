import {TelegramService} from "../../../services/telegram.service";
import {InputPhotoFileLocation} from "../Data/InputFileLocation/InputPhotoFileLocation";
import {InputPeerPhotoFileLocation} from "../Data/InputFileLocation/InputPeerPhotoFileLocation";


export class Upload {

  mtProto: any;

  constructor(private telegramService: TelegramService) {
    this.mtProto = this.telegramService.mtProto;
  }




  /**
   * This method is used to get a file from a specific location.
   *
   * Link to official documentation: [upload.getFile](https://core.telegram.org/method/upload.getFile)
   *
   * @param {InputPhotoFileLocation | InputPeerPhotoFileLocation} location - The location of the file. This can be either an InputPhotoFileLocation or an InputPeerPhotoFileLocation.
   * @param {number} [offset=0] - The offset from where to start reading the file. Default is 0.
   * @param {number} [limit=1024 '*' 1024] - The maximum amount of bytes to read from the file. Default is 1MB.
   *
   * @returns {Promise} - A Promise that resolves with the file data if the file is successfully retrieved, or rejects with an error if the file retrieval fails.
   *
   * @throws {Error} - If the method call to the Telegram API fails, an error is thrown.
   */
  async getFile(location: InputPhotoFileLocation | InputPeerPhotoFileLocation, offset: number = 0, limit: number = 1024 * 1024) {
    switch (location.constructor) {
      case InputPhotoFileLocation: {
        let photoLocation = location as InputPhotoFileLocation;

        return this.telegramService.call('upload.getFile', {
          location: {
            _: photoLocation._,
            id: photoLocation.id,
            access_hash: photoLocation.access_hash,
            file_reference: photoLocation.file_reference,
            thumb_size: photoLocation.thumb_size
          },
          offset: offset,
          limit: limit
        });
      }
      case InputPeerPhotoFileLocation: {
        let peerPhotoLocation = location as InputPeerPhotoFileLocation;
        return this.telegramService.call('upload.getFile', {
          location: {
            _: peerPhotoLocation._,
            peer: {
              _: peerPhotoLocation.peer._,
              user_id: peerPhotoLocation.peer.user_id,
              access_hash: peerPhotoLocation.peer.access_hash
            },
            photo_id: peerPhotoLocation.photo_id
          },
          offset: offset,
          limit: limit
        });
      }

    }
  }

  async saveFilePart(file_id: number, bytes: Uint8Array, file_part: number = 0 ) {
    return this.telegramService.call('upload.saveFilePart', {
      file_id: file_id,
      file_part: file_part,
      bytes: bytes
    });
  }

  async saveBigFilePart(file_id: number, file_part: number, file_total_parts: number, bytes: Uint8Array) {
    return this.telegramService.call('upload.saveBigFilePart', {
      file_id: file_id,
      file_part: file_part,
      file_total_parts: file_total_parts,
      bytes: bytes
    });
  }

}
