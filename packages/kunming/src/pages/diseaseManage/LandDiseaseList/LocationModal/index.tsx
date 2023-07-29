import { Modal } from 'antd';
import MapLocation from 'baseline/src/components/MapLocation';
import React, { useEffect } from 'react';
import { useModel } from 'umi';
import { underLocation } from '../service';

type Iprops = {
  isModalshow: boolean;
  onCancel: Function;
  id: string;
};
const LocationModal: React.FC<Iprops> = (props) => {
  const { setLnglatArr } = useModel<any>('facility');

  const getLocation = async () => {
    const res = await underLocation(props.id);
    const list: any = [[]];
    if (res.data instanceof Array) {
      if (res?.data?.length) {
        res.data.forEach((item: any) => {
          list.push([item.longitude, item.latitude]);
        });
      }
      setLnglatArr(list);
    } else if (res.data instanceof Object) {
      list.push([res.data.longitude, res.data.latitude]);
      setLnglatArr(list);
    }
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
      bodyStyle={{ height: '660px' }}
      open={props.isModalshow}
      onCancel={() => props.onCancel()}
      onOk={() => handleSubmit()}
    >
      <MapLocation height={620} />
    </Modal>
  );
};

export default LocationModal;
