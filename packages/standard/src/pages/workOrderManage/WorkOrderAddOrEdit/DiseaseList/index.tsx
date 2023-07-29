import type { ProColumns } from '@ant-design/pro-table';
import styles from './styles.less';
import ProTable from '@ant-design/pro-table';
import { Input, Image } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { getDiseaseList } from '@/services/ant-design-pro';

export type TableListItem = {
  key: number;
  nums: string;
  imgUrl: string;
  diseaseNo: string;
  diseType: string;
  diseaseImp: string;
};

const tableListDataSource: TableListItem[] = [];

for (let i = 0; i < 15; i += 1) {
  tableListDataSource.push({
    key: i,
    nums: `${i + 1}`,
    imgUrl: 'fsfsdfs',
    diseaseNo: 'fsfsdfs',
    diseType: 'fsfsdfs',
    diseaseImp: 'fsfsdfs',
  });
}

const columns: ProColumns<TableListItem>[] = [
  {
    title: '序号',
    dataIndex: 'nums',
    render: (text: any, record: any, index: any) => index,
    width: 64,
  },
  {
    title: '缩略图',
    dataIndex: 'imgUrl',
    key: 'imgUrl',
    width: 100,
    render: (text: any) => {
      return (
        <>
          <Image src={text} style={{ width: 58, height: 46 }} placeholder={true} />
        </>
      );
    },
  },
  {
    title: '病害编号',
    dataIndex: 'diseaseNo',
    key: 'diseaseNo',
    width: 150,
    ellipsis: true,
  },
  {
    title: '病害类型',
    dataIndex: 'diseType',
    width: 170,
    render: () => {
      return '';
    },
  },
  {
    title: '紧急程度',
    dataIndex: 'diseaseImp',
    width: 100,
    valueEnum: {
      0: { text: '非紧急' },
      1: { text: '紧急' },
    },
  },
  {
    title: '所在区域',
    dataIndex: 'address',
    key: 'address',
    width: 230,
    ellipsis: true,
    // render: (text: any, recode: any) => {
    //   return `${recode.longitude}, ${recode.latitude}`;
    // },
  },
];

const DiseaseList: React.ForwardRefRenderFunction<{ getSelects: () => any[] }> = (_, ref) => {
  const [selects, setSelects] = useState([]);

  useImperativeHandle(ref, () => ({
    getSelects: () => selects,
    setSelects,
  }));

  useEffect(() => {
    getDiseaseList({ orderId: '1' }).then();
  }, []);

  return (
    <div className={styles.wrap}>
      <ProTable<TableListItem>
        rowSelection={{
          // selectedRowKeys: selectedRowKey,
          columnWidth: 64,
          type: 'checkbox',
          // onChange: onSelectChange,
        }}
        dataSource={tableListDataSource}
        rowKey="key"
        columns={columns}
        search={false}
        options={false}
        dateFormatter="string"
        headerTitle=""
        pagination={{
          showQuickJumper: false,
          defaultPageSize: 5,
          // current: searchPage,
          // onChange: pageChange,
        }}
        toolBarRender={() => [
          <Input
            className={styles.rightInput}
            suffix={<SearchOutlined className="input-search" />}
            allowClear
            placeholder="请输入病害编号、所在区域关键字"
            size="large"
          />,
        ]}
      />
    </div>
  );
};

export default forwardRef(DiseaseList);
