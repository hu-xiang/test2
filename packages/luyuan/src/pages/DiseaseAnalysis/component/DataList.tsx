import React from 'react';
import { Card, Select, Button, Table } from 'antd';

const { Option } = Select;
const columns = [
  {
    title: '编号',
    dataIndex: 'index',
    key: 'index',
  },
  {
    title: 'ID名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '病害类别',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: '长度面积',
    dataIndex: 'area',
    key: 'area',
  },
];

const data = [
  {
    key: '1',
    index: 1,
    name: 'harbor.sm/ocr',
    area: 32,
    type: '龟裂',
  },
  {
    key: '2',
    index: '2',
    name: 'harbor.sm/detection',
    area: 10,
    type: '条状修补，块状修补，纵向裂',
  },
  {
    key: '3',
    index: '3',
    name: 'harbor.sm/ocr',
    area: 10,
    type: '龟裂',
  },
  {
    key: '4',
    index: '4',
    name: 'detection',
    area: 40,
    type: '龟裂',
  },
];
const DataList: React.FC = () => {
  //   const extra2: React.ReactNode = () => {
  //     return (
  //       <>
  //         <Select defaultValue="jack">
  //           <Option value="jack">横向裂缝</Option>
  //           <Option value="jack3">横向裂缝</Option>
  //           <Option value="lucy">纵向裂缝</Option>
  //           <Option value="jack2">条状修补</Option>
  //           <Option value="lucy2">块状修补</Option>
  //           <Option value="lucy3">龟裂</Option>
  //           <Option value="lucy4">其它</Option>
  //         </Select>
  //         <Button>导出</Button>
  //       </>
  //     );
  //   };
  return (
    <Card
      style={{ marginTop: 16 }}
      bodyStyle={{
        padding: 5,
      }}
      type="inner"
      title="数据列表"
      extra={
        <>
          <Select defaultValue="1">
            <Option value="1">K260+200</Option>
          </Select>
          <Select defaultValue="jack" style={{ marginLeft: 10 }}>
            <Option value="jack">全部</Option>
            <Option value="jack3">横向裂缝</Option>
            <Option value="lucy">纵向裂缝</Option>
            <Option value="jack2">条状修补</Option>
            <Option value="lucy2">块状修补</Option>
            <Option value="lucy3">龟裂</Option>
            <Option value="lucy4">其它</Option>
          </Select>
          <Button style={{ marginLeft: 10 }}>查询</Button>
          <Button style={{ marginLeft: 10 }}>导出</Button>
        </>
      }
    >
      <Table columns={columns} dataSource={data} pagination={false} />
    </Card>
  );
};

export default DataList;
