import { Form, Modal, Input, DatePicker, Select, message, Row, Col, InputNumber } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { commonRequest } from 'baseline/src/utils/commonMethod';
import StakeModal from './StakeModal';
import moment from 'moment';
import type { Moment } from 'moment';
import styles from './styles.less';
import validRule from 'baseline/src/utils/validate';

type Iprops = {
  id?: string | number;
  isEdit: boolean;
  isShow: boolean;
  onCancel: Function;
  onOk: Function;
};

const { Option } = Select;
const { TextArea } = Input;

const requestList = [
  { url: '/traffic-bsl/accident/add', method: 'post' },
  { url: '/traffic-bsl/accident/edit', method: 'put' },
  { url: '/traffic-bsl/accident/editShow', method: 'get' },
  { url: '/traffic/facilities/select', method: 'get' },
];

const accidentRank = {
  1: '轻微事故',
  2: '一般事故',
  3: '重大事故',
  4: '特大事故',
};

const AccidentInfo: React.FC<Iprops> = (props) => {
  const formref = useRef<any>();
  const [facilitiesList, setFacilitiesList] = useState<any>([]);
  const [isSelectPoint, setIsSelectPoint] = useState<boolean>(false);
  const [facilitiesId, setFacilitiesId] = useState<any>();
  const [first, setFirst] = useState<any>();
  const [last, setLast] = useState<any>();
  const [direct, setDirect] = useState<number>(0);

  const rules: any = {
    limitNumber50: [validRule.limitNumber50()],
    limitNoKong50: [validRule.limitNoKong50(true, '请输入事故地点')],
  };

  // 获取所属设施数据
  const getFacilitiesList = async () => {
    const res = await commonRequest(requestList[3]);
    setTimeout(() => {
      setFacilitiesList(res.data);
    }, 0);
    return res;
  };

  const getEditInfo = async () => {
    const res = await commonRequest({ ...requestList[2], params: { id: props?.id } });
    setDirect(res?.data?.direct || 0);
    formref.current.setFieldsValue({
      title: res?.data?.title,
      accidentNo: res?.data?.accidentNo,
      level: res?.data?.level,
      address: res?.data?.address,
      facilitiesId: res?.data?.facilitiesId,
      deadCount: res?.data?.deadCount,
      hurtCount: res?.data?.hurtCount,
      moneyLoss: res?.data?.moneyLoss,
      happenTime: moment(res?.data?.happenTime),
      stakeNo: res?.data?.stakeNo,
      description: res?.data?.description,
      direct: res?.data?.direct,
    });

    const list = res?.data?.stakeNo?.split('+');
    setFirst(list[0]?.slice(1));
    setLast(list[1]);
    setFacilitiesId(res?.data?.facilitiesId);
  };

  useEffect(() => {
    if (props?.isEdit) getEditInfo();
  }, []);

  useEffect(() => {
    if (props?.isShow) getFacilitiesList();
  }, [props?.isShow]);

  const handleSubmit = async () => {
    const formList = formref.current.getFieldsValue();
    formref.current
      .validateFields()
      .then(async () => {
        formList.happenTime = moment(formList.happenTime).format('YYYY-MM-DD HH:mm:ss');
        formList.direct = direct;
        // let right = null;
        // if (last * 1 < 10) {
        //   right = `00${last}`;
        // } else if (!(last * 1 < 10) && last * 1 < 100) {
        //   right = `0${last}`;
        // } else {
        //   right = last;
        // }
        // formList.stakeNo = `K${first*1}+${right}`;
        try {
          let res;
          if (props.isEdit) {
            formList.id = props?.id;
            res = await commonRequest({ ...requestList[1], params: formList });
          } else {
            res = await commonRequest({ ...requestList[0], params: formList });
          }
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onCancel();
            props.onOk();
          }
          return true;
        } catch {
          message.error({
            content: '提交失败!',
            key: '提交失败!',
          });
          return false;
        }
      })
      .catch(() => {});
  };

  const selectMap = () => {
    if (!facilitiesId) {
      message.warning({
        content: '请先选择所属道路!',
        key: '请先选择所属道路!',
      });
      return;
    }
    setIsSelectPoint(true);
  };

  const format = (first1: any, last1: any) => {
    if (
      (typeof first1 !== 'number' && !first1?.length) ||
      (typeof last1 !== 'number' && !last1?.length)
    ) {
      formref.current.setFieldsValue({
        stakeNo: '',
      });
      // formref.current.validateFields(['stakeNo']);
    } else {
      let right: any = last1;
      if (last1 * 1 < 10) {
        right = `00${last1 * 1}`;
      } else if (!(last1 * 1 < 10) && last1 * 1 < 100) {
        right = `0${last1 * 1}`;
      } else {
        right = last1 * 1;
      }
      formref.current.setFieldsValue({
        stakeNo: `K${first1 * 1}+${right}`,
      });
    }
  };
  const disabledDate = (current: Moment) => {
    return current && current > moment(new Date()).endOf('day');
  };
  const range = (start: number, end: number) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };
  const disabledDateTime = () => {
    const curH = new Date().getHours();
    const curM = new Date().getMinutes();
    const curS = new Date().getSeconds();
    return {
      disabledHours: () => range(0, 60).splice(curH + 1, 60),
      disabledMinutes: () => range(0, 60).splice(curM + 1, 60),
      disabledSeconds: () => range(0, 60).splice(curS + 1, 60),
    };
  };
  return (
    <div>
      <Modal
        title={props.isEdit ? '事故信息编辑' : '事故信息创建'}
        open={props.isShow}
        maskClosable={false}
        width={620}
        bodyStyle={{ overflowY: 'scroll', height: 'calc(90vh - 136px)', maxHeight: '680px' }}
        style={{ top: '5vh' }}
        onCancel={() => {
          props.onCancel();
        }}
        onOk={() => handleSubmit()}
        okText="提交"
      >
        <div>
          <Form
            labelAlign="right"
            labelCol={{ flex: '78px' }}
            labelWrap
            wrapperCol={{ flex: 1 }}
            ref={formref}
            colon={false}
          >
            <Form.Item
              label="事故标题"
              name="title"
              // rules={[{ required: true, message: '请输入事故标题' }]}
              rules={rules.limitNumber50}
            >
              <Input autoComplete="off" placeholder="请输入事故标题" />
            </Form.Item>
            <Form.Item
              label="事故编号"
              name="accidentNo"
              rules={rules.limitNumber50}
              // rules={[{ required: true, message: '请输入事故编号' }]}
            >
              <Input autoComplete="off" placeholder="请输入事故编号" />
            </Form.Item>
            <Form.Item
              label="事故等级"
              name="level"
              rules={[{ required: true, message: '请选择事故等级' }]}
            >
              <Select placeholder="请选择" allowClear>
                {Object.keys(accidentRank).map((item: any) => (
                  <Option key={item} value={item * 1}>
                    {accidentRank[item]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="事故地点"
              name="address"
              rules={rules.limitNoKong50}
              // rules={[{ required: true, message: '请输入事故地点' }]}
            >
              <Input autoComplete="off" placeholder="请输入事故地点" />
            </Form.Item>
            <Form.Item
              label="所属道路"
              name="facilitiesId"
              rules={[{ required: true, message: '请选择所属道路' }]}
            >
              <Select
                placeholder="请选择"
                allowClear
                onChange={(e) => {
                  setFacilitiesId(e);
                  setFirst('');
                  setLast('');
                  formref.current.setFieldsValue({
                    stakeNo: '',
                  });
                }}
              >
                {facilitiesList?.map((item: any) => (
                  <Option key={item.id} value={item.id}>
                    {item.facilitiesName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Row>
              <Col style={{ width: '240px', marginRight: '94px' }}>
                <Form.Item
                  label="死亡人数"
                  name="deadCount"
                  rules={[{ required: true, message: '请输入死亡人数' }]}
                >
                  <InputNumber
                    controls
                    min={0}
                    max={999999999}
                    precision={0}
                    style={{ width: '162px' }}
                  />
                </Form.Item>
              </Col>
              <Col style={{ width: '240px' }}>
                <Form.Item
                  label="受伤人数"
                  name="hurtCount"
                  rules={[{ required: true, message: '请输入受伤人数' }]}
                >
                  <InputNumber
                    controls
                    min={0}
                    max={999999999}
                    precision={0}
                    style={{ width: '162px' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="财产损失"
              name="moneyLoss"
              rules={[{ required: true, message: '请输入财产损失' }]}
            >
              <InputNumber
                min={0}
                max={999999999}
                precision={2}
                addonAfter="万元"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              label="时间"
              name="happenTime"
              rules={[{ required: true, message: '请选择时间' }]}
            >
              <DatePicker showTime disabledDate={disabledDate} disabledTime={disabledDateTime} />
            </Form.Item>
            <Form.Item
              label="桩号位置"
              name="stakeNo"
              rules={[{ required: true, message: '请选择桩号位置' }]}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  placeholder="请选择"
                  style={{ width: '120px' }}
                  value={direct}
                  onChange={(e: number) => setDirect(e)}
                >
                  <Option key={0} value={0}>
                    上行
                  </Option>
                  <Option key={1} value={1}>
                    下行
                  </Option>
                </Select>
                <span style={{ padding: '0 10px' }}>K</span>
                <InputNumber
                  min={0}
                  max={999999999}
                  precision={0}
                  style={{ width: '120px' }}
                  value={first}
                  onChange={(e: any) => {
                    setFirst(e);
                  }}
                  onBlur={() => {
                    format(first, last);
                  }}
                />
                <span style={{ padding: '0 10px' }}>+</span>
                <InputNumber
                  min={0}
                  max={999}
                  precision={0}
                  value={last}
                  formatter={(value: any) => {
                    if (value?.length === 1) {
                      return `00${value}`;
                    }
                    if (value?.length === 2) {
                      return `0${value}`;
                    }
                    return value;
                  }}
                  // parser={(value:any) => value!.replace('%', '')}
                  onChange={(e: any) => {
                    setLast(e);
                  }}
                  onBlur={() => {
                    format(first, last);
                  }}
                  style={{ width: '120px', marginRight: '20px' }}
                />
                <a className="ahover" onClick={selectMap}>
                  选取点位
                </a>
              </div>
            </Form.Item>
            <div className={styles.accidentFormItem}>
              <Form.Item
                label="事故描述"
                name="description"
                rules={[{ required: true, message: '请输入事故描述' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请输入事故描述，最多可输入200个字"
                  style={{ marginBottom: '20px' }}
                  maxLength={200}
                  showCount
                />
              </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>

      {isSelectPoint ? (
        <StakeModal
          isSelectPoint={isSelectPoint}
          id={facilitiesId}
          onCancel={() => {
            setIsSelectPoint(false);
          }}
          onOk={(val: any, direction: number) => {
            setDirect(direction);
            formref.current.setFieldsValue({
              stakeNo: val,
            });
            const list = val?.split('+');
            setFirst(list[0]?.slice(1));
            setLast(list[1]);
            setIsSelectPoint(false);
          }}
        />
      ) : null}
    </div>
  );
};
export default AccidentInfo;
