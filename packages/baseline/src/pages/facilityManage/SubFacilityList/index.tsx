import React from 'react';
import { Tabs } from 'antd';
import FacilityList from './FacilityList/index';
import PendingReview from './PendingReview';
import tabsStyle from './tabsStyle.less';
import { useKeepAlive } from '../../../components/ReactKeepAlive';
import KeepAlive from 'react-activation';

export default (): React.ReactElement => {
  useKeepAlive('tabs');

  const tabData = [
    {
      key: '1',
      name: '附属设施列表',
      content: (
        <KeepAlive name="/sublist" saveScrollPosition="screen">
          <FacilityList />
        </KeepAlive>
      ),
    },
    {
      key: '2',
      name: '待审核',
      content: (
        <KeepAlive name="/pendView" saveScrollPosition="screen">
          <PendingReview />
        </KeepAlive>
      ),
    },
  ];
  const tabPanelData: any = () => {
    return tabData.map((it: any) => {
      return { label: it?.name, key: it?.key, children: it?.content };
    });
  };
  return (
    <div className={tabsStyle.tabsStyle}>
      <div className={tabsStyle.divider} />
      <Tabs defaultActiveKey="1" destroyInactiveTabPane={true} items={tabPanelData()}></Tabs>
    </div>
  );
};
