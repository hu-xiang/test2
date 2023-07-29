import React, { useEffect, useRef, useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { ReactComponent as NoVideo } from '../../assets/img/video/noVideo.svg';

type Iprops = {
  width?: string;
  height?: string;
  wsUrl: string;
  style?: any;
  videoBigShow?: boolean;
};

let wsPlayer: any = null;

const VideoStream: React.FC<Iprops> = (props) => {
  const [isShowVideo, setIsShowVideo] = useState<boolean>(false);
  const { width, height, wsUrl, style, videoBigShow = false } = props;
  const videoRef: any = useRef(null);
  const wsPlayerRef: any = useRef(null);

  useEffect(() => {
    // if (wsPlayer) {
    //   wsPlayer?.close();
    //   wsPlayer = null;
    // }

    const videoElement = videoRef.current;

    // 创建视频播放器实例

    const wsShow = () => {
      setIsShowVideo(true);
    };
    // 处理 WebSocket 消息事件
    function handleWebSocketMessage(event: any) {
      console.log(event);
      if (event.data) {
        console.log(event.data);
        console.log(event.data.fileStart);
      }
      // const videoData = event.data;
      // 在这里可以进行视频数据的处理或其他操作
      // 将视频数据传递给 WebSocket 播放器实例
      // wsPlayer.appendVideoData(videoData);
    }

    // 处理 WebSocket 关闭事件
    function handleWebSocketClose() {
      // console.log('WebSocket connection closed');
      // 在这里可以处理 WebSocket 关闭事件
      // props?.wsClose(event);
      setIsShowVideo(false);
    }

    if (wsUrl && !videoBigShow) {
      // 创建 WebSocket 播放器实例
      if (wsPlayer) {
        wsPlayer?.close();
        // wsPlayer = null;
      }
      wsPlayer = new VideoPlayer({
        wsUrl, // 替换为实际的 WebSocket URL
        videoDom: videoElement,
        wsOnMsg: handleWebSocketMessage,
        wsOnClose: handleWebSocketClose,
        wsShow,
        disableReconnect: false, // 可选，是否禁用自动重连，默认为 false
      });
      wsPlayerRef.current = wsPlayer;
      wsPlayer.on();
    }
  }, [wsUrl]);

  useEffect(() => {
    if (wsPlayer && props?.videoBigShow) {
      wsPlayer.close();
    }
  }, [props?.videoBigShow]);

  useEffect(() => {
    // 在组件卸载时关闭播放器实例
    return () => {
      if (wsPlayer) {
        wsPlayer.close();
      }
    };
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        // controls
        autoPlay
        width={width || 500}
        // muted
        style={{ objectFit: 'fill', height: height || '500px', display: isShowVideo ? '' : 'none' }}
      />
      <div style={{ ...style, display: isShowVideo ? 'none' : '' }}>
        <NoVideo />
      </div>
    </div>
  );
};

export default VideoStream;
