import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, message, Modal, Space, Dropdown, Image } from 'antd';
import { getValidateToolList, taskDel, taskStart, imgLibDel, getImgInfo } from './service';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { useScrollObj } from '../../../utils/tableScrollSet';
import CrtOrEditTask from './components/CrtOrEditTask';
import Upload from './components/Upload';
import styles from './styles.less';
// import ImgLib from './components/ImgLib';
import CommonTable from '../../../components/CommonTable';
import { useAccess, useHistory } from 'umi';
// import { getMenuItem } from '../../../utils/commonMethod';
import type { MenuProps } from 'antd';
import { ReactComponent as LeftImg } from '../../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightImg } from '../../../assets/img/leftAndRight/rightImg.svg';
import ImgCanvas from './AVTDetail/ImgCanvasModal/ImgCanvas';

const { Search } = Input;
export type Member = {
  avatar: string;
  realName: string;
  nickName: string;
  email: string;
  outUserNo: string;
  phone: string;
  permission?: string[];
};

const { confirm } = Modal;

let pageName = 'algValiTool-imgLib-page';
let previewCurPageData: any = [];
let curRowId: any = null;
let initRowId: any = null;
let pageChange: boolean = false;
let toPage: string = '';
let timeHandler: any = null;

export default (): React.ReactElement => {
  const history = useHistory<any>();
  const actionRef = useRef<any>();
  const ChildRef = useRef<any>();

  const [rowInfo, setRowInfo] = useState<any>({});
  const [keyword, setKeyword] = useState<any>('');
  const [imgLibKeyword, setImgLibKeyword] = useState<any>('');
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);
  const [tableData, setTableData] = useState([]);

  const scrollObj = useScrollObj(tableData, { x: 1400, y: 'calc(100vh - 220px)' });
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const [crtShow, setCrtShow] = useState(false);
  const [uploadShow, setUploadShow] = useState(false);

  const [isCreate, setIsCreate] = useState(false);
  const [imgLibShow, setImgLibShow] = useState(false);
  const access: any = useAccess();

  const [imgLibSelectedRowKey, setImgLibSelectedRowKey] = useState<(number | string)[]>([]);
  // const [imgLibSearchPage] = useState(1);
  // const [imgLibTabpage] = useState(1);
  // const [imgLibTabpagesize] = useState(10);
  const [nextDisabled, setNextDisabled] = useState(false); // true： 置灰不可点  false: 表示可点
  const [preDisabled, setPreDisabled] = useState(false); // true： 置灰不可点  false: 表示可点
  const [curPreviewImgIndex, setCurPreviewImgIndex] = useState<number>(-1); // 当前预览的病害图片在列表中的序号
  const [previewImgVisible, setPreviewImgVisible] = useState<boolean>(false);
  const [visible, setVisible] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [imgInfo, setImgInfo] = useState<any>([]);
  const [radioType] = useState<string>('0');

  const refreshPage = () => {
    setSearchPage(1);
    actionRef.current.reload();
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

  const handleStart = async () => {
    const params: any = {
      idList: selectedRowKey?.length === 0 ? [] : selectedRowKey,
    };
    const formData = new FormData();
    formData.append('idList', params.idList);
    const res = await taskStart(formData);
    if (res.status === 0) {
      message.success({
        content: '任务开始',
        key: '任务开始',
      });
      refreshPage();
      setSelectedRowKey([]);
    }
  };

  const handleDel = (deleteType: any, text?: any) => {
    const params = {
      ids: getIds(deleteType, text?.verifyTaskId),
    };
    confirm({
      title: '设备信息将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        if (deleteType === 'batch') {
          formData.append('idList', params?.ids);
        } else {
          formData.append('idList', params?.ids);
        }
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          // const checkRes = await versionCheck({ idList: params?.ids });
          // if (checkRes.status === 0) {
          let res: any = null;
          res = await taskDel(formData);
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            refreshPage();
            setSelectedRowKey([]);
          }
          return true;
          // }
          // return false;
        } catch (error) {
          hide();
          message.error({
            content: '删除失败!',
            key: '删除失败!',
          });
          return false;
        }
      },
      onCancel() {},
    });
  };

  const handleUpload = async (text: any) => {
    setUploadShow(true);
    setRowInfo(text);
  };
  const handleImgLib = async (text: any) => {
    setRowInfo(text);
    setImgLibShow(true);
  };
  const handleSelect = (type: string, currentItem: any) => {
    setRowInfo(currentItem);
    if (type === 'detail') {
      sessionStorage.setItem('validate-tool-id', currentItem?.verifyTaskId);
      history.push('/toolkit/AlgorithmValidateTool/AVTDetail');
    }

    if (type === 'edit') {
      setIsCreate(false);
      setCrtShow(true);
    }
    if (type === 'delete') {
      handleDel('', currentItem);
    }
  };
  const columns: any = [
    {
      title: '序号',
      key: 'num',
      width: 48,
      ellipsis: true,
      fixed: 'left',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 93,
      ellipsis: true,
    },
    {
      title: '任务状态',
      dataIndex: 'taskState',
      key: 'taskState',
      width: 98,
      valueEnum: {
        0: { text: '未开始', status: 'Default' },
        1: { text: '排队中', status: 'Processing' },
        2: { text: '执行中', status: 'Processing' },
        3: { text: '已完成', status: 'Success' },
        99: { text: '异常', status: 'Error' },
      },
    },
    // {
    //   title: '任务进度',
    //   dataIndex: 'modelVersion',
    //   key: 'modelVersion',
    //   width: 143,
    //   ellipsis: true,
    //   render: (text: any, record: any) => {
    //     console.log(text, record);
    //     const percentVal = 3;
    //     return (
    //       <Progress
    //         percent={percentVal}
    //         format={(percent, successPercent) => `${percent}/${successPercent || 5}`}
    //       />
    //     );
    //   },
    // },
    {
      title: '任务图片数量(张)',
      dataIndex: 'imgNum',
      key: 'imgNum',
      width: 126,
      ellipsis: true,
    },
    {
      title: '模型名称',
      dataIndex: 'modelName',
      key: 'modelName',
      ellipsis: true,
      width: 149,
    },
    {
      title: '验证规则',
      dataIndex: 'validationRule',
      key: 'validationRule',
      ellipsis: true,
      width: 84,
      render: (text: any, record: any) => {
        const typeMap = {
          0: 'iou验证',
          1: '数量对比',
        };
        return <span>{typeMap[record.validationRule]}</span>;
      },
    },
    {
      title: '准确率',
      dataIndex: 'crtTime',
      width: 78,
      key: 'crtTime',
      textWrap: 'noWrap',
      ellipsis: true,
      render: (text: any, record: any) => {
        let res: any = '-';
        if (
          record?.tpNum !== null &&
          record?.tpNum >= 0 &&
          record?.fpNum !== null &&
          record?.fpNum >= 0 &&
          record?.tpNum + record?.fpNum > 0
        ) {
          res = (record?.tpNum * 100) / (record?.tpNum + record?.fpNum);
          res = `${res.toFixed(2)}%`;
        }
        return <span>{res}</span>;
      },
    },
    {
      title: '召回率',
      dataIndex: 'crtTime',
      width: 78,
      key: 'crtTime',
      textWrap: 'noWrap',
      ellipsis: true,
      render: (text: any, record: any) => {
        let res: any = '-';
        if (
          record?.tpNum !== null &&
          record?.tpNum >= 0 &&
          record?.fnNum !== null &&
          record?.fnNum >= 0 &&
          record?.tpNum + record?.fnNum > 0
        ) {
          res = (record?.tpNum * 100) / (record?.tpNum + record?.fnNum);
          res = `${res.toFixed(2)}%`;
        }
        return <span>{res}</span>;
      },
    },
    {
      title: '正确',
      dataIndex: 'tpNum',
      width: 60,
      key: 'tpNum',
      textWrap: 'noWrap',
      ellipsis: true,
    },
    {
      title: '误检',
      dataIndex: 'fpNum',
      width: 60,
      key: 'fpNum',
      textWrap: 'noWrap',
      ellipsis: true,
    },
    {
      title: '漏检',
      dataIndex: 'fnNum',
      width: 60,
      key: 'fnNum',
      textWrap: 'noWrap',
      ellipsis: true,
    },
    {
      title: '任务开始时间',
      dataIndex: 'startTime',
      width: 134,
      key: 'startTime',
      textWrap: 'noWrap',
      ellipsis: true,
    },

    {
      title: '任务完成时间',
      dataIndex: 'endTime',
      width: 134,
      key: 'endTime',
      textWrap: 'noWrap',
      ellipsis: true,
    },
    {
      title: '任务耗时(秒)',
      dataIndex: 'crtTime',
      width: 100,
      key: 'crtTime',
      textWrap: 'noWrap',
      ellipsis: true,
      render: (text: any, record: any) => {
        let res: any = '-';
        if (record?.endTime && record?.startTime) {
          const endTime: any = new Date(record?.endTime);
          const startTime: any = new Date(record?.startTime);
          if (endTime < startTime) {
            res = '-';
          } else {
            res = (endTime - startTime) / 1000;
          }
        }
        return <span>{res}</span>;
      },
    },
    {
      title: '操作',
      width: 180,
      key: 'action',
      fixed: 'right',
      render: (text: any) => {
        const items: MenuProps['items'] = [];

        if (access['toolkit/AlgorithmValidateTool:btn_detail']) {
          items.push({
            key: 'detail',
            label: <a onClick={() => handleSelect('detail', text)}>详情</a>,
          });
        }
        if (access['toolkit/AlgorithmValidateTool:btn_edit']) {
          items.push({
            key: 'edit',
            label: <a onClick={() => handleSelect('edit', text)}>编辑</a>,
          });
        }
        if (access['toolkit/AlgorithmValidateTool:btn_del']) {
          items.push({
            key: 'delete',
            label: <a onClick={() => handleSelect('delete', text)}>删除</a>,
          });
        }

        return (
          <Space size="middle">
            {access['toolkit/AlgorithmValidateTool:btn_upload'] && (
              <a
                className={`ahover ${[1, 2].includes(text?.taskState) ? 'disableCss' : ''}`}
                onClick={() => {
                  if ([1, 2].includes(text?.taskState)) return;
                  handleUpload(text);
                }}
              >
                上传
              </a>
            )}
            {access['toolkit/AlgorithmValidateTool:btn_img'] && (
              <a
                className={`ahover ${[1, 2].includes(text?.taskState) ? 'disableCss' : ''}`}
                onClick={() => {
                  if ([1, 2].includes(text?.taskState)) return;
                  handleImgLib(text);
                }}
              >
                图片
              </a>
            )}

            <Dropdown menu={{ items }} disabled={[1, 2].includes(text?.taskState)}>
              <span
                className={`dropDownNameClass ahover ${
                  [1, 2].includes(text?.taskState) ? 'disableCss' : ''
                }`}
              >
                更多
                <span
                  className={`dropDownIcon ${[1, 2].includes(text?.taskState) ? 'disableCss' : ''}`}
                ></span>
              </span>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const onSearch = (e: any) => {
    setSelectedRowKey([]);
    setKeyword(e.trim());
    setSearchPage(1);
    actionRef.current.reload();
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
  const onSelectChange = (curSelectedRowKeys: any) => {
    // setSelectedRow(selectedRows[0]);
    setSelectedRowKey(curSelectedRowKeys);
  };

  // const clickRow = (record: any) => {
  //   const arr = selectedRowKey.filter((i) => i !== record.id);
  //   if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
  //   else setSelectedRowKey([...arr, record.id]);
  // };
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

  useEffect(() => {
    // 轮询当前表格任务状态
    timeHandler = setInterval(() => {
      actionRef.current.reload();
    }, 5000);
    return () => {
      clearInterval(timeHandler);
      timeHandler = null;
    };
  }, []);

  // 图片库 ---start

  const handerImgClick = async (e: any, id: any) => {
    const res = await getImgInfo({ id });
    if (res.status === 0) {
      setImgInfo(res?.data);
    }

    e.stopPropagation();

    let previewCurPageDataCopy: any = sessionStorage.getItem(`${pageName}-pageData`) || [];
    previewCurPageDataCopy = JSON.parse(previewCurPageDataCopy);
    previewCurPageData = [...previewCurPageDataCopy];

    const index = previewCurPageDataCopy.findIndex((item: any) => item['imgId'] === id);
    const cacheImgKeyName = 'imgId';

    initRowId = id;

    if (!previewCurPageDataCopy[index][cacheImgKeyName]) return;
    setPreviewImgVisible(true);
    setCurPreviewImgIndex(index);

    curRowId = previewCurPageDataCopy[index]['imgId'];
    // setImgUrl(previewCurPageDataCopy[index][cacheImgKeyName]);
  };
  const getImgLibIds = (type: any, id?: any) => {
    let ids: any = [];
    if (type === 'batch') {
      ids = imgLibSelectedRowKey?.length === 0 ? [] : imgLibSelectedRowKey;
    } else {
      ids = [id];
    }
    return ids;
  };
  const handleImgLibDel = (deleteType: any, text?: any) => {
    const params = {
      ids: getImgLibIds(deleteType, text?.imgId),
    };
    confirm({
      title: '图片将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        if (deleteType === 'batch') {
          formData.append('idList', params?.ids);
        } else {
          formData.append('idList', params?.ids);
        }
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          // const checkRes = await versionCheck({ idList: params?.ids });
          // if (checkRes.status === 0) {
          let res: any = null;
          res = await imgLibDel(formData);
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            ChildRef.current.onSet();
          }
          return true;
          // }
          // return false;
        } catch (error) {
          hide();
          message.error({
            content: '删除失败!',
            key: '删除失败!',
          });
          return false;
        }
      },
      onCancel() {},
    });
  };
  const imgLibColumns: any = [
    {
      title: '编号',
      key: 'verifyTaskId',
      width: 71,
      ellipsis: true,
      fixed: 'left',
      type: 'sort',
      // render: (text: any, record: any, index: any) =>
      //   `${((imgLibSearchPage || imgLibTabpage) - 1) * imgLibTabpagesize + (index + 1)}`,
    },
    {
      title: '缩略图',
      dataIndex: 'imgUrl',
      key: 'imgUrl',
      width: 101,
      render: (_text: any, record: any) => {
        return (
          <Image
            src={record?.imgUrl}
            style={{ width: 58, height: 46 }}
            placeholder={true}
            onClick={(e: any) => handerImgClick(e, record?.imgId)}
            preview={{
              visible: curRowId !== null && initRowId === record?.imgId,
              src: imgUrl,
              onVisibleChange: (value) => {
                setVisible(value);
                setPreviewImgVisible(value);
                if (!value) {
                  setImgUrl('');
                  curRowId = null;
                  pageChange = false;
                  toPage = '';
                  initRowId = null;
                  setCurPreviewImgIndex(-1);
                } else {
                  curRowId = record?.imgId;
                }
              },
            }}
          />
        );
      },
    },
    {
      title: '图片名称',
      dataIndex: 'imgName',
      key: 'imgName',
      width: 214,
      ellipsis: true,
    },
    {
      title: '标注结果',
      dataIndex: 'labelDiseaseTypes',
      key: 'labelDiseaseTypes',
      width: 220,
      ellipsis: true,
    },

    {
      title: '操作',
      width: 111,
      key: 'action',
      fixed: 'right',
      render: (text: any, record: any) => {
        return (
          <Space size="middle">
            {
              <a
                className="ahover"
                onClick={() => {
                  handleImgLibDel('single', record);
                }}
              >
                删除
              </a>
            }
          </Space>
        );
      },
    },
  ];
  const getImgLibSelectedRows = (rows: any) => {
    setImgLibSelectedRowKey(rows);
  };

  const imgLibRowMethods = async (row: any, type: string) => {
    switch (type) {
      case 'del':
        handleImgLibDel('', row);
        break;
      default:
        break;
    }
  };
  const imgLibOnSearch = (e: any) => {
    setImgLibKeyword(e.trim());
    ChildRef.current.onSet();
  };
  // 图片库 ---end

  // 图片预览切换 ========start================
  const handleUpdateImgInfo = async (isPageChange: boolean, todo: string) => {
    if (!isPageChange) {
      if (todo === 'toPrePage') {
        setCurPreviewImgIndex(curPreviewImgIndex - 1);
      } else {
        setCurPreviewImgIndex(curPreviewImgIndex + 1);
      }
    }
    if (isPageChange) {
      // const cacheImgKeyName = JSON.parse(
      //   sessionStorage.getItem(`${pageName}-columnImgKeyName`) || '',
      // );
      if (todo === 'toPrePage') {
        initRowId = previewCurPageData[previewCurPageData.length - 1]['imgId'];
        setCurPreviewImgIndex(previewCurPageData.length - 1);
        const res = await getImgInfo({
          id: previewCurPageData[previewCurPageData.length - 1]['imgId'],
        });
        if (res.status === 0) {
          setImgInfo(res?.data);
        }
        // setImgUrl(previewCurPageData[previewCurPageData.length - 1][cacheImgKeyName]);
      } else {
        initRowId = previewCurPageData[0]['imgId'];
        setCurPreviewImgIndex(0);
        const res = await getImgInfo({ id: previewCurPageData[0]['imgId'] });
        if (res.status === 0) {
          setImgInfo(res?.data);
        }
        // setImgUrl(previewCurPageData[0][cacheImgKeyName]);
      }
    }
  };
  const handleUpdatePreviewInfo = (parmas: any, res: any, pageNameStr: string) => {
    pageName = pageNameStr;
    previewCurPageData = res?.data || [];
    sessionStorage.setItem(`${pageName}-pageData`, JSON.stringify(res?.data || []));
    sessionStorage.setItem(`${pageName}-previewPage`, JSON.stringify(parmas?.current));
    sessionStorage.setItem(`${pageName}-previewPageSize`, JSON.stringify(parmas?.pageSize));
    sessionStorage.setItem(`${pageName}-previewCurPageDataTotal`, JSON.stringify(+res?.total || 0));
    if (pageChange && toPage) {
      handleUpdateImgInfo(true, toPage);
    }
  };

  // 切换预览图片相关
  const handleToPrevImg = async () => {
    const cachePage = JSON.parse(sessionStorage.getItem(`${pageName}-previewPage`) || '1');
    // const cacheImgKeyName = JSON.parse(
    //   sessionStorage.getItem(`${pageName}-columnImgKeyName`) || '',
    // );
    if (curPreviewImgIndex === 0 && cachePage > 1) {
      ChildRef.current.handleTogglePage(cachePage - 1);
      pageChange = true;
      toPage = 'toPrePage';
    } else {
      // setImgUrl(previewCurPageData[curPreviewImgIndex - 1][cacheImgKeyName]);
      const res = await getImgInfo({ id: previewCurPageData[curPreviewImgIndex - 1]['imgId'] });
      if (res.status === 0) {
        setImgInfo(res?.data);
      }
      handleUpdateImgInfo(false, 'toPrePage');
    }
  };
  const handleToNextImg = async () => {
    const cachePage = JSON.parse(sessionStorage.getItem(`${pageName}-previewPage`) || '1');
    const cachePageSize = JSON.parse(sessionStorage.getItem(`${pageName}-previewPageSize`) || '20');
    const cachePageDataTotal = JSON.parse(
      sessionStorage.getItem(`${pageName}-previewCurPageDataTotal`) || '0',
    );
    // const cacheImgKeyName = JSON.parse(
    //   sessionStorage.getItem(`${pageName}-columnImgKeyName`) || '',
    // );
    if (
      curPreviewImgIndex === previewCurPageData.length - 1 &&
      cachePage < Math.ceil(cachePageDataTotal / cachePageSize)
    ) {
      ChildRef.current.handleTogglePage(cachePage + 1);
      pageChange = true;
      toPage = 'toNextPage';
    } else {
      // setImgUrl(previewCurPageData[curPreviewImgIndex + 1][cacheImgKeyName]);
      const res = await getImgInfo({ id: previewCurPageData[curPreviewImgIndex + 1]['imgId'] });
      if (res.status === 0) {
        setImgInfo(res?.data);
      }
      handleUpdateImgInfo(false, 'toNextPage');
    }
  };

  useEffect(() => {
    setPreDisabled(false);
    setNextDisabled(false);

    const cachePage = JSON.parse(sessionStorage.getItem(`${pageName}-previewPage`) || '1');
    if (curPreviewImgIndex === 0 && cachePage === 1) {
      setPreDisabled(true);
    }

    const previewPageSize = JSON.parse(
      sessionStorage.getItem(`${pageName}-previewPageSize`) || '20',
    );
    const previewCurPageDataTotal = JSON.parse(
      sessionStorage.getItem(`${pageName}-previewCurPageDataTotal`) || '0',
    );
    if (cachePage === Math.ceil(previewCurPageDataTotal / previewPageSize)) {
      if (curPreviewImgIndex === previewCurPageData.length - 1) {
        setNextDisabled(true);
      }
    }
  }, [curPreviewImgIndex]);

  // 图片预览切换 ========end================
  return (
    <div className={`commonTableClass ${styles.algValiToolWrapper}`}>
      {/* 顶部按钮 */}
      <div className={'row-class'}>
        <div className="left-box">
          {access['toolkit/AlgorithmValidateTool:btn_create'] && (
            <Button
              type="primary"
              className={'buttonClass'}
              onClick={() => {
                setIsCreate(true);
                setCrtShow(true);
              }}
            >
              创建
            </Button>
          )}

          {access['toolkit/AlgorithmValidateTool:btn_start'] && (
            <Button
              className={'buttonClass'}
              disabled={selectedRowKey?.length === 0}
              onClick={() => handleStart()}
            >
              开始
            </Button>
          )}
          {access['toolkit/AlgorithmValidateTool:btn_batch_del'] && (
            <Button
              className={'buttonClass'}
              disabled={selectedRowKey?.length === 0}
              onClick={() => handleDel('batch')}
            >
              批量删除
            </Button>
          )}
        </div>
        <div className="right-search">
          <Search
            placeholder="请输入任务名称、模型名称的关键字"
            allowClear
            onSearch={(e) => onSearch(e)}
            maxLength={50}
            enterButton
          />
        </div>
      </div>
      {/* 表格 */}

      <div className={`table-box-normal`}>
        <ProTable<Member>
          columns={columns}
          actionRef={actionRef}
          request={getValidateToolList}
          params={{
            keyword,
          }}
          loading={false}
          onLoad={onLoad}
          rowKey="verifyTaskId"
          scroll={scrollObj || { x: '100%' }}
          rowSelection={{
            selectedRowKeys: selectedRowKey,
            type: 'checkbox',
            onChange: onSelectChange,
            getCheckboxProps: (record: any) => ({
              disabled: [1, 2].includes(record.taskState),
              name: record.taskState,
            }),
          }}
          // onRow={() => {
          //   return {
          //     onClick: (e: any) => {
          //       if (
          //         e?.target &&
          //         (e?.target?.nodeName === 'svg' || e?.target?.nodeName === 'path')
          //       ) {
          //         return false;
          //       }
          //       if (
          //         e?.target &&
          //         (e.target?.className.indexOf('ahover') > -1 ||
          //           e.target?.className.indexOf('ant-dropdown-menu-title-content') > -1)
          //       ) {
          //         return false;
          //       }
          //       // clickRow(record);
          //     }, // 点击行
          //   };
          // }}
          tableAlertRender={false}
          pagination={{
            showQuickJumper: false,
            defaultPageSize: 10,
            current: searchPage,
          }}
          toolBarRender={false}
          search={false}
          onChange={changetabval}
        />
      </div>

      {crtShow ? (
        <CrtOrEditTask
          onsetkey={() => actionRef.current.reload()}
          isShow={crtShow}
          editInfo={rowInfo}
          isCreate={isCreate}
          onCancel={() => {
            const filterList = selectedRowKey.filter((item) => item);
            if (!filterList.length) {
              setSelectedRowKey([]);
            }
            setCrtShow(false);
          }}
        />
      ) : null}
      {uploadShow ? (
        <Upload
          onsetkey={() => actionRef.current.reload()}
          isShow={uploadShow}
          editInfo={rowInfo}
          onCancel={() => {
            setUploadShow(false);
          }}
        />
      ) : null}
      {imgLibShow ? (
        <Modal
          title={'图片库详情'}
          open={imgLibShow}
          onCancel={() => setImgLibShow(false)}
          // className={`crtedtDev ${styles.crtedtDev}`}
          destroyOnClose
          maskClosable={false}
          footer={null}
          width={window.innerWidth * 0.68}
          style={{ height: window.innerHeight * 0.788 }}
        >
          <div className={`commonTableClass ${styles.imgLibWrapper}`}>
            {/* 顶部按钮 */}
            <div className={`row-class ${styles.imgLibTitle}`}>
              <div className="left-box">
                {
                  <Button
                    type="primary"
                    className={'buttonClass'}
                    onClick={() => handleImgLibDel('batch')}
                    disabled={imgLibSelectedRowKey?.length === 0}
                  >
                    批量删除
                  </Button>
                }
              </div>
              <div className="right-search">
                <Search
                  placeholder="请输入图片名称的关键字"
                  allowClear
                  // onSearch={(e) => onSearch(e)}
                  onSearch={(e) => imgLibOnSearch(e)}
                  maxLength={50}
                  enterButton
                />
              </div>
            </div>

            <CommonTable
              scroll={{ x: 880, y: 400 }}
              columns={imgLibColumns}
              searchKey={{ imgName: imgLibKeyword, taskId: rowInfo?.verifyTaskId }}
              rowKey={'imgId'}
              rowMethods={imgLibRowMethods}
              getSelectedRows={getImgLibSelectedRows}
              url="/traffic/algorithmVerifyVerifyImage/"
              isRefresh={true}
              onRef={ChildRef}
              isScroll={true}
              updatePreviewInfo={(params: any, res: any) =>
                handleUpdatePreviewInfo(params, res, 'algValiTool-imgLib-page')
              }
            />
          </div>
        </Modal>
      ) : null}
      {visible && (
        <ImgCanvas
          setImgUrl={(val: any) => {
            console.log(val, 'val');
            setImgUrl(val);
          }}
          data={imgInfo}
          radioType={radioType}
        />
      )}
      {/* 左右切换按钮 */}
      {previewImgVisible && visible && (
        <LeftImg
          className={`${styles.arrLeftIcon} ${styles.toggleIcon} ${
            preDisabled ? styles.arrIconDisabled : ''
          }`}
          onClick={preDisabled ? undefined : handleToPrevImg}
        />
      )}
      {previewImgVisible && visible && (
        <RightImg
          onClick={nextDisabled ? undefined : handleToNextImg}
          className={`${styles.arrRightIcon} ${styles.toggleIcon} ${
            nextDisabled ? styles.arrIconDisabled : ''
          }`}
        />
      )}
    </div>
  );
};
