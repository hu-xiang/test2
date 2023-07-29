import React from 'react';
import { Modal } from 'antd';
import Position from './Position';

type Iprops = {
  positionModalVisible: boolean;
  onCancel: () => void;
  savePosition: () => void;
};

const PositionModal: React.FC<Iprops> = (props) => {
  const submitPosition = () => {
    props.savePosition();
  };

  return (
    <>
      {props.positionModalVisible ? (
        <Modal
          title="地图定位"
          width={'70vw'}
          bodyStyle={{ height: '700px' }}
          open={props.positionModalVisible}
          onCancel={() => props.onCancel()}
          onOk={() => submitPosition()}
        >
          <Position searchVisible={true}></Position>
        </Modal>
      ) : (
        ''
      )}
    </>
  );
};

export default PositionModal;
