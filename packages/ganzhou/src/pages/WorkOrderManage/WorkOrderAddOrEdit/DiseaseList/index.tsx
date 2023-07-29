import type { ProColumns } from '@ant-design/pro-table';
import styles from './styles.less';
import ProTable from '@ant-design/pro-table';
import { Image } from 'antd';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { getDiseaseListByPage } from '@/services/ant-design-pro';
import SearchInput from 'baseline/src/components/SearchInput';

const DiseaseList: React.ForwardRefRenderFunction<{ getSelects: () => string[] }> = (_, ref) => {
  const [selects, setSelects] = useState<string[]>([]);
  const selectListRef = useRef<{ list: any[] }>({ list: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [keyword, setKeyword] = useState('');

  useImperativeHandle(ref, () => ({
    getSelects: () => selects,
    // getSelects: (isKey?: boolean) => (isKey ? selects : selectListRef.current.list),
  }));

  const columns: ProColumns<DiseaseListItem>[] = [
    {
      title: '序号',
      dataIndex: 'nums',
      render: (text: any, record: any, index: number) =>
        `${(currentPage - 1) * pageSize + (index + 1)}`,
      width: 64,
    },
    {
      title: '缩略图',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (text) => {
        return <Image src={text as string} style={{ width: 58, height: 46 }} placeholder={true} />;
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
      dataIndex: 'diseaseNameZh',
      width: 170,
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
      width: 255,
      ellipsis: true,
    },
  ];

  return (
    <div className={styles.wrap}>
      <ProTable<DiseaseListItem>
        request={getDiseaseListByPage}
        params={{
          keyword,
          pageSize,
          // current: currentPage,
        }}
        rowSelection={{
          selectedRowKeys: selects,
          columnWidth: 64,
          type: 'checkbox',
          onChange: (keys, rows) => {
            setSelects(keys as string[]);
            selectListRef.current.list = rows;
          },
        }}
        rowKey="diseaseId"
        scroll={{ y: 360 }}
        columns={columns}
        search={false}
        options={false}
        dateFormatter="string"
        pagination={{
          showQuickJumper: false,
          showSizeChanger: true,
          defaultPageSize: 5,
          pageSizeOptions: ['5', '10', '20', '50', '100'],
          current: currentPage,
          pageSize,
        }}
        onChange={(page) => {
          if (page?.current !== currentPage) {
            setCurrentPage(page?.current as number);
          }
          if (page?.pageSize !== pageSize) {
            setPageSize(page?.pageSize as number);
          }
        }}
        tableAlertRender={false}
        toolBarRender={() => [
          <SearchInput
            autoFocus={false}
            placeholder="请输入病害编号、所在区域关键字"
            onSearch={(v) => {
              setCurrentPage(1);
              setKeyword(v);
            }}
            className="rightInput"
          />,
        ]}
      />
    </div>
  );
};

export default forwardRef(DiseaseList);
