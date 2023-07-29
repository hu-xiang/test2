import React, { useState, useRef } from 'react';
import { Input, Button, Modal } from 'antd';
import CrtModel from './components/createOrEditModal';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { commonExport, commonDel, isExist } from 'baseline/src/utils/commonMethod';
import CommonTable from 'baseline/src/components/CommonTable';
import StructureLibModal from 'baseline/src/pages/facilityManage/FacilityList/components/roadLibModal';

const { confirm } = Modal;
const { Search } = Input;

const requestList = [
  { url: '/sm-traffic-hn/structure/export', method: 'post', blob: true },
  { url: '/sm-traffic-hn/structure/delete', method: 'DELETE' },
];

type Iprops = {
  programName?: string;
  importColumns?: any;
};
const FacilityList: React.FC<Iprops> = () => {
  const [crtusershow, setCrtusershow] = useState(false);
  const [keyword, setKeyword] = useState<any>('');
  const scroll = { x: 1200, y: 'calc(100vh - 220px)' };
  const [edtShow, setEdtShow] = useState(false);
  const [edtInfo, setEdtInfo] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [visibleStructureLib, setVisibleStructureLib] = useState<boolean>(false);

  const ChildRef: any = useRef();

  const Searchs = (e: any) => {
    setKeyword(e.trim());
    ChildRef.current.onSet();
  };
  const setkeywords = () => {
    ChildRef.current.onSet();
  };

  const downloadflie = async () => {
    const formData = new FormData();
    formData.append('ids', selectedRows);
    formData.append('keyword', keyword);
    commonExport({ ...requestList[0], params: formData });
  };

  const del = async (text: any) => {
    const formData = new FormData();
    formData.append('id', text.id);
    const res: any = await commonDel('道路信息将删除，是否继续？', {
      ...requestList[1],
      params: formData,
    });
    if (res) ChildRef.current.onSet('current');
  };

  const rowMethods = async (row: any, type: string) => {
    switch (type) {
      case 'edit':
        setEdtInfo(row);
        setEdtShow(true);
        setCrtusershow(true);
        break;

      case 'del':
        del(row);
        break;
      case 'structureLib':
        setEdtInfo(row);
        setVisibleStructureLib(true);
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
    { title: '结构物名称', key: 'structureName', width: 134 },
    { title: '所属道路名称', key: 'roadSection', width: 134 },
    {
      title: '道路类别',
      key: 'roadType',
      width: 134,
      valueEnum: {
        0: '城市道路',
        1: '公路',
      },
    },
    {
      title: '道路等级',
      key: 'roadLevel',
      width: 134,
      valueEnum: {
        0: '快速路',
        1: '主干道',
        2: '次干道',
        3: '支路',
        4: '高速公路',
        5: '一级公路',
        6: '二级公路',
        7: '三级公路',
        8: '四级公路',
      },
    },
    {
      title: '结构物类型',
      key: 'structureType',
      width: 134,
      valueEnum: {
        1: '桥梁',
        2: '隧道',
        3: '涵洞',
      },
    },
    {
      title: '结构物长度(km)',
      key: 'structureLength',
      width: 134,
      render: (text: any, row: any) => {
        const res = Number(row.structureLength / 1000).toFixed(3);
        return <span>{res}</span>;
      },
    },
    { title: '位置描述', key: 'position', width: 134 },
    { title: '管养单位', key: 'managementUnit', width: 134 },
    {
      title: '组织架构',
      dataIndex: 'deptStr',
      key: 'deptStr',
      ellipsis: true,
      width: 134,
    },
    { title: '新增时间', key: 'crtTime', width: 164 },
    {
      title: '操作',
      key: 'action',
      width: 190,
      type: 'operate',
      operateList: [
        {
          access: ['facilitymanage/structureList/index:btn_edit'],
          more: false,
          name: '编辑',
          type: 'edit',
        },
        {
          access: ['facilitymanage/structureList/index:btn_Lib'],
          more: false,
          name: '结构物台账',
          type: 'structureLib',
        },
        {
          access: ['facilitymanage/structureList/index:btn_del'],
          more: false,
          name: '删除',
          type: 'del',
        },
      ],
    },
  ];

  return (
    <div className={'commonTableClass'}>
      {/* 顶部按钮 */}
      <div className={'row-class'}>
        <div className="left-box">
          {isExist(['facilitymanage/structureList/index:btn_add']) && (
            <Button className={'buttonClass'} type="primary" onClick={() => setCrtusershow(true)}>
              创建
            </Button>
          )}
          {isExist(['facilitymanage/structureList/index:btn_export']) && (
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
        </div>
        <div className="right-search">
          <Search
            placeholder="请输入结构物名称关键字"
            allowClear
            onSearch={(e) => Searchs(e)}
            maxLength={50}
            enterButton
          />
        </div>
      </div>
      <div className={`table-box-normal`}>
        <CommonTable
          scroll={scroll}
          columns={columns}
          searchKey={{ keyword }}
          rowMethods={rowMethods}
          onRef={ChildRef}
          url="/sm-traffic-hn/structure/page"
          getSelectedRows={getSelectedRows}
        />
      </div>
      {crtusershow ? (
        <CrtModel
          onOK={() => setkeywords()}
          isEdit={edtShow}
          visible={crtusershow}
          rowInfo={edtInfo}
          onCancel={() => {
            setEdtShow(false);
            setCrtusershow(false);
          }}
        />
      ) : null}
      {visibleStructureLib ? (
        <StructureLibModal
          visible={visibleStructureLib}
          rowInfo={edtInfo}
          onCancel={() => {
            setVisibleStructureLib(false);
          }}
          onOk={() => {
            setVisibleStructureLib(false);
          }}
          title={'结构物台账'}
          URL={'/sm-traffic-hn/ledger/page'}
        />
      ) : null}
    </div>
  );
};

export default FacilityList;
