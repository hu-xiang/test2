import React, { useState, useImperativeHandle } from 'react';
import styles from './styles.less';
import EllipsisTooltip from '../../../../../components/EllipsisTooltip';
import { Select } from 'antd';

interface Iprops {
  title: string;
  isShow?: boolean;
  isPCICard?: boolean;
  flagId: string;
  onRef?: any;
  handleButton?: (val: number) => void;
  handleExport: (typeName: string) => void;
  handleRoadTypeChange?: (type: string) => void;
  customClassName?: string;
  isExport?: boolean;
}
type typeInf = { name: string; type: number };
const tabInfo: typeInf[] = [
  { name: '周', type: 1 },
  { name: '月', type: 2 },
  { name: '年', type: 3 },
];
const CardTitle: React.FC<Iprops> = (props) => {
  const {
    handleButton,
    customClassName,
    title,
    isShow = true,
    flagId,
    handleExport,
    isExport = true,
    isPCICard,
  } = props;
  const [tabValue, setTabValue] = useState<number>(1);
  // const [roadType, setRoadType] = useState(1);

  const changeTabs = (val: any) => {
    setTabValue(val);
    if (handleButton) {
      handleButton(val);
    }
  };
  const setDefalutVal = () => {
    setTabValue(1);
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    setDefalutVal,
  }));

  const handleRoadTypeChange = (val: any) => {
    // setRoadType(val);
    if (props?.handleRoadTypeChange) {
      props?.handleRoadTypeChange(val);
    }
  };
  return (
    <div className={styles['row-container']}>
      <div className={styles['left-title']}>
        <EllipsisTooltip title={title}>
          <span className={styles['ellipsis-title']}>{title}</span>
        </EllipsisTooltip>
      </div>
      <div className={styles['right-content']}>
        {isShow ? (
          <div className={`${styles['tab-button-container']} ${customClassName}`}>
            <ul className={styles['tab-button-ul']}>
              {tabInfo.map((it: any) => (
                <li
                  key={it?.type}
                  onClick={() => {
                    changeTabs(it?.type);
                  }}
                  className={`${it?.type === tabValue ? styles['active-class'] : ''} ${
                    styles['li-class']
                  }`}
                >
                  {it?.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {isPCICard ? (
          <div
            className={`${styles['tab-button-container']} ${customClassName} ${styles.roadTypeSelect}`}
          >
            <Select
              defaultValue={1}
              style={{ width: 120, height: 24 }}
              allowClear
              placeholder={'请选择道路类别'}
              options={[
                { label: '公路', value: 1 },
                { label: '城市道路', value: 0 },
              ]}
              onChange={handleRoadTypeChange}
            />
          </div>
        ) : null}

        {isExport && (
          <div
            className={styles['right-button-export']}
            onClick={() => {
              handleExport(flagId);
            }}
          >
            导出
          </div>
        )}
      </div>
    </div>
  );
};
export default CardTitle;
