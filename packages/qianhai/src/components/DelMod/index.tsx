import {
  // Input,
  Modal,
  // Form
} from 'antd';
import styles from './styles.less';

type Iprops = {
  showdelmod: boolean;
  onCancel: Function;
  errorName?: any;
  onseterr: Function;
};

const DelMod: React.FC<Iprops> = (props) => {
  return (
    <Modal
      title=" "
      open={props.showdelmod}
      onCancel={() => {
        props.onCancel();
      }}
      onOk={() => {
        props.onseterr();
        props.onCancel();
      }}
      className={`${styles.delmod}`}
      destroyOnClose
      // maskClosable={false}
      bodyStyle={{
        height: 184,
        lineHeight: '140px',
        textAlign: 'center',
      }}
    >
      <div>{props.errorName}</div>
    </Modal>
  );
};
export default DelMod;
