import React, { useState, useRef } from 'react';
import { Input, Button, Modal } from 'antd';
import CrtModel from './Crtmodel';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useHistory } from 'umi';
import { commonExport, commonDel, isExist } from '../../../utils/commonMethod';
import CommonTable from '../../../components/CommonTable';
import { useKeepAlive } from '../../../components/ReactKeepAlive';
import RoadLibModal from './components/roadLibModal';

const { confirm } = Modal;
const { Search } = Input;

const requestList = [
  { url: '/traffic/facilities/export', method: 'post', blob: true },
  { url: '/traffic/facilities/del', method: 'DELETE' },
];

type Iprops = {
  programName?: string;
  importColumns?: any;
};
const FacilityList: React.FC<Iprops> = (props: Iprops) => {
  useKeepAlive();
  const [crtusershow, setCrtusershow] = useState(false);
  const [keyword, setKeyword] = useState<any>('');
  const scroll = { x: 1200, y: 'calc(100vh - 220px)' };
  const [edtShow, setEdtShow] = useState(false);
  const [edtInfo, setEdtInfo] = useState<any>();
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [visibleRoadLib, setVisibleRoadLib] = useState<any>(false);

  const ChildRef: any = useRef();
  const history = useHistory();

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
      case 'tstatus':
        sessionStorage.setItem('facilityID', row?.id);
        history.push(`/facilitymanage/facilitylist/TStatus`);
        break;
      case 'set':
        sessionStorage.setItem('facilityID', row?.id);
        history.push(`/facilitymanage/facilitylist/Station`);
        break;
      case 'del':
        del(row);
        break;
      case 'roadLib':
        // del(row);
        setEdtInfo(row);
        setVisibleRoadLib(true);
        break;

      default:
        break;
    }
  };

  const getSelectedRows = (rows: any) => {
    setSelectedRows(rows);
  };

  const menuItems = () => {
    const menulist: any = [];
    if (isExist(['facilitymanage/facilitylist/index:btn_set']))
      menulist.push({ key: 'set', name: '桩号配置' });
    if (
      ['changsha'].includes(props?.programName || '') &&
      isExist(['facilitymanage/facilitylist/index:btn_roadLib'])
    )
      menulist.push({ key: 'roadLib', name: '道路台账' });
    if (isExist(['facilitymanage/facilitylist/index:btn_del']))
      menulist.push({ key: 'del', name: '删除' });
    return menulist;
  };

  const columns: any = props?.importColumns?.length
    ? [
        ...props?.importColumns,
        {
          title: '操作',
          key: 'action',
          width: 180,
          type: 'operate',
          operateList: [
            {
              access: ['facilitymanage/facilitylist/index:btn_edt'],
              more: false,
              name: '编辑',
              type: 'edit',
            },
            {
              access: ['facilitymanage/facilitylist/index:btn_tstatus'],
              more: false,
              name: '路面状况',
              type: 'tstatus',
            },
            {
              access: [
                'facilitymanage/facilitylist/index:btn_set',
                'facilitymanage/facilitylist/index:btn_del',
              ],
              more: true,
              menuItems: menuItems(),
            },
          ],
        },
      ]
    : [
        { title: '序号', key: 'id', width: 100, type: 'sort' },
        { title: '道路名称', key: 'facilitiesName', width: 200 },
        { title: '道路编码', key: 'roadSection', width: 200 },
        // {
        //   title: '设施类型',
        //   key: 'facilitiesType',
        //   width: 120,
        //   valueEnum: {
        //     0: '路基路面',
        //     1: '隧道',
        //     2: '桥梁',
        //     3: '涵洞',
        //     4: '人行道',
        //     5: '边坡',
        //   },
        // },
        {
          title: '道路类别',
          key: 'roadType',
          width: 120,
          valueEnum: {
            0: '城市道路',
            1: '公路',
          },
        },
        {
          title: '道路等级',
          key: 'roadLevel',
          width: 120,
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
          title: '车道数',
          key: 'laneNum',
          width: 80,
          render: (_text: any, record: any) => {
            return record?.laneNum * record?.streetNum;
          },
        },
        { title: '道路里程(m)', key: 'roadNum', width: 120 },
        { title: '起点', key: 'startPoint', width: 160 },
        { title: '终点', key: 'endPoint', width: 160 },
        {
          title: '管养单位',
          dataIndex: 'managementUnit',
          key: 'managementUnit',
          ellipsis: true,
          width: 150,
        },
        { title: '组织架构', key: 'deptName', width: 200 },
        { title: '新增时间', key: 'crtTime', width: 160 },
        {
          title: '操作',
          key: 'action',
          width: 180,
          type: 'operate',
          operateList: [
            {
              access: ['facilitymanage/facilitylist/index:btn_edt'],
              more: false,
              name: '编辑',
              type: 'edit',
            },
            {
              access: ['facilitymanage/facilitylist/index:btn_tstatus'],
              more: false,
              name: '路面状况',
              type: 'tstatus',
            },
            {
              access: [
                'facilitymanage/facilitylist/index:btn_set',
                'facilitymanage/facilitylist/index:btn_del',
              ],
              more: true,
              menuItems: menuItems(),
            },
          ],
        },
      ];

  return (
    <div className={'commonTableClass'}>
      {/* 顶部按钮 */}
      <div className={'row-class'}>
        <div className="left-box">
          {isExist(['facilitymanage/facilitylist/index:btn_add']) && (
            <Button className={'buttonClass'} type="primary" onClick={() => setCrtusershow(true)}>
              创建
            </Button>
          )}
          {isExist(['facilitymanage/facilitylist/index:btn_export']) && (
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
            placeholder="请输入道路名称关键字"
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
          url="/traffic/facilities/list"
          getSelectedRows={getSelectedRows}
        />
      </div>
      {crtusershow ? (
        <CrtModel
          onsetkey={setkeywords}
          edtShow={edtShow}
          crtusershow={crtusershow}
          edtInfo={edtInfo}
          onCancel={() => {
            setEdtShow(false);
            setCrtusershow(false);
          }}
        />
      ) : null}
      {visibleRoadLib ? (
        <RoadLibModal
          visible={visibleRoadLib}
          rowInfo={edtInfo}
          onCancel={() => {
            setVisibleRoadLib(false);
          }}
          onOk={() => {
            setVisibleRoadLib(false);
          }}
          title={'道路台账'}
          URL={'/sm-traffic-hn/ledger/page'}
        />
      ) : null}
    </div>
  );
};

export default FacilityList;
