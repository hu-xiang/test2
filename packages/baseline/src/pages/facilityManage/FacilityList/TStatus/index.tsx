import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, DatePicker } from 'antd';
import type { DatePickerProps } from 'antd';
import { useHistory } from 'umi';
import { isExist, commonExport, commonDel } from '../../../../utils/commonMethod';
import { ReactComponent as ListBack } from '../../../../assets/img/backDisease/back.svg';
import styles from './styles.less';
import CommonTable from '../../../../components/CommonTable';
import moment from 'moment';

const requestList = [
  { url: '/traffic/technical/status/exportByFacilityId', method: 'post', blob: true },
  { url: '/traffic/technical/status/batchdel', method: 'DELETE' },
];

const { confirm } = Modal;

const TStatus: React.FC = () => {
  const history: any = useHistory();
  const ChildRef = useRef<any>();
  const [selectedRows, setSelectedRows] = useState<any>([]);
  // const [yesterday, setYesterday] = useState<any>(
  //   moment(new Date(new Date().getTime() - 24 * 60 * 60 * 1000)),
  // );
  const [yesterday, setYesterday] = useState<any>();
  const facilityId: any = sessionStorage.getItem('facilityID');

  useEffect(() => {
    setSelectedRows([]);
  }, [yesterday]);

  const scroll = {
    x: 1400,
    y: isExist(['facilitymanage/TecStatus:btn_export'])
      ? 'calc(100vh - 302px)'
      : 'calc(100vh - 220px)',
  };

  const setkeywords = () => {
    ChildRef.current.onSet();
  };

  const batchExport = async () => {
    const params: any = {
      ids: selectedRows,
      facilityId,
      lastTime: yesterday ? moment(yesterday).format('YYYY-MM-DD') : undefined,
    };
    commonExport({ ...requestList[0], params });
  };

  const getSelectedRows = (rows: any) => {
    setSelectedRows(rows);
  };

  const onChange: DatePickerProps['onChange'] = (date) => {
    setYesterday(date);
  };

  const del = async (text: any, isBatch: boolean) => {
    const formData = new FormData();
    formData.append('ids', isBatch ? selectedRows : text.id);
    const res: any = await commonDel('技术状况信息将删除，是否继续？', {
      ...requestList[1],
      params: formData,
    });
    if (res) setkeywords();
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
    <div className={`${styles.TStatus} commonTableClass`}>
      <div
        className={styles.taskBack}
        onClick={() => {
          history.push('/facilitymanage/facilitylist');
        }}
      >
        <ListBack />
        <div className={styles.backText}>道路列表</div>
      </div>
      <div className={'row-calss'}>
        <div style={{ margin: '10px 10px 20px' }} className="left-box">
          {isExist(['facilitymanage/TecStatus:btn_export']) && (
            <Button
              type="primary"
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

          {isExist(['facilitymanage/TecStatus:btn_batchDel']) && (
            <Button
              className={'buttonClass'}
              disabled={selectedRows.length === 0}
              onClick={() => del({}, true)}
            >
              批量删除
            </Button>
          )}
          <div style={{ display: 'inline-flex', float: 'right', marginRight: '10px' }}>
            {/* <span style={{ display: 'inline-block', width: '95px', lineHeight: '40px' }}>
              数据统计时间
            </span> */}
            <DatePicker
              value={yesterday}
              onChange={onChange}
              style={{ width: '300px' }}
              placeholder="统计时间"
            />
          </div>
        </div>
      </div>
      <div
        className={`table-box-tabs ${
          isExist(['facilitymanage/TecStatus:btn_export']) ? null : `table-box-tabs-nobutton`
        }`}
      >
        <CommonTable
          scroll={scroll}
          columns={columns}
          searchKey={
            yesterday
              ? { facilityId, lastTime: moment(yesterday).format('YYYY-MM-DD') }
              : { facilityId }
          }
          rowMethods={() => {}}
          url="/traffic/technical/status/pageByFacilityId"
          getSelectedRows={getSelectedRows}
          isRefresh={true}
          onRef={ChildRef}
        />
      </div>
    </div>
  );
};
export default TStatus;
