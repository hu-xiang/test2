import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, message } from 'antd';
import { useAccess } from 'umi';
import CommonTable from '../../../../../components/CommonTable';
import { commonExport, isExist, commonRequest } from '../../../../../utils/commonMethod';

const requestList = [
  { url: '/traffic/technical/status/exportByTaskId', method: 'post', blob: true },
  { url: '/traffic/patrol/task/update/technical', method: 'get' },
];

type Iprops = {
  patrolTaskId?: number;
};

const { confirm } = Modal;

const TecStatus: React.FC<Iprops> = (props) => {
  const ChildRef: any = useRef();
  const access: any = useAccess();
  const [selectedRows, setSelectedRows] = useState<any>([]);

  useEffect(() => {}, []);

  const scroll = {
    x: 1400,
    y: isExist(['InspectManage/TecStatus:btn_export', 'InspectManage/Tstatus:btn_update'])
      ? 'calc(100vh - 332px)'
      : 'calc(100vh - 280px)',
  };
  const handleCompute = async () => {
    const params = { TaskId: props?.patrolTaskId };
    const res = await commonRequest({ ...requestList[1], params });
    if (res.status === 0) {
      message.success({
        content: '已完成路面状况更新！',
        key: '已完成路面状况更新！',
      });
      ChildRef.current.onSet();
    }
  };
  const batchExport = async () => {
    const params: any = {
      ids: selectedRows,
      taskId: props.patrolTaskId,
    };
    commonExport({ ...requestList[0], params });
  };

  const getSelectedRows = (rows: any) => {
    setSelectedRows(rows);
  };

  const columns: any = [
    { title: '序号', key: 'id', width: 60, type: 'sort' },
    { title: '道路名称', key: 'facilityName', width: 200 },
    { title: '起点', key: 'startPoint', width: 160 },
    { title: '终点', key: 'endPoint', width: 160 },
    {
      title: '路线方向',
      key: 'direct',
      width: 120,
      valueEnum: {
        0: '上行',
        1: '下行',
      },
    },
    { title: 'PCI参考值', key: 'pci', width: 120 },
    { title: 'PCI等级', key: 'pciLevel', width: 160 },
    { title: 'RQI参考值', key: 'rqi', width: 120 },
    { title: 'RQI等级', key: 'rqiLevel', width: 160 },
    { title: '数据统计时间', key: 'lastTime', width: 160 },
  ];

  return (
    <div className="commonTableClass">
      <div className={'row-calss'}>
        <div style={{ margin: '10px 10px 20px' }}>
          {access['InspectManage/Tstatus:btn_update'] && (
            <Button type="primary" onClick={handleCompute} style={{ marginRight: '10px' }}>
              更新指标计算
            </Button>
          )}
          {access['InspectManage/TecStatus:btn_export'] && (
            <Button
              className={'buttonClass'}
              onClick={() => {
                if (selectedRows.length === 0) {
                  confirm({
                    title: '是否导出查询列表所有数据？',
                    // icon: <ExclamationCircleOutlined />,
                    okText: '确定',
                    okType: 'danger',
                    cancelText: '取消',
                    async onOk() {
                      return batchExport();
                    },
                    onCancel() {},
                  });
                } else {
                  batchExport();
                }
              }}
            >
              批量导出
            </Button>
          )}
        </div>
      </div>
      <div
        className={`table-box-tab-no-search ${
          isExist(['InspectManage/TecStatus:btn_export', 'InspectManage/Tstatus:btn_update'])
            ? null
            : `table-box-tab-no-search-nobutton`
        }`}
      >
        <CommonTable
          scroll={scroll}
          columns={columns}
          onRef={ChildRef}
          searchKey={{ taskId: props.patrolTaskId }}
          rowMethods={() => {}}
          url="/traffic/technical/status/pageByTaskId"
          getSelectedRows={getSelectedRows}
        />
      </div>
    </div>
  );
};
export default TecStatus;
