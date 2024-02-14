/**
 * This class is used to create an object that represents a user's photo in the Telegram API.
 *
 * @param {number} user_id - The unique identifier of the user.
 * @param {number} access_hash - A secret number that is used to access the user's information.
 * @param {number} user_photo_id - The unique identifier of the user's photo.
 *
 * @property {number} user_id - The unique identifier of the user.
 * @property {number} access_hash - A secret number that is used to access the user's information.
 * @property {number} user_photo_id - The unique identifier of the user's photo.
 */
export class InputUserPhoto{
  user_id!: number;
  access_hash!: number;
  user_photo_id!: number;

  constructor(user_id: number, access_hash: number, user_photo_id: number){
    this.user_id = user_id;
    this.access_hash = access_hash;
    this.user_photo_id = user_photo_id;
  }
}
