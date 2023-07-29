import React from 'react';
import { Button, Dropdown, Input, message, Modal, Space } from 'antd';
import ProTable from '@ant-design/pro-table';
import styles from './styles.less';
import { useState, useRef } from 'react';
import TaskCreate from './component/taskCreate';
import Details from './component/details';
import { useAccess } from 'umi';
import Edit from './component/edit';
import { queryTaskList, startTask, showEdit, educeExcel, delTask } from './service';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { ReactComponent as LeftImg } from '../../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightImg } from '../../../assets/img/leftAndRight/rightImg.svg';
import { useScrollObj } from '../../../utils/tableScrollSet';
import { exportCom } from '../../../utils/exportCom';
import { getMenuItem } from '../../../utils/commonMethod';

const { Search } = Input;
const { confirm } = Modal;

export type Member = {
  avatar: string;
  realName: string;
  nickName: string;
  email: string;
  outUserNo: string;
  phone: string;
  permission?: string[];
};

interface Iprops {
  type: string;
  columns: any;
}
const CommonDetection: React.FC<Iprops> = (props) => {
  console.log(props.type);
  const [visib, setVisib] = useState(false);
  const [edivisib, setEdivisib] = useState(false);
  const [visibdetails, setVisibdetails] = useState(false);
  const [keyword, setKeyword] = useState<any>('');
  const [currentId, setCurrentId] = useState('');
  const [polling, setPolling] = useState<number | undefined>(5000);
  const [rowId, setRowId] = useState('');
  const [oldsel, setOldsel] = useState([]);
  const [oldtaskname, setOldtaskname] = useState('');
  const [taskType, setTaskType] = useState<any>();
  const [selectedRow, setSelectedRow] = useState({ taskState: -1, id: '-1' });
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);
  const [iconInfo, setIconInfo] = useState<any>({});
  const [bigImgFlag, setBigImgFlag] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const scrollObj = useScrollObj(tableData, { x: 1200, y: 'calc(100vh - 215px)' });
  const access: any = useAccess();
  const [searchPage, setSearchPage] = useState(1);
  const ref = useRef<any>();
  const [edtInfo, setEdtInfo] = useState<any>();
  const [rowInfo, setRowInfo] = useState<any>();

  const showdetails = (id: string, row: any) => {
    setVisibdetails(true);
    setCurrentId(id);
    setPolling(undefined);
    setRowInfo(row);
  };

  const taskBegin = async (id: string) => {
    const rev = new Promise((resolve) => {
      startTask(id).then(() => {
        resolve('成功');
      });
    });
    return rev;
  };
  const showEdt = async (text: any) => {
    const params = {
      id: text.id,
    };
    const edtres = await showEdit(params);
    const oldselliat = edtres.data.idsList;
    setTimeout(() => {
      setEdtInfo(edtres.data);
      setOldsel(oldselliat);
      setTaskType(text.modelId);
      setRowId(text.id);
      setOldtaskname(text.taskName);
      setEdivisib(true);
    }, 0);
    setPolling(undefined);
  };

  const updatakeyword = () => {
    ref.current.reload();
  };
  const getAllTask = (selectedKeys: any) => {
    const promises = selectedKeys.map((it: any) => {
      return taskBegin(it);
    });
    return Promise.all(promises);
  };

  const startclick = () => {
    if (selectedRowKey?.length > 0) {
      getAllTask(selectedRowKey).then(() => {
        updatakeyword();
      });
    }
    setTimeout(() => {
      setSelectedRowKey([]);
    }, 10);
  };

  const educeExc = async (text: any) => {
    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });
    try {
      const res: any = await educeExcel(text.id);
      hide();
      exportCom(res);
      message.success({
        content: '导出成功',
        key: '导出成功',
      });
      return true;
    } catch (error) {
      hide();
      message.error({
        content: '导出失败!',
        key: '导出失败!',
      });
      return false;
    }
  };
  const getIds = (type: any, id?: any) => {
    let ids: any = [];
    if (type === 'batch') {
      ids = selectedRowKey?.length === 0 ? [] : selectedRowKey;
    } else {
      ids = [id];
    }
    return ids;
  };
  const deltask = async (deleteType: any, id?: any) => {
    const params = {
      ids: getIds(deleteType, id),
    };
    const delMethod = async () => {
      const hide = message.loading({
        content: '正在删除',
        key: '正在删除',
      });
      try {
        const res = await delTask(params.ids);
        updatakeyword();
        hide();
        if (res.status === 0) {
          message.success({
            content: '删除成功',
            key: '删除成功',
          });
          updatakeyword();
          setSelectedRow({ taskState: -1, id: '-1' });
          setSelectedRowKey([]);
        } else {
          // message.error({
          //   content: res.message,
          //   key: res.message,
          // });
        }
        return true;
      } catch (error) {
        hide();
        message.error({
          content: '删除失败!',
          key: '删除失败!',
        });
        return false;
      }
    };

    confirm({
      title: '任务将删除，是否继续?',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        return delMethod();
      },
      onCancel() {},
    });
  };
  const handleSelect = (e: any, currentItem: any) => {
    if (e?.key === 'exportExc') {
      educeExc(currentItem);
    } else if (e?.key === 'delete') {
      deltask('single', currentItem?.id);
    }
  };
  const columns: any = [
    {
      title: '序号',
      key: 'num',
      width: 50,
      fixed: 'left',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
    },
    ...props.columns,
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 155,
      render: (text: any, record: any) => {
        const taskTypes: any = [1, 2];
        const menulist: any = [];
        if (access['taskList/index:btn_exportExcel'] && !taskTypes.includes(text.taskState)) {
          menulist.push({ key: 'exportExc', name: '导出Excel' });
        }
        if (access['taskList/index:btn_singeDel']) {
          menulist.push({ key: 'delete', name: '删除' });
        }
        const menuItems = menulist.map((it: any) => {
          return getMenuItem(it?.name, it?.key);
        });

        return (
          /* eslint-disable */
          <Space size="middle">
            {access['taskList/index:btn_edit'] ? (
              <a
                className={taskTypes.includes(text.taskState) ? 'disableCss' : 'ahover'}
                onClick={() => !taskTypes.includes(text.taskState) && showEdt(text)}
              >
                编辑
              </a>
            ) : null}
            {access['taskList/index:btn_details'] ? (
              <a className={'ahover'} onClick={() => showdetails(record?.id, record)}>
                详情
              </a>
            ) : null}

            {props?.type === 'pic' ? (
              menulist?.length > 0 ? (
                <Dropdown
                  menu={{ items: menuItems, onClick: (key: any) => handleSelect(key, text) }}
                  // overlay={() => {
                  //   return (
                  //     <Menu onClick={(key: any) => handleSelect(key, text)} items={menuItems}></Menu>
                  //   );
                  // }}
                >
                  <span className="dropDownNameClass ahover">
                    更多<span className="dropDownIcon"></span>
                  </span>
                </Dropdown>
              ) : null
            ) : access['taskList/index:btn_singeDel'] ? (
              <a className={'ahover'} onClick={() => handleSelect({ key: 'delete' }, text)}>
                删除
              </a>
            ) : null}
          </Space>
          /* eslint-enable */
        );
      },
    },
  ];
  const onSearch = (e: any) => {
    setKeyword(e.trim());
    setSearchPage(1);
    setSelectedRowKey([]);
    ref.current.reload();
  };

  const crtCancel = () => {
    setVisib(false);
  };

  const reqErr = () => {
    // message.error({
    //   content: '查询失败!',
    //   key: '查询失败!',
    // });
    setPolling(undefined);
  };

  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
      setTabpage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    setSelectedRowKey([]);
  };
  // 选中当前行
  const onSelectChange = (selectedRowKeys: any, selectedRows: any) => {
    setSelectedRow(selectedRows[0]);
    setSelectedRowKey(selectedRowKeys);
  };

  const clickRow = (record: any) => {
    setSelectedRow(record);
    const arr = selectedRowKey.filter((i) => i !== record.id);
    if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
    else setSelectedRowKey([...arr, record.id]);
  };

  const handleTableData = (data: any) => {
    for (let i = 0; i < data.length; i += 1) {
      if (data[i].id === selectedRow.id) {
        setSelectedRow(data[i]);
        break;
      }
    }
    return data;
  };

  const onBigImg = (obj: any, flag: any) => {
    setIconInfo({ ...iconInfo, ...obj });
    setBigImgFlag(flag);
  };
  const onLoad = (dataSource: any) => {
    if (!dataSource?.length) {
      if (searchPage > 1) {
        setSearchPage(searchPage - 1);
      } else {
        setSearchPage(1);
      }
    }
    if (tableData.length !== dataSource.length) {
      setTableData(dataSource);
    }
  };
  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  //   setTabpage(page);
  //   setSelectedRowKey([]);
  // };
  return (
    <div className={'commonTableClass'}>
      {/* 顶部按钮 */}
      <div className={'row-class'}>
        <div className="left-box">
          {access['taskList/index:btn_add'] ? (
            <Button
              type="primary"
              className={'buttonClass'}
              onClick={() => {
                setVisib(true);
                setPolling(undefined);
              }}
            >
              创建
            </Button>
          ) : null}
          {access['taskList/index:btn_start'] && (
            <Button
              className={'buttonClass'}
              disabled={
                selectedRowKey?.length === 0 ||
                selectedRow?.taskState === 1 ||
                selectedRow?.taskState === 2
              }
              onClick={() => startclick()}
            >
              开始
            </Button>
          )}
          {access['taskList/index:btn_del'] && (
            <Button
              className={'buttonClass'}
              disabled={selectedRowKey?.length === 0}
              onClick={() => deltask('batch')}
            >
              批量删除
            </Button>
          )}
        </div>
        <div className="right-search">
          <Search
            placeholder="请输入名称的关键字"
            allowClear
            maxLength={50}
            onSearch={(e) => onSearch(e)}
            enterButton
          />

          {visib && (
            <TaskCreate
              visib={visib}
              type={props.type}
              noCancel={() => crtCancel()}
              createSuccess={() => updatakeyword()}
              onBigImg={(obj: any, flag: any) => onBigImg(obj, flag)}
            />
          )}
        </div>
      </div>
      {/* 表格 */}
      <div className={`table-box-normal`}>
        <ProTable<Member>
          columns={columns}
          request={queryTaskList}
          params={{
            keyword,
            // current: searchPage,
          }}
          postData={handleTableData}
          rowKey="id"
          scroll={scrollObj || { x: '100%' }}
          onLoad={onLoad}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedRowKey,
            onChange: onSelectChange,
            // renderCell: (checked, record: any, index, originNode) => {
            //   if (record.taskState === 1 || record.taskState === 2) {
            //     return false;
            //   }
            //   return originNode;
            // },
            getCheckboxProps: (record: any) => ({
              disabled: record.taskState === 1 || record.taskState === 2,
            }),
          }}
          onRow={(record: any) => {
            if (record.taskState === 1 || record.taskState === 2) {
              return {};
            }
            return {
              onClick: (e: any) => {
                if (
                  e?.target &&
                  (e?.target?.nodeName === 'svg' || e?.target?.nodeName === 'path')
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
          tableAlertRender={false}
          polling={polling || undefined}
          pagination={{
            showQuickJumper: false,
            defaultPageSize: 20,
            current: searchPage,
            // onChange: pageChange,
          }}
          toolBarRender={false}
          search={false}
          actionRef={ref}
          onRequestError={reqErr}
          onChange={changetabval}
        />
      </div>

      {edivisib && (
        <Edit
          rowId={rowId}
          visib={edivisib}
          taskTypes={taskType}
          noCancel={() => {
            setEdivisib(false);
            setPolling(5000);
          }}
          oldsel={oldsel}
          edtInfo={edtInfo}
          oldtaskname={oldtaskname}
          createSuccess={() => updatakeyword()}
          onBigImg={(obj: any, flag: any) => onBigImg(obj, flag)}
          type={props.type}
        />
      )}
      {visibdetails && (
        <Details
          type={props.type}
          visibdetails={visibdetails}
          ids={currentId}
          onCancel={() => {
            setVisibdetails(false);
            setPolling(5000);
          }}
          rowInfo={rowInfo}
          onBigImg={(obj: any, flag: any) => onBigImg(obj, flag)}
        />
      )}
      <div className={styles.iconBoxHover1}>
        <LeftImg
          className={`${styles.topBoxText} ${styles.imgIconText} ${styles.topBoxText2}
          ${styles.iconPosition1} ${iconInfo.preflag ? styles.disables : ''}`}
          onClick={iconInfo.preflag ? undefined : iconInfo.preDisea}
          style={!bigImgFlag ? { display: 'none' } : {}}
        />
      </div>
      <div className={styles.iconBoxHover2}>
        <RightImg
          style={!bigImgFlag ? { display: 'none' } : {}}
          onClick={iconInfo.nextflag ? undefined : iconInfo.nextDisea}
          className={` ${styles.topBoxText3} ${styles.imgIconText}
          ${styles.iconPosition2} ${iconInfo.nextflag ? styles.disables : ''}`}
        />
      </div>
    </div>
  );
};

export default CommonDetection;
