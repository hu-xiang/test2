import React, { useState, useEffect, useRef } from 'react';
import { Input, Select, Button } from 'antd';
import styles from './styles.less';
import SceneModal from './SceneModal';
import LocationModal from './LocationModal';
import CommonTable from '@/components/CommonTable';
import { commonRequest, isExist, commonDel } from 'baseline/src/utils/commonMethod';

const { Option } = Select;
const requestList = [
  { url: '/traffic-bsl/focusScene/facilitiesDrop', method: 'get' },
  { url: '/traffic-bsl/focusScene/typeDrop', method: 'get' },
  { url: '/traffic-bsl/focusScene/del', method: 'DELETE' },
];

const KeyScene: React.FC = () => {
  const scroll = { x: 1400, y: 'calc(100vh - 220px)' };
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [focusSceneName, setFocusSceneName] = useState<string>('');
  const [facilitiesName, setFacilitiesName] = useState<any>(null);
  const [sceneName, setSceneName] = useState<any>(null);
  const [facilitiesList, setFacilitiesList] = useState<any>([]);
  const [sceneTypeList, setSceneTypeList] = useState<any>([]);

  const [isModalshow, setIsModalshow] = useState(false);
  const [isLocationModalshow, setIsLocationModalshow] = useState(false);
  const [rowId, setRowId] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [editInfo, setEditInfo] = useState<any>();

  const TableRef: any = useRef();

  const [searchKey, setSearchKey] = useState<any>({
    focusSceneName,
    facilitiesName,
    sceneName,
  });

  // 点击查询
  const onSearch = () => {
    TableRef.current.onSet();
  };

  useEffect(() => {
    setSearchKey({
      focusSceneName,
      facilitiesName,
      sceneName,
    });
    const listener = (event: any) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault();
        onSearch();
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [focusSceneName, facilitiesName, sceneName]);

  const getFacilities = async () => {
    const res = await commonRequest(requestList[0]);
    setFacilitiesList(res?.data);
  };

  const getSceneType = async () => {
    const res = await commonRequest(requestList[1]);
    setSceneTypeList(res?.data);
  };

  const setkeywords = () => {
    getFacilities();
    getSceneType();
    TableRef.current.onSet();
  };

  useEffect(() => {
    getFacilities();
    getSceneType();
  }, []);

  // 清除
  const onSelNull = () => {
    setFocusSceneName('');
    setFacilitiesName('');
    setSceneName('');
  };

  // 删除
  const delRow = async (text: any, isBatch: boolean) => {
    const formData = new FormData();
    formData.append('idList', isBatch ? selectedRows : text?.id);
    const res = await commonDel('重点场景信息将删除，是否继续？', {
      ...requestList[2],
      params: formData,
    });
    if (res) setkeywords();
  };

  const rowMethods = (row: any, type: string) => {
    switch (type) {
      case 'watch':
        setRowId(row?.id);
        setIsLocationModalshow(true);
        break;
      case 'edit':
        setEditInfo(row);
        setIsEdit(true);
        setIsModalshow(true);
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
  };
  const columns: any = [
    { title: '序号', key: 'id', width: 60, type: 'sort' },
    { title: '重点场景名称', key: 'focusSceneName', width: 200 },
    { title: '重点场景编号', key: 'focusSceneNo', width: 200 },
    { title: '场景类型', key: 'sceneName', width: 160 },
    { title: '道路名称', key: 'facilitiesName', width: 200 },
    {
      title: '是否排查',
      key: 'checkStatus',
      width: 100,
      valueEnum: {
        0: '否',
        1: '是',
      },
    },
    {
      title: '操作',
      key: 'option',
      width: 150,
      type: 'operate',
      operateList: [
        {
          access: ['facilitymanage/keyscene/index:btn_watch'],
          more: false,
          name: '查看定位',
          type: 'watch',
        },
        {
          access: ['facilitymanage/keyscene/index:btn_edit'],
          more: false,
          name: '编辑',
          type: 'edit',
          disabledKey: 'flag',
          disabledList: [false],
        },
        {
          access: ['facilitymanage/keyscene/index:btn_del'],
          more: false,
          name: '删除',
          type: 'del',
          disabledKey: 'flag',
          disabledList: [false],
        },
      ],
    },
  ];

  return (
    <div id={styles.KeyScene} className="page-list-common page-normal">
      <div className={` ${styles.topSelect} head-one-box`}>
        <div className={`${styles.rowClass}`}>
          <span className={styles.inpBox}>
            <div className={styles.rowLabel1}>重点场景名称</div>
            <Input
              className={styles.comClass}
              autoComplete="off"
              maxLength={60}
              placeholder="请输入重点场景名称"
              value={focusSceneName}
              onChange={(e: any) => setFocusSceneName(e.target.value)}
            />
          </span>
          <span className={styles.inpBox}>
            <div className={styles.rowLabel}>场景类型</div>
            <Select
              allowClear
              placeholder="请选择"
              onChange={(e) => setSceneName(e)}
              value={sceneName}
            >
              {sceneTypeList?.map((item: any) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </span>

          <span className={styles.inpBox}>
            <div className={styles.rowLabel}>道路名称</div>
            <Select
              allowClear
              placeholder="请选择"
              onChange={(e) => setFacilitiesName(e)}
              value={facilitiesName}
            >
              {facilitiesList?.map((item: any) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </span>

          <div className={styles.selBtnBox}>
            <Button
              type="primary"
              onClick={() => {
                onSearch();
              }}
            >
              查询
            </Button>
            <Button
              onClick={() => {
                onSelNull();
              }}
            >
              清除
            </Button>
          </div>
        </div>
      </div>
      <div className={'row-button'}>
        {isExist(['facilitymanage/keyscene/index:btn_add']) && (
          <Button className={'buttonClass'} type="primary" onClick={() => setIsModalshow(true)}>
            创建
          </Button>
        )}
        {isExist(['facilitymanage/keyscene/index:btn_batchDel']) && (
          <Button
            className={'buttonClass'}
            type="primary"
            disabled={selectedRows.length === 0}
            onClick={() => delRow({}, true)}
          >
            批量删除
          </Button>
        )}
      </div>
      <div
        className={`page-table-one-box ${
          isExist([
            'facilitymanage/keyscene/index:btn_add',
            'facilitymanage/keyscene/index:btn_batchDel',
          ])
            ? null
            : `page-table-one-box-nobutton`
        }`}
      >
        <CommonTable
          scroll={scroll}
          searchKey={searchKey}
          rowMethods={rowMethods}
          onRef={TableRef}
          url="/traffic-bsl/focusScene/list"
          columns={columns}
          getSelectedRows={getSelectedRows}
          selectedDisabledKey="flag"
          selectedDisabledValue={[false]}
        />
      </div>
      {isModalshow ? (
        <SceneModal
          onsetkey={setkeywords}
          isEdit={isEdit}
          isModalshow={isModalshow}
          editInfo={editInfo}
          onCancel={() => {
            setIsEdit(false);
            setIsModalshow(false);
          }}
        />
      ) : null}
      {isLocationModalshow ? (
        <LocationModal
          isModalshow={isLocationModalshow}
          id={rowId}
          onCancel={() => {
            setIsLocationModalshow(false);
          }}
        />
      ) : null}
    </div>
  );
};
export default KeyScene;
