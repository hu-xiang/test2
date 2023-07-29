import { Input, Modal, Form, message, Button, TreeSelect, Image } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
// import ProTable from '@ant-design/pro-table';
// import { ExclamationCircleOutlined } from '@ant-design/icons';
import styles from '../../styles_wdz.less';
// import { useAccess } from 'umi';
import {
  queryStake,
  sublineDept,
  sublineAddSave,
  querySubTrackList,
  subLineEditSave,
} from '../../service';
// import { useScrollObj } from '@/utils/tableScrollSet';

type Iprops = {
  isShow: boolean;
  isCreate: boolean;
  onCancel: Function;
  onsetkey: Function;
  editInfo: any;
  fkFacId: string;
  id: string;
  onContinue: Function;
};

export type Member = {};
// const { confirm } = Modal;

let map: any = null; // 全局map
let markers: any = [];
let layer: any = null;
// const { Option } = Select;
let allPos: any = []; // 所有点信息
let subTrackList: any = [];

let cropInfo: any = {
  upStartIndex: -1,
  upEndIndex: -1,
  downStartIndex: -1,
  downEndIndex: -1,
};
let toSelectType: any = 'upStart';

const EdtMod: React.FC<Iprops> = (props) => {
  const { AMap }: any = window;

  const formref = useRef<any>();

  const [deptVal, setDeptVal] = useState<any>('');
  const [deptLabel, setDeptLabel] = useState<any>('');
  const [deptTreeData, setDeptTreeData] = useState<any>([]);
  const [selectType, setSelectType] = useState<string>('upStart');

  // const access: any = useAccess();
  // const scrollObj = useScrollObj(tableData, { x: 690, y: '774px' }, 'subline-modal-table');

  const upStart = 'images/mapScenes/upStart.png';
  const up = 'images/mapScenes/up.png';
  const upEnd = 'images/mapScenes/upEnd.png';
  const downStart = 'images/mapScenes/downStart.png';
  const down = 'images/mapScenes/down.png';
  const downEnd = 'images/mapScenes/downEnd.png';

  // 地图 =========start=====
  const handleRenderLaberMarker = (curPos: any, icon: any, direction: any) => {
    const curData = {
      position: curPos,
      icon,
      zooms: [2, 30],
    };
    const labelMarker = new AMap.LabelMarker(curData);

    markers.push(labelMarker);

    labelMarker.on('click', async function (e: any) {
      // 获取当前点在所有点集合中的位置
      const curPosition = e?.data?.data?.position;
      const curPosIndex = allPos.findIndex((item: any) => {
        return item.longitude === curPosition[0] && item.latitude === curPosition[1];
      });

      let image = '';

      /* eslint-disable */
      if (direction === 0) {
        switch (toSelectType) {
          case 'upStart':
            if (cropInfo.upEndIndex > -1 && curPosIndex > cropInfo.upEndIndex) {
              message.warning({
                content: '请在上行终点位置前选择起点',
                key: '请在上行终点位置前选择起点',
              });
              return;
            } else {
              image = upStart;
              if (cropInfo.upStartIndex > -1) {
                markers[cropInfo.upStartIndex].setIcon({ image: up });
              }
              cropInfo.upStartIndex = curPosIndex;
              formref.current.setFieldValue('upStart', allPos[curPosIndex].stakeNo);
            }
            break;
          case 'upEnd':
            if (cropInfo.upStartIndex > -1 && curPosIndex < cropInfo.upStartIndex) {
              message.warning({
                content: '请在上行起点位置后选择终点',
                key: '请在上行起点位置后选择终点',
              });
              return;
            } else {
              image = upEnd;
              if (cropInfo.upEndIndex > -1) {
                markers[cropInfo.upEndIndex].setIcon({ image: up });
              }
              cropInfo.upEndIndex = curPosIndex;
              formref.current.setFieldValue('upEnd', allPos[curPosIndex].stakeNo);
            }
            break;
          case 'downStart':
            message.warning({
              content: '请在下行位置选取起点或终点',
              key: '请在下行位置选取起点或终点',
            });
            return;
          case 'downEnd':
            message.warning({
              content: '请在下行位置选取起点或终点',
              key: '请在下行位置选取起点或终点',
            });
            return;
        }
      }
      if (direction === 1) {
        switch (toSelectType) {
          case 'upStart':
            message.warning({
              content: '请在上行位置选取起点或终点',
              key: '请在上行位置选取起点或终点',
            });
            return;
          case 'upEnd':
            message.warning({
              content: '请在上行位置选取起点或终点',
              key: '请在上行位置选取起点或终点',
            });
            return;
          case 'downStart':
            if (cropInfo.downEndIndex > -1 && curPosIndex < cropInfo.downEndIndex) {
              message.warning({
                content: '请在下行终点位置后选择起点',
                key: '请在下行终点位置后选择起点',
              });
              return;
            } else {
              image = downStart;
              if (cropInfo.downStartIndex > -1) {
                markers[cropInfo.downStartIndex].setIcon({ image: down });
              }
              cropInfo.downStartIndex = curPosIndex;
              formref.current.setFieldValue('downStart', allPos[curPosIndex].stakeNo);
            }
            break;
          case 'downEnd':
            if (cropInfo.downStartIndex > -1 && curPosIndex > cropInfo.downStartIndex) {
              message.warning({
                content: '请在下行起点位置前选择终点',
                key: '请在下行起点位置前选择终点',
              });
              return;
            } else {
              image = downEnd;
              if (cropInfo.downEndIndex > -1) {
                markers[cropInfo.downEndIndex].setIcon({ image: down });
              }
              cropInfo.downEndIndex = curPosIndex;
              formref.current.setFieldValue('downEnd', allPos[curPosIndex].stakeNo);
            }
            break;
        }
      }
      /* eslint-enable */

      // 所有标注图恢复默认大小
      markers.forEach((marker: any, i: number) => {
        if (
          ![
            cropInfo.upStartIndex,
            cropInfo.upEndIndex,
            cropInfo.downStartIndex,
            cropInfo.downEndIndex,
          ].includes(i)
        ) {
          marker?.setIcon({ size: [20, 26] });
        }
      });

      e.target.setIcon({ size: [26, 32], image });
    });

    // // 一次性将海量点添加到图层
    // layer.add(markers);
  };

  // 获取裁剪数据相关
  const handleRenderPos = (list: any) => {
    // 创建 AMap.LabelsLayer 图层
    layer = new AMap.LabelsLayer({
      zooms: [3, 30],
      zIndex: 1000,
      collision: false,
    });

    // 将图层添加到地图
    map.add(layer);

    // 设置

    const icon = {
      type: 'image',
      image: '',
      size: [20, 26],
      anchor: 'bottom-center',
    };

    for (let i = 0; i < list.length; i++) {
      const pos = [list[i].longitude, list[i].latitude];

      if (list[i].direction === 0) {
        icon.image = up;
      }
      if (list[i].direction === 1) {
        icon.image = down;
      }

      if (!props.isCreate) {
        const { downEndPoint, downStartPoint, upEndPoint, upStartPoint } = props.editInfo;
        if (list[i].direction === 1 && list[i].stakeNo === downEndPoint) {
          icon.image = downEnd;
        }
        if (list[i].direction === 1 && list[i].stakeNo === downStartPoint) {
          icon.image = downStart;
        }
        if (list[i].direction === 0 && list[i].stakeNo === upEndPoint) {
          icon.image = upEnd;
        }
        if (list[i].direction === 0 && list[i].stakeNo === upStartPoint) {
          icon.image = upStart;
        }
      }
      handleRenderLaberMarker(pos, icon, list[i].direction);
    }
    // 一次性将海量点添加到图层
    layer.add(markers);
  };

  const calcCropInfo = () => {
    cropInfo = {
      upStartIndex: -1,
      upEndIndex: -1,
      downStartIndex: -1,
      downEndIndex: -1,
    };
    const { downEndPoint, downStartPoint, upEndPoint, upStartPoint } = props.editInfo;
    allPos.forEach((item: any, i: number) => {
      if (downEndPoint && downStartPoint) {
        if (item.direction === 1 && item.stakeNo === downEndPoint) {
          cropInfo.downEndIndex = i;
        }
        if (item.direction === 1 && item.stakeNo === downStartPoint) {
          cropInfo.downStartIndex = i;
        }
      }
      if (upEndPoint && upStartPoint) {
        if (item.direction === 0 && item.stakeNo === upEndPoint) {
          cropInfo.upEndIndex = i;
        }
        if (item.direction === 0 && item.stakeNo === upStartPoint) {
          cropInfo.upStartIndex = i;
        }
      }
    });
  };

  const handlePosData = (data: any) => {
    data[0].forEach((item: any) => {
      item.direction = 0;
    });
    data[1].forEach((item: any) => {
      item.direction = 1;
    });

    allPos = [...data[0], ...data[1]];

    if (!props.isCreate) {
      calcCropInfo();
    }

    // 剔除已存在的子线
    allPos = allPos.filter((item: any, i: number) => {
      let isExist = false;
      if (!props.isCreate) {
        if (cropInfo.downEndIndex > -1 && cropInfo.downStartIndex > -1) {
          // 下行：终点在起点之前  上行：终点在起点之后
          if (cropInfo.downStartIndex < cropInfo.downEndIndex) {
            const { downStartIndex, downEndIndex } = cropInfo;
            cropInfo.downEndIndex = downStartIndex;
            cropInfo.downStartIndex = downEndIndex;
          }
          if (i >= cropInfo.downEndIndex && i <= cropInfo.downStartIndex) return true;
        }
        if (cropInfo.upStartIndex > -1 && cropInfo.upEndIndex > -1) {
          if (cropInfo.upStartIndex > cropInfo.upEndIndex) {
            const { upStartIndex, upEndIndex } = cropInfo;
            cropInfo.upEndIndex = upStartIndex;
            cropInfo.upStartIndex = upEndIndex;
          }
          if (i >= cropInfo.upStartIndex && i <= cropInfo.upEndIndex) return true;
        }
      }
      subTrackList.forEach((val: any) => {
        if (
          val.latitude === +parseFloat(item.latitude).toFixed(10) &&
          val.longitude === +parseFloat(item.longitude).toFixed(10)
        ) {
          isExist = true;
        }
      });
      return !isExist;
    });

    // 重新计算下上下行起始点序号
    calcCropInfo();

    // 裁剪图片
    handleRenderPos(allPos);

    // 设置地图中心
    if (allPos.length) {
      const index = Math.ceil(allPos.length / 2);
      const center = [allPos[index]?.longitude, allPos[index]?.latitude];
      map.setCenter(center);
    }
  };
  const handleGetSceneTailorInfo = async () => {
    const params = {
      facilityId: props.fkFacId,
    };
    const res = await queryStake(params);
    if (res.status === 0) {
      // todo
      handlePosData(res?.data);
    }
  };

  const handleGetSubTrackList = async () => {
    const params = {
      proFacId: props.id,
    };
    const res = await querySubTrackList(params);
    if (res?.status === 0) {
      subTrackList = res.data || [];

      handleGetSceneTailorInfo();
    }
  };
  const submit = async (isContinue?: boolean) => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = formref.current.getFieldsValue();
        const params: any = {
          upEndPoint: formList.upEnd,
          upStartPoint: formList.upStart,
          downEndPoint: formList.downEnd,
          downStartPoint: formList.downStart,
          subName: formList.sublineName,
          fkDeptId: formList.deptType,
          fkDeptName: deptLabel.join(),
          fkFacId: props.fkFacId,
          fkProFacId: props.id,
          locationList: [],
        };
        if (cropInfo.upStartIndex > -1 && cropInfo.upEndIndex > -1) {
          params.locationList = [...allPos.slice(cropInfo.upStartIndex, cropInfo.upEndIndex + 1)];
        }
        if (cropInfo.downStartIndex > -1 && cropInfo.downEndIndex > -1) {
          params.locationList = [
            ...params.locationList,

            ...allPos.slice(cropInfo.downEndIndex, cropInfo.downStartIndex + 1),
          ];
        }

        if (!params.locationList.length) {
          message.warning({
            content: '请选择上行或下行的完整区间',
            key: '请选择上行或下行的完整区间',
          });
          return;
        }
        if (
          params.locationList.length &&
          ((cropInfo.downStartIndex === -1 && cropInfo.downEndIndex > -1) ||
            (cropInfo.downEndIndex === -1 && cropInfo.downStartIndex > -1))
        ) {
          message.warning({
            content: '请选择下行数据的完整区间',
            key: '请选择下行数据的完整区间',
          });
          return;
        }
        if (
          params.locationList.length &&
          ((cropInfo.upStartIndex === -1 && cropInfo.upEndIndex > -1) ||
            (cropInfo.upEndIndex === -1 && cropInfo.upStartIndex > -1))
        ) {
          message.warning({
            content: '请选择上行数据的完整区间',
            key: '请选择上行数据的完整区间',
          });
          return;
        }

        let res: any = null;
        if (props.isCreate) {
          res = await sublineAddSave(params);
        } else {
          params.id = props.editInfo.id;
          res = await subLineEditSave(params);
        }
        if (res.status === 0) {
          message.success({
            content: '保存成功',
            key: '保存成功',
          });
          toSelectType = 'upStart';
          setSelectType('upStart');
          if (isContinue) {
            if (markers.length) {
              map.remove(markers);
              markers = [];
            }
            if (layer) map.remove(layer);
            cropInfo = {
              upStartIndex: -1,
              upEndIndex: -1,
              downStartIndex: -1,
              downEndIndex: -1,
            };
            props.onContinue();
            formref.current.resetFields();

            handleGetSubTrackList();
          } else {
            props.onCancel();
          }
        }
      })
      .catch(() => {});
  };
  useEffect(() => {
    map = new AMap.Map('container', {
      zoom: 16,
      center: [102.847977, 25.11826],
    });

    return () => {
      toSelectType = 'upStart';
      setSelectType('upStart');
      cropInfo = {
        upStartIndex: -1,
        upEndIndex: -1,
        downStartIndex: -1,
        downEndIndex: -1,
      };
      // 销毁地图，并清空地图容器
      if (layer) map.remove(layer);
      if (markers.length) {
        map.remove(markers);
        markers = [];
      }
      if (map) map.destroy();
      map = null;
    };
  }, []);

  const handleContinue = (isClickContinueBtn?: boolean) => {
    if (isClickContinueBtn) {
      submit(true);
    } else {
      // toSelectType = 'upStart';
      props.onCancel();
    }
  };
  const customFooter = [
    <Button key="continue" onClick={() => handleContinue(true)} disabled={!props.isCreate}>
      继续创建
    </Button>,
    <Button key="submit" type="primary" onClick={() => submit()}>
      结束创建
    </Button>,
  ];

  const handleSelectType = (todo: string) => {
    toSelectType = todo;
    setSelectType(todo);
  };

  const handleGetSublineDept = async () => {
    const res = await sublineDept({});
    if (res?.length) {
      setDeptTreeData(res);

      if (!props.isCreate) {
        setDeptLabel([props.editInfo.fkDeptName]);
      }
    }
  };

  const handleDeptChange = (newVal: string, label: any) => {
    setDeptVal(newVal);
    setDeptLabel(label);
  };

  useEffect(() => {
    handleGetSublineDept();

    handleGetSubTrackList();

    if (!props.isCreate) {
      const { fkDeptId, downEndPoint, downStartPoint, upEndPoint, upStartPoint, subName } =
        props.editInfo;
      const initVals = {
        upEnd: upEndPoint,
        upStart: upStartPoint,
        sublineName: subName,
        downEnd: downEndPoint,
        downStart: downStartPoint,
        deptType: fkDeptId,
      };
      formref.current.setFieldsValue(initVals);
    }
  }, []);
  // 地图 =========end=====

  const fieldNames = {
    value: 'id',
  };
  return (
    <Modal
      title={props.isCreate ? '子线创建' : '子线编辑'}
      open={props.isShow}
      onCancel={() => handleContinue()}
      onOk={() => submit()}
      className={`crtedtDev ${styles.sublineDialog}`}
      destroyOnClose
      // okText={'提交'}
      width={window.innerWidth * 0.8}
      footer={customFooter}
    >
      <div className={styles.sublineContent}>
        <div
          id={'container'}
          className={`map ${styles.map}`}
          // style={{ height: `${window.innerHeight * 0.73}px` }}
        >
          <div className={styles.mapLegend}>
            <div className={styles.legendItem}>
              <Image height={16} width={16} src={up} preview={false}></Image>
              <span>上行位置</span>
            </div>
            <div className={styles.legendItem}>
              <Image height={16} width={16} src={down} preview={false}></Image>
              <span>下行位置</span>
            </div>
          </div>
        </div>

        <div className={styles.opsGroup}>
          <div className={styles.editTabWrapper}>
            <Form labelCol={{ flex: '78px' }} wrapperCol={{ flex: 1 }} ref={formref}>
              <Form.Item
                label="子线名称"
                name="sublineName"
                rules={[{ required: true, message: '请输入子线名称' }]}
              >
                <Input autoComplete="off" placeholder="请输入子线名称" />
              </Form.Item>
              <Form.Item
                label="组织架构"
                name="deptType"
                rules={[{ required: true, message: '请选择组织架构' }]}
              >
                <TreeSelect
                  showSearch
                  value={deptVal}
                  onChange={(newVal: string, label: any) => handleDeptChange(newVal, label)}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  allowClear
                  treeData={deptTreeData}
                  fieldNames={fieldNames}
                  placeholder="请选择组织架构"
                ></TreeSelect>
              </Form.Item>

              <Form.Item label="上行起点" name="upStart" className={styles.cumstomDirItem}>
                <Input disabled autoComplete="off" placeholder="请在地图上选取上行起点" />
              </Form.Item>
              <Form.Item label="上行终点" name="upEnd" className={styles.cumstomDirItem}>
                <Input disabled autoComplete="off" placeholder="请在地图上选取上行终点" />
              </Form.Item>
              <Form.Item
                label="下行起点"
                name="downStart"
                className={`${styles.customFormItem} ${styles.cumstomDirItem} customFormItem`}
              >
                <Input disabled autoComplete="off" placeholder="请在地图上选取下行起点" />
              </Form.Item>
              <Form.Item label="下行终点" name="downEnd" className={styles.cumstomDirItem}>
                <Input disabled autoComplete="off" placeholder="请在地图上选取下行终点" />
              </Form.Item>
            </Form>
            <div className={styles.opsSpan}>
              <span
                onClick={() => handleSelectType('upStart')}
                style={{ color: selectType === 'upStart' ? '#0013c1' : '#1890ff' }}
              >
                选取
              </span>
              <span
                onClick={() => handleSelectType('upEnd')}
                style={{ color: selectType === 'upEnd' ? '#0013c1' : '#1890ff' }}
              >
                选取
              </span>
              <span
                onClick={() => handleSelectType('downStart')}
                style={{ color: selectType === 'downStart' ? '#0013c1' : '#1890ff' }}
              >
                选取
              </span>
              <span
                onClick={() => handleSelectType('downEnd')}
                style={{ color: selectType === 'downEnd' ? '#0013c1' : '#1890ff' }}
              >
                选取
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EdtMod;
