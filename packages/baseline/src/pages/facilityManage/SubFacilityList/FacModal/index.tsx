import { Modal, Form, Select, message, DatePicker } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import styles from '../styles.less';
import MapLocation from '../../../../components/MapLocation';
import MarkMap from '../../../../components/MarkMap';
import UploadPic from '../UploadPic';
import type { DatePickerProps } from 'antd/es/date-picker';
import { commonRequest, getDictData } from '../../../../utils/commonMethod';
import moment from 'moment';

const { Option } = Select;
type Iprops = {
  isModalshow: boolean;
  isEdit: boolean;
  onCancel: Function;
  onsetkey: Function;
  editInfo: any;
  facilitiesTypeEnum: any;
  parentFacilitiesList: any;
};
let pageX = 0;
let pageY = 0;

const requestList = [
  { url: '/traffic/sub/facilities/facilities/sub/typeList', method: 'get' }, // 附属设施子类型
  { url: '/traffic/sub/facilities/add', method: 'post' },
  { url: '/traffic/sub/facilities/edit', method: 'post' },
  { url: '/traffic/sub/facilities/editList', method: 'get' },
];

const FacModal: React.FC<Iprops> = (props) => {
  const formref = useRef<any>();
  const [positionModalVisible, setpositionModalVisible] = useState(false);
  const { lnglatArr, setLnglatArr } = useModel<any>('facility');
  const { filePath, fileName, setFilePath, setFileName } = useModel<any>('file');
  const [oriPositionList, setOriPositionList] = useState<any>([]);
  const [subTypeEnum, setSubTypeEnum] = useState<any>([]);
  const { bbox, setBbox } = useModel<any>('facility');
  const { setBboxData } = useModel<any>('facility');
  const [facTypeEn, setFacTypeEn] = useState('');
  const [subTypeEn, setSubTypeEn] = useState('');

  const getSubType = async (val: any, option: any) => {
    if (val) {
      setFacTypeEn(option?.key);
      const res: any = await getDictData({ type: 2, dictCodes: [option?.key], scenesType: 3 }); // commonRequest({ ...requestList[0], params: { key: val } });
      setSubTypeEnum(res);
    } else {
      setSubTypeEnum([]);
    }
    if (!props?.isEdit) {
      formref.current.setFieldsValue({
        subType: '',
      });
    }
  };

  const subTypeChange = (option: any) => {
    setSubTypeEn(option?.key);
  };

  const getEditInfo = async (id: any) => {
    const res = await commonRequest({ ...requestList[3], params: { id } });
    setTimeout(() => {
      setLnglatArr([[], [res?.data?.longitude, res?.data?.latitude]]);
    }, 0);
    formref.current.setFieldsValue({
      type: res?.data?.type,
      subType: res?.data?.subType,
      imgUrl: res?.data?.imgUrl,
      facilitiesId: res?.data?.facilitiesId,
      direction: res?.data?.direction,
      collectTime: res?.data?.collectTime ? moment(res?.data?.collectTime) : '',
    });
    getSubType(res?.data?.type, { key: res?.data?.facTypeEn });
    setSubTypeEn(res?.data?.facTypeEn);
    setFileName(res?.data?.imgName);
    setFilePath(res?.data?.imgUrl);
    setBbox(res?.data?.bbox);
    setBboxData({
      url: res?.data?.imgUrl,
      ls: [
        {
          bbox: res?.data?.bbox,
          diseaseNameZh: res?.data?.typeName,
        },
      ],
    });
  };

  useEffect(() => {
    formref.current.setFieldsValue({
      imgUrl: filePath,
    });
  }, [filePath]);

  useEffect(() => {
    formref.current.setFieldsValue({
      locationList: lnglatArr.slice(1),
    });
  }, [lnglatArr]);

  useEffect(() => {
    setLnglatArr([[]]);
    if (props.isEdit) {
      getEditInfo(props.editInfo.id);
    } else {
      setFileName('');
      setFilePath('');
    }
    return () => {
      setFileName('');
      setFilePath('');
      setBbox(null);
      setBboxData(null);
    };
  }, []);

  const handleSubmit = async () => {
    const formList = formref.current.getFieldsValue();
    console.log(formList);
    formref.current
      .validateFields()
      .then(async () => {
        formList.imgUrl = filePath;
        formList.imgName = fileName;
        const [longitude, latitude] = lnglatArr[1];
        formList.longitude = longitude;
        // formList.subType = formList.subTyp || formList.subTyp === 0 ? formList.subTyp : null;
        formList.latitude = latitude;
        formList.bbox = typeof bbox === 'string' ? bbox : JSON.stringify(bbox);
        formList.collectTime = moment(formList.collectTime).format('YYYY-MM-DD HH:mm:ss');
        formList.facTypeEn = facTypeEn;
        formList.subTypeEn = subTypeEn;
        delete formList.locationList;
        try {
          let res;
          if (props.isEdit) {
            formList.id = props.editInfo.id;
            res = await commonRequest({ ...requestList[2], params: formList });
          } else {
            res = await commonRequest({ ...requestList[1], params: formList });
          }
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            setLnglatArr([[]]);
            props.onCancel();
            props.onsetkey();
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

  const positionMouseDown = (event: any) => {
    pageX = event.pageX;
    pageY = event.pageY;
  };
  const togglePositionModal = (event?: any) => {
    let timer = null;
    if (
      !event ||
      (event && Math.abs(event.pageX - pageX) <= 1 && Math.abs(event.pageY - pageY) <= 1)
    ) {
      if (timer) return;
      timer = setTimeout(() => {
        setpositionModalVisible(!positionModalVisible);
      }, 50);
      if (!event) {
        setLnglatArr(oriPositionList);
      } else {
        setOriPositionList(lnglatArr);
      }
    }
  };
  const savePosition = () => {
    setpositionModalVisible(!positionModalVisible);
  };

  const onChange = (value: DatePickerProps['value'], dateString: [string, string] | string) => {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString);
  };

  const onOk = (value: DatePickerProps['value']) => {
    console.log('onOk: ', value);
  };

  return (
    <>
      <Modal
        title={props.isEdit ? '编辑附属设施' : '创建附属设施'}
        open={props.isModalshow}
        maskClosable={false}
        onCancel={() => {
          setLnglatArr([[]]);
          props.onCancel();
        }}
        onOk={() => handleSubmit()}
        className={`facModal ${styles.facModal}`}
      >
        <div className="box">
          <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
            <Form.Item
              label="附属设施类型"
              name="type"
              rules={[{ required: true, message: '请选择附属设施类型' }]}
            >
              <Select
                placeholder="请选择"
                allowClear
                disabled={props.isEdit}
                onChange={(val, option) => getSubType(val, option)}
              >
                {props.facilitiesTypeEnum.map((item: any) => (
                  <Option key={item.dictCode} value={item.dictKey}>
                    {item.dictName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="附属设施子类型" name="subType">
              <Select
                placeholder="请选择"
                allowClear
                onChange={(val, option) => subTypeChange(option)}
              >
                {subTypeEnum?.map((item: any) => (
                  <Option key={item.dictCode} value={item.dictKey}>
                    {item.dictName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="采集时间"
              name="collectTime"
              rules={[{ required: true, message: '请选择采集时间' }]}
            >
              <DatePicker showTime onChange={onChange} onOk={onOk} disabled={props.isEdit} />
            </Form.Item>
            <Form.Item
              label="所属道路"
              name="facilitiesId"
              rules={[{ required: true, message: '请选择所属道路' }]}
            >
              <Select placeholder="请选择" allowClear>
                {props?.parentFacilitiesList.map((item: any) => (
                  <Option key={item.id} value={item.id}>
                    {item.facilitiesName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="图片上传"
              name="imgUrl"
              rules={[{ required: true, message: '请上传图片' }]}
            >
              <UploadPic
                uploadUrl="/traffic/sub/facilities/upload/img"
                removeUrl="/traffic/sub/facilities/file/del"
                width={316}
                disabled={props.isEdit}
                isEdit={props.isEdit}
              ></UploadPic>
            </Form.Item>
            <Form.Item
              label="地图定位"
              name="locationList"
              className="map-location"
              rules={[{ required: true, message: '地图定位不能为空', type: 'array' }]}
            >
              <div
                className={styles.positionWrap}
                onMouseDown={positionMouseDown}
                onMouseUp={togglePositionModal}
              >
                {!positionModalVisible ? (
                  <MapLocation height={100} isNotSetNull={true} isOne={true}></MapLocation>
                ) : (
                  ''
                )}
              </div>
            </Form.Item>
            <Form.Item
              name="direction"
              label="方向"
              className="addUserClass"
              rules={[{ required: true, message: '请选择方向' }]}
            >
              <Select placeholder="请选择" allowClear>
                <Option key={0} value={0 * 1}>
                  上行
                </Option>
                <Option key={1} value={1 * 1}>
                  下行
                </Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      {positionModalVisible ? (
        <Modal
          title="地图定位"
          width={'70vw'}
          bodyStyle={{ height: 'calc(90vh - 136px)', padding: '0' }}
          maskClosable={false}
          style={{ top: '5%' }}
          open={positionModalVisible}
          onCancel={() => togglePositionModal()}
          onOk={() => savePosition()}
        >
          <MarkMap searchVisible={true} isOne={true} height={'calc(90vh - 136px)'}></MarkMap>
        </Modal>
      ) : (
        ''
      )}
    </>
  );
};

export default FacModal;
