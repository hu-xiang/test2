import React from 'react';
import { Modal } from 'antd';
import MapLocation from '../../../../components/MapLocation';

type Iprops = {
  isModalshow: boolean;
  onCancel: Function;
  id: string;
};
const LocationModal: React.FC<Iprops> = (props) => {
  const handleSubmit = () => {
    props.onCancel();
  };
  return (
    <Modal
      title="地图定位"
      open={props.isModalshow}
      onCancel={() => props.onCancel()}
      onOk={() => handleSubmit()}
    >
      <MapLocation id={props.id} locationUrl="/traffic-km/under/location" />
    </Modal>
  );
};

export default LocationModal;
