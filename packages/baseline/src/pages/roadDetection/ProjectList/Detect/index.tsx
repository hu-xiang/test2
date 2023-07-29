import React, { useEffect, useState } from 'react';
import { useHistory } from 'umi';
import { Tabs } from 'antd';
import DetectContent from './DetectContent';
import { ReactComponent as ListBack } from '../../../../assets/img/backDisease/back.svg';
import styles from './styles.less';

const tabDatas = [
  { key: '1', label: '路面' },
  { key: '2', label: '街景' },
];
export default (): React.ReactNode => {
  const history = useHistory();
  const [currentTab, setCurrentTab] = useState<string>('1');
  useEffect(() => {
    setCurrentTab('1');
  }, []);
  return (
    <div className={styles.projectDetect}>
      <div className={styles.divider} />
      <div
        className={styles.projectBack}
        onClick={() => {
          history.push('/roadDetection/projectList');
        }}
      >
        <ListBack />
        <div className={styles.backText}>项目列表</div>
      </div>

      <Tabs
        defaultActiveKey="1"
        items={tabDatas}
        // destroyInactiveTabPane={true}
        onChange={(val) => setCurrentTab(val)}
      >
        {/* <Tabs.TabPane tab="路面" key="1"></Tabs.TabPane>
        <Tabs.TabPane tab="街景" key="2">
        </Tabs.TabPane> */}
      </Tabs>
      <DetectContent currentTab={currentTab} />
    </div>
  );
};
