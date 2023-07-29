import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal, Radio, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  isExist,
  commonExport,
  commonDel,
  commonRequest,
  getDictData,
} from '../../../../utils/commonMethod';
import LocationModal from '../LocationModal';
import CommonTable from '../../../../components/CommonTable';
import CommonSearch from '../../../../components/CommonSearch';

const { confirm } = Modal;
const requestList = [
  { url: '/traffic/sub/facilities/real/export', method: 'post', blob: true },
  { url: '/traffic/sub/facilities/facilities/typeList', method: 'get' },
  { url: '/traffic/facilities/select', method: 'get' },
  { url: '/traffic/sub/facilities/real/changeStatus', method: 'post' },
];

const facilitiesStatusEnum = {
  0: '正常',
  1: '已拆除',
  2: '已缺失',
};

export default (): React.ReactElement => {
  const [isLocationModalshow, setIsLocationModalshow] = useState(false);
  const [rowId, setRowId] = useState('');
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
    facilitiesStatus: undefined,
  });
  const scroll = { x: 1200, y: 'calc(100vh - 287px)' };

  const ChildRef = useRef<any>();

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
    const data = [
      {
        type: 'input',
        placeholder: '请输入附属设施编号、图片名称的关键字',
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
      {
        type: 'select',
        multiple: false,
        placeholder: '请选择',
        key: 'facilitiesStatus',
        label: '附属设施状态',
        labelWidth: 84,
        width: '33%',
        enumData: facilitiesStatusEnum,
      },
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
    setSearchData(data);
  }, [facilitiesTypeEnum, parentFacilitiesList]);

  const setkeywords = () => {
    ChildRef.current.onSet();
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
      facilitiesStatus: val.facilitiesStatus,
    });
  };

  const clearSearch = () => {
    setSearchKey({
      startTime: undefined,
      endTime: undefined,
      typeList: undefined,
      facId: undefined,
      keyword: undefined,
      facilitiesStatus: undefined,
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
      facilitiesStatus: searchKey?.facilitiesStatus,
      startTime: searchKey?.startTime,
      endTime: searchKey?.endTime,
      page: ChildRef.current.current,
      pageSize: ChildRef.current.pageSize,
    };
    commonExport({ ...requestList[0], params });
  };

  const close = async (row: any) => {
    let status: number = 1;
    confirm({
      icon: '',
      content: (
        <Radio.Group
          onChange={(e: any) => {
            status = e?.target?.value;
          }}
          defaultValue={status}
        >
          <Radio value={1}>已拆除</Radio>
          <Radio value={2}>已缺失</Radio>
        </Radio.Group>
      ),
      async onOk() {
        const params = {
          id: row?.id,
          status,
        };
        const res = await commonRequest({ ...requestList[3], params });
        if (res.status === 0) {
          message.success({
            content: '关闭成功',
            key: '关闭成功',
          });
          setkeywords();
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const open = async (row: any) => {
    const params = {
      id: row?.id,
      status: 0,
    };
    const res: any = await commonDel(
      '是否打开该附属设施，该附属设施状态将切换为正常，是否继续？',
      {
        ...requestList[3],
        params,
      },
      '打开',
    );
    if (res) setkeywords();
  };

  const rowMethods = async (row: any, type: string) => {
    switch (type) {
      case 'watch':
        setRowId(row?.id);
        setIsLocationModalshow(true);
        break;
      case 'close':
        if (row?.facilitiesStatus === 0) close(row);
        else open(row);
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
      title: '附属设施状态',
      key: 'facilitiesStatus',
      width: 120,
      valueEnum: facilitiesStatusEnum,
      colorEnum: {
        0: '#54A325',
        1: '#FF0000',
        2: '#FACC2A',
      },
    },
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
      width: 160,
      type: 'operate',
      operateList: [
        {
          access: ['facilitymanage/subfacilitylist/index:btn_watch'],
          more: false,
          name: '查看定位',
          type: 'watch',
        },
        {
          access: ['facilitymanage/subfacilitylist/index:btn_closeOrOp'],
          more: false,
          key: 'facilitiesStatus',
          name: { 0: '关闭', 1: '打开', 2: '打开' },
          type: 'close',
        },
      ],
    },
  ];

  return (
    <div className="page-list-common">
      <CommonSearch
        searchData={searchData}
        search={search}
        clearSearch={clearSearch}
        getValueData={getValueData}
      />
      <div className={'row-button'}>
        {isExist(['facilitymanage/subfacilitylist/index:btn_export']) && (
          <Button
            className={'buttonClass'}
            type="primary"
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
      </div>
      <div
        className={`page-table-tab-two-box ${
          isExist(['facilitymanage/subfacilitylist/index:btn_export'])
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
          url="/traffic/sub/facilities/real/list"
          getSelectedRows={getSelectedRows}
          method={'post'}
          pageName={'facility-page'}
          diseImgPreview={true}
        />
      </div>
      {isLocationModalshow ? (
        <LocationModal
          isModalshow={isLocationModalshow}
          id={rowId}
          type={0}
          onCancel={() => {
            setIsLocationModalshow(false);
          }}
        />
      ) : null}
    </div>
  );
};
