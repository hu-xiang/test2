import React, { useState } from 'react';
import styles from './styles.less';

interface Iprops {
  handleButton: (val: number) => void;
  customClassName?: string;
}
type typeInf = { name: string; type: number };
const typeTimeList: typeInf[] = [
  { name: '左', type: 0 },
  { name: '中', type: 2 },
  { name: '右', type: 1 },
];
const TabButtonContainer: React.FC<Iprops> = (props) => {
  const { handleButton, customClassName } = props;
  const [tabValue, setTabValue] = useState<number>(2);

  const changeTabs = (val: any) => {
    setTabValue(val);
    handleButton(val);
  };
  return (
    <div className={`${styles['tab-button-container']} ${customClassName}`}>
      <ul className={styles['tab-button-ul']}>
        {typeTimeList.map((it: any) => (
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
export default TabButtonContainer;
