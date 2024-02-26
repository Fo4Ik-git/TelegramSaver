import {Injectable} from '@angular/core';

// @ts-ignore
import MTProto from '@mtproto/core/envs/browser';
import {telegramConfig} from "../config/telegram.config";
import {MessageService} from "primeng/api";

interface ErrorWithDetails {
  error_code: number;
  error_message: string;
}

@Injectable({
  providedIn: 'root',
})
export class TelegramService {

  telegramConfig = telegramConfig
  public mtProto: any;
  messageService?: MessageService
  private errorHandlers: { [key: string]: Function } = {
    "FLOOD_WAIT_": async (error_message: string, method: any, params: {} = {}, options: {} = {}) => {
      const seconds = Number(error_message.split('FLOOD_WAIT_')[1]);
      const ms = seconds * 1000;

      this.notify(`Flood control: retrying in ${seconds} seconds...`);

      await this.sleep(ms);

      return this.call(method, params, options);
    },
    "SESSION_PASSWORD_NEEDED": () => {
      this.notify('Password needed');
    },
    "AUTH_KEY_UNREGISTERED": () => {
      this.notify('Auth key unregistered. Please login again.');
      localStorage.clear();
      window.location.reload();
    },
    "default": (error_message: string) => {
      this.notify(`Error: ${error_message}`);
    }
  }

  constructor() {
    this.mtProto = new MTProto({
      api_id: this.telegramConfig.api_id,
      api_hash: this.telegramConfig.api_hash,
      // test: true
    });
  }


  /**
   * This method is used to make a call to the Telegram API.
   *
   * @param {any} method - The name of the method to call on the Telegram API.
   * @param {Object} [params={}] - The parameters to pass to the method. Default is an empty object.
   * @param {Object} [options={}] - The options for the method call. Default is an empty object.
   *
   * @returns {Promise} - A Promise that resolves with the result of the method call if it is successful, or rejects with an error if the method call fails.
   *
   * @throws {Error} - If the method call to the Telegram API fails, an error is thrown.
   */
  public async call(method: any, params: {} = {}, options: {} = {}): Promise<any> {
    try {
      return await this.mtProto.call(method, params, options);
    } catch (error) {
      const {error_code, error_message} = error as ErrorWithDetails;
      return this.handleError(error_code, error_message, method, params, options);
    }
  }

  /**
   * This method creates a notification and appends it to the body of the document.
   * The notification is a div element with a specific style and contains a message, an SVG icon, and a close button.
   * The notification will disappear after 3 seconds or when the close button is clicked.
   *
   * @param {string} message - The message to be displayed in the notification.
   */
  public notify(message: string) {
    if (this.messageService) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: message});
    } else {
      const notification = document.createElement('div');
      notification.id = 'alert-border-1';
      notification.classList.add('fixed', 'top-0', 'right-0', 'flex', 'items-center', 'p-4', 'mb-4', 'text-blue-800', 'border-t-4', 'border-blue-300', 'bg-blue-50', 'dark:text-blue-400', 'dark:bg-gray-800', 'dark:border-blue-800');
      notification.setAttribute('role', 'alert');
      notification.innerHTML = `
    <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
    </svg>
    <div class="ms-3 text-sm font-medium">
      ${message}
    </div>
    <button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700" data-dismiss-target="#alert-border-1" aria-label="Close">
      <span class="sr-only">Dismiss</span>
      <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
      </svg>
    </button>
  `;
      document.body.appendChild(notification);

      const closeButton = notification.querySelector('button');
      if (!closeButton) {
        console.error('Close button not found');
        return;
      }
      closeButton.addEventListener('click', () => {
        notification.remove();
      });

      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  }

  private async handleError(error_code: number, error_message: string, method: any, params: {} = {}, options: {} = {}): Promise<any> {
    const handler = this.errorHandlers[error_message] || this.errorHandlers["default"];
    handler(error_message, method, params, options);
    return Promise.reject({error_code, error_message});
  }

  /**
   * This method creates a promise that resolves after a specified number of milliseconds.
   *
   * @param {number} ms - The number of milliseconds to wait before the promise is resolved.
   * @returns {Promise} - A promise that resolves after the specified number of milliseconds.
   */
  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  /**/

  /*
  public async sendMessage(message: string, random_id: number) {
    return this.call('messages.sendMessage', {
      peer: {
        _: 'inputPeerUser',
        user_id: this.config.bot_id,
        access_hash: 0
      },
      message: message,
      random_id: random_id,
    });
  }
*/
}

