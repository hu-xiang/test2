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
    title: '缺陷名称',
    dataIndex: 'name',
    key: 'name',
  },

  {
    title: '数量',
    dataIndex: 'number',
    key: 'number',
  },
];

const data = [
  {
    key: '1',
    index: 1,
    name: '纵向缺陷',
    number: 32,
  },
  {
    key: '2',
    index: '2',
    name: '横向缺陷',
    number: 10,
  },
  {
    key: '3',
    index: '3',
    name: '龟裂',
    number: 10,
  },
  {
    key: '4',
    index: '4',
    name: '其它',
    number: 20,
  },
];
const Statics: React.FC = () => {
  return (
    <Card
      style={{ marginTop: 16 }}
      bodyStyle={{
        padding: 5,
      }}
      type="inner"
      title="缺陷统计"
      extra={
        <>
          <Select defaultValue="jack">
            <Option value="jack">横向裂缝</Option>
            <Option value="jack3">横向裂缝</Option>
            <Option value="lucy">纵向裂缝</Option>
            <Option value="jack2">条状修补</Option>
            <Option value="lucy2">块状修补</Option>
            <Option value="lucy3">龟裂</Option>
            <Option value="lucy4">其它</Option>
          </Select>
          <Button style={{ marginLeft: 10 }}>导出</Button>
        </>
      }
    >
      <Table columns={columns} dataSource={data} pagination={false} />
    </Card>
  );
};

export default Statics;
