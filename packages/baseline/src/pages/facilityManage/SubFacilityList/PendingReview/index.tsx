import React, { useState, useRef, useEffect } from 'react';
import styles from '../PendingReview/styles.less';
import { Button, Modal, Image } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  isExist,
  commonExport,
  commonDel,
  commonRequest,
  getDictData,
} from '../../../../utils/commonMethod';
import LocationModal from '../LocationModal';
import FacModal from '../FacModal';
import CommonTable from '../../../../components/CommonTable';
import CommonSearch from '../../../../components/CommonSearch';
import ImgCanvas from '../../../../components/DistressCanvas';
import { ReactComponent as LeftImg } from '../../../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightImg } from '../../../../assets/img/leftAndRight/rightImg.svg';

const { confirm } = Modal;
const requestList = [
  { url: '/traffic/sub/facilities/export', method: 'post', blob: true },
  { url: '/traffic/sub/facilities/facilities/typeList', method: 'get' },
  { url: '/traffic/facilities/select', method: 'get' },
  { url: '/traffic/sub/facilities/batchDel', method: 'DELETE' },
  { url: '/traffic/sub/facilities/batchExamine', method: 'POST' },
];

// const isRepeatEnum = {
//   0: '是',
//   1: '否',
// };

let previewCurPageData: any = [];
let pageName = 'pendingReview-repeat-page';
let curRowId: any = null;
let initRowId: any = null;
let pageChange: boolean = false;
let toPage: string = '';

