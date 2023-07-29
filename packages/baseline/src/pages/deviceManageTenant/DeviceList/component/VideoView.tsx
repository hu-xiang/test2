import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import VideoStream from '../../../../components/VideoStream';
import { commonRequest } from '../../../../utils/commonMethod';
import styles from '../styles.less';

const requestList = [
  { url: '/traffic/camera/getPlayUrl', method: 'get' },
  { url: '/traffic/camera/getChannelList', method: 'get' },
];

type Iprops = {
  isVideoShow: boolean;
  onCancel: Function;
  rowInfo?: any;
};
const LocationModal: React.FC<Iprops> = (props) => {
  const [isShow, setIsShow] = useState<boolean>(false);
  const [wsUrl, setWsUrl] = useState<any>();
  const [uuid, setUuid] = useState<any>('');
  const [channelList, setChannelList] = useState<any>([]);
  const [channelIndex, setChannelIndex] = useState<number>(0);

  const getChannelList = async () => {
    const res = await commonRequest({
      ...requestList[1],
      params: { deviceId: props?.rowInfo?.deviceId },
    });
    if (res.status === 0) {
      setChannelList(res?.data || []);
      if (res?.data?.length) {
        setChannelIndex(0);
        setUuid(res?.data[0]?.channelUid);
      }
    }
  };
  const getVideoUrl = async (cameraUid: any) => {
    const video = await commonRequest({
      ...requestList[0],
      params: { cameraUid },
    });
    if (video.status === 0) {
      setWsUrl(video?.data?.mseUrl);
      setIsShow(true);
    } else {
      setWsUrl('');
    }
  };

  useEffect(() => {
    if (uuid) getVideoUrl(uuid);
  }, [uuid]);

  useEffect(() => {
    getChannelList();
  }, []);
  return (
    <Modal
      title="视频实时预览"
      width={'800px'}
      wrapClassName={styles.carInnerModal}
      maskClosable={false}
      bodyStyle={{
        height: '500px',
        padding: '0',
      }}
      open={props?.isVideoShow}
      onCancel={() => props?.onCancel()}
      onOk={() => {}}
      style={{
        top: 'calc(50% - 290px)',
      }}
      footer={false}
    >
      {isShow ? (
        <div
          style={{
            border: '0.5px solid rgba(255, 255, 255, 0.5)',
            width: '600px',
            height: '501px',
            // marginLeft: '24px',
            // borderRadius: '10px'
            display: 'flex',
          }}
        >
          <VideoStream
            width={'600px'}
            height={'500px'}
            wsUrl={wsUrl}
            style={{ position: 'absolute', left: '228px', top: '200px' }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              right: '24px',
              marginTop: '20px',
            }}
          >
            {channelList?.map((item: any, i: number) => (
              <div
                key={item?.id}
                className={`${i === channelIndex ? styles.channelSelected : ''} ${
                  styles.videoChannelSwitch
                }`}
                onClick={() => {
                  if (i === channelIndex) return;
                  setChannelIndex(i);
                  setUuid(channelList[i]?.channelUid);
                }}
              >
                {item?.channelName}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default LocationModal;
