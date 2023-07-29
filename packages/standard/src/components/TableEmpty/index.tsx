import nullStatus from '../../assets/img/InspectionBoard/empty.svg';
import styles from './index.less';

type Iprops = {
  customEmptyClass?: string;
};
const EmptyStatus: React.FC<Iprops> = (props) => {
  return (
    // 这里面就是我们自己定义的空状态
    <div style={{ textAlign: 'center' }} className={`tableEmptyClass ${props.customEmptyClass}`}>
      <img className="tableEmptyImgClass" src={nullStatus} alt="" />
      <div className={styles.emptyTxt}>暂无数据</div>
    </div>
  );
};
export default EmptyStatus;
