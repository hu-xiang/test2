import { Modal } from 'antd';
import MapLocation from 'baseline/src/components/MapLocation';
import React, { useEffect } from 'react';
import { useModel } from 'umi';
import { commonRequest } from 'baseline/src/utils/commonMethod';

const requestList = [{ url: '/traffic-bsl/focusScene/showEdit', method: 'get' }];

type Iprops = {
  isModalshow: boolean;
  onCancel: Function;
  id: string;
};
const LocationModal: React.FC<Iprops> = (props) => {
  const { setLnglatArr } = useModel<any>('facility');

  const getLocation = async () => {
    const res = await commonRequest({ ...requestList[0], params: { id: props.id } });
    const list: any = [[]];
    if (res?.data?.locationList.length) {
      res.data?.locationList.forEach((item: any) => {
        list.push([item.longitude, item.latitude]);
      });
      setLnglatArr(list);
      return;
    }
    setLnglatArr([[]]);
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = () => {
    props.onCancel();
  };
  return (
    <Modal
      title="地图定位"
      width={'70vw'}
      maskClosable={false}
      bodyStyle={{ height: 'calc(90vh - 55px)' }}
      open={props.isModalshow}
      onCancel={() => props.onCancel()}
      onOk={() => handleSubmit()}
      style={{ top: '5%' }}
      footer={false}
    >
      <MapLocation height={'calc(90vh - 95px)'} />
    </Modal>
  );
};

export default LocationModal;
