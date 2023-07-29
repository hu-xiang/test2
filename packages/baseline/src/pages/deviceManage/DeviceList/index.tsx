import { Tabs } from 'antd';
import CameraIndex from './camera/index';
import DeviceIndex from './DeviceIndex';
import tabsStyle from './tabsStyle.less';
import { useKeepAlive } from '../../../components/ReactKeepAlive';
import KeepAlive from 'react-activation';
import React, { useEffect, useState } from 'react';

export default (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState<any>('1');

  useKeepAlive('tabs');

  const tabData = [
    {
      key: '1',
      name: '边缘盒子',
      content: (
        <KeepAlive name="/deviceList" saveScrollPosition="screen">
          <DeviceIndex />
        </KeepAlive>
      ),
    },
    {
      key: '2',
      name: '摄像头',
      content: (
        <KeepAlive name="/Camera" saveScrollPosition="screen">
          <CameraIndex />
        </KeepAlive>
      ),
    },
  ];
  const tabPanelData: any = () => {
    return tabData.map((it: any) => {
      return { label: it?.name, key: it?.key, children: it?.content };
    });
  };

  useEffect(() => {
    if (localStorage.getItem('back_to_camera_tab') === 'true') {
      setActiveTab('2');
    }
  }, []);
  const handleTabChange = (key: string) => {
    localStorage.setItem('back_to_camera_tab', key === '1' ? 'false' : 'true');
    setActiveTab(key);
  };
  return (
    <div className={tabsStyle.tabsStyle}>
      <div className={tabsStyle.divider} />
      <Tabs
        onChange={(key: string) => handleTabChange(key)}
        activeKey={activeTab}
        destroyInactiveTabPane={true}
        items={tabPanelData()}
      ></Tabs>
    </div>
  );
};
