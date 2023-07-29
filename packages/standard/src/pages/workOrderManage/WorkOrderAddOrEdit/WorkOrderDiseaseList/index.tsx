import React from 'react';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Input, Space, Image } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from './styles.less';

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

  {
    title: '操作',
    key: 'action',
    width: 88,
    fixed: 'right',
    render: () => {
      return (
        <Space size="middle">
          <a>删除</a>
        </Space>
      );
    },
  },
];

interface IProps {
  setAddDiseaseVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const WorkOrderDiseaseList: React.FC<IProps> = ({ setAddDiseaseVisible }) => {
  return (
    <div className={styles.wrap}>
      <ProTable<TableListItem>
        dataSource={tableListDataSource}
        rowKey="key"
        columns={columns}
        search={false}
        options={false}
        dateFormatter="string"
        headerTitle="病害列表"
        pagination={{
          showQuickJumper: false,
          defaultPageSize: 5,
          // current: searchPage,
          // onChange: pageChange,
        }}
        toolBarRender={() => [
          <Input
            suffix={<SearchOutlined className="input-search" />}
            allowClear
            placeholder="请输入病害编号、所在区域关键字"
            size="large"
          />,
          <Button
            type="primary"
            onClick={() => {
              setAddDiseaseVisible(true);
            }}
            size="large"
          >
            添加
          </Button>,
        ]}
      />
    </div>
  );
};

export default WorkOrderDiseaseList;
