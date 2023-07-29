import React, { useState } from 'react';
import styles from './styles.less';

interface Iprops {
  tabInfo: any[];
  handleButton: (val: number) => void;
  customClassName?: string;
}

const TabButton: React.FC<Iprops> = (props) => {
  const { handleButton, customClassName, tabInfo } = props;
  const [tabValue, setTabValue] = useState<number>(1);

  const changeTabs = (val: any) => {
    setTabValue(val);
    handleButton(val);
  };
  return (
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
            <span>{it?.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default TabButton;
