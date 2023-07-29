import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Modal, Switch, Input } from 'antd';
import {
  sceneDel,
  roadDetail,
  sceneTypeTotal,
  doneCalibration,
  sceneTypeCheck,
  sceneIdentify,
} from '../../service';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import CreatOrEditSceneInfo from './CreatOrEditSceneInfo';
// import { useAccess } from 'umi';
import styles from '../../styles_wdz.less';
import Line from '../../../components/BaseLine';
// import CommonTable from '@/components/CommonTable';
import CommonTable from 'baseline/src/components/CommonTable';
import { commonDel } from 'baseline/src/utils/commonMethod';
import { SearchOutlined } from '@ant-design/icons';

export type Member = {};

const { confirm } = Modal;
type Iprops = {
  id: string;
  fkFacId: string;
};
const EdtMod: React.FC<Iprops> = (props) => {
  const [rowInfo, setRowInfo] = useState({});

  const [selectedRows, setSelectedRows] = useState<any>([]);

  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const [sublineDialogShow, setSublineDialogShow] = useState(false);

  const [sceneTypeList, setSceneTypeList] = useState<any>([]);

  const [isCreate, setIsCreate] = useState(false);
  const [checkStatus, setCheckStatus] = useState(false);
  const [keyword, setKeyword] = useState('');
  // const access: any = useAccess();

  const TableRef: any = useRef();

  // const [, updateState] = useState<any>();
  // const forceUpdate = useCallback(() => {
  //   updateState({});
  // }, []);

  const getIds = (type: any, id?: any) => {
    let ids: any = [];
    if (type === 'batch') {
      ids = selectedRowKey?.length === 0 ? [] : selectedRowKey;
    } else {
      ids = [id];
    }
    return ids;
  };

  const showEdit = async (todoinfo: any) => {
    setRowInfo(todoinfo);
  };
  // 场景类型统计
  const handleGetSceneTypeTotal = async () => {
    const res = await sceneTypeTotal({ proFacId: props.id });
    if (res.status === 0) {
      setSceneTypeList(res.data);
    }
  };
  const refreshTable = () => {
    TableRef.current.onSet('current');
  };
  const handleDel = (deleteType: any, text?: any) => {
    const params = {
      ids: getIds(deleteType, text?.id),
    };
    confirm({
      title: '场景信息将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const res = await sceneDel({ idList: params?.ids });
          if (res.status === 0) {
            hide();
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            refreshTable();
            handleGetSceneTypeTotal();
            return true;
          }
          return false;
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

  const handleEdit = async (text: any) => {
    showEdit(text);
    setIsCreate(false);
    setSublineDialogShow(true);
  };
  const columns: any = [
    { title: '序号', key: 'id', width: 60, type: 'sort' },
    {
      title: '位置截图',
      dataIndex: 'sceneImgUrl',
      key: 'sceneImgUrl',
      width: 129,
      ellipsis: true,
      type: 'previewImage',
    },
    {
      title: '场景名称',
      dataIndex: 'fkKeySceneName',
      key: 'fkKeySceneName',
      width: 214,
      ellipsis: true,
    },
    {
      title: '场景类型',
      dataIndex: 'fkSceneTypeName',
      key: 'fkSceneTypeName',
      width: 141,
      ellipsis: true,
    },
    {
      title: '上行起点',
      dataIndex: 'upStartPoint',
      key: 'upStartPoint',
      width: 162,
      ellipsis: true,
    },
    {
      title: '上行终点',
      dataIndex: 'upEndPoint',
      key: 'upEndPoint',
      width: 162,
      ellipsis: true,
    },
    {
      title: '下行起点',
      dataIndex: 'downStartPoint',
      key: 'downStartPoint',
      width: 162,
      ellipsis: true,
    },
    {
      title: '下行终点',
      dataIndex: 'downEndPoint',
      key: 'downEndPoint',
      width: 162,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 138,
      type: 'operate',
      operateList: [
        {
          access: [],
          more: false,
          name: '编辑',
          type: 'edit',
        },
        {
          access: [],
          more: false,
          name: '删除',
          type: 'del',
        },
      ],
    },
  ];

  const handleGetSceneStatus = async () => {
    const res = await roadDetail({
      id: props.id,
      latitude1: 38.043407,
      latitude2: 38.043408,
      latitude3: 38.043408,
      latitude4: 38.043407,
      longitude1: 114.517235,
      longitude2: 114.517235,
      longitude3: 114.517236,
      longitude4: 114.517236,
    });
    if (res.status === 0) {
      setCheckStatus(res?.data?.calibrationStatus !== 0);
    }
  };
  useEffect(() => {
    handleGetSceneTypeTotal();

    handleGetSceneStatus();
  }, [props.id]);

  const requestList = [
    { url: '/traffic-bsl/focusScene/facilitiesDrop', method: 'get' },
    { url: '/traffic-bsl/focusScene/typeDrop', method: 'get' },
    { url: '/traffic-bsl/project/delScene', method: 'DELETE' },
  ];
  // 删除
  const delRow = async (text: any, isBatch: boolean) => {
    const formData = new FormData();
    formData.append('idList', isBatch ? selectedRows : text?.id);
    const res = await commonDel('重点场景信息将删除，是否继续？', {
      ...requestList[2],
      params: formData,
    });
    if (res) {
      refreshTable();
      handleGetSceneTypeTotal();
    }
  };
  const rowMethods = (row: any, type: string) => {
    switch (type) {
      case 'edit':
        handleEdit(row);
        break;
      case 'del':
        delRow(row, false);
        break;
      default:
        break;
    }
  };
  const getSelectedRows = (rows: any) => {
    setSelectedRows(rows);
    setSelectedRowKey(rows);
  };
  const scroll = { x: 1400 };

  const handleToggleStatus = async () => {
    if (checkStatus) return;
    confirm({
      title: '是否完成场景标定？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          setCheckStatus(true);
          const parmas = {
            proFacId: props.id,
            projectId: sessionStorage.getItem('checkList_proId'),
          };
          const res = await doneCalibration(parmas);
          if (res.status === 0) {
            // todo
            message.success({
              content: '完成场景标定!',
              key: '完成场景标定!',
            });
            return true;
          }
          return false;
        } catch (error) {
          message.error({
            content: '未完成场景标定!',
            key: '未完成场景标定!',
          });
          return false;
        }
      },
      onCancel() {},
    });
  };

  const handleSceneRecognition = async () => {
    const checkRes = await sceneTypeCheck({});
    if (checkRes.status === 0) {
      const hide = message.loading({
        content: '正在识别场景',
        key: '正在识别场景',
      });
      try {
        const res = await sceneIdentify({ proFacId: props.id });
        if (res.status === 0) {
          hide();
          message.success({
            content: '识别成功!',
            key: '识别成功!',
          });
          refreshTable();
        }
      } catch (err) {
        hide();
        message.error({
          content: '识别场景失败!',
          key: '识别场景失败!',
        });
      }
    }
  };

  const searchKey = { proFacId: props.id, keyword };

  const handleSceneChange = (e: any) => {
    setKeyword(e.target.value || '');
  };
  return (
    <div className={styles.sceneInfo}>
      <div className={`commonTableClass ${styles.sceneInfoTop}`}>
        {/* 顶部按钮 */}
        <div className={'row-class tab-row-scene'}>
          <div className="left-box">
            <Button
              type="primary"
              className={'buttonClass'}
              onClick={() => {
                setIsCreate(true);
                setSublineDialogShow(true);
              }}
            >
              场景标定
            </Button>

            <Button
              type="primary"
              className={`buttonClass ${styles['second-button']}`}
              onClick={() => handleSceneRecognition()}
            >
              场景识别
            </Button>
            <Button
              className={'buttonClass'}
              disabled={selectedRowKey?.length === 0}
              onClick={() => handleDel('batch')}
            >
              批量删除
            </Button>
          </div>
          <div className={styles.sceneSearch}>
            <Switch
              className={styles.switchCls}
              onChange={() => handleToggleStatus()}
              checkedChildren="已完成"
              unCheckedChildren="未完成"
              disabled={checkStatus}
              checked={checkStatus}
            />
            <Input
              style={{ marginLeft: '20px' }}
              allowClear
              placeholder="场景类型搜索"
              suffix={<SearchOutlined style={{ color: '#8897AB' }} />}
              onChange={handleSceneChange}
            ></Input>
          </div>
        </div>
        {/* 表格 */}

        <CommonTable
          scroll={scroll}
          columns={columns}
          searchKey={searchKey}
          rowMethods={rowMethods}
          onRef={TableRef}
          isRefresh={true}
          url="/traffic-bsl/project/sceneList"
          getSelectedRows={getSelectedRows}
          pageName={'scene-info-page'}
        />

        {sublineDialogShow ? (
          <CreatOrEditSceneInfo
            onsetkey={() => refreshTable()}
            isShow={sublineDialogShow}
            editInfo={rowInfo}
            isCreate={isCreate}
            onCancel={() => {
              setSublineDialogShow(false);
              refreshTable();
              handleGetSceneTypeTotal();
            }}
            onContinue={() => {
              refreshTable();
            }}
            id={props.id}
            fkFacId={props.fkFacId}
          />
        ) : null}
      </div>

      {/* 场景类型统计 */}
      <div className={styles.sceneTypeLineWrapper}>
        <div className={styles.chartTitle}>场景类型统计</div>
        <div className={styles.chartWrapper}>
          <Line data={sceneTypeList} />
        </div>
      </div>
    </div>
  );
};
export default EdtMod;
