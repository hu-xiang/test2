import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.less';
import {
  Button,
  Select,
  TreeSelect,
  DatePicker,
  message,
  Image,
  Space,
  Input,
  Modal,
  Form,
} from 'antd';
import moment from 'moment';
import ProTable from '@ant-design/pro-table';
import MutiSelect from '../../../components/MutiSelect';
import { getDiseaseInfo, downloadExcel, dellistinfo, edtDescription, getListInfo } from './service';
import DistressCanvas from '../../../components/DistressCanvas';
import { useAccess } from 'umi';
import { useDiseaseScrollObj } from '../../../utils/tableScrollSet';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import TagInput from './tagInput';
import { exportCom } from '../../../utils/exportCom';
import { ReactComponent as ToolStart } from '../../../assets/img/toolkit/toolStart.svg';
import { getTenName, getTenDevice } from '../../../services/ant-design-pro/api';
import { isEqual } from 'lodash';

export type Member = {
  startTime: string;
  endTime: string;
  disease: string;
};
interface lsType {
  diseaseNameZh: string;
  area: string;
  length: string;
  collectTime: string;
  diseaseType: string;
}
const { Option } = Select;
const { confirm } = Modal;
const { RangePicker } = DatePicker;
const ls: lsType[] = [];
const defalutSearchKey = {
  startTime: undefined,
  endTime: undefined,
  diseaseType: [],
  keyword: undefined,
};

