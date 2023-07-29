/**
columns = [
  {
    title: 'xxx',
    key: 'name',
    width: 100,
    type: '', // sort,image,isClick,operate,默认空
    clickConfig: { // type为isClick需要这个
      clickValue: [1], // 根据是否包含在数组里面的值来判断需要点击
      valueEnum: isRepeatEnum, // 如果需要枚举显示内容，可以不用传外层的valueEnum
      type: 'yes' // 事件类型
    }
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
import { commonRequest, getMenuItem, useCompare } from '../../utils/commonMethod';
import { ProTable } from '@ant-design/pro-table';
import { Image, Badge, Space, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useScrollObjSta } from '../../utils/tableScrollSet';
import { changeTableScrollBarPosition } from '../../utils/commonMethod';
import { useAccess, useModel } from 'umi';
import placeholdSvg from '../../../public/images/placeholder.svg';
import { ReactComponent as LeftImg } from '../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightImg } from '../../assets/img/leftAndRight/rightImg.svg';
// import Draggable from 'react-draggable';
import styles from './styles.less';
import ImgCanvas from '../DistressCanvas';

type Iprops = {
  scroll?: any;
  isScroll?: boolean;
  columns?: any;
  searchKey?: any;
  rowMethods: Function;
  onRef?: any;
  url?: string;
  getSelectedRows: Function;
  selectedDisabledKey?: string;
  selectedDisabledValue?: any;
  method?: string;
  rowSelection?: boolean;
  isRefresh?: boolean;
  pagination?: boolean;
  pageName?: string;
  updatePreviewInfo?: Function;
  diseImgPreview?: boolean;
  updateCurPreviewInfo?: Function;
  updateAuditBtn?: Function;
  rowKey?: string;
  defaultPageSize?: number;
  getTableData?: Function;
  arrowShow?: boolean;
  requireValue?: string;
  // onDataSourceChange?: Function;
};

let previewCurPageData: any = [];
let columnImgKeyName: any = null;
// let scaleRatio = 1;
let curRowId: any = null;
// let initRowId: any = null;
let pageChange: boolean = false;
let toPage: string = '';

const CommonTable: React.FC<Iprops> = (props) => {
  const ref = useRef<any>();
  // const previewImgRef = useRef<any>();
  const access: any = useAccess();
  const {
    columns,
    searchKey,
    scroll,
    requireValue,
    isScroll,
    rowMethods,
    url,
    onRef,
    getSelectedRows,
    selectedDisabledKey = '',
    selectedDisabledValue,
    method = 'get',
    rowSelection = true,
    isRefresh = false,
    pagination = true,
    pageName,
    rowKey,
    defaultPageSize,
    getTableData = () => {},
    arrowShow = true,
  } = props;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagesize, setPagesize] = useState<number>(defaultPageSize || 20);
  const [total, setTotal] = useState<number>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [columnList, setColumnList] = useState<any>([]);
  const scrollObj = useScrollObjSta(tableData, scroll, false);
  const newColumns = useCompare(columns);

  const [nextDisabled, setNextDisabled] = useState(false); // true： 置灰不可点  false: 表示可点
  const [preDisabled, setPreDisabled] = useState(false); // true： 置灰不可点  false: 表示可点
  const [curPreviewImgIndex, setCurPreviewImgIndex] = useState<number>(-1); // 当前预览的病害图片在列表中的序号
  // const [previewPage, setPreviewPage] = useState<number>(1); // 预览图片时 当前页码
  // const [previewImgVisible, setPreviewImgVisible] = useState<boolean>(false);
  // const [setPreviewImgUrl] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [data, setData] = useState<any>();
  // const [rowId, setRowId] = useState('');
  const { setArrowVisible, setArrowDisabled, toLeftOrRight, setToLeftOrRight } =
    useModel<any>('dataReport'); // 与业务相关，需优化

  // 重置
  const onSet = (params: string = '') => {
    // setCurrentPage(1);
    setSelectedRowKeys([]);
    getSelectedRows([]);
    if (params === 'next') {
      setCurrentPage(currentPage + 1);
    } else if (params === 'pre') {
      setCurrentPage(currentPage - 1);
      ref.current.reload();
    } else if (params === 'current') {
      ref.current.reload();
    } else {
      /* eslint no-lonely-if: 0 */
      if (currentPage === 1) {
        ref.current.reload();
      } else {
        setCurrentPage(1);
      }
    }
  };
  const handleClosePreview = () => {
    // curRowId = null;
    // setPreviewImgVisible(false);
    setVisible(false);
  };

  const handleTogglePage = (toPageStr: any) => {
    setCurrentPage(toPageStr);
  };

  useEffect(() => {
    getTableData(tableData);
  }, [tableData]);
  const onClearSearch = () => {
    setSelectedRowKeys([]);
    getSelectedRows([]);
    setCurrentPage(1);
    ref.current.reload();
  };

  const handleSetSelectedRow = (rowIdArr: any) => {
    setSelectedRowKeys(rowIdArr);
  };
  useImperativeHandle(onRef, () => {
    return {
      onSet,
      currentPage,
      pagesize,
      total,
      handleClosePreview,
      tableData,
      handleTogglePage,
      onClearSearch,
      handleSetSelectedRow,
    };
  });

  const isExist = (list: any = []) => {
    if (!list.length) return true;
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
  const onChange = (selectedRowKeysArr: any, selectedRows: any) => {
    setSelectedRowKeys(selectedRowKeysArr);
    getSelectedRows(selectedRowKeysArr, selectedRows, 'onChange');
  };
  // 点击表格行
  const clickRow = (record: any) => {
    const arr = selectedRowKeys.filter((i: any) => i !== record[props?.rowKey || 'id']);
    if (selectedRowKeys.includes(record[props?.rowKey || 'id'])) {
      setSelectedRowKeys(arr);
      getSelectedRows(arr, record, 'clickRow');
    } else {
      setSelectedRowKeys([...arr, record[props?.rowKey || 'id']]);
      getSelectedRows([...arr, record[props?.rowKey || 'id']], record, 'clickRow');
    }
  };

  const tabChange = (text: any) => {
    if (text?.current !== currentPage) {
      setCurrentPage(text?.current as number);
    }
    if (text?.pageSize !== pagesize) setPagesize(text?.pageSize as number);
    ref.current.reload();
    // setSelectedRowKeys([]);
    // getSelectedRows([]);
  };

  const menuItems = (menulist: any) => {
    return menulist?.map((it: any) => {
      return getMenuItem(it?.name, it?.key);
    });
  };

  // 图片预览切换 ========start================
  const handleSetData = (record: any) => {
    const cacheImgKeyName = JSON.parse(
      sessionStorage.getItem(`${pageName}-columnImgKeyName`) || 'imgUrl',
    );
    curRowId = record[props?.rowKey || 'id'];
    setData({
      url: record[cacheImgKeyName || 'imgUrl'],
      ls: [
        {
          bbox: record?.bbox,
          diseaseNameZh: record?.typeName,
        },
      ],
      id: record[props?.rowKey || 'id'],
    });
    // setRowId(record?.id);
  };

  const handerImgClick = (e: any, id: any) => {
    e.stopPropagation();
    setVisible(true);
    setArrowVisible(true);
    curRowId = id;

    if (props.updateAuditBtn) {
      props.updateAuditBtn(true);
    }

    let previewCurPageDataCopy: any = sessionStorage.getItem(`${pageName}-pageData`) || [];
    previewCurPageDataCopy = JSON.parse(previewCurPageDataCopy);
    previewCurPageData = [...previewCurPageDataCopy];

    const index = previewCurPageDataCopy.findIndex(
      (item: any) => item[props?.rowKey || 'id'] === id,
    );
    const cacheImgKeyName = JSON.parse(
      sessionStorage.getItem(`${pageName}-columnImgKeyName`) || 'imgUrl',
    );

    if (!previewCurPageDataCopy[index][cacheImgKeyName]) return;
    setCurPreviewImgIndex(index);

    setVisible(true);
    setArrowVisible(true);
    if (props.updateAuditBtn) {
      props.updateAuditBtn(true);
    }

    if (props.diseImgPreview) {
      handleSetData(previewCurPageDataCopy[index]);
    } else {
      curRowId = previewCurPageDataCopy[index][props?.rowKey || 'id'];
      // setPreviewImgUrl(previewCurPageDataCopy[index][cacheImgKeyName]);
      setImgUrl(previewCurPageDataCopy[index][cacheImgKeyName]);
    }
  };
  const handleUpdateImgInfo = async (isPageChange: boolean, todo: string) => {
    if (!isPageChange) {
      if (todo === 'toPrePage') {
        setCurPreviewImgIndex(curPreviewImgIndex - 1);
      } else {
        setCurPreviewImgIndex(curPreviewImgIndex + 1);
      }
    }
    if (isPageChange) {
      const cacheImgKeyName = JSON.parse(
        sessionStorage.getItem(`${pageName}-columnImgKeyName`) || 'imgUrl',
      );
      if (todo === 'toPrePage') {
        // initRowId = previewCurPageData[previewCurPageData.length - 1][props?.rowKey || 'id'];
        setCurPreviewImgIndex(previewCurPageData.length - 1);
        if (props.diseImgPreview) {
          handleSetData(previewCurPageData[previewCurPageData.length - 1]);
        } else {
          // setPreviewImgUrl(previewCurPageData[previewCurPageData.length - 1][cacheImgKeyName]);
          setImgUrl(previewCurPageData[previewCurPageData.length - 1][cacheImgKeyName]);
        }
      } else {
        // initRowId = previewCurPageData[0][props?.rowKey || 'id'];
        setCurPreviewImgIndex(0);
        if (props.diseImgPreview) {
          handleSetData(previewCurPageData[0]);
        } else {
          // setPreviewImgUrl(previewCurPageData[0][cacheImgKeyName]);
          setImgUrl(previewCurPageData[0][cacheImgKeyName]);
        }
      }
    }
  };
  const handleUpdatePreviewInfo = (parmas: any, res: any) => {
    previewCurPageData = res?.data || [];
    sessionStorage.setItem(`${pageName}-pageData`, JSON.stringify(res?.data || []));
    sessionStorage.setItem(`${pageName}-previewPage`, JSON.stringify(currentPage));
    sessionStorage.setItem(`${pageName}-previewPageSize`, JSON.stringify(parmas?.pageSize));
    sessionStorage.setItem(`${pageName}-previewCurPageDataTotal`, JSON.stringify(+res?.total || 0));
    if (pageChange && toPage) {
      handleUpdateImgInfo(true, toPage);
    }
  };

  // 切换预览图片相关
  const handleToPrevImg = () => {
    const cachePage = JSON.parse(sessionStorage.getItem(`${pageName}-previewPage`) || '1');
    const cacheImgKeyName = JSON.parse(
      sessionStorage.getItem(`${pageName}-columnImgKeyName`) || 'imgUrl',
    );
    if (curPreviewImgIndex === 0 && cachePage > 1) {
      setCurrentPage(cachePage - 1);
      pageChange = true;
      toPage = 'toPrePage';
    } else {
      if (props.diseImgPreview) {
        handleSetData(previewCurPageData[curPreviewImgIndex - 1]);
      } else {
        // setPreviewImgUrl(previewCurPageData[curPreviewImgIndex - 1][cacheImgKeyName]);
        setImgUrl(previewCurPageData[curPreviewImgIndex - 1][cacheImgKeyName]);
      }
      handleUpdateImgInfo(false, 'toPrePage');
    }
  };
  const handleToNextImg = () => {
    const cachePage = JSON.parse(sessionStorage.getItem(`${pageName}-previewPage`) || '1');
    const cachePageSize = JSON.parse(sessionStorage.getItem(`${pageName}-previewPageSize`) || '20');
    const cachePageDataTotal = JSON.parse(
      sessionStorage.getItem(`${pageName}-previewCurPageDataTotal`) || '0',
    );
    const cacheImgKeyName = JSON.parse(
      sessionStorage.getItem(`${pageName}-columnImgKeyName`) || 'imgUrl',
    );
    if (
      curPreviewImgIndex === previewCurPageData.length - 1 &&
      cachePage < Math.ceil(cachePageDataTotal / cachePageSize)
    ) {
      setCurrentPage(cachePage + 1);
      pageChange = true;
      toPage = 'toNextPage';
    } else {
      if (props.diseImgPreview) {
        handleSetData(previewCurPageData[curPreviewImgIndex + 1]);
      } else {
        // setPreviewImgUrl(previewCurPageData[curPreviewImgIndex + 1][cacheImgKeyName]);
        setImgUrl(previewCurPageData[curPreviewImgIndex + 1][cacheImgKeyName]);
      }
      handleUpdateImgInfo(false, 'toNextPage');
    }
  };

  useEffect(() => {
    if (toLeftOrRight === 'left') {
      handleToPrevImg();
    } else if (toLeftOrRight === 'right') {
      handleToNextImg();
    }
    setToLeftOrRight('');
  }, [toLeftOrRight]);

  useEffect(() => {
    if (curPreviewImgIndex < 0) return;
    setPreDisabled(false);
    setNextDisabled(false);
    setArrowDisabled(''); // 业务相关需优化

    // 开始预览时 待审核页面抛出相关事件
    if (curPreviewImgIndex > -1 && props.pageName === 'pending-review-page') {
      if (props.updateCurPreviewInfo) {
        props.updateCurPreviewInfo(previewCurPageData[curPreviewImgIndex]);
      }
    }
    const cachePage =
      !sessionStorage.getItem(`${pageName}-previewPage`) ||
      sessionStorage.getItem(`${pageName}-previewPage`) === 'undefined'
        ? JSON.parse('1')
        : JSON?.parse(sessionStorage?.getItem(`${pageName}-previewPage`) || '1');
    if (curPreviewImgIndex === 0 && cachePage === 1) {
      setPreDisabled(true);
      setArrowDisabled('left'); // 业务相关需优化
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
        setArrowDisabled('right'); // 业务相关需优化
      }
    }
  }, [curPreviewImgIndex]);

  // 图片预览切换 ========end================

  const formatColumns = (argColumns: any) => {
    const list: any = [];
    argColumns.forEach((item: any) => {
      const column = {
        title: item.title,
        key: item.key,
        width: item.width,
      };
      if (item?.render) Object.assign(column, { render: item?.render });
      if (!['sort', 'operate'].includes(item?.type))
        Object.assign(column, { ellipsis: true, dataIndex: item.key });
      if (
        ['sort', 'image', 'isClick'].includes(item?.type) ||
        item?.colorEnum ||
        item?.formatKeys?.length
      ) {
        Object.assign(column, {
          render: (_text: any, record: any, index: any) => {
            if (item?.type === 'sort') return `${(currentPage - 1) * pagesize + (index + 1)}`;
            if (item?.type === 'image')
              return (
                <Image
                  src={record[item?.key]}
                  style={{ width: 58, height: 46 }}
                  placeholder={true}
                />
              );
            if (item?.colorEnum)
              return (
                <Badge
                  color={item?.colorEnum[record[item?.key]]}
                  text={item?.valueEnum ? item?.valueEnum[record[item?.key]] : record[item?.key]}
                />
              );
            if (item?.type === 'isClick') {
              return item?.clickConfig?.clickValue?.includes(record[item?.key]) ? (
                <a
                  className="ahover"
                  onClick={() => {
                    rowMethods(record, item?.clickConfig?.type);
                  }}
                >
                  {item?.clickConfig?.valueEnum
                    ? item?.clickConfig?.valueEnum[record[item?.key]]
                    : record[item?.key]}
                </a>
              ) : (
                <span>
                  {item?.clickConfig?.valueEnum
                    ? item?.clickConfig?.valueEnum[record[item?.key]]
                    : record[item?.key]}
                </span>
              );
            }
            // 多个字段拼接的内容
            if (item?.formatKeys?.length && record[item?.key]) {
              return item?.formatKeys.map((k: any) => (
                <span key={k}>
                  <span key={k}>
                    {item?.formatEnum?.hasOwnProperty(k)
                      ? item?.formatEnum[k][record[k]]
                      : record[k]}
                  </span>{' '}
                  <br />
                </span>
              ));
            }
            return null;
          },
        });
      }
      // 增加图片预览切换功能
      if (item?.type === 'previewImage') {
        columnImgKeyName = item?.key;
        sessionStorage.setItem(
          `${pageName}-columnImgKeyName`,
          JSON.stringify(columnImgKeyName || ''),
        );
        Object.assign(column, {
          render: (text: any, record: any) => {
            if (props.diseImgPreview) {
              return (
                <div
                  className={styles['image-container']}
                  onClick={(e: any) => {
                    setData({
                      url: record?.imgUrl,
                      ls: [
                        {
                          bbox: record?.bbox,
                          diseaseNameZh: record?.typeName,
                        },
                      ],
                      id: record?.id,
                    });
                    // setRowId(record?.id);
                    curRowId = record?.id;
                    handerImgClick(e, record[props?.rowKey || 'id']);
                  }}
                >
                  <img
                    src={record[column.key] || placeholdSvg}
                    style={{ width: 58, height: 46, cursor: 'pointer' }}
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.src = placeholdSvg;
                      img.onerror = null;
                    }}
                  />
                  <div className={styles['image-mask-container']}>
                    <span className={styles['image-mask-eye']}></span>
                    <span className={styles['image-mask-name']}>预览</span>
                  </div>
                </div>
              );
            }
            return (
              <>
                <Image
                  src={record[column.key] || placeholdSvg}
                  style={{ width: 58, height: 46 }}
                  placeholder={true}
                  fallback={placeholdSvg}
                  preview={false}
                  onClick={(e: any) => handerImgClick(e, record[props?.rowKey || 'id'])}
                />
              </>
            );
            // }
            // return (
            //   <>
            //     <Image
            //       src={record[column.key]}
            //       style={{ width: 58, height: 46 }}
            //       placeholder={true}
            //       fallback={placeholdSvg}
            //       preview={false}
            //       onClick={(e: any) => handerImgClick(e, record.id)}
            //     />
            //   </>
            // );
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
                        {e?.key ? e?.name[row[e?.key]] : e?.name}
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
  }, [newColumns, currentPage, imgUrl, pagesize]);

  return (
    <div className={'common-table-style'}>
      {visible ? (
        <Image
          style={{ display: 'none' }}
          placeholder={true}
          rootClassName={'common-iamge-root'}
          className={'common-iamge'}
          fallback={placeholdSvg}
          preview={{
            visible, // initRowId === record?.id && curRowId !== null,
            src: imgUrl,
            onVisibleChange: (value) => {
              setVisible(value);
              // setPreviewImgVisible(value);
              if (props.updateAuditBtn) {
                props.updateAuditBtn(value);
              }
              if (!value) {
                setData(null);
                setImgUrl('');
                // setRowId('');
                // curRowId = null;
                pageChange = false;
                toPage = '';
                // initRowId = null;
                setArrowVisible(value);
                changeTableScrollBarPosition(curPreviewImgIndex);
              }
            },
          }}
        />
      ) : null}
      <ProTable
        columns={columnList}
        onLoad={onLoad}
        rowClassName={(record: any) => {
          return curRowId === record.id ? 'highlight-row' : '';
        }}
        params={
          isRefresh
            ? {
                ...searchKey,
                page: pagination ? currentPage : undefined,
                pageSize: pagination ? pagesize : undefined,
              }
            : {}
        }
        request={async (params) => {
          if (requireValue && !searchKey[requireValue]) {
            // console.log('为空',searchKey?.requireValue)
            return Promise.resolve();
          }
          // console.log('qiguai',params);
          const obj = {
            ...searchKey,
            page: pagination ? currentPage : undefined,
            pageSize: params.pageSize,
          };
          const res = await commonRequest({ url, method, params: obj, isTable: true });
          setSelectedRowKeys([]);
          // 表示需要预览切换
          if (pageName) {
            handleUpdatePreviewInfo(params, res);
          }

          if (props.updatePreviewInfo) {
            props.updatePreviewInfo(params, res);
          }
          setTotal(res?.total);
          setTableData(res?.data);
          return res;
        }}
        rowKey={rowKey || 'id'}
        rowSelection={
          rowSelection
            ? {
                selectedRowKeys,
                type: 'checkbox',
                onChange,
                getCheckboxProps: (record: any) => ({
                  disabled: selectedDisabledValue?.includes(record[selectedDisabledKey]),
                }),
              }
            : false
        }
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
        pagination={
          pagination
            ? {
                showQuickJumper: false,
                current: currentPage,
                defaultPageSize: props?.defaultPageSize || 20,
                // onChange: pageChange,
              }
            : false
        }
        tableAlertRender={false}
        toolBarRender={false}
        search={false}
        actionRef={ref}
        scroll={(isScroll ? scroll : scrollObj) || { x: '100%' }}
        onChange={tabChange}
        // onDataSourceChange={onDataSourceChange}
      />
      {/* 图片预览切换 =======start============= */}
      {/* {previewImgVisible && !props.diseImgPreview && (
        <div className={styles.previewWrapper}>
          <div className={styles.previewMask} onClick={() => handleClosePreview()}></div>
          <div className={styles.previewImg}>
            <Draggable
              onStop={() => handleDragImgStop()}
              defaultClassName={styles.draggableDefaultClass}
            >
              <div ref={previewImgRef} className={styles.previewImgInner}>
                <Image src={previewImgUrl} preview={false} />
              </div>
            </Draggable>
          </div>
        </div>
      )} */}

      {visible && props.diseImgPreview ? (
        <>
          <ImgCanvas
            setImgUrl={(resUrl: any) => {
              setImgUrl(resUrl);
            }}
            data={data}
          />
        </>
      ) : (
        ''
      )}
      {/* 左右切换按钮 */}
      {visible && arrowShow && (
        <>
          <LeftImg
            className={`${styles.arrLeftIcon} ${styles.toggleIcon} ${
              preDisabled ? styles.arrIconDisabled : ''
            }`}
            onClick={preDisabled ? undefined : handleToPrevImg}
          />
          <RightImg
            onClick={nextDisabled ? undefined : handleToNextImg}
            className={`${styles.arrRightIcon} ${styles.toggleIcon} ${
              nextDisabled ? styles.arrIconDisabled : ''
            }`}
          />
        </>
      )}
      {/* 图片预览切换 =======end============= */}
    </div>
  );
};
export default CommonTable;
