import { Input, Modal, Form, Select, InputNumber, TreeSelect, Row, Col, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
// import { useModel } from 'umi';
import styles from '../styles.less';
import validRule from 'baseline/src/utils/validate';
import { fetchTree, getRoadList, getRoadInfo, structureSave } from '../service';

// const requestList = [{ url: '/traffic/facility/location/queryStake', method: 'get' }];

type Iprops = {
  visible: boolean;
  isEdit: boolean;
  onCancel: Function;
  onOK: Function;
  rowInfo: any;
};

const Crtmodel: React.FC<Iprops> = (props) => {
  const [roadNameOps, setRoadNameOps] = useState<any>([]);
  const [roadTypeOps, setRoadTypeOps] = useState<any>([]);
  const [roadLevelOps, setRoadLevelOps] = useState<any>([]);
  const [structureTypeOps, setStructureTypeOps] = useState<any>([]);
  const [isCustomRoadName, setIsCustomRoadName] = useState<boolean>(false);
  const [treelist, setTreelist] = useState<any>([]);
  const [roadName, setRoadName] = useState<any>('');
  const [deptIds, setDeptIds] = useState<any>([]);

  const formRef = useRef<any>();

  const rules: any = {
    name: [validRule.limitNumber20()],
    laneNum: [validRule.checkInteger10()],
  };

  const CITY_ROAD = [
    { label: '快速路', value: 0 },
    { label: '主干道', value: 1 },
    { label: '次干道', value: 2 },
    { label: '支路', value: 3 },
  ];
  const HIGHWAY_ROAD = [
    { label: '高速公路', value: 4 },
    { label: '一级公路', value: 5 },
    { label: '二级公路', value: 6 },
    { label: '三级公路', value: 7 },
    { label: '四级公路', value: 8 },
  ];

  useEffect(() => {
    setRoadTypeOps([
      { label: '城市道路', value: 0 },
      { label: '公路', value: 1 },
    ]);
    setStructureTypeOps([
      { label: '桥梁', value: 1 },
      { label: '隧道', value: 2 },
      { label: '涵洞', value: 3 },
    ]);
    if (props.isEdit) {
      setRoadLevelOps([...CITY_ROAD, ...HIGHWAY_ROAD]);
    }
  }, []);

  const submit = () => {
    formRef.current.validateFields().then(async () => {
      const formList = formRef.current.getFieldsValue();
      const {
        structureType,
        structureName,
        structureLength,
        position,
        roadType,
        roadLevel,
        managementUnit,
        facilityId,
      } = formList;

      const params = {
        depts: deptIds?.length ? deptIds : props.rowInfo.depts,
        facilityId: !facilityId ? '' : facilityId,
        id: '',
        managementUnit,
        position,
        roadLevel,
        roadSection: roadName,
        roadType,
        structureLength,
        structureName,
        structureType,
      };
      if (isCustomRoadName) {
        params.roadSection = formRef.current.getFieldValue('cusRoadName');
      }

      if (props.isEdit) {
        params.id = props.rowInfo.id;
      }
      const res = await structureSave(params);
      if (res.status === 0) {
        message.success({
          content: '保存成功',
        });
        props.onCancel();
        props.onOK();
      }
    });
  };

  const handleGetRoadInfo = async (id: string) => {
    const res = await getRoadInfo({ id });
    if (res.status === 0) {
      const { deptId, roadType, roadLevel, managementUnit } = res.data;
      formRef.current.setFieldsValue({
        roadType,
        roadLevel,
        managementUnit,
        depts: deptId.split(','),
      });

      setDeptIds(deptId.split(','));
    }
  };
  const handleChangeRoadName = (value: any) => {
    formRef.current.setFieldsValue({
      roadType: undefined,
      roadLevel: undefined,
      cusRoadName: undefined,
      managementUnit: '',
      depts: [],
    });
    if (value !== 0 && value !== undefined) {
      handleGetRoadInfo(value);
      setRoadLevelOps([...CITY_ROAD, ...HIGHWAY_ROAD]);

      const roadNameItem = roadNameOps.filter((item: any) => item.value === value);
      setRoadName(roadNameItem[0]?.label);
    } else {
      setRoadLevelOps([]);
    }
    setIsCustomRoadName(value === 0);
  };
  const handleChangeRoadType = (value: any) => {
    formRef.current.setFieldValue('roadLevel', undefined);
    if (value === undefined) {
      setRoadLevelOps([]);
      return;
    }
    setRoadLevelOps(value === 1 ? HIGHWAY_ROAD : CITY_ROAD);
  };

  // 递归处理组织架构树形数据
  const convertData = (data: any) => {
    const info = data;
    info.forEach((item: any, index: any) => {
      info[index] = {
        ...item,
        label: item.label.toString(),
        key: item.id.toString(),
        value: item.id.toString(),
      };
      if (item.children) {
        convertData(item.children);
      }
    });
    setTreelist(info);
  };
  const getTree = async () => {
    const res = await fetchTree();
    convertData(res);
  };

  const handleGetRoadList = async () => {
    const res = await getRoadList();
    if (res.status === 0) {
      const ret: any = [];
      if (!res?.data?.length) {
        ret.push({
          label: '自定义',
          value: 0,
        });
        setRoadNameOps(ret);
        return;
      }
      res.data.forEach((item: any) => {
        ret.push({
          label: item.facilitiesName,
          value: item.id,
        });
      });
      ret.push({
        label: '自定义',
        value: 0,
      });
      setRoadNameOps(ret);
    }
  };

  const handleDeptChange = (value: any) => {
    let ids = [];
    if (value?.length) {
      ids = value.map((item: any) => item.value);
    }
    setDeptIds(ids);
  };

  useEffect(() => {
    handleGetRoadList();

    getTree();
    if (props.isEdit) {
      const {
        depts,
        structureName,
        roadType,
        roadLevel,
        structureType,
        structureLength,
        facilityId,
        roadSection,
        position,
        managementUnit,
      } = props.rowInfo;
      formRef.current.setFieldsValue({
        depts,
        structureName,
        roadType,
        roadLevel,
        structureType,
        structureLength,
        facilityId: !facilityId ? 0 : facilityId,
        position,
        managementUnit,
      });

      // 自定义
      if (!facilityId) {
        formRef.current.setFieldValue('cusRoadName', roadSection);
        setIsCustomRoadName(true);
      }
    }
  }, []);
  return (
    <>
      <Modal
        title={!props.isEdit ? '创建结构物' : '编辑结构物'}
        open={props.visible}
        maskClosable={false}
        okText={'提交'}
        onCancel={() => {
          props.onCancel();
        }}
        onOk={() => submit()}
        width={960}
      >
        <div className="box">
          <Form
            labelAlign="right"
            labelCol={{ flex: '100px' }}
            labelWrap
            wrapperCol={{ flex: 1 }}
            colon={false}
            ref={formRef}
          >
            <Row>
              <Col span={12}>
                <Form.Item label="结构物名称" name="structureName" rules={rules.name}>
                  <Input
                    autoComplete="off"
                    placeholder="请输入结构物名称"
                    style={{ width: '348px' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="所属道路名称">
                  <Form.Item name="facilityId" style={{ display: 'inline-block', width: '168px' }}>
                    <Select
                      style={{ height: 40 }}
                      placeholder="请选择道路名称"
                      allowClear
                      onChange={handleChangeRoadName}
                      options={roadNameOps}
                    ></Select>
                  </Form.Item>
                  <Form.Item
                    name="cusRoadName"
                    style={{ display: 'inline-block', width: '168px', marginLeft: '8px' }}
                  >
                    <Input
                      disabled={!isCustomRoadName}
                      autoComplete="off"
                      placeholder="请输入道路名称"
                      maxLength={50}
                    />
                  </Form.Item>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="道路类别" name="roadType">
                  <Select
                    style={{ height: '40px', width: '348px' }}
                    placeholder="请选择道路类别"
                    allowClear
                    onChange={handleChangeRoadType}
                    options={roadTypeOps}
                    disabled={!isCustomRoadName}
                  ></Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="道路等级" name="roadLevel">
                  <Select
                    style={{ width: '344px' }}
                    placeholder="请选择道路等级"
                    allowClear
                    // onChange={handleChangeRoadLevel}
                    options={roadLevelOps}
                    disabled={!isCustomRoadName}
                  ></Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  label="结构物类型"
                  name="structureType"
                  rules={[{ required: true, message: '请选择结构物类型' }]}
                >
                  <Select
                    style={{ height: '40px', width: '348px' }}
                    placeholder="请选择结构物类型"
                    allowClear
                    // onChange={handleChangeStructureType}
                    options={structureTypeOps}
                  ></Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="结构物长度"
                  name="structureLength"
                  className={styles.structureLen}
                >
                  <InputNumber
                    style={{ width: '344px' }}
                    placeholder="请输入结构物长度"
                    // onChange={handleChangeLen}
                    min={0}
                    precision={0}
                    prefix="m"
                  ></InputNumber>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="位置描述" name="position">
                  <Input
                    autoComplete="off"
                    placeholder="请输入起点桩号或路段信息"
                    style={{ width: '348px' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="管养单位" name="managementUnit">
                  <Input
                    style={{ width: '344px' }}
                    disabled={!isCustomRoadName}
                    autoComplete="off"
                    placeholder="请输入管养单位"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  label="组织架构"
                  name="depts"
                  rules={[{ required: true, message: '请选择组织架构' }]}
                >
                  <TreeSelect
                    style={{ width: '348px' }}
                    disabled={!isCustomRoadName}
                    treeData={treelist}
                    treeCheckable="true"
                    allowClear={true}
                    treeCheckStrictly={true}
                    showCheckedStrategy="SHOW_ALL"
                    maxTagCount={'responsive'}
                    placeholder={'请选择组织架构'}
                    onChange={handleDeptChange}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default Crtmodel;
