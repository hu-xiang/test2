import { ReactComponent as ToolStart } from '../../../assets/img/toolkit/toolStart.svg';
import { Button, Form, Select, DatePicker, TreeSelect, Modal, Image, TimePicker } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import styles from './styles.less';
import DistressCanvas from './components/DistressCanvas';
import { getTenName, getTenDevice } from '../../../services/ant-design-pro/api';
import ProTable from '@ant-design/pro-table';
import moment from 'moment';

const { Option } = Select;
type dataItemType = {
  flag: number;
  imgName: string;
  imgUrl: string;
  jsonString: any;
};
const dataItem: dataItemType = {
  flag: 0,
  imgName: '',
  imgUrl: '',
  jsonString: '',
};
export type Member = {
  avatar: string;
  realName: string;
  nickName: string;
  email: string;
  outUserNo: string;
  phone: string;
  permission?: string[];
};

let allTableItemId: any = [];
let firstClick = true;

export default (): React.ReactElement => {
  const [flag, setFlag] = useState(false);
  const [nextItem, setNextItem] = useState<any>();
  const [deviceVal, setDeviceVal] = useState<any>([]);
  // const [isAdd, setAdd] = useState(false);
  const [data, setData] = useState<any>(dataItem);
  const [getNextImageData, setGetNextImageData] = useState<any>();
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [flag1, setFlag1] = useState(false);
  const [list, setList] = useState<any>([]);
  const [listLength, setListLength] = useState(0);
  const [colorInd, setColorInd] = useState<any>();
  const formref = useRef<any>();
  const [tenant, setTenant] = useState();
  const [kind, setKind] = useState([]);
  const [kind2, setKind2] = useState([]);
  const [collectTime, setcollectTime] = useState<any>();
  const [selTreeType, setSelTreeType] = useState(1);
  const [movetenFlag, setMovetenFlag] = useState(false);
  const formref2 = useRef<any>();
  const actionRef = useRef<any>();
  const [tenant2, setTenant2] = useState();
  const [device2, setDevice2] = useState();
  const [canvasDataUrl, setCanvasDataUrl] = useState('');
  const [visible, setVisible] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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
    formref.current.setFieldsValue({ collectTime: moment().startOf('day') });
    const reInp = () => {
      if (!document.querySelector('.container')?.clientWidth) return;
      if (document.querySelector('.container')!.clientWidth > 1300) {
        setFlag1(false);
      } else {
        setFlag1(true);
      }
    };
    reInp();
    window.addEventListener('resize', reInp);
    return () => {
      window.removeEventListener('resize', reInp);
    };
  }, []);

  useEffect(() => {
    window.addEventListener('click', (e: any) => {
      if (e?.target && !e.target.classList.contains('ant-typography')) {
        setColorInd(undefined);
      }
    });
    return () => {
      setColorInd(undefined);
    };
  }, []);

  const getDevice = async (isUpdate: boolean = false) => {
    try {
      let tenantId = formref?.current?.getFieldsValue()?.tenant;
      if (movetenFlag) {
        tenantId = formref2?.current?.getFieldsValue()?.tenant;
      }
      if (isUpdate) {
        tenantId = formref?.current?.getFieldsValue()?.tenant;
      }
      const res: any = await getTenDevice({
        tenantId,
      });
      const lists: any = [];
      const list2: any = [];
      const deviceIds: any = [];
      res.data.forEach((i: any) => {
        lists.push({ ...i, label: i.deviceId, value: i.id, key: i.id });
        list2.push(i.id);
        deviceIds.push(i.deviceId);
      });
      setKind2(lists);
      setDeviceVal(deviceIds);
      // setDeviceVal(list2);
      // const list2: any = [];
      // lists.forEach((i: any) => {
      //   list2.push(i.label);
      // });
      formref.current.setFieldsValue({ device: list2 });
      if (movetenFlag) {
        formref2.current.setFieldsValue({ device: list2 });
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    if (data?.imgUrl) {
      setSelectedRowKey([]);
      const indList: any = [];
      data.list.forEach((item: any, index: any) => {
        data.list[index].id = item.id;
        indList.push(item.id);
        if (index === data.list.length - 1) {
          setSelectedRowKey(indList);
        }
      });

      allTableItemId = indList.concat();

      setList([...data.list]);
      setListLength(data.list.length);
      setFlag(true);
    }
    if (!flag) return;

    if (!data?.imgUrl || !data?.dataNull) {
      // console.log('object进来');
      // 无数据，退回选择页
      setTenant2(undefined);
      setDevice2(undefined);
      setFlag(false);
      getDevice(true);
    } else {
      setFlag(true);
    }
  }, [data, flag, data.list]);

  const nextItemFn = (fn: void) => {
    setNextItem({ fn });
  };

  const DataFn = (datas: any) => {
    setData(datas);
  };

  const column: any = [
    {
      title: '序号',
      key: 'id',
      render: (text: any, record: any, index: any) => `${index + 1}`,
      // `${(tabpage - 1) * tabpagesize + (index + 1)}`,
      width: 60,
    },
    {
      title: '病害类型',
      dataIndex: 'diseaseNameZh',
      key: 'diseaseNameZh',
      width: 150,
      ellipsis: true,
      render: (text: any, recode: any) => {
        return (
          <span
            className={`${styles.cursor} ${colorInd === recode.id ? styles.selLight : ''}`}
            onClick={() => {
              if (colorInd === recode.id) {
                setColorInd(undefined);
              } else {
                setColorInd(recode.id);
              }
            }}
          >
            {text}
          </span>
        );
      },
    },
  ];

  // 选中当前行
  const onSelectChange = (selectedRowKeys: any) => {
    setSelectedRowKey(selectedRowKeys);
  };

  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };

  const clickHeadRow = () => {
    if (selectedRowKey.length === listLength) {
      setSelectedRowKey([]);
    } else {
      setSelectedRowKey(allTableItemId);
    }
  }; // 点击表头行

  const setFirstClick = () => {
    firstClick = true;
  };

  const nextItemDebounce = () => {
    if (firstClick) {
      nextItem?.fn({ startTime, endTime });
      firstClick = false;
    }
  };

  document.onkeyup = (e) => {
    if (!flag) return;
    e.preventDefault();
    if (e.key === '`') {
      nextItemDebounce();
    }
    if (e.code === 'Space') {
      clickHeadRow();
    }
  };

  const selSub = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        console.log('11', startTime, endTime);
        getNextImageData?.fn({
          startTime,
          endTime,
          tenant_id: formref?.current?.getFieldsValue()?.tenant,
          collectTime: formref?.current?.getFieldsValue()?.collectTime.format('YYYY-MM-DD'),
          deviceIds: deviceVal,
        });
      })
      .catch(() => {});
  };
  const timeRangeSelect = (dates: any, dateStrings: any) => {
    setcollectTime(dateStrings);
  };
  const selSub2 = async () => {
    console.log('3333333', startTime, endTime);
    formref2.current
      .validateFields()
      .then(async () => {
        setTenant2(formref2?.current?.getFieldsValue()?.tenant);
        setDevice2(deviceVal);
        getNextImageData?.fn({
          tenant_id: formref2?.current?.getFieldsValue()?.tenant,
          collectTime:
            collectTime || formref2?.current?.getFieldsValue()?.collectTime?.format('YYYY-MM-DD'),
          deviceIds: deviceVal,
        });
        actionRef.current.reload();
        setMovetenFlag(false);
      })
      .catch(() => {});
  };

  const onSelTreeChange = (val: any, option: any) => {
    setDeviceVal(option);
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
      setDeviceVal([]);
      formref.current.setFieldsValue({ device: undefined });
      if (movetenFlag) {
        formref2.current.setFieldsValue({ device: undefined });
      }
    } else {
      const lists: any = [];
      const deviceIds: any = [];
      kind2.forEach((i: any) => {
        lists.push(i?.id);
        deviceIds.push(i?.deviceId);
      });
      setDeviceVal(deviceIds);
      formref.current.setFieldsValue({ device: lists });
      if (movetenFlag) {
        formref2.current.setFieldsValue({ device: lists });
      }
    }
  };
  const clickNull = () => {
    setSelTreeType(2);
    setDeviceVal([]);
    formref.current.setFieldsValue({ device: [] });
    if (movetenFlag) {
      formref2.current.setFieldsValue({ device: [] });
    }
  };

  const setImgUrl = (dataUrl: string) => {
    setCanvasDataUrl(dataUrl);
  };

  const DateTimeRangeSelect = (time: any, timeStr: any) => {
    setStartTime(timeStr[0] || '00:00:00');
    setEndTime(timeStr[1] || '23:59:59');
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
    <div
      id={`${styles.ManualAuditToolContainer}`}
      className={`ManualAuditToolContainer ${flag ? styles.ManualAuditToolContainer2 : ''}`}
    >
      <div className={styles.tenmMoveBox} style={!flag ? { display: 'none' } : {}}>
        <Button
          type="primary"
          style={{ float: 'right' }}
          onClick={() => {
            setMovetenFlag(true);
            setcollectTime(undefined);
            setTimeout(() => {
              formref2?.current?.setFieldsValue({ collectTime: moment().startOf('day') });
            }, 10);
          }}
        >
          切换租户
        </Button>
      </div>
      <div className={'toolStartBox'} style={flag ? { display: 'none' } : {}}>
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
                    // value={deviceVal}
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
                <Form.Item
                  name="collectTime"
                  label="采集日期"
                  // className="addUserClass"
                  rules={[{ required: true, message: '请选择采集日期' }]}
                >
                  <DatePicker
                    inputReadOnly
                    format="YYYY-MM-DD"
                    disabledDate={disabledDate}
                    onChange={timeRangeSelect}
                    // value={timerDate}
                  />
                </Form.Item>

                <Form.Item name="collectDateTime" label="采集时间">
                  <TimePicker.RangePicker inputReadOnly onChange={DateTimeRangeSelect} />
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
      {/* <div className={styles.disBox} style={!flag ? { display: 'none' } : {}}> */}

      <div
        className={`${styles.disBox} ${flag1 ? styles.disBox1 : ''} disBoxManu`}
        style={!flag ? { display: 'none' } : {}}
      >
        <div className={styles.disImgBox}>
          <DistressCanvas
            nextItemFn={nextItemFn}
            setImgUrl={setImgUrl}
            DataFn={DataFn}
            // setAdd={setAdd}
            // isAdd={isAdd}
            selectedRowKey={selectedRowKey}
            selObj={{
              startTime,
              endTime,
              tenant_id: tenant2 || formref?.current?.getFieldsValue()?.tenant,
              deviceIds: device2 || deviceVal,
              collectTime: tenant2
                ? collectTime ||
                  formref?.current?.getFieldsValue()?.collectTime?.format('YYYY-MM-DD')
                : formref?.current?.getFieldsValue()?.collectTime?.format('YYYY-MM-DD'),
            }}
            flags={flag}
            colorInd={colorInd}
            setSelectedRowKey={setSelectedRowKey}
            setColorInd={setColorInd}
            setGetNextImageData={setGetNextImageData}
            setFirstClick={setFirstClick}
          />
        </div>
        <Image
          width={200}
          style={{ display: 'none' }}
          preview={{
            visible,
            src: canvasDataUrl,
            onVisibleChange: (value) => {
              setVisible(value);
            },
          }}
        />
        <div className={styles.btnBox}>
          <Button
            style={{ height: 40 }}
            // disabled={isAdd}
            onClick={() => setVisible(true)}
          >
            放大
          </Button>
          <Button
            style={{ height: 40, marginLeft: 20 }}
            type="primary"
            onClick={() => {
              nextItemDebounce();
            }}
          >
            下一张（~）
          </Button>
        </div>
      </div>
      <div
        className={`${styles.disListBox} ${flag1 ? styles.disListBox1 : ''}`}
        style={!flag ? { display: 'none' } : {}}
      >
        <div className={styles.textBox}>标注列表</div>
        <div className={styles.tableBox}>
          <ProTable<Member>
            columns={column}
            dataSource={list}
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedRowKey,
              type: 'checkbox',
              onChange: onSelectChange,
            }}
            scroll={{ y: 'calc(100vh - 215px)' }}
            actionRef={actionRef}
            pagination={false}
            tableAlertRender={false}
            toolBarRender={false}
            search={false}
            onHeaderRow={() => {
              return {
                onClick: clickHeadRow,
              };
            }}
            // onRequestError={reqErr}
          />
        </div>
      </div>
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
              <TreeSelect
                treeData={kind2}
                // value={deviceVal}
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
            <Form.Item
              name="collectTime"
              label="采集时间"
              className="addUserClass"
              rules={[{ required: true, message: '请选择采集时间' }]}
            >
              <DatePicker
                inputReadOnly
                format="YYYY-MM-DD"
                disabledDate={disabledDate}
                onChange={timeRangeSelect}
                // value={timerDate}
              />
            </Form.Item>
          </Form>
        </Modal>
      ) : null}
    </div>
  );
};
