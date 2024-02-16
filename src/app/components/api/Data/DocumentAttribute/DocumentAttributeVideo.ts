export class DocumentAttributeVideo {
  flags?: number;
  round_message?: boolean;
  supports_streaming?: boolean;
  nosound_video?: boolean;
  duration!: number;
  w!: number;
  h!: number;
  preload_prefix_size?: number;
  _: string = 'documentAttributeVideo';

  constructor(duration: number,
              w: number,
              h: number,
              flags?: number,
              round_message?: boolean,
              supports_streaming?: boolean,
              nosound_video?: boolean,
              preload_prefix_size?: number) {
    this.flags = flags;
    this.round_message = round_message;
    this.supports_streaming = supports_streaming;
    this.nosound_video = nosound_video;
    this.duration = duration;
    this.w = w;
    this.h = h;
    this.preload_prefix_size = preload_prefix_size;
  }

  getAttribute() {
    return {
      _: this._,
      flags: this.flags,
      round_message: this.round_message,
      supports_streaming: this.supports_streaming,
      nosound_video: this.nosound_video,
      duration: this.duration,
      w: this.w,
      h: this.h,
      preload_prefix_size: this.preload_prefix_size
    }
  }
}
