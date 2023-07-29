import { Switch } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.less';
import CommonTable from 'baseline/src/components/CommonTable';
import { commonRequest, commonDel } from 'baseline/src/utils/commonMethod';

type Iprops = {
  id?: string;
  projectId?: string;
  fkFacId?: string;
};

const requestList = [
  { url: '/traffic-bsl/project/doneUpload', method: 'POST', isParams: true },
  { url: '/traffic-bsl/project/roadDetail', method: 'get' },
];

const AccidentInfo: React.FC<Iprops> = (props) => {
  const TableRef: any = useRef();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  useEffect(() => {
    setIsChecked(false);
  }, []);

  const columns: any = [
    { title: '编号', key: 'id', width: 60, type: 'sort' },
    { title: '位置', key: 'address', width: 200 },
    { title: '事故标题', key: 'title', width: 200 },
    { title: '事故等级', key: 'levelName', width: 200 },
    { title: '事故时间', key: 'happenTime', width: 200 },
  ];

  const onChange = async (checked: boolean) => {
    const res = await commonDel(
      '是否完成事故上传？',
      {
        ...requestList[0],
        params: {
          proFacId: props?.id,
          projectId: props?.projectId,
        },
      },
      '事故上传',
    );
    if (!isChecked && res) {
      setIsChecked(checked);
    }
  };

  const getInfo = async (id: any) => {
    const params = {
      id,
      latitude1: 38.043407,
      latitude2: 38.043408,
      latitude3: 38.043408,
      latitude4: 38.043407,
      longitude1: 114.517235,
      longitude2: 114.517235,
      longitude3: 114.517236,
      longitude4: 114.517236,
    };
    const res = await commonRequest({ ...requestList[1], params });
    setIsChecked(!!res?.data?.uploadStatus);
  };

  useEffect(() => {
    if (props?.id) {
      TableRef.current.onSet();
      getInfo(props?.id);
    }
  }, [props?.id]);
  return (
    <div className={styles.AccidentInfo}>
      <Switch
        defaultChecked
        onChange={onChange}
        checked={isChecked}
        style={{ float: 'right', marginBottom: '20px' }}
        checkedChildren="已完成"
        unCheckedChildren="未完成"
        disabled={isChecked}
      />
      <div className={styles.AccidentInfoTable}>
        <CommonTable
          scroll={{ x: 950, y: 'calc(100vh - 316px)' }}
          columns={columns}
          onRef={TableRef}
          searchKey={{ facId: props?.fkFacId }}
          rowMethods={() => {}}
          url="/traffic-bsl/project/accidentInfo"
          getSelectedRows={() => {}}
          rowSelection={false}
        />
      </div>
    </div>
  );
};
export default AccidentInfo;
