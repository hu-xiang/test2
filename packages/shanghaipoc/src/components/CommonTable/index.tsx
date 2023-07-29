/**
columns = [
  {
    title: 'xxx',
    key: 'name',
    width: 100,
    type: '', // sort,image,operate,默认空
    colorEnum: {},
    valueEnum: {},
    operateList: [ // type为operate有操作按钮，其他默认空
      {
        access: [], // 权限
        name: '', // 按钮名称
        type: '', // 按钮类型
        disabledKey: '', // 操作按钮根据某个字段禁用
        disabledList: [], // 操作按钮根据哪些值禁用
        more: false, // 是否是更多
        menuItems: [
            {
              key: '',
              name: '',
            }
          ],
      }
    ]
  }
]
* */

import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { commonRequest, getMenuItem, useCompare } from 'baseline/src/utils/commonMethod';
import { ProTable } from '@ant-design/pro-table';
import { Image, Badge, Space, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useScrollObjSta } from '@/utils/tableScrollSet';
import { useAccess } from 'umi';

type Iprops = {
  scroll?: any;
  columns?: any;
  searchKey?: any;
  rowMethods: Function;
  onRef?: any;
  url?: string;
  getSelectedRows: Function;
  selectedDisabledKey?: string;
  selectedDisabledValue?: any;
};
const CommonTable: React.FC<Iprops> = (props) => {
  const ref = useRef<any>();
  const access: any = useAccess();
  const {
    columns,
    searchKey,
    scroll,
    rowMethods,
    url,
    onRef,
    getSelectedRows,
    selectedDisabledKey = '',
    selectedDisabledValue,
  } = props;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagesize, setPagesize] = useState<number>(20);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [columnList, setColumnList] = useState<any>([]);
  const scrollObj = useScrollObjSta(tableData, scroll);
  const newColumns = useCompare(columns);

  // 重置
  const onSet = () => {
    setCurrentPage(1);
    setSelectedRowKeys([]);
    getSelectedRows([]);
    ref.current.reload();
  };

  useImperativeHandle(onRef, () => {
    return {
      onSet,
    };
  });

  const isExist = (list: any = []) => {
    const rec = list.some((it: string) => {
      if (access[it]) {
        return true;
      }
      return false;
    });
    return rec;
  };

  const onLoad = (dataSource: any) => {
    if (!dataSource?.length) {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        setCurrentPage(1);
      }
    } else if (tableData.length !== dataSource.length) {
      setTableData(dataSource);
    }
  };

  // 表格选中行变化
  const onChange = (selectedRows: any) => {
    setSelectedRowKeys(selectedRows);
    getSelectedRows(selectedRows);
  };
  // 点击表格行
  const clickRow = (record: any) => {
    const arr = selectedRowKeys.filter((i: any) => i !== record.id);
    if (selectedRowKeys.includes(record.id)) {
      setSelectedRowKeys(arr);
      getSelectedRows(arr);
    } else {
      setSelectedRowKeys([...arr, record.id]);
      getSelectedRows([...arr, record.id]);
    }
  };

  const tabChange = (text: any) => {
    if (text?.current !== currentPage) {
      setCurrentPage(text?.current as number);
    }
    if (text?.pageSize !== pagesize) setPagesize(text?.pageSize as number);
    setSelectedRowKeys([]);
    getSelectedRows([]);
  };

  const menuItems = (menulist: any) => {
    return menulist?.map((it: any) => {
      return getMenuItem(it?.name, it?.key);
    });
  };

  const formatColumns = (argColumns: any) => {
    const list: any = [];
    argColumns.forEach((item: any) => {
      const column = {
        title: item.title,
        key: item.key,
        width: item.width,
      };
      if (!['sort', 'operate'].includes(item?.type))
        Object.assign(column, { ellipsis: true, dataIndex: item.key });
      if (['sort', 'image'].includes(item?.type) || item?.colorEnum) {
        Object.assign(column, {
          render: (text: any, _record: any, index: any) => {
            if (item?.type === 'sort') return `${(currentPage - 1) * pagesize + (index + 1)}`;
            if (item?.type === 'image')
              return <Image src={text} style={{ width: 58, height: 46 }} placeholder={true} />;
            if (item?.colorEnum) return <Badge color={item?.colorEnum[item.key]} text={item.key} />;
            return null;
          },
        });
      }
      if (item?.valueEnum) Object.assign(column, { valueEnum: item?.valueEnum });
      if (item?.type === 'operate') {
        Object.assign(column, {
          fixed: 'right',
          valueType: 'option',
          render: (_text: any, row: any) => (
            <Space size="middle">
              {item?.operateList.map((e: any, i: number) => {
                return !e?.more
                  ? isExist(e?.access) && (
                      <a
                        className="ahover"
                        key={i}
                        onClick={() => {
                          if (e?.disabledList?.includes(row[e?.disabledKey])) return;
                          rowMethods(row, e.type);
                        }}
                        style={
                          e?.disabledList?.includes(row[e?.disabledKey])
                            ? { color: 'rgba(0, 0, 0, 0.25)', cursor: 'no-drop' }
                            : {}
                        }
                      >
                        {e.name}
                      </a>
                    )
                  : isExist(e?.access) && (
                      <Dropdown
                        key={i}
                        menu={{
                          items: menuItems(e?.menuItems),
                          onClick: (key: any) => rowMethods(row, key?.key),
                        }}
                        // overlay={() => {
                        //   return (
                        //     <Menu
                        //       onClick={(key: any) => rowMethods(row, key?.key)}
                        //       items={menuItems(e?.menuItems)}
                        //     ></Menu>
                        //   );
                        // }}
                      >
                        <a className="ahover">
                          更多 <DownOutlined />
                        </a>
                      </Dropdown>
                    );
              })}
            </Space>
          ),
        });
      }
      list.push(column);
    });
    setColumnList(list);
  };

  useEffect(() => {
    formatColumns(newColumns);
  }, [newColumns]);

  return (
    <ProTable
      columns={columnList}
      onLoad={onLoad}
      params={
        {
          // ...searchKey,
        }
      }
      request={async (params) => {
        const obj = { ...searchKey, page: params.current, pageSize: params.pageSize };
        const res = await commonRequest({ url, method: 'get', params: obj, isTable: true });
        // 表单搜索项会从 params 传入，传递给后端接口。
        return res;
      }}
      rowKey="id"
      rowSelection={{
        selectedRowKeys,
        type: 'checkbox',
        onChange,
        getCheckboxProps: (record: any) => ({
          disabled: selectedDisabledValue?.includes(record[selectedDisabledKey]),
        }),
      }}
      onRow={(record: any) => {
        return {
          onClick: (e: any) => {
            if (selectedDisabledValue?.includes(record[selectedDisabledKey])) return;
            if (
              e?.target &&
              (e?.target?.nodeName === 'svg' ||
                e?.target?.nodeName === 'path' ||
                e?.target?.innerText === '预览')
            ) {
              return;
            }
            if (
              e?.target &&
              (e.target?.className.indexOf('ahover') > -1 ||
                e.target?.className.indexOf('ant-dropdown-menu-title-content') > -1)
            ) {
              return;
            }
            clickRow(record);
          }, // 点击行
        };
      }}
      pagination={{
        showQuickJumper: false,
        current: currentPage,
        // onChange: pageChange,
      }}
      tableAlertRender={false}
      toolBarRender={false}
      search={false}
      actionRef={ref}
      scroll={scrollObj || { x: '100%' }}
      onChange={tabChange}
    />
  );
};
export default CommonTable;
