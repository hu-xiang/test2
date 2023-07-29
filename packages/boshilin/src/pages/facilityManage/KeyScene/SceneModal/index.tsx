import { Input, Modal, Form, Select, message, Switch } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import MapLocation from 'baseline/src/components/MapLocation';
import MarkMap from 'baseline/src/components/MarkMap';
import { commonRequest } from 'baseline/src/utils/commonMethod';

const requestList = [
  { url: '/traffic-bsl/focusScene/add', method: 'post' },
  { url: '/traffic-bsl/focusScene/edit', method: 'put' },
  { url: '/traffic-bsl/focusScene/showEdit', method: 'get' },
  { url: '/traffic-bsl/focusScene/selectSceneName', method: 'get' },
  { url: '/traffic/facilities/select', method: 'get' },
  { url: '/traffic-bsl/focusScene/checkName', method: 'get' },
];

const { Option } = Select;
type Iprops = {
  isModalshow: boolean;
  isEdit: boolean;
  onCancel: Function;
  onsetkey: Function;
  editInfo: any;
};
let pageX = 0;
let pageY = 0;

const SceneModal: React.FC<Iprops> = (props) => {
  const formref = useRef<any>();
  const [positionModalVisible, setpositionModalVisible] = useState(false);
  const { lnglatArr, setLnglatArr } = useModel<any>('facility');
  const [oriPositionList, setOriPositionList] = useState<any>([]);
  const [sceneTypeList, setSceneTypeList] = useState<any>([]);
  const [facilitiesList, setFacilitiesList] = useState<any>([]);
  const [facilitiesId, setFacilitiesId] = useState<any>(null);
  const [sceneId, setSceneId] = useState<any>(null);

  const formatLocation = (arr: any[]) => {
    const list: any = [[]];
    if (arr.length) {
      arr.forEach((item: any) => {
        list.push([item.longitude, item.latitude]);
      });
    }
    setTimeout(() => {
      setLnglatArr(list);
    }, 0);
  };
  // 验证场景名称
  const checkName = () => {
    return {
      required: true,
      validator: async (_rule?: any, value?: any) => {
        if (!value) {
          return Promise.reject(new Error('请输入场景名称'));
        }
        if (value.length > 50) {
          return Promise.reject(new Error('场景名称总字数不能超过50'));
        }
        if (!props.isEdit) {
          const res = await commonRequest({
            ...requestList[5],
            params: { name: value },
            needError: false,
          });
          if (res.status !== 0) {
            return Promise.reject(new Error('该场景名称已使用，场景名称不能重复'));
          }
        }

        return Promise.resolve();
      },
    };
  };

  const rules: any = {
    checkName: [checkName()],
  };

  const getEditInfo = async (id: any) => {
    const res = await commonRequest({ ...requestList[2], params: { id } });
    if (res?.status === 0) formatLocation(res?.data?.locationList);
    formref.current.setFieldsValue({
      focusSceneName: res?.data?.focusSceneName,
      checkStatus: res?.data?.checkStatus,
      fkFacilitiesName: res?.data?.facilitiesName,
      fkSceneTypeName: res?.data?.sceneName,
    });
    setFacilitiesId(res?.data?.facilitiesId);
    setSceneId(res?.data?.sceneId);
  };

  useEffect(() => {
    formref.current.setFieldsValue({
      locationList: lnglatArr.slice(1),
    });
  }, [lnglatArr]);

  const getFacList = async (value: string) => {
    commonRequest({ ...requestList[4], params: { name: value } }).then((res: any) => {
      setFacilitiesList(res?.data);
    });
  };

  const getSceneList = async (value: string) => {
    commonRequest({ ...requestList[3], params: { sceneName: value } }).then((res: any) => {
      setSceneTypeList(res?.data);
    });
  };

  useEffect(() => {
    getFacList('');
    getSceneList('');
    setLnglatArr([[]]);
    if (props.isEdit) {
      getEditInfo(props.editInfo.id);
    } else {
      formref.current.setFieldsValue({
        checkStatus: 1,
      });
    }
  }, []);

  const handleSubmit = async () => {
    const formList = formref.current.getFieldsValue();
    formref.current
      .validateFields()
      .then(async () => {
        const locationList = lnglatArr.slice(1).map((item: any) => {
          return {
            latitude: item[1],
            longitude: item[0],
          };
        });
        formList.fkSceneTypeId = sceneId;
        formList.fkFacilitiesId = facilitiesId;
        formList.locationList = locationList;
        try {
          let res;
          if (props.isEdit) {
            formList.id = props.editInfo.id;
            res = await commonRequest({ ...requestList[1], params: formList });
          } else {
            res = await commonRequest({ ...requestList[0], params: formList });
          }
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            setLnglatArr([[]]);
            props.onCancel();
            props.onsetkey();
          } else {
            message.error({
              content: res.message,
              key: res.message,
            });
          }
        } catch {
          message.error({
            content: '提交失败!',
            key: '提交失败!',
          });
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

  const onChange = (val: boolean) => {
    formref.current.setFieldsValue({
      checkStatus: val ? 1 : 0,
    });
  };

  const searchSceneType = (newValue: string) => {
    if (newValue) getSceneList(newValue);
    else setSceneTypeList([]);
  };

  const searchFacilities = (newValue: string) => {
    if (newValue) getFacList(newValue);
    else setFacilitiesList([]);
  };

  const changeSceneType = (newValue: string) => {
    setSceneId(sceneTypeList.filter((item: any) => item.sceneName === newValue)[0]?.id);
  };

  const changeFacilities = (newValue: string) => {
    setFacilitiesId(facilitiesList.filter((item: any) => item.facilitiesName === newValue)[0]?.id);
  };

  return (
    <>
      <Modal
        title={props.isEdit ? '编辑隐患场景' : '创建隐患场景'}
        open={props.isModalshow}
        maskClosable={false}
        onCancel={() => {
          setLnglatArr([[]]);
          props.onCancel();
        }}
        onOk={() => handleSubmit()}
      >
        <div className="box">
          <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
            <Form.Item
              label="场景名称"
              name="focusSceneName"
              rules={rules.checkName}
              validateTrigger="onBlur"
            >
              <Input autoComplete="off" placeholder="请输入场景名称" disabled={props.isEdit} />
            </Form.Item>
            <Form.Item
              label="场景类型"
              name="fkSceneTypeName"
              rules={[{ required: true, message: '请选择场景类型' }]}
            >
              <Select
                placeholder="请选择场景类型"
                allowClear
                showSearch
                onSearch={searchSceneType}
                onChange={changeSceneType}
                defaultActiveFirstOption={false}
                filterOption={false}
              >
                {sceneTypeList?.map((item: any) => (
                  <Option key={item.id} value={item.sceneName}>
                    {item.sceneName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="道路名称"
              name="fkFacilitiesName"
              rules={[{ required: true, message: '请选择道路名称' }]}
            >
              <Select
                placeholder="请选择道路名称"
                allowClear
                showSearch
                onSearch={searchFacilities}
                onChange={changeFacilities}
                defaultActiveFirstOption={false}
                filterOption={false}
              >
                {facilitiesList?.map((item: any) => (
                  <Option key={item.id} value={item.facilitiesName}>
                    {item.facilitiesName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="是否排查" name="checkStatus" valuePropName="checked">
              <Switch onChange={(e) => onChange(e)} />
            </Form.Item>
            <Form.Item
              label="场景位置"
              name="locationList"
              className="map-location"
              rules={[{ required: true, message: '场景位置不能为空', type: 'array' }]}
            >
              <div onMouseDown={positionMouseDown} onMouseUp={togglePositionModal}>
                {!positionModalVisible ? (
                  <MapLocation height={120} isNotSetNull={true}></MapLocation>
                ) : (
                  ''
                )}
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      {positionModalVisible ? (
        <Modal
          title="地图定位"
          width={'70vw'}
          bodyStyle={{ height: 'calc(90vh - 136px)', paddingBottom: '20px' }}
          maskClosable={false}
          open={positionModalVisible}
          onCancel={() => togglePositionModal()}
          onOk={() => savePosition()}
          style={{ top: '5%' }}
        >
          <MarkMap searchVisible={true} height={'calc(90vh - 176px)'}></MarkMap>
        </Modal>
      ) : (
        ''
      )}
    </>
  );
};

export default SceneModal;
