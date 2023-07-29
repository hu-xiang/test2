import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.less';
import moment from 'moment';
import { ProTable } from '@ant-design/pro-table';
import { Input, Select, Button, Space, message, Modal, DatePicker, Image } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useAccess } from 'umi';
import { useScrollObjSta } from '@/utils/tableScrollSet';
import { useLocalStorageState } from 'ahooks';
import { getListInfo, underDel, underBatchDel } from './service';
import LandModal from './LandModal';
import LocationModal from './LocationModal';

const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;
export type TableListItem = {
  id: number;
  fileUrl: number;
  diseaseNo: string | number;
  projectName: string;
  diseaseType: string | number;
  riskLv: string | number;
  address: string;
  roadName: string;
  commitTime: string;
  maintenanceCost: string;
};

export default (): React.ReactElement => {
  // 表格数据
  const [tableData, setTableData] = useState([]);
  // 表格选中行
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  // 当前页
  const [searchPage, setSearchPage] = useState(1);
  // 表格每页数量
  const [tabpagesize, setTabpagesize] = useState(20);
  const [isModalshow, setIsModalshow] = useState(false);
  const [isLocationModalshow, setIsLocationModalshow] = useState(false);
  const [rowId, setRowId] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [editInfo, setEditInfo] = useState<any>();
  // 综合查询
  const [keyword, setKeyword] = useState();
  // 风险等级
  const [riskLvList, setRiskLvList] = useState<any>([]);
  // 病害类型
  const [diseaseTypeList, setDiseaseTypeList] = useState<any>([]);
  // 道路名称
  const [roadName, setRoadName] = useState();
  // 提交时间的按钮类型
  const [btnType, setBtnType] = useState(2);
  //
  const [timerDate, setTimerDate] = useState<any>([undefined, undefined]);
  const [pickTime, setPickTime] = useState<any>({ startTime: undefined, endTime: undefined });
  const [timerDateCopy, setTimerDateCopy] = useLocalStorageState<any>('timerDateCopy', {
    timerDateCopy: [undefined, undefined],
  });

  const [searchKey, setSearchKey] = useState<any>({
    startTime:
      (timerDateCopy[0] && moment(timerDateCopy[0]).format('YYYY-MM-DD HH:mm:ss')) ||
      pickTime.startTime ||
      moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
    endTime:
      (timerDateCopy[1] && moment(timerDateCopy[1]).format('YYYY-MM-DD HH:mm:ss')) ||
      pickTime.endTime ||
      moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
    // startTime: pickTime.startTime,
    // endTime: pickTime.endTime,
    riskLvList,
    diseaseTypeList,
    keyword,
    roadName,
  });
  const scrollObj = useScrollObjSta(tableData, { x: 1200, y: 'calc(100vh - 287px)' });
  const ref = useRef<any>();
  const riskLvEnum = {
    0: 'I',
    1: 'II',
    2: 'III',
    3: 'IV',
    4: '安全',
  };

  const diseaseTypeEnum = {
    0: '空洞',
    1: '脱空',
    2: '一般疏松',
    3: '严重疏松',
    4: '富水',
  };

  useEffect(() => {
    if (btnType === 1) {
      setTimerDate([moment().startOf('week'), moment().endOf('week')]);
      setPickTime({
        startTime: moment().startOf('week').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().endOf('week').format('YYYY-MM-DD HH:mm:ss'),
      });
    } else if (btnType === 2) {
      setTimerDate([moment().startOf('month'), moment().endOf('month')]);
      setPickTime({
        startTime: moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
      });
    } else {
      setTimerDate([undefined, undefined]);
    }
  }, [btnType]);

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
  const access: any = useAccess();

  const setkeywords = () => {
    ref.current.reload();
  };

  // 表格选中变化
  const onSelectChange = (selectedRowKeys: any) => {
    setSelectedRowKey(selectedRowKeys);
  };

  // 点击表格行
  const clickRow = (record: any) => {
    const arr = selectedRowKey.filter((i: any) => i !== record.id);
    if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
    else setSelectedRowKey([...arr, record.id]);
  };

  // 表格变化
  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    setSelectedRowKey([]);
  };

  // 禁用今天后的日期
  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };

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

  // 点击查询
  const onSearch = () => {
    setSearchKey({
      startTime: pickTime.startTime,
      endTime: pickTime.endTime,
      riskLvList,
      diseaseTypeList,
      keyword,
      roadName,
    });
    setSearchPage(1);
    ref.current.reload();
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
  }, [pickTime, keyword, riskLvList, diseaseTypeList, roadName]);

  // 清除
  const onSelNull = () => {
    setBtnType(3);
    setTimerDate([undefined, undefined]);
    setPickTime({ startTime: undefined, endTime: undefined });
    setRiskLvList(undefined);
    setDiseaseTypeList(undefined);
    setRoadName(undefined);
    setKeyword(undefined);
    if (btnType === 3) setTimerDate([undefined, undefined]);
    setTimerDateCopy([undefined, undefined]);
  };

  // 判断是否有表格上面操作按钮权限，给特定样式
  const isExist = () => {
    const arrlist = [
      'diseasemanage/landdiseaselist/index:btn_add',
      'diseasemanage/landdiseaselist/index:btn_delList',
    ];
    const rec = arrlist.some((it: string) => {
      if (access[it]) {
        return true;
      }
      return false;
    });
    return rec;
  };

  // 删除
  const delRow = (text: any, isBatch: boolean) => {
    confirm({
      title: '病害信息将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        if (isBatch) formData.append('ids', selectedRowKey);
        else formData.append('id', text.props.text.id);
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const res = isBatch ? await underBatchDel(formData) : await underDel(formData);
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            if (isBatch) setSelectedRowKey([]);
            setkeywords();
          } else {
            // message.error({
            //   content: res.message,
            //   key: res.message,
            // });
          }
          return true;
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

  const columns: any = [
    {
      title: '序号',
      key: 'id',
      render: (text: any, record: any, index: any) =>
        `${(searchPage - 1) * tabpagesize + (index + 1)}`,
      width: 50,
    },
    {
      title: '报告图片',
      dataIndex: 'fileUrl',
      key: 'fileUrl',
      width: 80,
      render: (text: any) => {
        return <Image src={text} style={{ width: 58, height: 46 }} placeholder={true} />;
      },
    },
    {
      title: '病害编号',
      dataIndex: 'diseaseNo',
      key: 'diseaseNo',
      width: 100,
      ellipsis: true,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '病害类型',
      dataIndex: 'diseaseType',
      key: 'diseaseType',
      width: 100,
      ellipsis: true,
      valueEnum: diseaseTypeEnum,
    },
    {
      title: '风险等级',
      dataIndex: 'riskLv',
      key: 'riskLv',
      width: 100,
      valueEnum: riskLvEnum,
    },
    {
      title: '所在区域',
      dataIndex: 'address',
      key: 'address',
      width: 160,
      ellipsis: true,
    },
    {
      title: '道路名称',
      dataIndex: 'roadName',
      key: 'roadName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '提交日期',
      dataIndex: 'commitTime',
      key: 'commitTime',
      width: 160,
    },
    {
      title: '预估养护费用',
      dataIndex: 'maintenanceCost',
      key: 'maintenanceCost',
      width: 120,
    },
    {
      title: '操作',
      key: 'option',
      width: 160,
      fixed: 'right',
      valueType: 'option',
      render: (text: any, recode: any) => (
        <Space size="middle">
          {access['diseasemanage/landdiseaselist/index:cat_location'] && (
            <a
              className="ahover"
              onClick={() => {
                setRowId(recode.id);
                setIsLocationModalshow(true);
              }}
            >
              查看定位
            </a>
          )}
          {access['diseasemanage/landdiseaselist/index:btn_edt'] && (
            <a
              className="ahover"
              onClick={() => {
                recode.commitTime1 = recode.commitTime ? moment(recode.commitTime) : '';
                setEditInfo(recode);
                setIsEdit(true);
                setIsModalshow(true);
              }}
            >
              编辑
            </a>
          )}
          {access['diseasemanage/landdiseaselist/index:btn_del'] && (
            <a className="ahover" onClick={() => delRow(text, false)}>
              删除
            </a>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div id={styles.container} className="page-list-common">
      <div className={` ${styles.topSelect} head-two-box`}>
        <div className={styles.rowClass}>
          <span className={styles.inpBox}>
            综合搜索
            <Input
              className={styles.comClass}
              autoComplete="off"
              maxLength={60}
              placeholder="请输入病害编号、项目名称、所在区域"
              value={keyword}
              onChange={(e: any) => setKeyword(e.target.value)}
            />
          </span>
          <span className={styles.inpBox}>
            风险等级
            <Select
              allowClear
              placeholder="请选择"
              mode="multiple"
              maxTagCount="responsive"
              onChange={(e) => setRiskLvList(e)}
              value={riskLvList}
            >
              {Object.keys(riskLvEnum).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {riskLvEnum[item]}
                </Option>
              ))}
            </Select>
          </span>
          <span className={styles.inpBox}>
            病害类型
            <Select
              allowClear
              mode="multiple"
              maxTagCount="responsive"
              placeholder="请选择"
              style={{ marginRight: 0 }}
              onChange={(e) => setDiseaseTypeList(e)}
              value={diseaseTypeList}
            >
              {Object.keys(diseaseTypeEnum).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {diseaseTypeEnum[item]}
                </Option>
              ))}
            </Select>
          </span>
          <span className={styles.inpBox}>
            道路名称
            <Input
              className={styles.comClass}
              autoComplete="off"
              maxLength={60}
              placeholder="请输入道路名称"
              value={roadName}
              onChange={(e: any) => setRoadName(e.target.value)}
            />
          </span>
        </div>
        <div className={`${styles.rowClass} `}>
          <span className={` ${styles.timerBox}`}>
            <div className={styles.labelBox}>提交日期</div>
            <div
              onClick={() => setBtnType(1)}
              className={`${styles.dateSel} ${btnType === 1 && styles.btnLight}`}
            >
              本周
            </div>
            <div
              onClick={() => setBtnType(2)}
              className={`${styles.dateSel} ${btnType === 2 && styles.btnLight}`}
            >
              本月
            </div>
            <div
              onClick={() => setBtnType(3)}
              className={`${styles.dateSel} ${btnType === 3 && styles.btnLight}`}
            >
              自定义
            </div>
            <span className={styles.timeBox}>
              <RangePicker
                // showTime
                disabled={btnType === 1 || btnType === 2}
                inputReadOnly
                format="YYYY-MM-DD HH:mm:ss"
                showTime
                disabledDate={disabledDate}
                onChange={timeRangeSelect}
                value={timerDate}
              />
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
                // className="kong-btn"
                // disabled={selectedRowKey.length === 0}
                onClick={() => {
                  onSelNull();
                }}
              >
                清除
              </Button>
            </div>
          </span>
        </div>
      </div>
      <div className={'row-button'}>
        {access['diseasemanage/landdiseaselist/index:btn_add'] && (
          <Button className={'buttonClass'} type="primary" onClick={() => setIsModalshow(true)}>
            新增
          </Button>
        )}
        {access['diseasemanage/landdiseaselist/index:btn_delList'] && (
          <Button
            className={'buttonClass'}
            disabled={selectedRowKey.length === 0}
            onClick={() => delRow({}, true)}
          >
            批量删除
          </Button>
        )}
      </div>
      <div className={`page-table-two-box ${isExist() ? null : `page-table-two-box-nobutton`}`}>
        <ProTable<TableListItem>
          columns={columns}
          onLoad={onLoad}
          params={{
            ...searchKey,
          }}
          request={async (params) => {
            const res = await getListInfo(params);
            // 表单搜索项会从 params 传入，传递给后端接口。
            return res;
          }}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedRowKey,
            type: 'checkbox',
            onChange: onSelectChange,
          }}
          onRow={(record: any) => {
            return {
              onClick: (e: any) => {
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
          pagination={{
            showQuickJumper: false,
            current: searchPage,
          }}
          tableAlertRender={false}
          toolBarRender={false}
          search={false}
          actionRef={ref}
          scroll={scrollObj || { x: '100%' }}
          onChange={changetabval}
        />
      </div>
      {isModalshow ? (
        <LandModal
          onsetkey={setkeywords}
          isEdit={isEdit}
          isModalshow={isModalshow}
          editInfo={editInfo}
          onCancel={() => {
            setIsEdit(false);
            setIsModalshow(false);
            // setkeywords();
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