export default (): React.ReactElement => {
  const [pickTime, setPickTime] = useState<any>({
    startTime: moment().startOf('day').format('YYYY-MM-DD'),
    endTime: moment().endOf('day').format('YYYY-MM-DD'),
  });
  const [selTreeType, setSelTreeType] = useState(1);
  const [btnType, setBtnType] = useState(4);
  const totalLimit: number = 10000;
  const [dataTotal, setDataTotal] = useState<any>();
  const [edtList, setEdtList] = useState<any>(); //  记录错误描述编辑的顺序
  const [timerDate, setTimerDate] = useState<any>([moment().startOf('day'), moment().endOf('day')]);
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [comprehensiveSearch, setComprehensiveSearch] = useState();
  const [imgUrl, setImgUrl] = useState('');
  const [data, setData] = useState<any>({ ls });
  const [tableData, setTableData] = useState([]);
  const [postTData, setPostTData] = useState([]);
  const [info, setInfo] = useState<any>({});
  const access: any = useAccess();
  const [searchPage, setSearchPage] = useState(1);
  const [flag1, setFlag1] = useState(false);
  const [tenant, setTenant] = useState<any>();
  const [tenantId, setTenantId] = useState<any>();
  const [kind, setKind] = useState([]);
  const [kind2, setKind2] = useState([]);
  const formref = useRef<any>();
  const [movetenFlag, setMovetenFlag] = useState(false);
  const formref2 = useRef<any>();
  const [tenant2, setTenant2] = useState();
  const [device2, setDevice2] = useState();
  const [curPreviewRowId, setCurPreviewRowId] = useState<string>('');
  const [imgFlag, setImgFlag] = useState(false);
  const childRef: any = useRef<React.ElementRef<typeof MutiSelect>>();
  const [disease, setDisease] = useState<any[]>([]);
  const [searchKey, setSearchKey] = useState<any>({
    startTime: pickTime.startTime,
    endTime: pickTime.endTime,
    diseaseType: disease,
    keyword: comprehensiveSearch,
  });

  const actionRef = useRef<any>();
  const scrollObj = useDiseaseScrollObj(tableData, { x: 1200, y: 'calc(100vh - 400px)' });
  const getTen = async () => {
    try {
      const res: any = await getTenName();
      setKind(res.data);
      return true;
    } catch (error) {
      return false;
    }
  };
  useEffect(() => {
    getTen();
  }, []);
  useEffect(() => {
    if (btnType === 1) {
      setTimerDate([moment().startOf('week'), moment().endOf('week')]);
      setPickTime({
        startTime: moment().startOf('week').format('YYYY-MM-DD'),
        endTime: moment().endOf('week').format('YYYY-MM-DD'),
      });
    } else if (btnType === 2) {
      setTimerDate([moment().startOf('month'), moment().endOf('month')]);
      setPickTime({
        startTime: moment().startOf('month').format('YYYY-MM-DD'),
        endTime: moment().endOf('month').format('YYYY-MM-DD'),
      });
    } else if (btnType === 4) {
      setTimerDate([moment().startOf('day'), moment().endOf('day')]);
      setPickTime({
        startTime: moment().startOf('day').format('YYYY-MM-DD'),
        endTime: moment().endOf('day').format('YYYY-MM-DD'),
      });
    } else {
      setTimerDate([undefined, undefined]);
      setPickTime({
        startTime: undefined,
        endTime: undefined,
      });
    }
  }, [btnType]);
  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };
  // 时间
  const timeRangeSelect = (dates: any, dateStrings: any) => {
    if (dateStrings[0] === '' && dateStrings[1] !== '') {
      setTimerDate([undefined, moment(dateStrings[1], 'YYYY-MM-DD')]);
    } else if (dateStrings[1] === '' && dateStrings[0] !== '') {
      setTimerDate([moment(dateStrings[0], 'YYYY-MM-DD'), undefined]);
    } else if (dateStrings[1] === '' && dateStrings[0] === '') {
      setTimerDate([undefined, undefined]);
    } else {
      setTimerDate([moment(dateStrings[0], 'YYYY-MM-DD'), moment(dateStrings[1], 'YYYY-MM-DD')]);
    }

    setPickTime({ startTime: dateStrings[0], endTime: dateStrings[1] });
  };

  const previewBigImg = (url: string) => {
    setImgUrl(url);
  };
  const imgInfo = async (infos: any) => {
    if (!infos?.recode) return;
    const detRes = await getDiseaseInfo(
      infos.recode?.id,
      tenant2 || formref?.current?.getFieldsValue()?.tenant,
    );
    setData(detRes.data);
  };
  useEffect(() => {
    if (!data.ls.length && info?.recode?.id) {
      imgInfo(info);
    } else {
      setData({ ls: data.ls, url: data.url, num: 1 });
    }
  }, [imgFlag, imgUrl]);

  const handleExport = async () => {
    if (
      (selectedRowKey?.length === 0 && dataTotal > totalLimit) ||
      selectedRowKey?.length > totalLimit
    ) {
      message.error({
        content: `超过数据上限，最多可导出${totalLimit}条数据!`,
        key: `超过数据上限，最多可导出${totalLimit}条数据!`,
      });
      return;
    }
    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });
    const obj = {
      ids: selectedRowKey?.length === 0 ? [] : selectedRowKey,
      startTime: searchKey.startTime,
      endTime: searchKey.endTime,
      disease: searchKey.diseaseType,
      keyword: searchKey.keyword,
      deviceId: device2 || formref?.current?.getFieldsValue()?.device,
      tenant_id: tenant2 || formref?.current?.getFieldsValue()?.tenant,
    };

    try {
      const res: any = await downloadExcel(obj);
      hide();
      exportCom(res);
      message.success({
        content: '导出成功',
        key: '导出成功',
      });
    } catch (error) {
      hide();
      message.error({
        content: '导出失败!',
        key: '导出失败!',
      });
    }
  };
  const handleTableData = (dataArr: any) => {
    setPostTData(dataArr);
    return dataArr;
  };
  useEffect(() => {
    if (postTData?.length > 0) {
      const list = Array.from(postTData, (it: any) => {
        return { ...it, flag: true, value: it?.errorDescription, isChange: false };
      });
      setEdtList([...list]);
    }
  }, [postTData]);

  const onDel = (deleteType: any, text?: any) => {
    const newIds: any = deleteType === 'batch' ? selectedRowKey : text?.id;
    confirm({
      title: '错题信息将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const formData = new FormData();
          formData.append('ids', newIds);
          const res = await dellistinfo(
            formData,
            tenant2 || formref?.current?.getFieldsValue()?.tenant,
          );
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            setSelectedRowKey([]);
            actionRef.current.reload();
          }
          return true;
        } catch (error) {
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
      key: 'nums',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
      width: 80,
    },
    {
      title: '病害图片',
      dataIndex: 'imgUrl',
      key: 'imgUrl',
      width: 100,
      render: (text: any, recode: any) => {
        return (
          <>
            <Image
              src={text}
              style={{ width: 58, height: 46 }}
              placeholder={true}
              preview={{
                visible: imgFlag && curPreviewRowId === recode.id,
                src: imgUrl,
                onVisibleChange: (value) => {
                  setCurPreviewRowId(recode.id);
                  setImgFlag(value);
                  setInfo({ recode });

                  if (!value) {
                    setCurPreviewRowId('');
                    setData({ ls });
                    setImgUrl('');
                    setInfo({});
                  }
                },
              }}
            />
          </>
        );
      },
    },
    {
      title: '病害编号',
      dataIndex: 'diseaseNo',
      key: 'diseaseNo',
      width: 200,
      ellipsis: true,
    },
    {
      title: '图片名称',
      dataIndex: 'imgName',
      key: 'imgName',
      width: 240,
      ellipsis: true,
    },
    {
      title: '病害类型',
      dataIndex: 'diseaseNameZh',
      width: 160,
      ellipsis: true,
    },
    {
      title: '所在区域',
      dataIndex: 'address',
      key: 'address',
      width: 280,
      ellipsis: true,
    },
    {
      title: '错误描述',
      dataIndex: 'errorDescription',
      key: 'errorDescription',
      width: 180,
      render: (text: any, recode: any, index: any) => {
        const handleConfirmInput = async (value: any) => {
          const indexItem = edtList.findIndex((ii: any) => ii?.id === recode?.id);
          const listArr: any = edtList.slice();
          try {
            if (indexItem > -1) {
              if (listArr[indexItem].value !== value) {
                const res = await edtDescription(
                  {
                    address: recode?.address,
                    collectTime: recode?.collectTime,
                    diseaseNameZh: recode?.diseaseNameZh,
                    diseaseNo: recode?.diseaseNo,
                    diseaseType: recode?.diseaseType,
                    errorDescription: value,
                    id: recode?.id,
                    imgName: recode?.imgName,
                    imgUrl: recode?.imgUrl,
                  },
                  tenant2 || formref?.current?.getFieldsValue()?.tenant,
                );
                if (res.status === 0) {
                  listArr[indexItem].isChange = true;
                  listArr[indexItem].value = value;
                } else {
                  listArr[indexItem].isChange = false;
                }
              }
            }
          } catch (error) {
            listArr[indexItem].isChange = false;
            message.error({
              content: '编辑描述信息失败!',
              key: '编辑描述信息失败!',
            });
          } finally {
            listArr[indexItem] = { ...edtList[indexItem], flag: true };
            setEdtList([...listArr]);
          }
        };
        return (
          <div
            onDoubleClick={() => {
              const cList: any = edtList.slice();
              cList[index].flag = false;
              setEdtList([...cList]);
            }}
            style={edtList && edtList[index]?.isChange ? { color: '#3C7CE8' } : {}}
          >
            {edtList && !edtList[index]?.flag ? (
              <TagInput
                value={(edtList && edtList[index]?.value) || text}
                onChange={handleConfirmInput}
              />
            ) : (
              (edtList && edtList[index]?.value) || text
            )}
          </div>
        );
      },
    },
    {
      title: '采集时间',
      dataIndex: 'collectTime',
      key: 'collectTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (text: any) => {
        return (
          <Space size="middle">
            {access['errorBook/index:btn_del'] && (
              <a
                className={`ahover`}
                onClick={() => {
                  onDel('single', text);
                }}
              >
                {'删除'}
              </a>
            )}
          </Space>
        );
      },
    },
  ];

  // 选中当前行
  const onSelectChange = (selectedRowKeys: any) => {
    setSelectedRowKey(selectedRowKeys);
  };

  const clickRow = (record: any) => {
    const arr = selectedRowKey.filter((i) => i !== record.id);
    if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
    else setSelectedRowKey([...arr, record.id]);
  };
  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
      setTabpage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    setSelectedRowKey([]);
  };
  const onload = (dataSource: any) => {
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
  const handletreeselect = (value: any) => {
    // console.log('handleTreeSelect',value);
    setDisease(value);
  };

  const onSearch = () => {
    setSearchKey({
      startTime: pickTime.startTime,
      endTime: pickTime.endTime,
      diseaseType: disease,
      keyword: comprehensiveSearch,
    });
    setSelectedRowKey([]);
    setSearchPage(1);
    actionRef.current.reload();
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
  }, [pickTime, disease, comprehensiveSearch]);
  const clearPage = () => {
    if (!isEqual(defalutSearchKey, searchKey)) {
      setSearchPage(1);
      setSearchKey({ ...defalutSearchKey });
      setSelectedRowKey([]);
      actionRef.current.reload();
    }
  };
  const onSelNull = () => {
    setBtnType(3);
    setTimerDate([undefined, undefined]);
    setPickTime({ startTime: undefined, endTime: undefined });
    setDisease([]);
    setComprehensiveSearch(undefined);
    setSearchKey({
      startTime: undefined,
      endTime: undefined,
      diseaseType: [],
      keyword: undefined,
    });
    if (childRef?.current) {
      childRef?.current.clearFunc(true);
    }
    if (btnType === 3) setTimerDate([undefined, undefined]);
    clearPage();
  };
  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  //   setTabpage(page);
  //   setSelectedRowKey([]);
  //   // setTabpagesize(pageSize);
  // };
  const selSub = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        setFlag1(true);
        setTenantId(tenant?.value);
      })
      .catch(() => {});
  };
  const debouceSearch = (e: any) => {
    setComprehensiveSearch(e.target.value);
  };
  const selSub2 = async () => {
    formref2.current
      .validateFields()
      .then(async () => {
        setTenant2(formref2?.current?.getFieldsValue()?.tenant);
        setDevice2(formref2?.current?.getFieldsValue()?.device);
        actionRef.current.reload();
        setMovetenFlag(false);
        setTenantId(tenant?.value);
      })
      .catch(() => {});
  };
  const getDevice = async () => {
    try {
      const res: any = await getTenDevice({
        tenantId:
          formref2?.current?.getFieldsValue()?.tenant || formref?.current?.getFieldsValue()?.tenant,
      });
      const newData = res.data.map((i: any) => {
        return { label: i.deviceId, value: i.deviceId };
      });
      setKind2(newData || []);
      return true;
    } catch (error) {
      return false;
    }
  };
  const onSelTreeChange = (val: any) => {
    if (val.length === Object.keys(kind2).map((i: any) => i * 1).length) {
      setSelTreeType(1);
      return false;
    }
    setSelTreeType(0);
    return false;
  };
  const clickAll = () => {
    setSelTreeType(1);
    if (!kind2.length) {
      formref.current.setFieldsValue({ device: undefined });
      if (movetenFlag) {
        formref2.current.setFieldsValue({ device: undefined });
      }
    } else {
      const lists: any = [];
      kind2.map((i: any) => {
        lists.push(i.value);
        return true;
      });

      formref.current.setFieldsValue({ device: lists });
      if (movetenFlag) {
        formref2.current.setFieldsValue({ device: lists });
      }
    }
  };
  const clickNull = () => {
    setSelTreeType(2);
    formref.current.setFieldsValue({ device: [] });
    if (movetenFlag) {
      formref2.current.setFieldsValue({ device: [] });
    }
  };
  const dropdownRender: any = (originNode: any) => {
    return (
      <div>
        <div className={styles.selTreeBoxTen}>
          <div
            className={`${styles.selTreeAllOrNull} ${selTreeType === 1 ? styles.lightSelTree : ''}`}
            onClick={clickAll}
          >
            全选
          </div>
          <div
            className={`${styles.selTreeAllOrNull} ${selTreeType === 2 ? styles.lightSelTree : ''}`}
            onClick={clickNull}
          >
            清空
          </div>
        </div>
        {originNode}
      </div>
    );
  };

  return (
    <div id={styles.errorBookcontainer} className={'common-table-tenant'}>
      <div className={'ManualAuditToolContainer'} style={flag1 ? { display: 'none' } : {}}>
        <div className={'toolStartBox'}>
          <div className={'startBox'}>
            <ToolStart />
            <div className={`startIconBox`}>
              <div style={{ width: 300 }}>
                <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} ref={formref}>
                  <Form.Item
                    label="租户"
                    name="tenant"
                    rules={[{ required: true, message: '请选择租户' }]}
                  >
                    <Select
                      style={{ height: 40 }}
                      placeholder="请选择租户"
                      onChange={(e: any, val: any) => {
                        getDevice();
                        setTenant(val);
                        if (!val) {
                          formref?.current?.setFieldsValue({ device: undefined });
                        }
                      }}
                      allowClear
                    >
                      {Object.values(kind).map((item: any) => (
                        <Option key={item.tenantName} value={item.id}>
                          {item.tenantName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="设备"
                    name="device"
                    rules={[{ required: true, message: '请选择设备' }]}
                  >
                    <TreeSelect
                      treeData={kind2}
                      // value={selectTreeVal}
                      onChange={onSelTreeChange}
                      treeCheckable="true"
                      allowClear={true}
                      disabled={!tenant}
                      className={'treeselBox'}
                      showCheckedStrategy="SHOW_PARENT"
                      dropdownRender={dropdownRender}
                      placeholder="请选择设备"
                      maxTagCount={'responsive'}
                    />
                  </Form.Item>
                </Form>
              </div>
              <Button
                type="primary"
                className={'startIconBtn'}
                onClick={() => {
                  selSub();
                }}
              >
                查询
              </Button>
            </div>
          </div>
        </div>
      </div>
      {flag1 ? (
        <div style={!flag1 ? { display: 'none' } : {}}>
          <div className={'ten-move-box'}>
            <Button type="primary" style={{ float: 'right' }} onClick={() => setMovetenFlag(true)}>
              切换租户
            </Button>
          </div>
          <div className={` ${styles.topSelect} top-head-box`}>
            <div style={{ minWidth: 1240 }}>
              <div className={`${styles.rowClass}`}>
                <span className={styles.inpBox}>
                  综合搜索
                  <Input
                    className={styles.comClass}
                    autoComplete="off"
                    placeholder="编号/名称/区域/描述"
                    value={comprehensiveSearch}
                    onChange={(e) => debouceSearch(e)}
                  />
                </span>
                <span className={`${styles.inpBox} ${styles.inpBox3}`}>
                  病害类型
                  <MutiSelect
                    urgency={''}
                    tenantId={tenantId}
                    onRef={childRef}
                    handletreeselect={handletreeselect}
                  />
                </span>
                <span className={` ${styles.timerBox} ${styles.timerBox1}`}>
                  <span style={{ marginRight: 10 }}>采集时间:</span>
                  <div
                    onClick={() => setBtnType(4)}
                    className={`${styles.dateSel} ${btnType === 4 && styles.btnLight}`}
                  >
                    今日
                  </div>
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
                      disabled={btnType === 1 || btnType === 2 || btnType === 4}
                      inputReadOnly
                      // format="YYYY-MM-DD"
                      // showTime
                      disabledDate={disabledDate}
                      onChange={timeRangeSelect}
                      value={timerDate}
                    />
                  </span>
                </span>
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
          <div className="row-button">
            {access['errorBook/index:btn_batchExport_list'] && (
              <Button
                type="primary"
                className={'buttonClass'}
                disabled={dataTotal === 0}
                onClick={() => {
                  if (selectedRowKey.length === 0) {
                    confirm({
                      title: '是否导出查询列表所有数据？',
                      icon: <ExclamationCircleOutlined />,
                      okText: '确定',
                      okType: 'danger',
                      cancelText: '取消',
                      async onOk() {
                        return handleExport();
                      },
                      onCancel() {},
                    });
                  } else {
                    handleExport();
                  }
                }}
              >
                批量导出
              </Button>
            )}
            {access['errorBook/index:btn_batchDelete'] && (
              <Button
                className={'buttonClass'}
                type="primary"
                disabled={selectedRowKey.length === 0}
                onClick={() => {
                  onDel('batch');
                }}
              >
                批量删除
              </Button>
            )}
          </div>
          <div
            className={`table-box ${
              access['errorBook/index:btn_batchExport_list'] ||
              access['errorBook/index:btn_batchDelete']
                ? null
                : `table-box-nobutton`
            }`}
          >
            <ProTable<Member>
              columns={columns}
              actionRef={actionRef}
              request={async (params) => {
                const res = await getListInfo(params);
                setDataTotal(res.total * 1);
                // 表单搜索项会从 params 传入，传递给后端接口。
                return res;
              }}
              postData={handleTableData}
              params={{
                startTime: searchKey.startTime && `${searchKey.startTime} 00:00:00`,
                endTime: searchKey.endTime && `${searchKey.endTime} 23:59:59`,
                disease: searchKey.diseaseType,
                keyword: searchKey.keyword,
                // current: searchPage,
                tenant_id: tenant2 || formref?.current?.getFieldsValue()?.tenant,
                deviceId: device2 || formref?.current?.getFieldsValue()?.device,
              }}
              rowKey="id"
              rowSelection={{
                selectedRowKeys: selectedRowKey,
                type: 'checkbox',
                onChange: onSelectChange,
              }}
              onRow={(record) => {
                return {
                  onClick: (e: any) => {
                    if (
                      e?.target &&
                      (e?.target?.nodeName === 'svg' || e?.target?.nodeName === 'path')
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
              tableAlertRender={false}
              pagination={{
                showQuickJumper: false,
                defaultPageSize: 20,
                current: searchPage,
                // onChange: pageChange,
              }}
              toolBarRender={false}
              search={false}
              scroll={scrollObj || { x: '100%' }}
              // onRequestError={reqErr}
              onChange={changetabval}
              onLoad={onload}
            />
          </div>
        </div>
      ) : null}
      {movetenFlag ? (
        <Modal
          title={`切换租户`}
          open={movetenFlag}
          onCancel={() => setMovetenFlag(false)}
          className="moveten"
          onOk={() => {
            selSub2();
          }}
        >
          <Form
            labelAlign="right"
            labelCol={{ flex: '50px' }}
            labelWrap
            wrapperCol={{ flex: 1 }}
            ref={formref2}
            colon={false}
          >
            <Form.Item
              label="租户"
              name="tenant"
              rules={[{ required: true, message: '请选择租户' }]}
            >
              <Select
                style={{ height: 40 }}
                placeholder="请选择租户"
                onChange={(e: any, val: any) => {
                  getDevice();
                  setTenant(val);
                  if (!val) {
                    formref2?.current?.setFieldsValue({ device: undefined });
                  }
                }}
                allowClear
              >
                {Object.values(kind).map((item: any) => (
                  <Option key={item.tenantName} value={item.id}>
                    {item.tenantName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="设备"
              name="device"
              rules={[{ required: true, message: '请选择设备' }]}
            >
              <TreeSelect
                treeData={kind2}
                // value={selectTreeVal}
                onChange={onSelTreeChange}
                treeCheckable="true"
                allowClear={true}
                disabled={!tenant}
                className={'treeselBox'}
                showCheckedStrategy="SHOW_PARENT"
                dropdownRender={dropdownRender}
                placeholder="请选择设备"
                maxTagCount={'responsive'}
              />
            </Form.Item>
          </Form>
        </Modal>
      ) : null}
      {imgFlag ? (
        <>
          <DistressCanvas setImgUrl={previewBigImg} data={data} />{' '}
        </>
      ) : (
        ''
      )}
    </div>
  );
};
