export default class VideoPlayer {
  /* eslint-disable */
  private ws: WebSocket | null;
  private frameQueue: ArrayBuffer[];
  private mp4Box: any;
  private wsUrl: string;
  private videoDom: HTMLVideoElement;
  private wsOnMsg: Function | undefined;
  private wsOnClose: Function | undefined;
  private wsShow: Function | undefined;

  constructor(config: {
    wsUrl: string;
    videoDom: HTMLVideoElement;
    wsOnMsg?: Function;
    wsOnClose?: Function;
    wsShow?: Function;
    disableReconnect?: boolean;
  }) {
    const { wsUrl, videoDom, ...rest } = config;
    this.wsUrl = wsUrl;
    this.videoDom = videoDom;
    Object.assign(this, rest);
    this.ws = null;
    this.frameQueue = [];
    this.mp4Box = require('mp4box');
  }

  on(): void {
    let sourcebuffer: SourceBuffer | null = null;
    this.ws = new WebSocket(this.wsUrl);
    this.ws.binaryType = 'arraybuffer';
    let firstMessage = true;
    const videoDom = this.videoDom;

    const demux_moov = (info: any): void => {
      const codecs: string[] = [];
      for (let i = 0; i < info.tracks.length; i++) {
        codecs.push(info.tracks[i].codec);
      }
      const mediasource = new MediaSource();
      videoDom.src = URL.createObjectURL(mediasource);
      let pre_pos = 0;
      mediasource.onsourceopen = () => {
        sourcebuffer = mediasource.addSourceBuffer('video/mp4; codecs="' + codecs.join(', ') + '"');
        sourcebuffer.onupdateend = () => {
          const pos = videoDom.currentTime;
          if (videoDom.buffered.length > 0) {
            const start = videoDom.buffered.start(videoDom.buffered.length - 1);
            const end = videoDom.buffered.end(videoDom.buffered.length - 1);

            if (pos < start) {
              videoDom.currentTime = start;
              if (this.wsShow) {
                this.wsShow();
              }
            }

            if (pos > end) {
              videoDom.currentTime = start;
            }

            if (pos - pre_pos !== 0 && end - pos > 3) {
              videoDom.currentTime = end;
            }

            for (let i = 0; i < videoDom.buffered.length - 1; i++) {
              const prestart = videoDom.buffered.start(i);
              const preend = videoDom.buffered.end(i);
              if (!sourcebuffer?.updating) {
                sourcebuffer?.remove(prestart, preend);
              }
            }

            if (pos - start > 10 && !sourcebuffer?.updating) {
              sourcebuffer?.remove(0, pos - 3);
            }

            if (end - pos > 10 && !sourcebuffer?.updating) {
              sourcebuffer?.remove(0, end - 3);
            }
          }
          pre_pos = pos;
        };
      };
    };

    this.ws.onmessage = (e: MessageEvent<ArrayBuffer>) => {
      if (this.wsOnMsg) {
        this.wsOnMsg(e);
      }
      if (firstMessage) {
        firstMessage = false;
        const moov: any = e.data;
        const mp4Box = this.mp4Box.createFile();
        mp4Box.onReady = demux_moov;
        moov.fileStart = 0;
        mp4Box.appendBuffer(moov);
      }
      this.frameQueue.push(e.data);
      if (!sourcebuffer || sourcebuffer.updating) {
        return;
      }
      if (this.frameQueue.length === 1) {
        sourcebuffer.appendBuffer(this.frameQueue.shift()!);
      } else {
        let byte_length = 0;
        for (const qnode of this.frameQueue) {
          byte_length += qnode.byteLength;
        }
        const mp4buf = new Uint8Array(byte_length);
        let offset = 0;
        for (const qnode of this.frameQueue) {
          const frame = new Uint8Array(qnode);
          mp4buf.set(frame, offset);
          offset += qnode.byteLength;
        }
        sourcebuffer.appendBuffer(mp4buf);
        this.frameQueue.splice(0, this.frameQueue.length);
      }
    };
    this.ws.onerror = (e: any) => {
      // console.log('ws player onerror');
      // setTimeout(() => {
      //   this.close();
      //   this.on();
      // }, 10000);
      if (this.wsOnClose) {
        this.wsOnClose(e);
      }
    };
    this.ws.onclose = (e: any) => {
      // console.log('ws player onclose');
      // setTimeout(() => {
      //   this.close();
      //   this.on();
      // }, 10000);
      if (this.wsOnClose) {
        this.wsOnClose(e);
      }
    };
  }

  close(): void {
    this.ws?.close();
  }
  /* eslint-enable */
}
