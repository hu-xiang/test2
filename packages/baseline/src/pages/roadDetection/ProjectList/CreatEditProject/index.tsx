import { Select, Input, Button, Modal, Form, DatePicker, Upload, message, InputNumber } from 'antd';
import { UploadOutlined, PaperClipOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ReactComponent as CircleDel } from '../../../../assets/img/rodeDetection/circleDel.svg';
import React, { useEffect, useState, useRef } from 'react';
import styles from './styles.less';
import { commonRequest, commonExport } from '../../../../utils/commonMethod';
import moment from 'moment';
import InputUpload from './InputUpload';
import validRule from '../../../../utils/validate';

const { Option } = Select;

type Iprops = {
  isModalShow: boolean;
  isEdit: boolean;
  onCancel: Function;
  onOk: Function;
  editInfo: any;
};

const requestList = [
  { url: '/traffic/road/project/facList', method: 'get' },
  { url: '/traffic/road/project/add', method: 'post' },
  { url: '/traffic/road/project/edit', method: 'post' },
  { url: '/traffic/road/project/edit/list', method: 'get' },
  { url: '/traffic/road/project/libList', method: 'post' },
  { url: '/traffic/road/project/excel/model', method: 'get', blob: true },
  { url: '/traffic/road/project/check/import', method: 'post' },
];

const projectType = [{ value: 0, label: '农村公路检测' }];

const roadMaterial = [
  { value: 1, label: '沥青' },
  { value: 0, label: '水泥' },
];

