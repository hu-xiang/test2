import { Input, Modal, Form, Select, InputNumber, message, TreeSelect, Row, Col } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import styles from '../styles.less';
import { addfaci, editfaci, fetchTree, getFacilitiesEditInfo, checkProTask } from '../service';
import validRule from '../../../../utils/validate';
// import Position from './Position';
// import PositionModal from './PositionModal';
import MarkMapShow from './component/MarkMapShow';
import MarkMapPro from './component/MarkMapPro';
import UploadPic from './component/UploadPic';
import { commonRequest } from '../../../../utils/commonMethod';

const requestList = [{ url: '/traffic/facility/location/queryStake', method: 'get' }];

const { Option } = Select;
const { confirm } = Modal;
type Iprops = {
  crtusershow: boolean;
  edtShow: boolean;
  onCancel: Function;
  onsetkey: Function;
  edtInfo: any;
};
let pageX = 0;
let pageY = 0;

const Crtmodel: React.FC<Iprops> = (props) => {
  const [treelist, setTreelist] = useState<any>([]);
  const [canNotEdit, setCanNotEdit] = useState<boolean>(false);
  // const isTenant = localStorage.getItem('isTenant');
  // const [kind] = useState({
  //   0: '路基路面',
  //   1: '隧道',
  //   2: '桥梁',
  //   3: '涵洞',
  //   4: '人行道',
  //   5: '边坡',
  // });
  const [kind2] = useState<any>({ 0: '城市道路', 1: '公路' });
  const [kind3, setKind3] = useState<any>([]);
  const [kind4] = useState<any>({ 1: '单行道', 2: '双行道' });
  const formref = useRef<any>();
  const [positionModalVisible, setpositionModalVisible] = useState(false);
  const {
    lnglatArr,
    setLnglatArr,
    upStartIndex,
    upEndIndex,
    downStartIndex,
    downEndIndex,
    setUpStartIndex,
    setUpEndIndex,
    setDownStartIndex,
    setDownEndIndex,
    canMark,
    setCanMark,
    // pointTypeList,
    setPointTypeList,
    stakeNo,
    setStakeNo,
  } = useModel<any>('facility');
  const { filePath, setFilePath, setFileName } = useModel<any>('file');
  const [oriPositionList, setOriPositionList] = useState<any>([]);
  // const [oriPointList, setOriPointList] = useState<any>([]);
  const [depList, setDepList] = useState<any>([]);
  const [upStakeList, setUpStakeList] = useState<any>([]);
  const [downStakeList, setDownStakeList] = useState<any>([]);
  const rules: any = {
    name: [validRule.limitNumber20()],
    laneNum: [validRule.checkInteger10()],
  };
  const changeRoadKind = (e: any) => {
    formref.current.setFieldsValue({
      roadLevel: undefined,
    });

    if (e === 0) {
      setKind3({ 0: '快速路', 1: '主干道', 2: '次干道', 3: '支路' });
    } else if (e === 1) {
      setKind3({ 4: '高速公路', 5: '一级公路', 6: '二级公路', 7: '三级公路', 8: '四级公路' });
    } else {
      setKind3([]);
    }
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

  const formatDeptId = (arr: any, labels: any) => {
    if (!arr) return undefined;
    const idList = Array.from(new Set([...arr?.split(',')])).map((i: any) => i);
    const labelList = Array.from(new Set([...labels?.split(',')])).map((i: any) => i);
    const valList: any = [];
    idList.forEach((i: any, index: any) => {
      valList.push({
        label: labelList[index],
        value: i,
      });
    });
    setDepList(valList);
    return valList;
  };

  const getEditInfo = async (id: any) => {
    const res = await getFacilitiesEditInfo(id);
    convertData(res?.data?.depts);
    const type = res?.data?.roadType;
    if (type === 0) {
      setKind3({ 0: '快速路', 1: '主干道', 2: '次干道', 3: '支路' });
    } else if (type === 1) {
      setKind3({ 4: '高速公路', 5: '一级公路', 6: '二级公路', 7: '三级公路', 8: '四级公路' });
    } else {
      setKind3([]);
    }
    formref.current.setFieldsValue({
      facilitiesName: res?.data?.facilitiesName,
      roadSection: res?.data?.roadSection,
      facilitiesType: res?.data?.facilitiesType,
      roadType: res?.data?.roadType,
      roadLevel: res?.data?.roadLevel,
      roadNum: res?.data?.roadNum,
      startPoint: res?.data?.startPoint,
      endPoint: res?.data?.endPoint,
      deptId: formatDeptId(res?.data?.deptId, res?.data?.deptName),
      streetNum: res?.data?.streetNum,
      laneNum: res?.data?.laneNum,
      managementUnit: res?.data?.managementUnit,
    });
    const left = res?.data?.startStake?.slice(0, res?.data?.startStake.length - 3);
    const right = res?.data?.startStake?.slice(res?.data?.startStake.length - 3);
    setStakeNo([left, right]);
    setFileName(res?.data?.facilitiesImg);
    setFilePath(res?.data?.facilitiesImg);
  };

  const getStake = async () => {
    const res: any = await commonRequest({
      ...requestList[0],
      params: { facilityId: props.edtInfo.id },
    });
    let upList = [];
    let downList = [];
    if (res?.data[0].length) {
      upList = res?.data[0].map((item: any, i: number) => {
        let type = 1;
        if (i !== 0) {
          if (i === res?.data[0].length - 1) {
            type = 3;
          } else {
            type = 2;
          }
        }
        return {
          ...item,
          type,
        };
      });
    }
    if (res?.data[1].length) {
      downList = res?.data[1].map((item: any, i: number) => {
        let type = 4;
        if (i !== 0) {
          if (i === res?.data[1].length - 1) {
            type = 6;
          } else {
            type = 5;
          }
        }
        return {
          ...item,
          type,
        };
      });
    }
    setLnglatArr([[], ...upList, ...downList]);
    // setInitList([...upList, ...downList]);
  };

  const canEditPos = async () => {
    const res = await checkProTask(props.edtInfo.id);
    setCanNotEdit(res?.data);
  };

  useEffect(() => {
    if (props.edtShow) {
      getEditInfo(props.edtInfo.id);
      getStake();
      canEditPos();
    } else {
      getTree();
      setFileName('');
      setFilePath('');
      setLnglatArr([[]]);
    }
    return () => {
      setUpStartIndex(-1);
      setUpEndIndex(-1);
      setDownStartIndex(-1);
      setDownEndIndex(-1);
      setFilePath('');
      setFileName('');
      setCanMark(false);
      setPointTypeList([]);
      setStakeNo(['000', '000']);
    };
  }, []);

  const changedNum = (e: any) => {
    if (e === null) {
      formref.current.setFieldsValue({
        roadNum: undefined,
      });
    }
  };
  const getUPDownList = () => {
    let upList = [];
    let downList = [];
    if (upStartIndex || upEndIndex) {
      upList =
        upStartIndex < upEndIndex
          ? lnglatArr.slice(upStartIndex, upEndIndex + 1)
          : lnglatArr.slice(upEndIndex, upStartIndex + 1).reverse();
    }
    if (downStartIndex || downEndIndex) {
      downList =
        downStartIndex < downEndIndex
          ? lnglatArr.slice(downStartIndex, downEndIndex + 1)
          : lnglatArr.slice(downEndIndex, downStartIndex + 1).reverse();
    }
    setUpStakeList(upList);
    setDownStakeList(downList);
    return {
      upStakeList: upList,
      downStakeList: downList,
    };
  };

  const crtusers = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = formref.current.getFieldsValue();

        const deptId = formList.deptId.length
          ? formList.deptId
              .map((item: any) => {
                return item.value;
              })
              .join(',')
          : '';
        formList.deptId = deptId;
        formList.upStakeList = upStakeList;
        formList.downStakeList = downStakeList;
        formList.facilitiesImg = filePath;
        // formList.imgName = fileName;
        delete formList.location;
        try {
          let res;
          const stakenum = stakeNo.reduce((pre: any, it: any) => {
            return `${pre}${it}`;
          });
          if (props.edtShow) {
            formList.id = props.edtInfo.id;
            res = await editfaci({ ...formList, startStake: stakenum });
          } else {
            res = await addfaci({ ...formList, startStake: stakenum });
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
  const togglePositionModal = (event?: any, isClose = true) => {
    let timer = null;
    if (
      !event ||
      (event && Math.abs(event.pageX - pageX) <= 1 && Math.abs(event.pageY - pageY) <= 1)
    ) {
      if (timer) return;
      if (isClose) {
        timer = setTimeout(() => {
          setpositionModalVisible(!positionModalVisible);
        }, 50);
      }
      if (!event) {
        setLnglatArr(oriPositionList);
        setUpStartIndex(-1);
        setUpEndIndex(-1);
        setDownStartIndex(-1);
        setDownEndIndex(-1);
        // setPointTypeList(oriPointList);
      } else {
        setOriPositionList(JSON.parse(JSON.stringify(lnglatArr)));
        // setOriPointList(pointTypeList);
        setCanMark(false);
      }
    }
  };
  const getStakeNo = (list: any) => {
    const arr = list?.map((item: any, index: number) => {
      let left = stakeNo[0];
      let right = stakeNo[1];
      if (index * 100 + Number(stakeNo[1]) < 1000) {
        if (index * 100 + Number(stakeNo[1]) < 10) {
          right = `00${index * 100 + Number(stakeNo[1])}`;
        } else if (index * 100 + Number(stakeNo[1]) < 100) {
          right = `0${index * 100 + Number(stakeNo[1])}`;
        } else {
          right = index * 100 + Number(stakeNo[1]);
        }
      } else {
        left = Number(stakeNo[0]) + Math.floor((index * 100 + Number(stakeNo[1])) / 1000);
        if ((index * 100 + Number(stakeNo[1])) % 1000 < 10) {
          right = `00${(index * 100 + Number(stakeNo[1])) % 1000}`;
        } else if ((index * 100 + Number(stakeNo[1])) % 1000 < 100) {
          right = `0${(index * 100 + Number(stakeNo[1])) % 1000}`;
        } else {
          right = (index * 100 + Number(stakeNo[1])) % 1000;
        }
      }
      return {
        ...item,
        stakeNo: `K${left}+${right}`,
      };
    });
    return arr;
  };
  const savePosition = () => {
    if (
      (upStartIndex !== -1 && upEndIndex === -1) ||
      (upStartIndex === -1 && upEndIndex !== -1) ||
      (downStartIndex !== -1 && downEndIndex === -1) ||
      (downStartIndex === -1 && downEndIndex !== -1)
    ) {
      return message.warn({
        content: '同一车道的起点和终点必须同时存在!',
        key: '同一车道的起点和终点必须同时存在!',
      });
    }
    let list = JSON.parse(JSON.stringify(lnglatArr));

    if (canMark) {
      const arr: any = getUPDownList();
      list = getStakeNo(arr?.upStakeList)?.concat(getStakeNo(arr?.downStakeList));
    }
    if (props.edtShow && canMark) {
      confirm({
        title: '是否全量更新桩号配置数据？',
        // icon: <ExclamationCircleOutlined />,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        async onOk() {
          setLnglatArr(list?.length ? list : [[]]);
          setUpStartIndex(-1);
          setUpEndIndex(-1);
          setDownStartIndex(-1);
          setDownEndIndex(-1);
          setTimeout(() => {
            setOriPositionList(list?.length ? list : [[]]);
            // setOriPointList(pointTypeList);
            setpositionModalVisible(!positionModalVisible);
          }, 100);
        },
        onCancel() {},
      });
    } else {
      setUpStartIndex(-1);
      setUpEndIndex(-1);
      setDownStartIndex(-1);
      setDownEndIndex(-1);
      if (!props?.edtShow) {
        setLnglatArr(list?.length ? list : [[]]);
      } else {
        setLnglatArr(list?.length ? list : oriPositionList);
      }
      setpositionModalVisible(!positionModalVisible);
    }
    return true;
  };
  const onSearch = (e: any) => {
    if (depList.length) {
      formref.current.setFieldsValue({
        deptId: e?.map((item: any) => ({
          label: item.label || depList.filter((m: any) => m.value === item.value)[0].label,
          value: item.value,
        })),
      });
    }
  };
  return (
    <>
      <Modal
        title={props.edtShow ? '编辑道路' : '创建道路'}
        open={props.crtusershow}
        maskClosable={false}
        onCancel={() => {
          setLnglatArr([[]]);
          props.onCancel();
        }}
        onOk={() => crtusers()}
        className={`crtFacility ${styles.crtFacility}`}
      >
        <div className="box">
          <Form
            labelAlign="right"
            labelCol={{ flex: '100px' }}
            labelWrap
            wrapperCol={{ flex: 1 }}
            ref={formref}
            colon={false}
          >
            <Form.Item label="道路名称" name="facilitiesName" rules={rules.name}>
              <Input autoComplete="off" placeholder="请输入道路名称" />
            </Form.Item>
            <Row>
              <Col style={{ width: '48%', marginRight: '40px' }}>
                <Form.Item label="道路编码" name="roadSection" rules={rules.name}>
                  <Input autoComplete="off" placeholder="请输入道路编码" />
                </Form.Item>
              </Col>
              <Col style={{ width: '48%' }}>
                {/* <Form.Item
                  label="设施类型"
                  name="facilitiesType"
                  rules={[{ required: true, message: '请选择设施类型' }]}
                >
                  <Select
                    style={{ height: 40 }}
                    placeholder="请选择设施类型"
                    allowClear
                    disabled={props.edtShow}
                  >
                    {Object.keys(kind).map((item: any) => (
                      <Option key={item} value={item * 1}>
                        {kind[item]}
                      </Option>
                    ))}
                  </Select>
                </Form.Item> */}
                <Form.Item label="管养单位" name="managementUnit">
                  <Input autoComplete="off" placeholder="请输入管养单位" />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col style={{ width: '48%', marginRight: '40px' }}>
                <Form.Item
                  label="道路类别"
                  name="roadType"
                  rules={[{ required: true, message: '请选择道路类别' }]}
                >
                  <Select
                    style={{ height: 40 }}
                    placeholder="请选择道路类别"
                    allowClear
                    onChange={changeRoadKind}
                  >
                    {Object.keys(kind2).map((item: any) => (
                      <Option key={item} value={item * 1}>
                        {kind2[item]}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col style={{ width: '48%' }}>
                <Form.Item
                  name="roadLevel"
                  label="道路等级"
                  className="addUserClass"
                  rules={[{ required: true, message: '请选择道路等级' }]}
                >
                  <Select style={{ height: 40 }} placeholder="请选择道路等级" allowClear>
                    {Object.keys(kind3).map((item: any) => (
                      <Option key={item} value={item * 1}>
                        {kind3[item]}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col style={{ width: '48%', marginRight: '40px' }}>
                <Form.Item
                  label="道路定位"
                  name="locationList"
                  className="map-location"
                  // rules={[{ required: true, message: '设施定位不能为空', type: 'array' }]}
                >
                  <div
                    className={styles.positionWrap}
                    onMouseDown={positionMouseDown}
                    onMouseUp={togglePositionModal}
                    style={{ height: '120px' }}
                  >
                    {!positionModalVisible ? (
                      <MarkMapShow height={120} isNotSetNull={true}></MarkMapShow>
                    ) : (
                      ''
                    )}
                  </div>
                </Form.Item>
              </Col>
              <Col style={{ width: '48%' }}>
                <Form.Item
                  label="道路图片"
                  name="facilitiesImg"
                  // rules={[{ required: true, message: '请上传图片' }]}
                >
                  <UploadPic isEdit={props.edtShow}></UploadPic>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col style={{ width: '48%', marginRight: '40px' }}>
                <Form.Item
                  label="起点"
                  name="startPoint"
                  rules={[
                    {
                      pattern: /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_+-]){1,50}$/,
                      message: '中文、数字、字母以及-_+组成(1-50位)',
                    },
                  ]}
                >
                  <Input
                    placeholder="请输入起点桩号或起点路段信息，如K100+100深南大道"
                    autoComplete="off"
                  />
                </Form.Item>
              </Col>
              <Col style={{ width: '48%' }}>
                <Form.Item
                  label="终点"
                  name="endPoint"
                  rules={[
                    {
                      pattern: /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_+-]){1,50}$/,
                      message: '中文、数字、字母以及-_+组成(1-50位)',
                    },
                  ]}
                >
                  <Input
                    autoComplete="off"
                    placeholder="请输入终点桩号或终点路段信息，如K100+100深南大道"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col style={{ width: '48%', marginRight: '40px' }}>
                <Form.Item
                  label="单行/双行道"
                  name="streetNum"
                  rules={[{ required: true, message: '请选择单行/双行道' }]}
                >
                  <Select style={{ height: 40 }} placeholder="请选择单行/双行道" allowClear>
                    {Object.keys(kind4).map((item: any) => (
                      <Option key={item} value={item * 1}>
                        {kind4[item]}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col style={{ width: '48%' }}>
                <Form.Item label="单向车道数" name="laneNum" rules={rules.laneNum}>
                  <InputNumber
                    controls
                    min={0}
                    max={999999999}
                    precision={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col style={{ width: '48%', marginRight: '40px' }}>
                <Form.Item label="道路里程(m)" name="roadNum">
                  <InputNumber
                    controls
                    min={0}
                    max={999999999}
                    precision={0}
                    onChange={changedNum}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col style={{ width: '48%' }}>
                <Form.Item
                  label="组织架构"
                  name="deptId"
                  className="addUserClass"
                  rules={[{ required: true, message: '请选择组织架构', type: 'array' }]}
                >
                  <TreeSelect
                    // disabled={isTenant !== '1'}
                    treeData={treelist}
                    treeCheckable="true"
                    allowClear={true}
                    treeCheckStrictly={true}
                    showCheckedStrategy="SHOW_ALL"
                    maxTagCount={'responsive'}
                    placeholder={'请选择组织架构'}
                    onChange={onSearch}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
      {positionModalVisible ? (
        <Modal
          title="地图定位"
          width={'70vw'}
          bodyStyle={{
            height: canNotEdit ? 'calc(90vh - 55px)' : 'calc(90vh - 136px)',
            // paddingBottom: '20px',
            padding: '0',
          }}
          maskClosable={false}
          open={positionModalVisible}
          onCancel={() => togglePositionModal()}
          onOk={() => savePosition()}
          style={{ top: '5%' }}
          footer={canNotEdit ? null : undefined}
        >
          <MarkMapPro
            searchVisible={true}
            canNotEdit={canNotEdit}
            isEdit={props.edtShow}
            height={canNotEdit ? 'calc(90vh - 55px)' : 'calc(90vh - 136px)'}
          ></MarkMapPro>
        </Modal>
      ) : (
        ''
      )}
    </>
  );
};

export default Crtmodel;
