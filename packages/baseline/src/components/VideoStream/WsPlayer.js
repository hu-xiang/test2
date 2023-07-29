/* eslint-disable */
export default class WsPlayer {
  constructor(config = {}) {
    // const { wsUrl, videoDom, wsOnMsg, wsOnClose, wsOnFirstMsg, disableReconnect } = config
    Object.keys(config).forEach((key) => {
      this[key] = config[key];
    });

    this.MP4Box = require('mp4box');
  }

  reconnect = () => {
    if (this.disableReconnect || this.isRemoved) return;
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.close();
      this.open();
    }, 10000);
  };

  open = () => {
    this.sourcebuffer = null;
    this.frameQueue = [];
    this.ws = new WebSocket(this.wsUrl);
    this.ws.binaryType = 'arraybuffer';
    let firstMessage = true;
    let demux_moov = (info) => {
      let codecs = [];
      for (let i = 0; i < info.tracks.length; i++) {
        codecs.push(info.tracks[i].codec);
      }

      let videoEl = this.videoDom;
      let mediasource = new MediaSource();
      videoEl.src = URL.createObjectURL(mediasource);
      let pre_pos = 0;
      mediasource.onsourceopen = () => {
        URL.revokeObjectURL(videoEl.src);
        const mimeType = `video/mp4; codecs="${codecs.join(', ')}"`;
        // console.log(mimeType, MediaSource.isTypeSupported(mimeType));
        this.sourcebuffer = mediasource.addSourceBuffer(mimeType);
        this.sourcebuffer.onupdateend = () => {
          let pos = videoEl.currentTime;
          if (videoEl.buffered.length > 0) {
            let start = videoEl.buffered.start(videoEl.buffered.length - 1);
            let end = videoEl.buffered.end(videoEl.buffered.length - 1);
            // console.log('pos=' + pos + ',start=' + start + ',end=' + end);

            if (pos < start) {
              // console.log('==1 set videoEl.currentTime pos=' + pos + ',start=' + start + ',end=' + end);
              videoEl.currentTime = start;
            }

            if (pos > end) {
              // console.warn('==12 chase frame pos=' + pos + ',start=' + start + ',end=' + end);
              videoEl.currentTime = start;
            }

            if (pos - pre_pos != 0 && end - pos > 3) {
              // console.log('==13 set end videoEl.currentTime pos=' + pos + ',start=' + start + ',end=' + end);
              videoEl.currentTime = end;
            }

            for (let i = 0; i < videoEl.buffered.length - 1; i++) {
              let prestart = videoEl.buffered.start(i);
              let preend = videoEl.buffered.end(i);
              if (!this.sourcebuffer.updating) {
                this.sourcebuffer.remove(prestart, preend);
              }
            }

            if (pos - start > 10 && !this.sourcebuffer.updating) {
              // console.warn('==14 remove start pos=' + pos + ',start=' + start + ',end=' + end);
              this.sourcebuffer.remove(0, pos - 3);
            }

            if (end - pos > 10 && !this.sourcebuffer.updating) {
              // console.warn('==15 remove end pos=' + pos + ',start=' + start + ',end=' + end);
              this.sourcebuffer.remove(0, end - 3);
            }
          }
          pre_pos = pos;
        };
      };
    };

    this.ws.onmessage = (e) => {
      this.reconnect();

      if (this.wsOnMsg) {
        this.wsOnMsg(e);
      }

      if (!(e.data instanceof ArrayBuffer)) {
        return;
      }

      if (firstMessage) {
        firstMessage = false;
        if (this.wsOnFirstMsg) {
          this.wsOnFirstMsg(e);
        }
        let moov = e.data;
        let mp4Box = this.MP4Box.createFile();
        mp4Box.onReady = demux_moov;
        moov.fileStart = 0;
        mp4Box.appendBuffer(moov);
      }

      this.frameQueue.push(e.data);

      if (!this.sourcebuffer || this.sourcebuffer.updating) {
        return;
      }

      // this.sourcebuffer.appendBuffer(this.frameQueue.shift());

      if (this.frameQueue.length === 1) {
        try {
          this.sourcebuffer.appendBuffer(this.frameQueue.shift());
        } catch (error) {
          console.log(error, 'appendBuffer 119');
        }
      } else {
        let byte_length = 0;

        for (const qnode of this.frameQueue) {
          byte_length += qnode.byteLength;
        }

        let mp4buf = new Uint8Array(byte_length);

        let offset = 0;

        for (const qnode of this.frameQueue) {
          let frame = new Uint8Array(qnode);
          mp4buf.set(frame, offset);
          offset += qnode.byteLength;
        }
        try {
          this.sourcebuffer.appendBuffer(mp4buf);
        } catch (error) {
          console.log(error, 'appendBuffer 140');
        }
        this.frameQueue.splice(0, this.frameQueue.length);
      }
    };

    this.ws.onclose = (e) => {
      console.log('ws player onclose');
      this.reconnect();

      if (this.wsOnClose) {
        this.wsOnClose(e);
      }
    };

    this.ws.onerror = () => {
      console.log('ws player onerror');
      this.reconnect();
    };
  };

  close = () => {
    if (this.videoDom) {
      this.videoDom.src = '';
    }

    this.ws && this.ws.close();
  };

  launch = () => {
    this.isRemoved = false;
    this.close();
    this.reconnect();
    this.open();
  };

  send = (msg) => {
    this.ws && this.ws.send(msg);
  };

  remove = () => {
    clearTimeout(this.reconnectTimer);
    this.isRemoved = true;
    this.close();
  };
}
