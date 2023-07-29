import { Input, Modal, Form, Select, DatePicker, Button, message, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
// import ReportToUpload from './ReportToUpload';
import InputUpload from './InputUpload';
import { ReactComponent as CircleDel } from '@/assets/img/delIcon/circleDel.svg';
import styles from './styles.less';
import { landTypeEnum, directionEnum, reportlist } from '../dicEnum';
import { addOrEdit, selectFacilities, getProjectEditInfo } from '../serves';
import moment from 'moment';
import type { Moment } from 'moment';
import validRule from '@/utils/validate';

type Iprops = {
  isModalShow: boolean;
  isEdit: boolean;
  onCancel: Function;
  onSet: Function;
  id: string | number;
};

const { Option } = Select;

const AddOrEditModal: React.FC<Iprops> = (props) => {
  const formref: any = useRef();
  const [facilitiesTypeEnum, setFacilitiesTypeEnum] = useState<any>([]);
  const [facilitiesId, setFacilitiesId] = useState<any>('');
  const [laneList, setLaneList] = useState<any>([
    {
      direction: '',
      lane: '',
      diseaseFile: '',
      evaluationFile: '',
      questionnaireFile: '',
      recordFile: '',
      streetViewFile: '',
    },
  ]);
  const [confirmLoading, setconfirmLoading] = useState<boolean>(false);

  const rules: any = {
    checkReport: [validRule.checkReport(true, laneList)],
    projectName: [validRule.limitNumberLetterCHN20()],
    projectNo: [validRule.limitNumberLetter20()],
  };

  // 获取设施名称
  const getFacilityName = async () => {
    const res = await selectFacilities();
    setFacilitiesTypeEnum(res?.data || []);
  };

  // 获取设施名称
  const projectEditInfo = async (id: any) => {
    const res = await getProjectEditInfo(id);
    formref.current.setFieldsValue({
      projectName: res?.data?.projectName,
      projectNo: res?.data?.projectNo,
      // facilitiesId: res?.data?.facilitiesId,
      facilitiesName: res?.data?.facilitiesName,
      roadType: res?.data?.roadType,
      qualifyRate: res?.data?.qualifyRate,
      intactRate: res?.data?.intactRate,
      liablePerson: res?.data?.liablePerson,
      detectTime: res?.data?.detectTime ? moment(res?.data?.detectTime) : '',
    });
    setFacilitiesId(res?.data?.facilitiesId);
    if (res?.data?.laneList.length) setLaneList(res?.data?.laneList);
  };

  useEffect(() => {
    getFacilityName();
    if (props.isEdit) {
      projectEditInfo(props.id);
    }
  }, []);

  const handleSubmit = () => {
    setconfirmLoading(true);
    const formList = formref.current.getFieldsValue();
    formref.current
      .validateFields()
      .then(async () => {
        formList.laneList = laneList;
        formList.detectTime = moment(formList.detectTime).format('YYYY-MM-DD');
        try {
          if (props.isEdit) {
            formList.id = props.id;
            formList.facilitiesId = facilitiesId;
            delete formList.facilitiesName;
          }
          const res = await addOrEdit(formList);
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onCancel();
            props.onSet();
          } else {
            // message.error({
            //   content: res.message,
            //   key: res.message,
            // });
          }
          setconfirmLoading(false);
          return true;
        } catch {
          message.error({
            content: '提交失败!',
            key: '提交失败!',
          });
          setconfirmLoading(false);
          return false;
        }
      })
      .catch(() => {
        setconfirmLoading(false);
      });
  };

  const addLane = () => {
    setLaneList([
      ...laneList,
      {
        direction: '',
        lane: '',
        diseaseFile: '',
        evaluationFile: '',
        questionnaireFile: '',
        recordFile: '',
        streetViewFile: '',
      },
    ]);
  };

  const delLane = (index: any) => {
    if (laneList.length === 1 && index === 0) {
      message.warning({
        content: '至少保留一条报表数据上传',
        key: '0',
      });
      return;
    }
    laneList.splice(index, 1);
    setLaneList([...laneList]);
    formref.current.validateFields(['laneList']);
  };

  const onUpload = (index: number, type: string, filePath: string) => {
    const data = laneList;
    data[index][type] = filePath;
    setLaneList(data);
    formref.current.validateFields(['laneList']);
  };

  const valueChange = (e: any, index: any, filed: string) => {
    const data = laneList;
    if (filed === 'lane') data[index][filed] = e.target.value;
    else data[index][filed] = e;
    setLaneList(data);
  };

  const disabledDate = (current: Moment) => {
    return current && current >= moment(new Date()).endOf('day');
  };

  return (
    <div>
      <Modal
        title={props.isEdit ? '项目编辑' : '项目创建'}
        open={props.isModalShow}
        maskClosable={false}
        className="commomModalClass"
        width={543}
        onCancel={() => {
          props.onCancel();
        }}
        confirmLoading={confirmLoading}
        onOk={() => handleSubmit()}
      >
        <div className={styles.regularProjectModalBox}>
          <Form
            labelAlign="right"
            labelCol={{ flex: '78px' }}
            labelWrap
            wrapperCol={{ flex: 1 }}
            ref={formref}
            colon={false}
          >
            <Form.Item label="项目名称" name="projectName" rules={rules.projectName}>
              <Input autoComplete="off" placeholder="请输入项目名称" disabled={props.isEdit} />
            </Form.Item>
            <Form.Item label="项目编号" name="projectNo" rules={rules.projectNo}>
              <Input autoComplete="off" placeholder="请输入项目编号" disabled={props.isEdit} />
            </Form.Item>
            <Form.Item
              label="道路名称"
              name={props.isEdit ? 'facilitiesName' : 'facilitiesId'}
              rules={[{ required: true, message: '请选择道路名称' }]}
            >
              <Select placeholder="请选择道路名称" allowClear disabled={props.isEdit}>
                {facilitiesTypeEnum.map((item: any) => (
                  <Option key={item.id} value={item.id}>
                    {item.facilitiesName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="路面类型"
              name="roadType"
              rules={[{ required: true, message: '请选择路面类型' }]}
            >
              <Select placeholder="请选择路面类型" allowClear>
                {Object.keys(landTypeEnum).map((item: any) => (
                  <Option key={item} value={item * 1}>
                    {landTypeEnum[item]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="合格率"
              name="qualifyRate"
              rules={[{ required: true, message: '请输入合格率(%)' }]}
            >
              <InputNumber
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              label="完好率"
              name="intactRate"
              rules={[{ required: true, message: '请输入完好率(%)' }]}
            >
              <InputNumber
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item label="负责人" name="liablePerson">
              <Input autoComplete="off" />
            </Form.Item>
            <Form.Item
              label="检测时间"
              name="detectTime"
              rules={[{ required: true, message: '请选择检测时间' }]}
            >
              <DatePicker disabledDate={disabledDate} />
            </Form.Item>
            <div className={styles.reportItemOuter}>
              <Form.Item
                label="报表上传"
                name="laneList"
                rules={rules.checkReport}
                className={styles.reportItem}
              >
                <div className={styles.reportItemContent}>
                  {laneList.map((item: any, index: number) => {
                    return (
                      <div className={styles.reportToUpload} key={`${item.direction}${index}`}>
                        <div className={styles.leftIndex}>{index + 1}</div>
                        <div className={styles.rightContent}>
                          <div className={styles.rightRowContent}>
                            <Select
                              placeholder="请选择车道方向"
                              allowClear
                              className={styles.rowHalfCol}
                              defaultValue={item.direction}
                              onChange={(e) => valueChange(e, index, 'direction')}
                              key={`${item.direction}${index}`}
                            >
                              {Object.keys(directionEnum).map((item1: any) => (
                                <Option key={item1} value={item1 * 1}>
                                  {directionEnum[item1]}
                                </Option>
                              ))}
                            </Select>
                            <Input
                              autoComplete="off"
                              placeholder="请输入车道"
                              className={styles.rowHalfCol}
                              defaultValue={item.lane}
                              onChange={(e) => valueChange(e, index, 'lane')}
                              key={item.lane}
                            />
                            <CircleDel
                              style={{ marginTop: '10px', cursor: 'pointer' }}
                              onClick={() => delLane(index)}
                            />
                          </div>
                          {reportlist.map((m: any, n: number) => {
                            return (
                              <div className={styles.rightRowContent} key={`${m.filePath}${n}`}>
                                <InputUpload
                                  placeholder={m.placeholder}
                                  index={index}
                                  filePath={item[m.filePath]}
                                  onUpload={onUpload}
                                  type={m.filePath}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.addButton}>
                  <Button type="dashed" ghost onClick={addLane}>
                    <PlusOutlined />
                    添加车道
                  </Button>
                </div>
              </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default AddOrEditModal;
