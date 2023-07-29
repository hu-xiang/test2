import React from 'react';
import InspectPlan from 'baseline/src/pages/inspectManage/InspectPlan';

export default (): React.ReactNode => {
  const columns = {
    title: '线路里程（km）',
    dataIndex: 'roadNum',
    key: 'roadNum',
    width: 150,
    ellipsis: true,
    render: (_text: any, record: any) => {
      return (
        <span>
          {record?.roadNum || record?.roadNum === 0 || record?.roadNum === '0'
            ? (record?.roadNum / 1000)?.toFixed(3)
            : '-'}
        </span>
      );
    },
  };
  return <InspectPlan importColumns={columns}></InspectPlan>;
};