const CreatEditProject: React.FC<Iprops> = (props) => {
  const formref = useRef<any>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [file, setFile] = useState<any>();
  const [roadData, setRoadData] = useState<any>([]);
  const [reportList, setReportList] = useState<any>([]);
  const [checkType, setCheckType] = useState<number>(0);
  // const [facilitiesId, setFacilitiesId] = useState<any>();
  const [picList, setPicList] = useState<any>([]);
  const [upLibraryId, setupLibraryId] = useState<any>('');
  const [downLibraryId, setDownLibraryId] = useState<any>('');
  const [canSelectPic, setCanSelectPic] = useState<any>([]);
  const [facilitiesOps, setFacilitiesOps] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const rules: any = {
    // checkReport: [validRule.checkReport(true, roadData)],
    projectName: [validRule.limitNumber50()],
  };

  const getFacilities = async () => {
    const res = await commonRequest({ ...requestList[0] });
    // setFacilitiesList(res?.data);
    // 转换格式 {1623971077728190465: "沙河西路_下行"} to [{label: '沙河西路_下行 , value: '1623971077728190465'}]
    const { data } = res;
    if (Object.keys(data).length) {
      const facOps = [];
      for (let i = 0; i < Object.keys(data).length; i++) {
        const key = Object.keys(data)[i];
        if (data[key]) {
          facOps.push({
            label: data[key],
            value: key,
          });
        }
      }
      setFacilitiesOps(facOps);
    }
  };

  useEffect(() => {
    if (facilitiesOps && props.isEdit && formref?.current?.getFieldsValue()?.facilitiesId) {
      if (
        facilitiesOps.findIndex(
          (item: any) => item.value === formref?.current?.getFieldsValue()?.facilitiesId,
        ) === -1
      ) {
        formref.current.setFieldsValue({
          facilitiesId: '',
        });
      }
    }
  }, [facilitiesOps]);

  const formatData = (val: any, list: any) => {
    const list1 = list?.map((item: any) => {
      return {
        ...item,
        libraryId: val?.filter((m: any) => m?.id === item?.libraryId)?.length
          ? item?.libraryId
          : '',
      };
    });
    setRoadData([...list1]);
  };

  const getPicList = async (e: any, list: any, up: any, down: any) => {
    if (e) {
      const res = await commonRequest({ ...requestList[4], params: { id: e } });
      setPicList(res?.data);
      if (!res?.data?.filter((item: any) => item?.id === up)?.length) {
        setupLibraryId('');
      } else {
        setupLibraryId(up);
      }
      if (!res?.data?.filter((item: any) => item?.id === down)?.length) {
        setDownLibraryId('');
      } else {
        setDownLibraryId(down);
      }
      if (props?.isEdit) {
        formatData(res?.data || [], list || []);
      }
    } else {
      setPicList([]);
      setupLibraryId('');
      setDownLibraryId('');
      formatData([], list || []);
    }
  };
  const getEditInfo = async () => {
    const res = await commonRequest({ ...requestList[3], params: { id: props?.editInfo?.id } });
    let aloneFileName = '';
    if (res?.data?.checkType) {
      aloneFileName = `${res?.data?.upLibraryId || ''}${res?.data?.downLibraryId || ''}`;
    } else {
      aloneFileName = res?.data?.aloneFileName;
    }
    formref.current.setFieldsValue({
      projectName: res?.data?.projectName,
      projectType: res?.data?.projectType,
      pavementMaterial: res?.data?.pavementMaterial,
      facilitiesId: res?.data?.facilitiesId,
      checkTime: moment(res?.data?.checkTime),
      checkType: res?.data?.checkType,
      aloneFileName,
    });
    setCheckType(res?.data?.checkType);
    if (!res?.data?.checkType) setRoadData(res?.data?.list?.length ? res?.data?.list : [{}]);
    if (res?.data?.checkType) {
      // setupLibraryId(res?.data?.upLibraryId);
      // setDownLibraryId(res?.data?.downLibraryId);
      getPicList(
        res?.data?.facilitiesId,
        res?.data?.list,
        res?.data?.upLibraryId,
        res?.data?.downLibraryId,
      );

      const arr = canSelectPic?.filter(
        (item: any) => item !== res?.data?.upLibraryId && item !== res?.data?.downLibraryId,
      );
      if (!arr?.includes(res?.data?.upLibraryId) && res?.data?.upLibraryId)
        arr?.push(res?.data?.upLibraryId);
      if (!arr?.includes(res?.data?.downLibraryId) && res?.data?.downLibraryId)
        arr?.push(res?.data?.downLibraryId);
      res?.data?.list?.forEach((item: any) => {
        if (item?.libraryId && !arr?.includes(item?.libraryId)) {
          arr?.push(item?.libraryId);
        }
      });
      setCanSelectPic([...arr]);
    } else {
      const index = res?.data?.aloneFileName?.lastIndexOf('.');
      setFirstName(res?.data?.aloneFileName?.substring(0, index));
      setLastName(res?.data?.aloneFileName?.substring(index, res?.data?.aloneFileName?.length));
    }
  };
  useEffect(() => {
    getFacilities();
    if (props?.isEdit) {
      getEditInfo();
    } else {
      setRoadData([
        {
          direct: '',
          laneNum: '',
          laneWidth: 3.75,
          pavmentFile: '',
          pavmentFileName: '',
          planenessFile: '',
          planenessFileName: '',
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (!props.isEdit) {
      formref.current.setFieldsValue({
        checkType: 0,
      });
      setCheckType(0);
    }
  }, [props.isEdit]);

  useEffect(() => {
    if (checkType) {
      if (upLibraryId || downLibraryId) {
        formref.current.setFieldsValue({
          aloneFileName: `${upLibraryId}${downLibraryId}`,
        });
      } else {
        formref.current.setFieldsValue({
          aloneFileName: '',
        });
      }
    }
  }, [upLibraryId, downLibraryId]);

  useEffect(() => {
    const list = checkType
      ? [
          {
            placeholder: '请上传平整度数据（必填）',
            filePath: 'planenessFile',
            fileName: 'planenessFileName',
          },
        ]
      : [
          {
            placeholder: '请上传路面病害数据（必填）',
            filePath: 'pavmentFile',
            fileName: 'pavmentFileName',
          },
          {
            placeholder: '请上传平整度数据（必填）',
            filePath: 'planenessFile',
            fileName: 'planenessFileName',
          },
        ];
    setReportList(list);
    roadData?.forEach((item: any) => {
      if (checkType) {
        delete item?.pavmentFile;
        delete item?.pavmentFileName;
      }
      if (!item?.hasOwnProperty('libraryId') && checkType) {
        item.libraryId = '';
      }
    });
  }, [checkType]);

  const checkLaneData = () => {
    const fileds1 = ['direct', 'laneNum', 'laneWidth', 'pavmentFileName', 'planenessFileName'];
    const fileds2 = ['direct', 'laneNum', 'laneWidth', 'libraryId', 'planenessFileName'];
    try {
      /* eslint-disable */
      let list: any = [];
      roadData?.forEach((item: any) => {
        Object.keys(item).forEach((key: any) => {
          if (checkType) {
            if (fileds2?.includes(key)) {
              if (!item[key] && !item[key] && item[key] !== 0 && item[key] !== '0') {
                throw new Error('路面数据每一项不能为空！');
              }
            }
          } else {
            if (fileds1?.includes(key)) {
              if (!item[key] && !item[key] && item[key] !== 0 && item[key] !== '0') {
                throw new Error('路面数据每一项不能为空！');
              }
            }
          }
        });
        const isRepeat = `${item?.direct}${item?.laneNum}`;
        if (list?.includes(isRepeat)) {
          throw new Error('isRepeat');
        } else {
          list?.push(isRepeat);
        }
      });
      /* eslint-enable */
    } catch (error) {
      /* eslint-disable */
      if (error?.message === 'isRepeat') {
        return Promise.resolve('isRepeat');
      } else {
        return Promise.resolve(true);
      }
      /* eslint-enable */
    }

    return Promise.resolve(false);
  };

  const handleSubmit = async () => {
    const isNull = await checkLaneData();
    if (isNull) {
      message.warning({
        content: isNull === 'isRepeat' ? '同方向情况下，车道数不可重复' : '路面数据每一项不能为空',
        key: '0',
      });
      return;
    }
    formref.current
      .validateFields()
      .then(async () => {
        setLoading(true);
        const formList = formref.current.getFieldsValue();
        formList.list = roadData;
        formList.checkTime = moment(formList.checkTime).format('YYYY-MM-DD');
        console.log(formList);
        const formData = new FormData();
        Object.keys(formList).forEach((key: any) => {
          if (key === 'list') {
            for (let i = 0; i < formList.list?.length; i++) {
              Object.keys(formList?.list[i]).forEach((key1: any) => {
                // formData.append(`arr[${i}][${key1}]`, formList?.list[i][key1]);
                formData.append(`list[${i}].${key1}`, formList?.list[i][key1]);
              });
            }
          } else {
            /* eslint-disable */
            if (!(checkType && key === 'aloneFileName')) formData.append(key, formList[key]);
            /* eslint-enable */
          }
        });
        if (!checkType) formData.append('aloneFile', file);
        if (checkType) {
          formData.append('upLibraryId', upLibraryId || '');
          formData.append('downLibraryId', downLibraryId || '');
        }
        try {
          if (props.isEdit) {
            formData.append('id', props?.editInfo?.id);
          }
          const res = await commonRequest(
            props.isEdit
              ? { ...requestList[2], params: formData }
              : { ...requestList[1], params: formData },
          );
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            setLoading(false);
            props.onCancel();
            props.onOk();
          }
          return true;
        } catch {
          message.error({
            content: '提交失败!',
            key: '提交失败!',
          });
          setLoading(false);
          return false;
        }
      })
      .catch(() => {});
  };

  const beforeUpload = (fileinfos: any) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileinfos);
    reader.onload = async () => {
      const params: any = new FormData();
      params.append('file', fileinfos);
      params.append('checkType', 0);
      const res = await commonRequest({ ...requestList[6], params });

      if (res?.status === 0) {
        setFile(fileinfos);
        formref.current.setFieldsValue({
          aloneFileName: fileinfos?.name,
        });
        const index = fileinfos?.name?.lastIndexOf('.');
        setFirstName(fileinfos?.name?.substring(0, index));
        setLastName(fileinfos?.name?.substring(index, fileinfos?.name?.length));
      }
    };

    return false;
  };
  const onChange = (files: any) => {
    if (!files.fileList.length) {
      formref.current.setFieldsValue({
        aloneFileName: '',
      });
      setFile('');
      setFirstName('');
      setLastName('');
    }
  };

  const removeFile = () => {
    setFile('');
    setFirstName('');
    setLastName('');
    formref.current.setFieldsValue({
      aloneFileName: undefined,
    });
  };

  const delRoadData = (index: any) => {
    if (roadData.length === 1 && index === 0) {
      message.warning({
        content: '至少保留一条路面数据',
        key: '0',
      });
      return;
    }
    roadData.splice(index, 1);
    setRoadData([...roadData]);
  };

  const onUpload = async (index: number, type: string, file1: any, fileName: string) => {
    const data = roadData;
    roadData[index][type] = file1;
    if (type === 'pavmentFile') {
      roadData[index].pavmentFileName = fileName;
    } else if (type === 'planenessFile') {
      roadData[index].planenessFileName = fileName;
    }
    setRoadData(data);
  };

  const addLane = () => {
    setRoadData([
      ...roadData,
      checkType
        ? {
            direct: '',
            laneNum: '',
            laneWidth: 3.75,
            libraryId: '',
            planenessFile: '',
            planenessFileName: '',
          }
        : {
            direct: '',
            laneNum: '',
            laneWidth: 3.75,
            pavmentFile: '',
            pavmentFileName: '',
            planenessFile: '',
            planenessFileName: '',
          },
    ]);
  };

  const valueChange = (e: any, index: any, filed: string) => {
    const data = roadData;
    // if (filed === 'laneWidth') data[index][filed] = e?.target?.value;
    // else data[index][filed] = e;
    data[index][filed] = e;
    setRoadData(data);
  };

  const downloadFile = (type: number) => {
    const params = {
      type,
    };
    commonExport({ ...requestList[5], params });
  };

  return (
    <div>
      <Modal
        title={props?.isEdit ? '项目编辑' : '项目创建'}
        open={props?.isModalShow}
        maskClosable={false}
        onCancel={() => {
          props.onCancel();
        }}
        confirmLoading={loading}
        onOk={() => handleSubmit()}
        width={'600px'}
        bodyStyle={{
          // paddingBottom: '20px',
          maxHeight: 'calc(90vh - 136px)',
          overflow: 'scroll',
        }}
        style={{ top: '5%' }}
        className={styles.creatEditProject}
      >
        <Form
          labelAlign="right"
          labelCol={{ flex: '106px' }}
          labelWrap
          wrapperCol={{ flex: 1 }}
          ref={formref}
          colon={false}
        >
          <Form.Item label="项目名称" name="projectName" rules={rules?.projectName}>
            <Input placeholder="请输入项目名称" autoComplete="off" disabled={props?.isEdit} />
          </Form.Item>

          <Form.Item
            label="项目类型"
            name="projectType"
            rules={[{ required: true, message: '请选择项目类型' }]}
          >
            <Select disabled={props?.isEdit} placeholder="请选择" allowClear>
              {projectType.map((item: any) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="道路名称"
            name="facilitiesId"
            rules={[{ required: true, message: '请选择道路名称' }]}
          >
            <Select
              onChange={(e) => {
                // setFacilitiesId(e);
                setCanSelectPic([]);
                getPicList(e, roadData, upLibraryId, downLibraryId);
              }}
              disabled={props?.isEdit}
              placeholder="请选择"
              allowClear
              filterOption={(input, option) => {
                return `${option?.label}`?.includes(input.toLowerCase());
              }}
              showSearch
              options={facilitiesOps}
            ></Select>
          </Form.Item>

          <Form.Item
            label="路面材质"
            name="pavementMaterial"
            rules={[{ required: true, message: '请选择路面材质' }]}
          >
            <Select placeholder="请选择" allowClear disabled={props?.isEdit}>
              {roadMaterial.map((item: any) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="检测时间"
            name="checkTime"
            rules={[{ required: true, message: '请选择检测时间' }]}
          >
            <DatePicker placeholder="请选择" disabled={props?.isEdit} />
          </Form.Item>

          <Form.Item
            label="检测方式"
            name="checkType"
            rules={[{ required: true, message: '请选择检测方式' }]}
          >
            <Select
              onChange={(val) => setCheckType(val)}
              placeholder="请选择"
              disabled={props?.isEdit}
            >
              <Option value={0}>报表导入</Option>
              <Option value={1}>平台检测</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="沿线设施数据"
            name="aloneFileName"
            rules={[{ required: true, message: '请上传沿线设施数据' }]}
            style={{ width: '560px' }}
          >
            {checkType ? (
              <div>
                <Select
                  onChange={(e) => {
                    if (!e) {
                      const list = canSelectPic?.filter((item: any) => item !== upLibraryId);
                      setCanSelectPic([...list]);
                    } else {
                      const list = upLibraryId
                        ? canSelectPic?.filter((item: any) => item !== upLibraryId)
                        : canSelectPic;
                      if (!list?.includes(e)) list?.push(e);
                      setCanSelectPic([...list]);
                    }
                    setupLibraryId(e);
                  }}
                  placeholder="请选择上行图片库"
                  style={{ width: '219px', marginRight: '10px' }}
                  value={upLibraryId || null}
                  allowClear
                >
                  {picList.map((item: any) => (
                    <Option
                      key={item.id}
                      value={item.id}
                      disabled={canSelectPic?.includes(item?.id)}
                    >
                      {item.libraryName}
                    </Option>
                  ))}
                </Select>
                <Select
                  onChange={(e) => {
                    if (!e) {
                      const list = canSelectPic?.filter((item: any) => item !== downLibraryId);
                      setCanSelectPic([...list]);
                    } else {
                      const list = downLibraryId
                        ? canSelectPic?.filter((item: any) => item !== downLibraryId)
                        : canSelectPic;
                      if (!list?.includes(e)) list?.push(e);
                      setCanSelectPic([...list]);
                    }
                    setDownLibraryId(e);
                  }}
                  placeholder="请选择下行图片库"
                  style={{ width: '219px' }}
                  value={downLibraryId || null}
                  allowClear
                >
                  {picList.map((item: any) => (
                    <Option
                      key={item.id}
                      value={item.id}
                      disabled={canSelectPic?.includes(item?.id)}
                    >
                      {item.libraryName}
                    </Option>
                  ))}
                </Select>
              </div>
            ) : (
              <div className={styles.uploadContent}>
                <div>
                  <Upload
                    accept=".xls,.xlsx"
                    maxCount={1}
                    onChange={onChange}
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                  >
                    <Button icon={<UploadOutlined />}>上传文件</Button>
                  </Upload>
                  <a
                    className="ahover"
                    style={{ marginLeft: '10px' }}
                    onClick={() => downloadFile(0)}
                  >
                    下载模板
                  </a>
                </div>

                {(firstName || lastName) && (
                  <div className={styles.fileBox}>
                    <div className="fileIcon">
                      <PaperClipOutlined />
                    </div>
                    <div
                      className={styles.fileName}
                      title={firstName}
                      style={{ width: `${350 + 40}px` }}
                    >
                      <div className={styles.firstName} style={{ maxWidth: '350px' }}>
                        {firstName}
                      </div>
                      <div className={styles.lastName}>{lastName}</div>
                    </div>
                    <div className={styles.removeBnt}>
                      <DeleteOutlined onClick={removeFile} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </Form.Item>
        </Form>
        <div
          style={{ marginTop: firstName || lastName ? '40px' : undefined }}
          className={styles.lastItem}
        >
          <div className={styles.itemLabel}>路面数据</div>
          {roadData.map((item: any, index: number) => {
            return (
              <div key={item.pavementId || index} className={styles.itemContent}>
                <div className={styles.firstRow}>
                  <div style={{ lineHeight: '40px', width: '20px' }}>{index + 1}</div>
                  <div style={{ marginRight: '10px', width: '140px' }}>
                    <Select
                      placeholder="请选择"
                      style={{ width: '140px' }}
                      defaultValue={item.direct || item.direct === 0 ? item.direct : null}
                      onChange={(e) => valueChange(e, index, 'direct')}
                    >
                      <Option value={0}>上行</Option>
                      <Option value={1}>下行</Option>
                    </Select>
                  </div>
                  <div style={{ marginRight: '10px' }}>
                    <InputNumber
                      placeholder="车道"
                      style={{ width: '140px' }}
                      defaultValue={item.laneNum}
                      min={1}
                      max={10}
                      precision={0}
                      onChange={(e) => valueChange(e, index, 'laneNum')}
                    ></InputNumber>
                    {/* <Input
                      placeholder="车道"
                      style={{ width: '140px', height: '40px' }}
                      defaultValue={item.laneNum}
                      onChange={(e) => valueChange(e, index, 'laneNum')}
                    ></Input> */}
                  </div>
                  <div>
                    {/* <Input
                      placeholder="车道宽度（m）"
                      suffix="m"
                      style={{ height: '40px', width: '140px' }}
                      defaultValue={item.laneWidth}
                      onChange={(e) => valueChange(e, index, 'laneWidth')}
                    /> */}
                    <InputNumber
                      placeholder="车道宽度（m）"
                      // suffix="m"
                      style={{ height: '40px', width: '140px' }}
                      defaultValue={item.laneWidth}
                      min={0}
                      precision={2}
                      addonAfter="m"
                      onChange={(e) => valueChange(e, index, 'laneWidth')}
                    ></InputNumber>
                  </div>
                  <CircleDel
                    style={{ marginTop: '10px', cursor: 'pointer', marginLeft: '10px' }}
                    onClick={() => delRoadData(index)}
                  />
                </div>
                {checkType ? (
                  <div className={styles.selectPics}>
                    <Select
                      placeholder="请选择路面病害数据图片库（必填）"
                      style={{ width: '440px' }}
                      defaultValue={item.libraryId || null}
                      onChange={(e) => {
                        if (!e) {
                          const list = canSelectPic?.filter(
                            (item1: any) => item1 !== roadData[index].libraryId,
                          );
                          setCanSelectPic([...list]);
                        } else {
                          const list = roadData[index].libraryId
                            ? canSelectPic?.filter(
                                (item2: any) => item2 !== roadData[index].libraryId,
                              )
                            : canSelectPic;
                          if (!list?.includes(e)) list?.push(e);
                          setCanSelectPic([...list]);
                        }
                        valueChange(e, index, 'libraryId');
                      }}
                      allowClear
                    >
                      {picList.map((d: any) => (
                        <Option key={d.id} value={d.id} disabled={canSelectPic?.includes(d?.id)}>
                          {d.libraryName}
                        </Option>
                      ))}
                    </Select>
                  </div>
                ) : null}
                <div>
                  {reportList.map((m: any) => {
                    return (
                      <div className={styles.rightRowContent} key={`${m.filePath}${index}`}>
                        <InputUpload
                          placeholder={m.placeholder}
                          index={index}
                          fileName={item[m.fileName]}
                          onUpload={onUpload}
                          type={m.filePath}
                        />
                        <a
                          className="ahover"
                          style={{ marginLeft: '10px' }}
                          onClick={() => downloadFile(m.filePath === 'pavmentFile' ? 1 : 2)}
                        >
                          下载模板
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className={styles.addButton}>
            <Button type="dashed" ghost onClick={addLane}>
              <PlusOutlined />
              添加车道
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default CreatEditProject;
