import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.less';
import { ReactComponent as ToolStart } from '../../../assets/img/toolkit/toolStart.svg';
import { Button, Select, DatePicker, message, Image, Space, Input, Modal, Form } from 'antd';
import moment from 'moment';
import ProTable from '@ant-design/pro-table';
import { getDiseaseInfo, getRemListInfo, downlodExcel } from './service';
import DistressCanvas from '../../../components/DistressCanvas';
import { useAccess } from 'umi';
import { useDiseaseScrollObj } from '../../../utils/tableScrollSet';
import DuplicatesList from './components/duplicatesList';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { isNaN, isEqual } from 'lodash';
import { exportCom } from '../../../utils/exportCom';
import { ReactComponent as LeftImg } from '../../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightImg } from '../../../assets/img/leftAndRight/rightImg.svg';
import { diseaseAll1, disease3 } from '../../../utils/dataDic';
import { getTenName, getTenDevice } from '../../../services/ant-design-pro/api';

export type Member = {
  startTime: string;
  endTime: string;
  checkCode: string;
  disease: string;
  diseaseImp: string;
  fkFacilitiesId: number;
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
const ls: lsType[] = [];
// const { AMap }: any = window;

export default (): React.ReactElement => {
  const [btnType, setBtnType] = useState(1);
  // const [exportFlag, setExportFlag] = useState<boolean>(false);
  const [timerDate, setTimerDate] = useState<any>(moment().startOf('day'));
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [comprehensiveSearch, setComprehensiveSearch] = useState();
  const [imgUrl, setImgUrl] = useState('');
  const [data, setData] = useState<any>({ ls });
  const [tableData, setTableData] = useState([]);
  const [info, setInfo] = useState<any>({});
  const access: any = useAccess();
  const totalLimit: number = 10000;
  const [searchPage, setSearchPage] = useState(1);
  const [movetenFlag, setMovetenFlag] = useState(false);

  const [carRange, setCarRange] = useState<any>(undefined);
  const [placeRange, setPlaceRange] = useState<any>(undefined);
  const [sizeRange, setSizeRange] = useState<any>(undefined);

  const [val1, setVal1] = useState<any>(['']);
  const [val2, setVal2] = useState<any>(['']);
  const [val3, setVal3] = useState<any>(['']);

  const [visibDuplicatesList, setVisibDuplicatesList] = useState(false);
  const [duplicatesInfo, setDuplicatesInfo] = useState();
  const [total, setTotal] = useState<any>(0);

  const [preflag, setPreflag] = useState(true);
  const [nextflag, setNextflag] = useState(true);
  const [viewIndex, setViewIndex] = useState(-1);
  const [lastId, setLastId] = useState(0);

  const [imgFlag, setImgFlag] = useState(false);
  const formref = useRef<any>();
  const formref2 = useRef<any>();
  const [tenant, setTenant] = useState();
  const [kind, setKind] = useState([]);
  const [kind2, setKind2] = useState([]);
  const [flag1, setFlag1] = useState(false);

  const [facilityId, setFacilityId] = useState<number>();
  // const [visible, setVisible] = useState(false)
  const [tenant2, setTenant2] = useState();
  const [device2, setDevice2] = useState();
  const [productModelList, setProductModelList] = useState<any>(diseaseAll1);
  const [disease, setDisease] = useState();
  const [colTime, setColTime] = useState<any>();
  const [searchKey, setSearchKey] = useState<any>({
    collectTime: colTime || timerDate?.format('YYYYMMDD'),
    disease,
    keyword: comprehensiveSearch,
    imgPositionThreshold: undefined,
    bhPositionThreshold: undefined,
    bhErrorThreshold: undefined,
  });
  const defalutSearchKey = {
    disease: undefined,
    keyword: undefined,
    imgPositionThreshold: undefined,
    bhPositionThreshold: undefined,
    bhErrorThreshold: undefined,
    tenant_id: tenant2 || formref?.current?.getFieldsValue()?.tenant,
    deviceId: device2 || formref?.current?.getFieldsValue()?.device,
    collectTime: moment().startOf('day')?.format('YYYYMMDD'),
  };
  const actionRef = useRef<any>();
  const scrollObj = useDiseaseScrollObj(tableData, { x: 1200, y: 'calc(100vh - 448px)' });
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
    const filterArr = diseaseAll1.filter((it: any) => it?.value * 1 !== 14);
    setProductModelList(filterArr);
  }, []);

  useEffect(() => {
    if (btnType === 1) {
      setTimerDate(moment().startOf('day'));
      setColTime(moment().startOf('day').format('YYYYMMDD').toString());
    } else {
      setTimerDate(undefined);
      // setColTime(moment().startOf('day').format('YYYYMMDD'))
    }
  }, [btnType]);
  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };
  // 时间
  const timeRangeSelect = (dates: any, dateStrings: any) => {
    setTimerDate(dates);
    setColTime(dateStrings);
  };

  const previewBigImg = (url: string) => {
    setImgUrl(url);
  };
  const imgInfo = async (infos: any) => {
    if (!infos?.recode?.id) return;

    const detRes = await getDiseaseInfo(
      infos.recode.id,
      tenant2 || formref?.current?.getFieldsValue()?.tenant,
    );
    if (detRes.status === 0) {
      setData(detRes.data);
      const list = Array.from({ length: tabpagesize }, () => false);
      list[viewIndex] = true;
    } else {
      setData({ ls });
    }
  };

  useEffect(() => {
    if ((!imgUrl && tableData.length && !preflag) || !nextflag) {
      setInfo({ recode: tableData[viewIndex] });
    }
  }, [tableData]);
  useEffect(() => {
    // setInfo({ recode: tableData[viewIndex] });
    if (info?.recode?.id && lastId !== info?.recode?.id) {
      setLastId(info?.recode?.id);
      imgInfo(info);
    } else {
      setData({ ls: data.ls, url: data.url, num: 1 });
    }
  }, [imgFlag, info, imgUrl]);

  const handleExport = async () => {
    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });
    const obj = {
      ids: selectedRowKey?.length === 0 ? '' : selectedRowKey,
      collectTime: colTime || timerDate?.format('YYYYMMDD'),
      deviceId: device2 || formref?.current?.getFieldsValue()?.device,
      tenant_id: tenant2 || formref?.current?.getFieldsValue()?.tenant,
      disease: searchKey.disease,
      keyword: searchKey.keyword,
      imgPositionThreshold: searchKey.imgPositionThreshold
        ? searchKey.imgPositionThreshold * 1
        : undefined,
      bhPositionThreshold: searchKey.bhPositionThreshold
        ? searchKey.bhPositionThreshold * 1
        : undefined,
      bhErrorThreshold: searchKey.bhErrorThreshold ? searchKey.bhErrorThreshold / 100 : undefined,
    };

    try {
      const res: any = await downlodExcel(obj);
      hide();
      exportCom(res);
      message.success({
        content: '导出成功',
        key: '导出成功',
      });
      return true;
    } catch (error) {
      hide();
      message.error({
        content: '导出失败!',
        key: '导出失败!',
      });
      return false;
    }
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
      render: (text: any, recode: any, index: any) => {
        // imgInfo(recode)
        return (
          <>
            <Image
              src={text}
              style={{ width: 58, height: 46 }}
              placeholder={true}
              preview={{
                visible: imgFlag && index === 0,
                src: imgUrl,
                onVisibleChange: (value) => {
                  setInfo({ recode });
                  setViewIndex(index);
                  setImgFlag(value);
                  if (value) {
                    if ((searchPage === 1 || tabpage === 1) && index === 0) {
                      setPreflag(true);
                      setNextflag(false);
                    } else if (
                      (tabpage === Math.ceil(total / tabpagesize) ||
                        searchPage === Math.ceil(total / tabpagesize)) &&
                      index === tableData.length - 1
                    ) {
                      setPreflag(false);
                      setNextflag(true);
                    } else {
                      setPreflag(false);
                      setNextflag(false);
                    }
                  }
                  if (!value) {
                    setData({ ls });
                    setImgUrl('');
                    setInfo({});
                    setViewIndex(-1);
                    setLastId(-1);
                  }
                },
              }}
            />
          </>
        );
      },
      // ellipsis: true,
      // fixed: 'left',
    },
    {
      title: '病害编号',
      dataIndex: 'diseaseNo',
      key: 'diseaseNo',
      width: 260,
      ellipsis: true,
    },
    {
      title: '图片名称',
      dataIndex: 'fkImgName',
      key: 'fkImgName',
      width: 240,
      ellipsis: true,
    },
    {
      title: '病害类型',
      dataIndex: 'diseType',
      // key: 'diseaseNameZh',
      width: 160,
      render: (text: any, recode: any) => {
        const type = {
          1: '水泥路面',
          2: '沥青路面',
        };
        return recode?.taskType &&
          !Object.keys(disease3).some((i: any) => i * 1 === recode?.diseaseType)
          ? `${type[recode.taskType]}-${recode.diseaseNameZh}`
          : `${recode.diseaseNameZh}`;
      },
    },
    {
      title: '车辆经纬度',
      key: 'longitudeAndlatitude',
      width: 240,
      render: (text: any, recode: any) => {
        if (!recode.imgLongitude) {
          return '-';
        }
        return `${recode.imgLongitude}, ${recode.imgLatitude}`;
      },
      ellipsis: true,
    },
    {
      title: ' 病害经纬度',
      key: 'diseaselongitudeAndlatitude',
      width: 240,
      render: (text: any, recode: any) => {
        if (!recode.longitude) {
          return '-';
        }
        return `${recode.longitude}, ${recode.latitude}`;
      },
      ellipsis: true,
    },
    {
      title: ' 病害面积(m²)',
      dataIndex: 'area',
      key: 'area',
      width: 100,
      ellipsis: true,
    },
    {
      title: '所在区域',
      dataIndex: 'address',
      key: 'address',
      width: 280,
      ellipsis: true,
      // render: (text: any, recode: any) => {
      //   return `${recode.longitude}, ${recode.latitude}`;
      // },
    },
    {
      title: '桩号',
      dataIndex: 'imgNo',
      key: 'imgNo',
      width: 180,
      render: (text: any, recode: any) => {
        let name = '';
        if (recode.routeMode === 0) {
          name = '上行';
        } else {
          name = recode.routeMode === 1 ? '下行' : '';
        }
        return `${recode.imgNo ? recode.imgNo : '-'} ${recode.imgNo ? name : ''}`;
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
            {/* {access['diseaseList/index:btn_detail'] && ( */}
            <a
              className={`ahover ${text.filterIds && text.filterIds.length ? '' : 'disableCss'}`}
              onClick={() => {
                if (!text.filterIds || !text.filterIds.length) return;
                setDuplicatesInfo(text);
                setVisibDuplicatesList(true);
              }}
            >
              {'列表'}
            </a>
            {/* )} */}
          </Space>
        );
      },
    },
  ];
  // const reqErr = () => {
  //   message.error({
  //     content: '查询失败!',
  //     key: '查询失败!',
  //   });
  //   // setPolling(undefined);
  // };
  // 选中当前行
  const onSelectChange = (selectedRowKeys: any) => {
    // setSelectedRow(selectedRows[0]);
    setSelectedRowKey(selectedRowKeys);
  };

  const clickRow = (record: any) => {
    // setSelectedRow(record);
    // setSelectedRowKey([record.id]); // 单选
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

    // if (tableData.length !== dataSource.length) {
    setTableData(dataSource);
    // }
  };
  // const changeCode = (sel: any) => {
  //   setCheckCode(sel);
  // };
  // const onSelChange3 = (sel: any) => {
  //   setUrgency(sel);
  //   if (sel === 1) {
  //     setProductModelList(diseaseAll1.filter((i) => diseaseUrgency3[i.value]));
  //   } else if (sel === 0) {
  //     setProductModelList(diseaseAll1.filter((i) => diseaseUrgency4[i.value]));
  //   } else {
  //     setProductModelList(diseaseAll1);
  //   }
  //   setDisease(undefined);
  // };

  const onSelChange = (sel: any) => {
    setDisease(sel);
  };
  // const handleFacilityChange = (val: any) => {
  //   setFacilityId(val);
  // };
  const onSearch = () => {
    setSearchKey({
      collectTime:
        colTime ||
        timerDate?.format('YYYYMMDD') ||
        moment().startOf('day').format('YYYYMMDD').toString(),
      disease,
      keyword: comprehensiveSearch,
      fkFacilitiesId: facilityId,
      imgPositionThreshold: carRange ? carRange * 1 : undefined,
      bhPositionThreshold: placeRange ? placeRange * 1 : undefined,
      bhErrorThreshold: sizeRange ? sizeRange / 1 : undefined,
    });
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
  }, [
    colTime,
    timerDate,
    comprehensiveSearch,
    facilityId,
    disease,
    carRange,
    placeRange,
    sizeRange,
  ]);
  const clearPage = () => {
    if (!isEqual(defalutSearchKey, searchKey)) {
      setSearchPage(1);
      setSearchKey({ ...defalutSearchKey });
      setSelectedRowKey([]);
      actionRef.current.reload();
    }
  };
  const onSelNull = () => {
    setBtnType(1);
    setTimerDate(moment().startOf('day'));
    setDisease(undefined);
    setFacilityId(undefined);
    setComprehensiveSearch(undefined);
    setCarRange(undefined);
    setVal1([]);
    setPlaceRange(undefined);
    setVal2([]);
    setSizeRange(undefined);
    setVal3([]);
    clearPage();
    // if (btnType === 3) setTimerDate(undefined);
  };
  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  //   setTabpage(page);
  //   setSelectedRowKey([]);
  //   // setTabpagesize(pageSize);
  // };

  const debouceSearch = (e: any) => {
    setComprehensiveSearch(e.target.value);
  };
  const debouceSearch2 = (e: any) => {
    const list = e.target.value.split('');
    if (list[0] && list[0] === '-') {
      setVal1([]);
      setCarRange(undefined);
      return;
    }
    if (isNaN(e.target.value * 1) || !e.target.value) {
      if (e.target.value === '.') {
        setCarRange('0.');
        setVal1(['0.']);
        return;
      }
      setVal1([]);
      setCarRange(undefined);
      return;
    }
    if (list[0] && list[0] === '0' && list[1] !== '.') {
      setCarRange(e.target.value * 1);
      setVal1([e.target.value * 1]);
      return;
    }

    const reg = /^[0-9.]+$/;
    if (reg.test(e.target.value)) {
      setCarRange(e.target.value);
      setVal1([e.target.value]);
      return;
    }

    setCarRange(e.target.value);
    setVal1([e.target.value]);
  };
  const debouceSearch3 = (e: any) => {
    const list = e.target.value.split('');
    if (list[0] && list[0] === '-') {
      setPlaceRange(undefined);
      setVal2([]);
      return;
    }
    if (isNaN(e.target.value * 1) || !e.target.value) {
      if (e.target.value === '.') {
        setPlaceRange('0.');
        setVal2(['0.']);
        return;
      }
      setPlaceRange(undefined);
      setVal2([]);
      return;
    }
    if (list[0] && list[0] === '0' && list[1] !== '.') {
      setPlaceRange(e.target.value * 1);
      setVal2([e.target.value * 1]);
      return;
    }
    const reg = /^[0-9.]+$/;
    if (reg.test(e.target.value)) {
      setPlaceRange(e.target.value);
      setVal2([e.target.value]);
      return;
    }

    setPlaceRange(e.target.value);
    setVal2([e.target.value]);
  };
  const debouceSearch4 = (e: any) => {
    const values: any = (e.target.value * 1).toString();
    const list = values.split('');
    if (list[0] && list[0] === '-') {
      setSizeRange(undefined);
      setVal3([]);
      return;
    }
    if (isNaN(e.target.value * 1) || !e.target.value) {
      if (e.target.value === '-') {
        setSizeRange(undefined);
        setVal3([]);
        return;
      }
      if (e.target.value === '.') {
        setSizeRange('0.');
        setVal3(['0.']);
        return;
      }
      setSizeRange(undefined);
      setVal3([]);
      return;
    }
    if (list[0] && list[0] === '0' && list[1] !== '.') {
      if (list.length > 6) {
        setSizeRange(list.splice(0, 6).join(''));
        setVal3([list.splice(0, 6).join('')]);
        return;
      }
      if (e.target.value * 1 > 100) {
        setSizeRange(100);
        setVal3([100]);
        return;
      }
      if (e.target.value * 1 === 0) {
        setSizeRange('');
        setSizeRange(undefined);
        setVal3([]);
        return;
      }
      setSizeRange(e.target.value * 1);
      setVal3([e.target.value * 1]);
      return;
    }

    const reg2 = /^[0-9.]+$/;
    if (reg2.test(e.target.value)) {
      if (list.length > 6) {
        setSizeRange(list.splice(0, 6).join(''));
        setVal3([list.splice(0, 6).join('')]);
        return;
      }
      if (values * 1 > 100) {
        setSizeRange(100);
        setVal3([100]);
        return;
      }
      setSizeRange(e.target.value);
      setVal3([e.target.value]);
      return;
    }

    setSizeRange(e.target.value);
    setVal3([e.target.value]);
  };

  const preDisea = () => {
    setNextflag(false);
    // const list = Array.from({ length: tabpagesize }, () => false);
    let ind = viewIndex - 1;
    if (viewIndex === 0) {
      setSearchPage(searchPage - 1);
      ind = tabpagesize - 1;

      setData({ ls });
      setImgUrl('');
      setInfo({});
      setViewIndex(-1);
    }
    // list[ind] = true;
    // setEdtFlagList([...list]);

    setViewIndex(ind);
    if (viewIndex !== 0) {
      setInfo({ recode: tableData[ind] });
    }
    if ((tabpage === 1 || searchPage === 1) && ind === 0) {
      setPreflag(true);
    }
  };

  const nextDisea = () => {
    setPreflag(false);
    // const list = Array.from({ length: tabpagesize }, () => false);
    let ind = viewIndex + 1;
    if (viewIndex === tabpagesize - 1) {
      setSearchPage(searchPage + 1);
      ind = 0;

      setData({ ls });
      setImgUrl('');
      setInfo({});
      setViewIndex(-1);
    }
    // list[ind] = true;
    // setEdtFlagList([...list]);
    setViewIndex(ind);
    if (viewIndex !== tabpagesize - 1) {
      setInfo({ recode: tableData[ind] });
    }
    if (
      (tabpage === Math.ceil(total / tabpagesize) ||
        searchPage === Math.ceil(total / tabpagesize)) &&
      ind === tableData.length - 1
    ) {
      setNextflag(true);
    }
  };

  const selSub = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        setFlag1(true);
      })
      .catch(() => {});
  };
  const selSub2 = async () => {
    formref2.current
      .validateFields()
      .then(async () => {
        setTenant2(formref2?.current?.getFieldsValue()?.tenant);
        setDevice2(formref2?.current?.getFieldsValue()?.device);
        actionRef.current.reload();
        setMovetenFlag(false);
      })
      .catch(() => {});
  };
  const getDevice = async () => {
    try {
      const res: any = await getTenDevice({
        tenantId:
          formref2?.current?.getFieldsValue()?.tenant || formref?.current?.getFieldsValue()?.tenant,
      });
      setKind2(res.data);
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <div id={styles.DebugToolcontainer} className={'common-table-tenant'}>
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
                    <Select
                      style={{ height: 40 }}
                      placeholder="请选择设备"
                      allowClear
                      disabled={!tenant}
                    >
                      {kind2.map((item: any) => (
                        <Option key={item.id} value={item.deviceId}>
                          {item.deviceId}
                        </Option>
                      ))}
                    </Select>
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
            {/* <div className={`${styles.rowClass} ${flag1 ? styles.ipnBigBox2 : ''}  ${flag ? styles.ipnBigBox1 : ''}`}> */}
            <div className={`${styles.rowClass}`}>
              <span className={styles.inpBox}>
                综合搜索
                <Input
                  className={styles.comClass}
                  autoComplete="off"
                  placeholder="请输入病害编号、图片名称"
                  value={comprehensiveSearch}
                  onChange={(e) => debouceSearch(e)}
                />
              </span>
              <span className={`${styles.inpBox} ${styles.inpBox3}`} style={{ paddingLeft: 19 }}>
                病害类型
                <Select
                  allowClear
                  placeholder="请选择"
                  style={{ marginRight: 0 }}
                  onChange={onSelChange}
                  value={disease}
                >
                  {productModelList.map((item: any) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </span>
              <span className={`${styles.inpBox} ${styles.inpBoxTime}`}>
                <span>采集时间</span>
                <div
                  onClick={() => setBtnType(1)}
                  style={{ marginLeft: 10 }}
                  className={`${styles.dateSel} ${btnType === 1 && styles.btnLight}`}
                >
                  今日
                </div>
                <div
                  onClick={() => setBtnType(3)}
                  className={`${styles.dateSel} ${btnType === 3 && styles.btnLight}`}
                >
                  自定义
                </div>
                <span className={styles.timeBox}>
                  <DatePicker
                    disabled={btnType === 1}
                    inputReadOnly
                    format="YYYYMMDD"
                    disabledDate={disabledDate}
                    onChange={timeRangeSelect}
                    value={timerDate}
                  />
                </span>
              </span>
            </div>
            <div className={`${styles.rowClass} `} style={{ marginBottom: 0 }}>
              <span className={` ${styles.timerBox}`}>
                <span className={`${styles.inpBox6} ${styles.inpBox7}`}>
                  车辆位置范围
                  <Input
                    className={styles.comClass}
                    autoComplete="off"
                    value={[...val1]}
                    placeholder="请输入"
                    defaultValue={carRange}
                    onChange={(e) => debouceSearch2(e)}
                    suffix="m"
                  />
                </span>
                <span className={`${styles.inpBox6} ${styles.inpBox7}`}>
                  病害位置范围
                  <Input
                    className={styles.comClass}
                    autoComplete="off"
                    value={[...val2]}
                    placeholder="请输入"
                    onChange={(e) => debouceSearch3(e)}
                    suffix="m"
                  />
                </span>
                <span className={`${styles.inpBox6} ${styles.inpBox7}`}>
                  病害尺寸误差
                  <Input
                    className={styles.comClass}
                    autoComplete="off"
                    value={[...val3]}
                    placeholder="请输入"
                    onChange={(e) => debouceSearch4(e)}
                    suffix="%"
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
          <div className="row-button">
            {access['toolkit/RemoveDuplicatesDebugTool/index:btn_export'] && (
              <Button
                type="primary"
                className={'buttonClass'}
                disabled={total === 0}
                onClick={() => {
                  if (selectedRowKey.length === 0) {
                    if (total > totalLimit) {
                      message.error({
                        content: `超过数据上限，最多可导出${totalLimit}条数据!`,
                        key: `超过数据上限，最多可导出${totalLimit}条数据!`,
                      });
                      return;
                    }
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
          </div>
          <div
            className={`table-box table-box-two ${
              !access['toolkit/RemoveDuplicatesDebugTool/index:btn_export'] &&
              'table-box-nobutton-two'
            }`}
          >
            <ProTable<Member>
              columns={columns}
              actionRef={actionRef}
              request={async (params) => {
                const res = await getRemListInfo(params);
                setTotal(res.total * 1);
                return res;
              }}
              params={{
                disease: searchKey.disease,
                keyword: searchKey.keyword,
                // current: searchPage,
                imgPositionThreshold: searchKey.imgPositionThreshold
                  ? searchKey.imgPositionThreshold * 1
                  : undefined,
                bhPositionThreshold: searchKey.bhPositionThreshold
                  ? searchKey.bhPositionThreshold * 1
                  : undefined,
                bhErrorThreshold: searchKey.bhErrorThreshold
                  ? searchKey.bhErrorThreshold / 100
                  : undefined,
                tenant_id: tenant2 || formref?.current?.getFieldsValue()?.tenant,
                deviceId: device2 || formref?.current?.getFieldsValue()?.device,
                collectTime: searchKey?.collectTime || timerDate?.format('YYYYMMDD'),
              }}
              rowKey="id"
              // postData={postData}
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
              // polling={polling || undefined}
              pagination={{
                showQuickJumper: false,
                defaultPageSize: 20,
                current: searchPage,
                // onChange: pageChange,
                pageSizeOptions: ['10', '20', '50', '100', '1000'],
              }}
              toolBarRender={false}
              search={false}
              scroll={scrollObj || { x: '100%' }}
              // onRequestError={reqErr}
              onChange={changetabval}
              onLoad={onload}
            />
          </div>
          {visibDuplicatesList ? (
            <DuplicatesList
              duplicatesInfo={duplicatesInfo}
              onCancel={() => {
                setVisibDuplicatesList(false);
              }}
              visibDuplicatesList={visibDuplicatesList}
              deviceId={device2 || formref?.current?.getFieldsValue()?.device}
              tenant_id={tenant2 || formref?.current?.getFieldsValue()?.tenant}
            />
          ) : null}
          <div className={styles.iconBoxHover1}>
            <LeftImg
              className={`${styles.topBoxText} ${styles.imgIconText} ${styles.topBoxText2}
            ${styles.iconPosition1} ${preflag ? styles.disables : ''}`}
              onClick={preflag ? undefined : preDisea}
              style={!imgFlag ? { display: 'none' } : {}}
            />
          </div>
          <div className={styles.iconBoxHover2}>
            <RightImg
              style={!imgFlag ? { display: 'none' } : {}}
              onClick={nextflag ? undefined : nextDisea}
              className={` ${styles.topBoxText3} ${styles.imgIconText}
            ${styles.iconPosition2} ${nextflag ? styles.disables : ''}`}
            />
          </div>
        </div>
      ) : null}

      {movetenFlag ? (
        <Modal
          title={`切换租户`}
          open={movetenFlag}
          onCancel={() => setMovetenFlag(false)}
          // footer={false}
          className="moveten"
          onOk={() => {
            selSub2();
          }}
        >
          <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} ref={formref2} colon={false}>
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
              <Select
                style={{ height: 40 }}
                placeholder="请选择设备"
                allowClear
                disabled={!tenant}
                // onChange={changeRoadKind}
              >
                {kind2.map((item: any) => (
                  <Option key={item.id} value={item.deviceId}>
                    {item.deviceId}
                  </Option>
                ))}
              </Select>
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
