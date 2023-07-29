import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Modal, Checkbox, Col, Row, message, Progress } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import { useHistory } from 'umi';
import { commonExport, commonDel, isExist } from '../../../utils/commonMethod';
import CommonTable from '../../../components/CommonTable';
import CreatEditProject from './CreatEditProject';
import { useKeepAlive } from '../../../components/ReactKeepAlive';
import { commonRequest } from '../../../utils/commonMethod';

const { confirm } = Modal;
const { Search } = Input;

let timer: any = null;
let mounted: boolean = false;

const requestList = [
  { url: '/traffic/road/project/export', method: 'post', blob: true },
  { url: '/traffic/road/project/del', method: 'DELETE' },
  { url: '/traffic/road/project/download', method: 'post', blob: true },
  { url: '/traffic/road/project/check', method: 'GET' },
];

export default (): React.ReactElement => {
  useKeepAlive();
  const [keyword, setKeyword] = useState<any>('');
  const scroll = { x: 1200, y: 'calc(100vh - 220px)' };
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [reportModal, setReportModal] = useState<boolean>(false);
  const [isModalShow, setIsModalShow] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editInfo, setEditInfo] = useState<any>();
  const [checkedType, setCheckedType] = useState<any>(['0', '1', '2']);
  const [allCheck, setAllCheck] = useState<number>(0);
  const [hasChecked, setHasChecked] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const ChildRef: any = useRef();
  const history = useHistory();

  useEffect(() => {
    mounted = true;
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const Searchs = (e: any) => {
    setKeyword(e.trim());
    ChildRef.current.onSet();
  };
  const setkeywords = () => {
    ChildRef.current.onSet();
  };

  const downloadflie = async () => {
    const params = {
      ids: selectedRows,
      keyword,
    };
    commonExport({ ...requestList[0], params });
  };

  const exportFlie = async () => {
    if (!checkedType?.length) {
      message.warning({
        content: '需要选中要导出的报表',
        key: '需要选中要导出的报表',
      });
      return;
    }
    const params: any = {
      projectId: editInfo?.id,
    };
    if (checkedType?.includes('0')) Object.assign(params, { roadType: '1' });
    if (checkedType?.includes('1')) Object.assign(params, { facilityType: '0' });
    if (checkedType?.includes('2')) Object.assign(params, { technicalStatusType: '2' });
    commonExport({ ...requestList[2], params });
    setEditInfo(undefined);
    setReportModal(false);
  };

  const del = async (text: any, isBatch: boolean) => {
    const formData = new FormData();
    formData.append('ids', isBatch ? selectedRows : text.id);
    const res: any = await commonDel('项目信息将删除，是否继续？', {
      ...requestList[1],
      params: formData,
    });
    if (res) setkeywords();
  };

  const check = async (id: any) => {
    const res = await commonRequest({ ...requestList[3], params: { id } });
    if (res?.data) {
      if (mounted) {
        setAllCheck(res?.data?.allCheck_total);
        setHasChecked(res?.data?.check_total);
      }
    }
    if (res?.data?.check_total / res?.data?.allCheck_total === 1) {
      clearInterval(timer);
    }
  };

  useEffect(() => {
    if (!open) {
      setAllCheck(0);
      setHasChecked(0);
    }
  }, [open]);

  const rowMethods = async (row: any, type: string) => {
    switch (type) {
      case 'detect':
        check(row?.id);
        sessionStorage.setItem('road_detection_id', row?.id);
        timer = setInterval(async () => {
          check(row?.id);
        }, 3000);
        setOpen(true);
        // history.push(`/roadDetection/projectList/detect`);
        break;
      case 'detail':
        sessionStorage.setItem('road_detection_facId', row?.facId);
        sessionStorage.setItem('road_detection_checkType', row?.checkType);
        sessionStorage.setItem('road_detection_id', row?.id);
        history.push(`/roadDetection/projectList/detail`);
        break;
      case 'report':
        setEditInfo(row);
        setReportModal(true);
        break;
      case 'edit':
        setIsEdit(true);
        setEditInfo(row);
        setIsModalShow(true);
        break;
      case 'del':
        del(row, false);
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
    if (isExist(['roadDetection/projectList/index:btn_report']))
      menulist.push({ key: 'report', name: '报表' });
    if (isExist(['roadDetection/projectList/index:btn_edit']))
      menulist.push({ key: 'edit', name: '编辑' });
    if (isExist(['roadDetection/projectList/index:btn_del']))
      menulist.push({ key: 'del', name: '删除' });
    return menulist;
  };

  const onChange = (checkedValues: CheckboxValueType[]) => {
    console.log('checked = ', checkedValues);
    setCheckedType(checkedValues);
  };

  const columns: any = [
    { title: '序号', key: 'id', width: 100, type: 'sort' },
    { title: '项目名称', key: 'projectName', width: 200 },
    { title: '项目编号', key: 'projectNo', width: 200 },
    {
      title: '项目类型',
      key: 'projectTypeName',
      width: 120,
    },
    { title: '道路名称', key: 'facilitiesName', width: 200 },
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
    { title: '路面材质', key: 'pavementMaterialName', width: 120 },
    { title: '道路里程(m)', key: 'roadNum', width: 120 },
    { title: '检测方式', key: 'checkTypeName', width: 120 },
    { title: 'TCI', key: 'tci', width: 100 },
    { title: 'PCI', key: 'pci', width: 100 },
    { title: 'RQI', key: 'rqi', width: 100 },
    { title: 'PQI', key: 'pqi', width: 100 },
    { title: '检测时间', key: 'checkTime', width: 160 },
    {
      title: '操作',
      key: 'action',
      width: 160,
      type: 'operate',
      operateList: [
        {
          access: ['roadDetection/projectList/index:btn_detect'],
          more: false,
          name: '检测',
          type: 'detect',
          disabledKey: 'checkType', // 操作按钮根据某个字段禁用
          disabledList: [0], // 操作按钮根据哪些值禁用
        },
        {
          access: ['roadDetection/projectList/index:btn_detail'],
          more: false,
          name: '详情',
          type: 'detail',
        },
        {
          access: [
            'roadDetection/projectList/index:btn_report',
            'roadDetection/projectList/index:btn_edit',
            'roadDetection/projectList/index:btn_del',
          ],
          more: true,
          menuItems: menuItems(),
        },
      ],
    },
  ];

  const clear = () => {
    clearInterval(timer);
  };

  return (
    <div className={'commonTableClass'}>
      {/* 顶部按钮 */}
      <div className={'row-class'}>
        <div className="left-box">
          {isExist(['roadDetection/projectList/index:btn_add']) && (
            <Button
              className={'buttonClass'}
              type="primary"
              onClick={() => {
                setIsEdit(false);
                setEditInfo(null);
                setIsModalShow(true);
              }}
            >
              创建
            </Button>
          )}
          {isExist(['roadDetection/projectList/index:btn_export']) && (
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
          {isExist(['roadDetection/projectList/index:btn_delAll']) && (
            <Button
              className={'buttonClass'}
              disabled={selectedRows.length === 0}
              onClick={() => del({}, true)}
            >
              批量删除
            </Button>
          )}
        </div>
        <div className="right-search">
          <Search
            placeholder="请输入项目名称、项目编号关键字"
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
          url="/traffic/road/project/list"
          getSelectedRows={getSelectedRows}
        />
      </div>

      {reportModal && (
        <Modal
          title="检测报表导出"
          width={'513px'}
          bodyStyle={{
            paddingBottom: '20px',
          }}
          maskClosable={false}
          open={reportModal}
          onCancel={() => setReportModal(false)}
          onOk={exportFlie}
          style={{ top: 'calc(50vh - 150px)' }}
        >
          <Checkbox.Group defaultValue={['0', '1', '2']} onChange={onChange}>
            <Row style={{ marginBottom: '20px' }}>
              <Col>
                <Checkbox value="0">路面病害统计表</Checkbox>
              </Col>
            </Row>
            <Row style={{ marginBottom: '20px' }}>
              <Col>
                <Checkbox value="1">沿线设施损坏统计表</Checkbox>
              </Col>
            </Row>
            <Row>
              <Col>
                <Checkbox value="2">道路技术状况统计表</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Modal>
      )}

      {isModalShow && (
        <CreatEditProject
          isModalShow={isModalShow}
          isEdit={isEdit}
          editInfo={editInfo}
          onCancel={() => setIsModalShow(false)}
          onOk={() => {
            setIsModalShow(false);
            setkeywords();
          }}
        />
      )}

      {open && (
        <Modal
          title={false}
          closable={false}
          width={'520px'}
          bodyStyle={{
            paddingBottom: '20px',
          }}
          maskClosable={false}
          open={open}
          onCancel={() => {
            clear();
            setOpen(false);
          }}
          onOk={() => {
            // if ((hasChecked / allCheck) < 1) {
            //   message.warning({
            //     content: '正在进行路面病害检测，请稍等！',
            //     key: '正在进行路面病害检测，请稍等！',
            //   });
            //   return;
            // };
            clear();
            setOpen(false);
            history.push(`/roadDetection/projectList/detect`);
          }}
          okText="进行人工检测"
          style={{ top: 'calc(50vh - 150px)' }}
          okButtonProps={{ disabled: !!(hasChecked / allCheck < 1) || allCheck === 0 }}
          cancelButtonProps={{ disabled: !!(hasChecked / allCheck < 1) || allCheck === 0 }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <ExclamationCircleOutlined
                style={{ fontSize: '20px', color: '#ED7B2F', paddingRight: '12px' }}
              />
              <span>正在进行路面病害检测，请稍等！</span>
            </div>
            <Progress
              strokeColor="#0013C1"
              style={{ width: '436px' }}
              percent={(hasChecked / allCheck) * 100}
              format={() => `${hasChecked}/${allCheck}`}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
