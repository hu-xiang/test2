import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import VideoStream from '../../../../../components/VideoStream';
import { commonRequest } from '../../../../../utils/commonMethod';

const requestList = [{ url: '/traffic/camera/getPlayUrl', method: 'get' }];

type Iprops = {
  isVideoShow: boolean;
  onCancel: Function;
  rowInfo?: any;
};
const LocationModal: React.FC<Iprops> = (props) => {
  const [isShow, setIsShow] = useState<boolean>(false);
  const [wsUrl, setWsUrl] = useState<any>();

  const getVideoUrl = async () => {
    const res = await commonRequest({
      ...requestList[0],
      params: { cameraUid: props.rowInfo?.cameraUid },
    });
    if (res.status === 0) {
      setWsUrl(res?.data?.mseUrl);
      setIsShow(true);
    }
    setWsUrl('');
  };

  useEffect(() => {
    getVideoUrl();
  }, []);
  return (
    <Modal
      title="视频预览"
      width={'70vw'}
      maskClosable={false}
      bodyStyle={{ height: 'calc(90vh - 55px)', padding: '0 1px' }}
      open={props.isVideoShow}
      onCancel={() => props.onCancel()}
      onOk={() => {}}
      style={{ top: '5%' }}
      footer={false}
    >
      {isShow ? (
        <VideoStream
          width={'100%'}
          height={'calc(90vh - 55px)'}
          wsUrl={wsUrl}
          style={{ position: 'absolute', left: 'calc(50% - 84px)', top: 'calc(50% - 84px)' }}
        />
      ) : null}
    </Modal>
  );
};

export default LocationModal;
