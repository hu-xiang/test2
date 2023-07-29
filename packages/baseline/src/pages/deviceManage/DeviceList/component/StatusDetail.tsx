import { Input, Modal } from 'antd';
import React, { useState, useCallback, useRef } from 'react';
import styles from '../styles.less';
import ProTable from '@ant-design/pro-table';
import { deviceStatus } from '../service';
import debounce from 'lodash/debounce';

type Iprops = {
  visibStatus: boolean;
  onCancel: Function;
  rowinfo: any;
};
export type Member = {
  diseaseNameZh: string;
};

const StatusDetail: React.FC<Iprops> = (props) => {
  const [keyword, setKeyword] = useState<any>('');
  const [searchPage, setSearchPage] = useState(1);
  const { rowinfo } = props;
  const actionRef = useRef<any>();

  const getStatusName = (status: any) => {
    let statusName = '无';
    if (status !== '-') {
      statusName = status * 1 === 0 ? '在线' : '离线';
    }
    return statusName;
  };

  const statustype = {
    '0': '正常',
    '1': '异常',
  };
  const columns3 = [
    {
      title: '子设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
    },
    {
      title: '通道号',
      dataIndex: 'channelNum',
      key: 'channelNum',
    },
    {
      title: '状态',
      dataIndex: 'deviceStatus',
      key: 'deviceStatus',
      render: (val: any, record: any) => {
        const color =
          record?.deviceStatus === '0' ? 'rgba(68, 142, 73, 1)' : 'rgba(220, 45, 45, 1)';
        return <span style={{ color }}>{statustype[record?.deviceStatus] || '-'}</span>;
      },
    },
  ];

  const onload = (dataSource: any) => {
    if (!dataSource?.length) {
      if (searchPage > 1) {
        setSearchPage(searchPage - 1);
      } else {
        setSearchPage(1);
      }
    }
  };
  const debouceSearch = useCallback(
    debounce((e: any) => {
      setSearchPage(1);
      setKeyword(e.target.value.trim());
    }, 500),
    [],
  );

  return (
    <Modal
      title={`设备状态-${getStatusName(props?.rowinfo?.status)}`}
      open={props.visibStatus}
      onCancel={() => props.onCancel()}
      footer={false}
      width={575}
      className="statusDetailModal"
    >
      <div className="statusDetailSearch">
        <span className="statusTxt">设备编号</span>
        <span className="statusInput">
          <Input
            disabled={true}
            value={props?.rowinfo?.deviceId}
            placeholder="输入设备编号"
            allowClear
            onChange={(e) => debouceSearch(e)}
            style={{
              width: 469,
              height: 40,
              borderRadius: 4,
            }}
            className="usersel"
          />
        </span>
      </div>
      <div className={styles.statusDetailBox}>
        <ProTable<Member>
          columns={columns3}
          request={deviceStatus}
          scroll={{ y: 235 }}
          actionRef={actionRef}
          params={{
            deviceId: keyword || rowinfo.deviceId,
          }}
          rowKey="id"
          pagination={false}
          toolBarRender={false}
          search={false}
          onLoad={onload}
          // onRequestError={reqErr}
        />
      </div>
    </Modal>
  );
};

export default StatusDetail;