export default (): React.ReactElement => {
  const [visible, setVisible] = useState(false);
  const [auditBtnVisible, setAuditBtnVisible] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [data, setData] = useState<any>();
  const [isLocationModalshow, setIsLocationModalshow] = useState(false);
  const [rowId, setRowId] = useState('');
  const [isFacModalshow, setIsFacModalshow] = useState(false);
  const [isRepeatShow, setIsRepeatShow] = useState(false);
  // 是否为编辑
  const [isEdit, setIsEdit] = useState(false);
  // 编辑当前行数据
  const [editInfo, setEditInfo] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any>([]);
  // 附属设施类型枚举
  const [facilitiesTypeEnum, setFacilitiesTypeEnum] = useState<any>([]);
  // 所属设施枚举
  const [parentFacilitiesList, setParentFacilitiesList] = useState<any>([]);

  const [searchData, setSearchData] = useState<any>([]);
  const [searchKey, setSearchKey] = useState<any>({
    startTime: undefined,
    endTime: undefined,
    typeList: undefined,
    facId: undefined,
    keyword: undefined,
    // isRepeat: undefined,
  });

  const scroll = { x: 1200, y: 'calc(100vh - 287px)' };

  const [nextDisabled, setNextDisabled] = useState(false); // true： 置灰不可点  false: 表示可点
  const [preDisabled, setPreDisabled] = useState(false); // true： 置灰不可点  false: 表示可点
  const [curPreviewImgIndex, setCurPreviewImgIndex] = useState<number>(-1); // 当前预览的病害图片在列表中的序号
  const [previewImgVisible, setPreviewImgVisible] = useState<boolean>(false);

  const ChildRef = useRef<any>();

  // 图片预览切换 ========start================
  const handleSetData = (record: any) => {
    curRowId = record?.id;
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
  };
  const handerImgClick = (e: any, id: any) => {
    e.stopPropagation();

    let previewCurPageDataCopy: any = sessionStorage.getItem(`${pageName}-pageData`) || [];
    previewCurPageDataCopy = JSON.parse(previewCurPageDataCopy);
    previewCurPageData = [...previewCurPageDataCopy];

    const index = previewCurPageDataCopy.findIndex((item: any) => item.id === id);
    sessionStorage.setItem(`${pageName}-columnImgKeyName`, JSON.stringify('imgUrl'));
    const cacheImgKeyName = 'imgUrl';

    initRowId = id;

    if (!previewCurPageDataCopy[index][cacheImgKeyName]) return;
    setPreviewImgVisible(true);
    setCurPreviewImgIndex(index);
    handleSetData(previewCurPageDataCopy[index]);
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
      if (todo === 'toPrePage') {
        initRowId = previewCurPageData[previewCurPageData.length - 1]?.id;
        setCurPreviewImgIndex(previewCurPageData.length - 1);
        handleSetData(previewCurPageData[previewCurPageData.length - 1]);
      } else {
        initRowId = previewCurPageData[0]?.id;
        setCurPreviewImgIndex(0);
        handleSetData(previewCurPageData[0]);
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
  const handleToPrevImg = () => {
    const cachePage = JSON.parse(sessionStorage.getItem(`${pageName}-previewPage`) || '1');
    if (curPreviewImgIndex === 0 && cachePage > 1) {
      pageChange = true;
      toPage = 'toPrePage';
      ChildRef.current.handleTogglePage(cachePage - 1);
    } else {
      handleSetData(previewCurPageData[curPreviewImgIndex - 1]);
      handleUpdateImgInfo(false, 'toPrePage');
    }
  };
  const handleToNextImg = () => {
    const cachePage = JSON.parse(sessionStorage.getItem(`${pageName}-previewPage`) || '1');
    const cachePageSize = JSON.parse(sessionStorage.getItem(`${pageName}-previewPageSize`) || '20');
    const cachePageDataTotal = JSON.parse(
      sessionStorage.getItem(`${pageName}-previewCurPageDataTotal`) || '0',
    );
    if (
      curPreviewImgIndex === previewCurPageData.length - 1 &&
      cachePage < Math.ceil(cachePageDataTotal / cachePageSize)
    ) {
      pageChange = true;
      toPage = 'toNextPage';
      ChildRef.current.handleTogglePage(cachePage + 1);
    } else {
      handleSetData(previewCurPageData[curPreviewImgIndex + 1]);
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

    return () => {};
  }, [curPreviewImgIndex]);

  // 图片预览切换 ========end================

  const getTypeList = async () => {
    const res: any = await getDictData({ type: 2, dictCodes: ['subfacility'], scenesType: 3 }); // commonRequest(requestList[1]);
    setFacilitiesTypeEnum(res);
  };
  // 获取所属设施数据
  const getParentFacilitiesList = async () => {
    const res = await commonRequest(requestList[2]);
    setTimeout(() => {
      setParentFacilitiesList(res.data);
    }, 0);
    return res;
  };

  useEffect(() => {
    getTypeList();
    getParentFacilitiesList();
  }, []);

  useEffect(() => {
    const searchList = [
      {
        type: 'input',
        placeholder: '请输入附属设施图片编号、图片名称的关键字',
        key: 'keyword',
        label: '综合搜索',
        labelWidth: 84,
        width: '33%',
      },
      {
        type: 'select',
        multiple: true,
        placeholder: '请选择',
        key: 'typeList',
        label: '附属设施类型',
        labelWidth: 84,
        width: '33%',
        enumData: facilitiesTypeEnum,
        enumValue: 'dictKey',
        enumLabel: 'dictName',
      },
      {
        type: 'select',
        multiple: false,
        placeholder: '请选择',
        key: 'facId',
        label: '所属道路名称',
        labelWidth: 84,
        width: '33%',
        enumData: parentFacilitiesList,
        enumValue: 'id',
        enumLabel: 'facilitiesName',
      },
      // {
      //   type: 'select',
      //   multiple: false,
      //   placeholder: '请选择',
      //   key: 'isRepeat',
      //   label: '是否存在重复',
      //   labelWidth: 84,
      //   width: '33%',
      //   enumData: isRepeatEnum,
      // },
      {
        type: 'timeRange',
        key: ['startTime', 'endTime'],
        label: '采集时间',
        labelWidth: 84,
        width: '50%',
        enumBtn: {
          1: '本周',
          2: '本月',
          3: '自定义',
        },
        disabledBtn: [1, 2],
      },
    ];
    setSearchData(searchList);
  }, [facilitiesTypeEnum, parentFacilitiesList]);

  const setkeywords = (params: any = '') => {
    ChildRef.current.onSet(params);
  };

  const search = () => {
    setkeywords();
  };

  const getValueData = (val: any) => {
    setSearchKey({
      startTime: val?.startTime,
      endTime: val?.endTime,
      typeList: val?.typeList,
      facId: val?.facId,
      keyword: val?.keyword,
      // isRepeat: val?.isRepeat,
    });
  };

  const clearSearch = () => {
    setSearchKey({
      startTime: undefined,
      endTime: undefined,
      typeList: undefined,
      facId: undefined,
      keyword: undefined,
      // isRepeat: undefined,
    });
    setkeywords();
  };

  useEffect(() => {
    const listener = (event: any) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault();
        search();
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [searchKey]);

  const downloadflie = async () => {
    const params = {
      ids: selectedRows,
      keyword: searchKey?.keyword,
      typeList: searchKey?.typeList,
      facId: searchKey?.facId,
      // isRepeat: searchKey?.isRepeat,
      startTime: searchKey?.startTime,
      endTime: searchKey?.endTime,
      page: ChildRef.current.current,
      pageSize: ChildRef.current.pageSize,
    };
    commonExport({ ...requestList[0], params });
  };

  const del = async (text: any, isBatch: boolean) => {
    const formData = new FormData();
    formData.append('ids', isBatch ? selectedRows : text.id);
    const res: any = await commonDel('附属设施信息将删除，是否继续？', {
      ...requestList[3],
      params: formData,
    });
    if (res) setkeywords();
  };

  const audit = async (id?: any) => {
    const res: any = await commonDel(
      '是否完成附属设施信息审核，加入附属设施列表中？',
      {
        ...requestList[4],
        params: id ? [id] : [curRowId],
      },
      '审核',
    );
    if (res) {
      setVisible(false);
      setkeywords('current');
      setPreviewImgVisible(false);

      setAuditBtnVisible(false);
      ChildRef.current.handleClosePreview();
    }
  };

  const rowMethods = async (row: any, type: string) => {
    switch (type) {
      case 'watch':
        setRowId(row?.id);
        setIsLocationModalshow(true);
        break;
      case 'audit':
        audit(row?.id);
        break;
      case 'edit':
        setEditInfo(row);
        setIsEdit(true);
        setIsFacModalshow(true);
        break;
      case 'del':
        del(row, false);
        break;
      case 'yes':
        setRowId(row?.id);
        setIsRepeatShow(true);
        break;
      default:
        break;
    }
  };

  const getSelectedRows = (rows: any) => {
    setSelectedRows(rows);
  };

  const columns: any = [
    { title: '序号', key: 'id', width: 60, type: 'sort' },
    {
      title: '附属设施图片',
      key: 'imgUrl',
      width: 100,
      type: 'previewImage',
    },
    { title: '附属设施编号', key: 'facilitiesNo', width: 200 },
    { title: '图片名称', key: 'imgName', width: 200 },
    { title: '附属设施类型', key: 'typeName', width: 120 },
    { title: '附属设施子类型', key: 'subTypeName', width: 120 },
    {
      title: '是否存在重复',
      key: 'isDuplicateName',
      width: 120,
      type: 'isClick',
      clickConfig: {
        clickValue: ['是'], // 根据是否包含在数组里面的值来判断需要点击
        // valueEnum: isRepeatEnum,
        type: 'yes', // 事件类型
      },
    }, // 表格内容需要点击
    { title: '所在区域', key: 'address', width: 200 },
    {
      title: '桩号',
      key: 'stackNo',
      width: 200,
      formatKeys: ['stackNo', 'direction'],
      formatEnum: { direction: { 0: '上行', 1: '下行' } },
    },
    { title: '所属道路名称', key: 'facilitiesName', width: 200 },
    { title: '组织架构', key: 'deptName', width: 160 },
    { title: '采集时间', key: 'collectTime', width: 160 },
    {
      title: '操作',
      key: 'option',
      width: 220,
      type: 'operate',
      operateList: [
        {
          access: ['facilitymanage/subfacilitylist/index:btn_watchMap'],
          more: false,
          name: '查看定位',
          type: 'watch',
        },
        {
          access: ['facilitymanage/subfacilitylist/index:btn_audit'],
          more: false,
          name: '审核',
          type: 'audit',
        },
        {
          access: ['facilitymanage/subfacilitylist/index:btn_edit'],
          more: false,
          name: '编辑',
          type: 'edit',
        },
        {
          access: ['facilitymanage/subfacilitylist/index:btn_del'],
          more: false,
          name: '删除',
          type: 'del',
        },
      ],
    },
  ];

  const columns1: any = [
    { title: '编号', key: 'id', width: 60, type: 'sort' },
    {
      title: '附属设施图片',
      key: 'imgUrl',
      width: 100,
      // type: 'previewImage',
      render: (_text: any, record: any) => {
        return (
          <Image
            src={record?.imgUrl}
            style={{ width: 58, height: 46 }}
            placeholder={true}
            onClick={(e: any) => handerImgClick(e, record?.id)}
            preview={{
              visible: curRowId !== null && initRowId === record?.id,
              src: imgUrl,
              onVisibleChange: (value) => {
                setVisible(value);
                setPreviewImgVisible(value);
                if (!value) {
                  setData(null);
                  setImgUrl('');
                  // setRowId('');
                  pageChange = false;
                  toPage = '';
                  initRowId = null;
                  setCurPreviewImgIndex(-1);
                } else {
                  setData({
                    url: record?.imgUrl,
                    ls: [
                      {
                        bbox: record?.bbox,
                        diseaseNameZh: record?.typeName,
                      },
                    ],
                  });
                  // setRowId(record?.id);
                  curRowId = record?.id;
                }
              },
            }}
          />
        );
      },
    },
    { title: '附属设施编号', key: 'facilitiesNo', width: 200 },
    { title: '图片名称', key: 'imgName', width: 200 },
    { title: '附属设施类型', key: 'typeName', width: 120 },
    { title: '附属设施子类型', key: 'subTypeName', width: 120 },
    {
      title: '附属设施状态',
      key: 'facilitiesStatus',
      width: 120,
      colorEnum: { 正常: '#54A325', 已拆除: '#FF0000', 已缺失: '#FACC2A' },
    },
  ];

  const updateCurPreviewInfo = (row: any) => {
    curRowId = row?.id;
  };

  return (
    <div className="page-list-common">
      <CommonSearch
        searchData={searchData}
        search={search}
        clearSearch={clearSearch}
        getValueData={getValueData}
      />
      <div className={'row-button'}>
        {isExist(['facilitymanage/subfacilitylist/index:btn_add']) && (
          <Button className={'buttonClass'} type="primary" onClick={() => setIsFacModalshow(true)}>
            创建
          </Button>
        )}
        {/* {isExist(['facilitymanage/subfacilitylist/index:btn_audit']) && (
          <Button className={'buttonClass'} disabled={selectedRows.length === 0} onClick={audit}>
            批量审核
          </Button>
        )} */}
        {isExist(['facilitymanage/subfacilitylist/index:btn_DExport']) && (
          <Button
            className={'buttonClass'}
            onClick={() => {
              if (selectedRows.length === 0) {
                confirm({
                  title: '是否导出查询列表所有数据？',
                  icon: <ExclamationCircleOutlined />,
                  okText: '确定',
                  okType: 'danger',
                  cancelText: '取消',
                  async onOk() {
                    return downloadflie();
                  },
                  onCancel() {},
                });
              } else {
                downloadflie();
              }
            }}
          >
            批量导出
          </Button>
        )}
        {isExist(['facilitymanage/subfacilitylist/index:btn_delList']) && (
          <Button
            className={'buttonClass'}
            disabled={selectedRows.length === 0}
            onClick={() => del({}, true)}
          >
            批量删除
          </Button>
        )}
      </div>
      <div
        className={`page-table-tab-two-box ${
          isExist([
            'facilitymanage/subfacilitylist/index:btn_add',
            'facilitymanage/subfacilitylist/index:btn_audit',
            'facilitymanage/subfacilitylist/index:btn_DExport',
            'facilitymanage/subfacilitylist/index:btn_delList',
          ])
            ? null
            : `page-table-tab-two-box-nobutton`
        }`}
      >
        <CommonTable
          scroll={scroll}
          columns={columns}
          searchKey={{ ...searchKey }}
          rowMethods={rowMethods}
          onRef={ChildRef}
          url="/traffic/sub/facilities/list"
          getSelectedRows={getSelectedRows}
          method={'post'}
          pageName={'pending-review-page'}
          diseImgPreview={true}
          updateCurPreviewInfo={(row: any) => updateCurPreviewInfo(row)}
          updateAuditBtn={(status: boolean) => setAuditBtnVisible(status)}
        />
      </div>
      {isLocationModalshow ? (
        <LocationModal
          isModalshow={isLocationModalshow}
          id={rowId}
          onCancel={() => {
            setIsLocationModalshow(false);
          }}
          type={1}
        />
      ) : null}
      {isFacModalshow ? (
        <FacModal
          onsetkey={setkeywords}
          isEdit={isEdit}
          isModalshow={isFacModalshow}
          editInfo={editInfo}
          facilitiesTypeEnum={facilitiesTypeEnum}
          parentFacilitiesList={parentFacilitiesList}
          onCancel={() => {
            setIsEdit(false);
            setIsFacModalshow(false);
          }}
        />
      ) : null}
      {isRepeatShow ? (
        <Modal
          title="重复数据"
          open={isRepeatShow}
          maskClosable={false}
          footer={false}
          width={1005}
          bodyStyle={{ maxHeight: 'calc(90vh - 55px)' }}
          style={{ top: '5%' }}
          onCancel={() => {
            setIsRepeatShow(false);
          }}
        >
          <CommonTable
            scroll={{ x: 950, y: 'calc(100vh - 287px)' }}
            columns={columns1}
            searchKey={{ id: rowId }}
            rowMethods={() => {}}
            url="/traffic/sub/facilities/repeat"
            getSelectedRows={() => {}}
            rowSelection={false}
            isRefresh={true}
            updatePreviewInfo={(params: any, res: any) =>
              handleUpdatePreviewInfo(params, res, 'pendingReview-repeat-page')
            }
          />
        </Modal>
      ) : null}

      {visible ? (
        <>
          <ImgCanvas setImgUrl={(url: any) => setImgUrl(url)} data={data} />{' '}
        </>
      ) : (
        ''
      )}
      {auditBtnVisible && !isRepeatShow && (
        <Button
          type="primary"
          onClick={() => audit()}
          style={{
            position: 'absolute',
            width: '108px',
            bottom: '30px',
            right: '30px',
            zIndex: '1100',
          }}
        >
          审核
        </Button>
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
