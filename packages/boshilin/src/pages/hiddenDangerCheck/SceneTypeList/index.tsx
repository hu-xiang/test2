import React, { useState } from 'react';
import styles from './styles.less';
import { Tabs } from 'antd';
import CheckItemIndex from './checkItemIndex';
import SceneTypeIndex from './sceneTypeIndex';

// const { TabPane } = Tabs;
export default (): React.ReactNode => {
  const [tabValue, setTabValue] = useState('1');

  const changeTabs = (val: any) => {
    setTabValue(val);
  };
  const tabDatas = [
    {
      key: '1',
      label: '场景类型列表',
      children: (
        <div className={styles['scene-type-list']}>
          <SceneTypeIndex tabValue={tabValue} />
        </div>
      ),
    },
    {
      key: '2',
      label: '排查项列表',
      children: (
        <div className={styles['check-list']}>
          <CheckItemIndex tabValue={tabValue} />
        </div>
      ),
    },
  ];
  return (
    <div className={styles['scene-container']}>
      <div className={styles['scene-tabs']}>
        <Tabs defaultActiveKey="1" onChange={changeTabs} items={tabDatas}>
          {/* <TabPane tab="场景类型列表" key="1">
            {tabValue === '1' ? (
              <div className={styles['scene-type-list']}>
                <SceneTypeIndex tabValue={tabValue} />
              </div>
            ) : null}
          </TabPane>
          <TabPane tab="排查项列表" key="2">
            {tabValue === '2' ? (
              <div className={styles['check-list']}>
                <CheckItemIndex tabValue={tabValue} />
              </div>
            ) : null}
          </TabPane> */}
        </Tabs>
      </div>
    </div>
  );
};
