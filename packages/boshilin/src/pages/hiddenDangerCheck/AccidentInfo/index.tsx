import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Select, DatePicker } from 'antd';
import { isExist, commonDel } from 'baseline/src/utils/commonMethod';
import CommonTable from 'baseline/src/components/CommonTable';
import AccidentModal from './AccidentModal';
import ImportModal from './ImportModal';
import moment from 'moment';
import styles from './styles.less';
import { isEqual } from 'lodash';

const { Option } = Select;
const { RangePicker } = DatePicker;

const accidentRank = {
  1: '轻微事故',
  2: '一般事故',
  3: '重大事故',
  4: '特大事故',
};

const requestList = [
  { url: '/traffic-bsl/accident/del', method: 'DELETE' },
  { url: '/traffic-bsl/accident/delBatch', method: 'DELETE' },
];
const defalutSearchKey = {
  startTime: undefined,
  endTime: undefined,
  facilitiesName: undefined,
  level: undefined,
};
export default (): React.ReactElement => {
  const ChildRef = useRef<any>();
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [keyword, setKeyword] = useState<any>('');
  const [level, setLevel] = useState<number>();
  const [btnType, setBtnType] = useState<number>(3);
  const [timerDate, setTimerDate] = useState<any>([undefined, undefined]);
  const [pickTime, setPickTime] = useState<any>({
    startTime: moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
  });
  const [isImportModal, setIsImportModal] = useState<boolean>(false);
  const [isShow, setIsShow] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [rowId, setRowId] = useState<string | number>();

  useEffect(() => {}, []);

  const getSelectedRows = (rows: any) => {
    setSelectedRows(rows);
  };

  const setkeywords = () => {
    ChildRef.current.onSet();
  };

  const del = async (text: any, isBatch: boolean) => {
    const formData = new FormData();
    if (isBatch) {
      formData.append('idList', selectedRows);
    } else {
      formData.append('id', text.id);
    }

    const res: any = await commonDel(
      '事故信息将删除，是否继续？',
      isBatch
        ? {
            ...requestList[1],
            params: formData,
          }
        : {
            ...requestList[0],
            params: formData,
          },
    );
    if (res) setkeywords();
  };

  // 点击查询
  const onSearch = () => {
    setkeywords();
  };

  useEffect(() => {
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
  }, [pickTime, keyword, level]);

  const clearPage = () => {
    const searchKey = {
      startTime: pickTime.startTime,
      endTime: pickTime.endTime,
      facilitiesName: keyword,
      level,
    };
    // console.log('ddddd',searchKey);
    if (!isEqual(defalutSearchKey, searchKey)) {
      ChildRef?.current?.onClearSearch();
    }
  };
  // 清除
  const onSelNull = () => {
    setBtnType(3);
    setTimerDate([undefined, undefined]);
    setPickTime({ startTime: undefined, endTime: undefined });
    setLevel(undefined);
    setKeyword(undefined);
    clearPage();
  };

  const rowMethods = async (row: any, type: string) => {
    switch (type) {
      case 'edit':
        setRowId(row?.id);
        setIsEdit(true);
        setIsShow(true);
        break;
      case 'del':
        del(row, false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (btnType === 1) {
      setTimerDate([moment().startOf('month'), moment().endOf('month')]);
      setPickTime({
        startTime: moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
      });
    } else if (btnType === 2) {
      setTimerDate([moment().startOf('year'), moment().endOf('year')]);
      setPickTime({
        startTime: moment().startOf('year').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().endOf('year').format('YYYY-MM-DD HH:mm:ss'),
      });
    } else {
      setTimerDate([undefined, undefined]);
      setPickTime({
        startTime: undefined,
        endTime: undefined,
      });
    }
  }, [btnType]);

  // 查询自定义日期设置
  const timeRangeSelect = (dates: any, dateStrings: any) => {
    if (dateStrings[0] === '' && dateStrings[1] !== '') {
      setTimerDate([undefined, moment(dateStrings[1], 'YYYY-MM-DD HH:mm:ss')]);
    } else if (dateStrings[1] === '' && dateStrings[0] !== '') {
      setTimerDate([moment(dateStrings[0], 'YYYY-MM-DD HH:mm:ss'), undefined]);
    } else if (dateStrings[1] === '' && dateStrings[0] === '') {
      setTimerDate([undefined, undefined]);
    } else {
      setTimerDate([
        moment(dateStrings[0], 'YYYY-MM-DD HH:mm:ss'),
        moment(dateStrings[1], 'YYYY-MM-DD HH:mm:ss'),
      ]);
    }

    setPickTime({ startTime: dateStrings[0], endTime: dateStrings[1] });
  };

  const columns: any = [
    { title: '编号', key: 'id', width: 60, type: 'sort' },
    { title: '事故标题', key: 'title', width: 200 },
    { title: '事故编号', key: 'accidentNo', width: 200 },
    { title: '桩号位置', key: 'stakeNo', width: 120 },
    { title: '事故等级', key: 'levelName', width: 100 },
    { title: '事故地点', key: 'address', width: 200 },
    { title: '所属道路', key: 'facilitiesName', width: 160 },
    { title: '死亡人数', key: 'deadCount', width: 80 },
    { title: '受伤人数', key: 'hurtCount', width: 80 },
    { title: '财产损失(万元)', key: 'moneyLoss', width: 160 },
    { title: '事故描述', key: 'description', width: 200 },
    { title: '事故时间', key: 'happenTime', width: 160 },
    {
      title: '操作',
      key: 'option',
      width: 100,
      type: 'operate',
      operateList: [
        {
          access: ['hiddenDangerCheck/accidentInfo:btn_edit'],
          more: false,
          name: '编辑',
          type: 'edit',
        },
        {
          access: ['hiddenDangerCheck/accidentInfo:btn_del'],
          more: false,
          name: '删除',
          type: 'del',
        },
      ],
    },
  ];

  return (
    <div id={styles.accidentBox} className="page-list-common page-normal">
      <div className={` ${styles.topSelect} head-one-box`}>
        <div className={`${styles.rowClass}`}>
          <span className={styles.inpBox}>
            <div className={styles.rowLabel}>道路名称</div>
            <Input
              className={styles.comClass}
              autoComplete="off"
              maxLength={60}
              placeholder="请输入道路名称关键字"
              value={keyword}
              onChange={(e: any) => setKeyword(e.target.value)}
            />
          </span>
          <span className={styles.inpBox}>
            <div className={styles.rowLabel}>事故等级</div>
            <Select allowClear placeholder="请选择" onChange={(e) => setLevel(e)} value={level}>
              {Object.keys(accidentRank).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {accidentRank[item]}
                </Option>
              ))}
            </Select>
          </span>

          <div className={styles.timeBox}>
            <div className={styles.itemLabel}>创建时间</div>
            <div className={styles.itemTime}>
              <div className={styles.btn}>
                <div
                  onClick={() => setBtnType(1)}
                  className={`${btnType === 1 && styles.btnLight}`}
                >
                  本月
                </div>
                <div
                  onClick={() => setBtnType(2)}
                  className={`${btnType === 2 && styles.btnLight}`}
                >
                  本年
                </div>
                <div
                  onClick={() => setBtnType(3)}
                  className={`${btnType === 3 && styles.btnLight}`}
                >
                  自定义
                </div>
              </div>
              <div className={styles.timeSelect}>
                <RangePicker
                  disabled={btnType !== 3}
                  inputReadOnly
                  format="YYYY-MM-DD HH:mm:ss"
                  // disabledDate={disabledDate}
                  showTime={{
                    defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                  }}
                  onChange={timeRangeSelect}
                  value={timerDate}
                />
              </div>
            </div>
          </div>

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
        {isExist(['hiddenDangerCheck/accidentInfo:btn_add']) && (
          <Button
            type="primary"
            onClick={() => {
              setIsEdit(false);
              setIsShow(true);
            }}
          >
            创建
          </Button>
        )}
        {isExist(['hiddenDangerCheck/accidentInfo:btn_import']) && (
          <Button onClick={() => setIsImportModal(true)}>批量导入</Button>
        )}
        {isExist(['hiddenDangerCheck/accidentInfo:btn_batchDel']) && (
          <Button disabled={!selectedRows?.length} onClick={() => del({}, true)}>
            批量删除
          </Button>
        )}
      </div>
      <div
        className={`page-table-one-box ${
          isExist([
            'hiddenDangerCheck/accidentInfo:btn_add',
            'hiddenDangerCheck/accidentInfo:btn_import',
            'hiddenDangerCheck/accidentInfo:btn_batchDel',
          ])
            ? null
            : `page-table-one-box-nobutton`
        }`}
      >
        <CommonTable
          scroll={{ x: 950, y: 'calc(100vh - 264px)' }}
          columns={columns}
          searchKey={{
            startTime: pickTime.startTime,
            endTime: pickTime.endTime,
            facilitiesName: keyword,
            level,
          }}
          onRef={ChildRef}
          rowMethods={rowMethods}
          url="/traffic-bsl/accident/list"
          getSelectedRows={getSelectedRows}
        />
      </div>
      {isShow ? (
        <AccidentModal
          isShow={isShow}
          id={rowId}
          isEdit={isEdit}
          onCancel={() => setIsShow(false)}
          onOk={() => {
            setIsShow(false);
            setkeywords();
          }}
        />
      ) : null}
      {isImportModal && (
        <ImportModal
          isImportModal={isImportModal}
          onCancel={() => setIsImportModal(false)}
          onOk={() => {
            setIsImportModal(false);
            setkeywords();
          }}
        />
      )}
    </div>
  );
};
