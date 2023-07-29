import { Modal } from 'antd';
import styles from './styles.less';

type Iprops = {
  title: string;
  // content: string;
  nwidth: number;
  modalShow: boolean;
  onModalCancel: () => void;
};

const TooltipModal: React.FC<Iprops> = (props) => {
  const { title, modalShow, nwidth } = props;

  return (
    <Modal
      title={title}
      closable={true}
      open={modalShow}
      onCancel={() => props.onModalCancel()}
      destroyOnClose
      width={nwidth}
      footer={null}
      maskClosable={true}
      className={styles['tooltip-modal-class']}
    >
      <div className={styles['modal-content-box']}>{props.children}</div>
    </Modal>
  );
};

export default TooltipModal;
