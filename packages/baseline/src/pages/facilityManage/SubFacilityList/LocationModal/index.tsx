import { Modal } from 'antd';
import MapLocation from '../../../../components/MapLocation';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { commonRequest } from '../../../../utils/commonMethod';

const requestList = [
  { url: '/traffic/sub/facilities/real/location', method: 'get' },
  { url: '/traffic/sub/facilities/location', method: 'get' },
];

type Iprops = {
  isModalshow: boolean;
  onCancel: Function;
  id: string;
  type?: any;
};
const LocationModal: React.FC<Iprops> = (props) => {
  const { setLnglatArr } = useModel<any>('facility');
  const [isShow, setIsShow] = useState<boolean>(false);

  const getLocation = async () => {
    const res = await commonRequest({ ...requestList[props.type], params: { id: props.id } });
    const list: any = [[]];
    if (res.status === 0) {
      list.push([res?.data?.longitude, res?.data?.latitude]);
    }
    setLnglatArr(list);
    setIsShow(true);
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
      bodyStyle={{ height: 'calc(90vh - 55px)', padding: '0' }}
      open={props.isModalshow && isShow}
      onCancel={() => props.onCancel()}
      onOk={() => handleSubmit()}
      style={{ top: '5%' }}
      footer={false}
    >
      {isShow && <MapLocation height={'calc(90vh - 55px)'} isOne={true} />}
    </Modal>
  );
};

export default LocationModal;
