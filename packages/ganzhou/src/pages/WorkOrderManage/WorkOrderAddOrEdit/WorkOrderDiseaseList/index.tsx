import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Popconfirm, Image, message } from 'antd';
import styles from './styles.less';
import { deleteDisease, getDiseaseList } from '@/services/ant-design-pro';
import SearchInput from 'baseline/src/components/SearchInput';

interface IProps {
  setAddDiseaseVisible: React.Dispatch<React.SetStateAction<boolean>>;
  orderId: string;
}

const WorkOrderDiseaseList: React.ForwardRefRenderFunction<
  { reloadAndRestTable: () => void; getTableLength: () => number },
  IProps
> = ({ setAddDiseaseVisible, orderId }, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [keyword, setKeyword] = useState('');
  const tableActionRef = useRef<ActionType>();
  const [tableLength, setTableLength] = useState<number>(0);

  const getTableLength = (): number => {
    return tableLength;
  };
  useImperativeHandle(ref, () => ({
    reloadAndRestTable: () => tableActionRef.current?.reloadAndRest?.(),
    getTableLength,
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
      width: 230,
      ellipsis: true,
    },
    {
      title: '操作',
      // dataIndex: 'address',
      // key: 'address',
      width: 88,
      render: (_, record) => {
        return (
          <>
            <Popconfirm
              placement="top"
              title={'确定要删除吗？'}
              onConfirm={async () => {
                const res = await deleteDisease({ id: record.id as string });
                if (res.status === 0) {
                  message.info('删除成功');
                  tableActionRef.current?.reload();
                }
              }}
              okText="确定"
              cancelText="取消"
            >
              <a className="ahover">删除</a>
            </Popconfirm>
          </>
        );
      },
    },
  ];
  const onLoad = (dataSource: any) => {
    if (!dataSource?.length) {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        setCurrentPage(1);
      }
    }
    setTableLength(dataSource?.length);
  };

  return (
    <div className={styles.wrap}>
      <ProTable<DiseaseListItem>
        actionRef={tableActionRef}
        tableClassName="ant-modal-image-common"
        request={getDiseaseList}
        params={{
          orderId,
          keyword,
          pageSize,
          // current: currentPage,
        }}
        onLoad={onLoad}
        rowKey="id"
        columns={columns}
        search={false}
        options={false}
        scroll={{ y: 360 }}
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
          <Button
            type="primary"
            onClick={() => {
              setAddDiseaseVisible(true);
            }}
          >
            添加
          </Button>,
        ]}
      />
    </div>
  );
};

export default forwardRef(WorkOrderDiseaseList);
