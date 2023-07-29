import { Button, Empty, Tree, message, Image } from 'antd';

import React, { useEffect, useState, useRef } from 'react';
import styles from '../styles.less';
import { useHistory } from 'umi';

import RedIcon from './RedIcon';
import GrayIcon from './GrayIcon';
import GreenIcon from './GreenIcon';
import SpotCheck from './SpotCheck2';
import ScenarioCheckImg from './ScenarioCheckImg';

import {
  querySceneTreeInfo,
  checkShowInfo,
  queryGpsInfo,
  nextPoint,
  updateDoneStatus,
} from '../service';

type Iprops = {
  a?: string;
};

let map: any = null; // 全局map
let markers: any = [];
let currentMarker: any;
let layer: any = null;
let curPosList: any = []; // 当前已展开场景所有点数据
let curPosGpsInfo: any = null; // 当前排查点gps信息
let sceneTrackId: any = null;
let curSpotIndex: any = -1;
let isOpenSpotCheckPage: boolean = false;
let clickTreeNodeCount: number = 0;
let curSpotInfo: any = null;
let curScenePosList: any = []; // 当前点击的树节点 场景的数据
let checkPicIndex: number = 1;

const EdtMod: React.FC<Iprops> = () => {
  const history = useHistory();

  const [isShowSpotCheck, setIsShowSpotCheck] = useState<boolean>(false);
  // const [curSpotIndex, setCurSpotIndex] = useState<number>(-1);
  const [treeData, setTreeData] = useState<any>([]);

  const [questionList, setQuestionList] = useState<any>([]);

  const [posImgList, setPosImgList] = useState<any>([]);
  const [loadedKeys, setLoadedKeys] = useState<any>([]); // 当前已加载树节点
  const [selectedKeys, setSelectedKeys] = useState<any>([]);

  // const [curSpotInfo, setCurSpotInfo] = useState<any>({}); // 用于点位排查弹窗
  const [showNoDanger, setShowNoDanger] = useState<boolean>(false); // 用于点位排查弹窗
  const [resetSpotCheckIcon, setResetSpotCheckIcon] = useState<number>(0);
  // const [checkPicIndex, setCheckPicIndex] = useState<number>(1);
  const [sceneImgPreview, setSceneImgPreview] = useState<any>();

  const scenarioCheckRef = useRef<any>();
  const spotCheckRef = useRef<any>();
  const treeWrapperRef = useRef<any>();

  const { AMap }: any = window;
  const projectId = sessionStorage.getItem('checkList_roadId');

  const markerGray = 'images/mapScenes/markerGray.png';
  const markerGreen = 'images/mapScenes/markerGreen.png';
  const markerRed = 'images/mapScenes/markerRed.png';

  const fieldNames = {
    title: 'name',
    value: 'id',
    children: 'list',
  };

  const plainOpsMap = {
    1: '正常',
    2: '错误',
    3: '缺失',
    4: '遮档',
    5: '损坏',
    6: '磨损',
    7: '不良',
  };

  const handleGoBack = () => {
    if (isShowSpotCheck) {
      setIsShowSpotCheck(false);
      isOpenSpotCheckPage = false;
    } else {
      history.go(-1);
    }
  };

  // 关闭点位排查弹窗
  const handleCloseSpotCheck = () => {
    setIsShowSpotCheck(false);
    isOpenSpotCheckPage = false;
  };

  const handleQueryGpsInfo = async (curPosInfo: any) => {
    const parmas = {
      trackId: curPosInfo?.id,
      sceneTrackId: curPosInfo?.proFacSceneTrackId,
    };
    const res = await queryGpsInfo(parmas);
    if (res.status === 0) {
      // 显示三张照片和回显右侧tab列表 如有
      curPosGpsInfo = res?.data;

      // 对图片排序
      const imgListArr = res?.data?.imgList || [];
      const imgListFilter = [{}, {}, {}];
      if (imgListArr.length) {
        imgListArr.forEach((item: any) => {
          if (item?.imgPosition === 0) {
            imgListFilter[0] = item;
          }
          if (item?.imgPosition === 1) {
            imgListFilter[2] = item;
          }
          if (item?.imgPosition === 2) {
            imgListFilter[1] = item;
          }
        });
        setPosImgList(imgListFilter);
        setSceneImgPreview(imgListFilter[checkPicIndex]);
      } else {
        setPosImgList([]);
      }

      setQuestionList(res?.data?.questionList || []);

      // 是否显示暂无隐患
      if (res?.data?.geoStatus === 1 && !res?.data?.questionList.length) {
        setShowNoDanger(true);
      } else {
        setShowNoDanger(false);
      }

      // 是否已打开点位排查时 切换了点位
      if (isOpenSpotCheckPage) {
        clickTreeNodeCount += 1;
        setResetSpotCheckIcon(clickTreeNodeCount);
      }
    }
  };
  const handleToSpotCheck = () => {
    if (curPosList && curPosList.length < 1) return;
    setIsShowSpotCheck(true);
    isOpenSpotCheckPage = true;
  };
  // 打开点位排查弹窗
  const handleOpenSpotCheck = (toCheckPicIndex: number) => {
    // setCheckPicIndex(toCheckPicIndex);
    checkPicIndex = toCheckPicIndex;
    if (curPosList && curPosList.length < 1) return;
    setSceneImgPreview(posImgList[toCheckPicIndex]);
  };

  const handleChildNodeTreeData = (nodeData: any, parentNode: any) => {
    const treeList = treeData.slice();
    treeList.forEach((item: any) => {
      // layer 1
      item.list.forEach((val: any) => {
        if (val.list.length) {
          // layer 2
          val.list.forEach((childVal: any) => {
            if (childVal.id === parentNode.id) {
              childVal.list = nodeData;
            }
          });
        }
      });
    });
    curPosList = [...curPosList, ...nodeData];
    return treeList;
  };

  useEffect(() => {
    if (curPosList && curPosList.length && curSpotIndex > -1) {
      // 树节点被选中
      setSelectedKeys([curPosList[curSpotIndex]?.key]);

      // 更新点位信息
      // setCurSpotInfo(curPosList[curSpotIndex]);
      curSpotInfo = curPosList[curSpotIndex];
    }
  }, [curSpotIndex]);

  const handleRenderLaberMarker = (curPos: any, icon: any, key: string) => {
    const curData = {
      position: curPos,
      icon,
      zooms: [2, 30],
      extData: {
        key,
      },
    };
    const labelMarker = new AMap.LabelMarker(curData);
    markers.push(labelMarker);

    // 加载tree 异步节点时
    currentMarker?.setIcon({ size: [20, 28] });

    // 给marker绑定事件
    labelMarker.on('click', (e: any) => {
      const curPosInfo = e?.data?.data?.position;
      const extData = e.target.getExtData();
      let curPosIndex = -1;

      curPosIndex = curPosList.findIndex((item: any) => {
        return (
          item.longitude === curPosInfo[0] &&
          item.latitude === curPosInfo[1] &&
          extData?.key === item.key
        );
      });

      // if (clickTreeNodeIndex > -1) {
      //   curPosIndex = clickTreeNodeIndex;
      //   // clickTreeNodeIndex = -1;
      // } else {
      //   curPosIndex = curPosList.findIndex((item: any) => {
      //     return item.longitude === curPosInfo[0] && item.latitude === curPosInfo[1];
      //   });
      // }
      sceneTrackId = curPosList[curPosIndex]?.proFacSceneTrackId;

      curSpotIndex = curPosIndex;
      // clickTreeNodeIndex = curPosIndex;
      sessionStorage.setItem('scene_curSpotInfo', JSON.stringify(curPosList[curPosIndex]));

      // 所有标注图恢复默认大小
      // markers.forEach((marker: any) => {
      currentMarker?.setIcon({ size: [20, 28] });
      // });

      e.target.setIcon({ size: [28, 36] });
      currentMarker = e.target;
      // 更新节点信息
      handleQueryGpsInfo(curPosList[curPosIndex]);

      // setMapImgList([]);
      // mapImgListArr = [];
    });
  };

  const handleShowMapNode = (resData: any) => {
    if (resData.length < 1) return;

    if (!layer) {
      // 创建 AMap.LabelsLayer 图层
      layer = new AMap.LabelsLayer({
        zooms: [3, 30],
        zIndex: 1000,
        collision: false,
      });

      // 将图层添加到地图
      map.add(layer);
    }

    const icon = {
      type: 'image',
      image: markerGray,
      size: [24, 24],
      anchor: 'bottom-center',
    };

    // 渲染海量点
    for (let i = 0; i < resData.length; i++) {
      if (resData[i].geoStatus === 2) {
        icon.image = markerRed;
      }
      if (resData[i].geoStatus === 1) {
        icon.image = markerGreen;
      }
      if (resData[i].geoStatus === 0) {
        icon.image = markerGray;
      }
      handleRenderLaberMarker([resData[i].longitude, resData[i].latitude], icon, resData[i].key);
    }

    // 一次性将海量点添加到图层
    layer.add(markers);

    // 设置地图中心
    const index = Math.floor(resData.length / 2);
    const center = [resData[index].longitude, resData[index].latitude];
    map.setCenter(center);
  };

  /* eslint-disable */
  const onLoadData: any = async (node: any) => {
    if (node.key.length === 1) return;
    const params = {
      sceneRelId: node?.id,
    };
    const res = await querySceneTreeInfo(params);
    if (res.status === 0) {
      // todo
      try {
        // 显示当前节点的地图点信息
        const nodeData: any = [];
        res?.data.slice().forEach((item: any, i: number) => {
          let resIcon: any = null;
          if (!item.geoStatus) {
            resIcon = GrayIcon;
          } else {
            resIcon = item.geoStatus === 1 ? GreenIcon : RedIcon;
          }
          nodeData.push({
            ...item,
            name: `${item.stackDirection === 0 ? '上行' : '下行'} ${item?.stackNo}`,
            isLeaf: true,
            icon: resIcon,
            key: `${node.key}-${i}`,
          });
        });
        handleShowMapNode(nodeData || []);

        // 组装树子节点信息
        const retNode = handleChildNodeTreeData(nodeData, node);
        return new Promise((resolve: any) => {
          const loadedKeysRes = loadedKeys.slice();
          loadedKeysRes.push(node.key);
          setLoadedKeys(loadedKeysRes);

          setTreeData(retNode);
          resolve();
        });
        // 图片信息
      } catch (err: any) {
        return new Promise<void>((resolve, reject) => {
          reject(new Error(err));
        });
      }
    }
    return new Promise((resolve: any) => resolve());
  };
  /* eslint-enable */

  // 地图相关
  useEffect(() => {
    map = new AMap.Map('container', {
      zoom: 13,
      zooms: [8, 30],
      center: [114.64, 38.03],
      keyboardEnable: false,
    });
    return () => {
      checkPicIndex = 1;
      curSpotIndex = -1;
      sceneTrackId = null;
      curPosGpsInfo = null;
      curPosList = [];
      curScenePosList = [];
      isOpenSpotCheckPage = false;
      clickTreeNodeCount = 0;
      currentMarker = null;
      curSpotInfo = null;
      // clickTreeNodeIndex = -1;
      // 销毁地图，并清空地图容器
      if (layer) map.remove(layer);
      layer = null;
      if (markers.length) {
        map.remove(markers);
        markers = [];
      }
      if (map) map.destroy();
      map = null;
    };
  }, []);

  const handleUpdateTreeAndMapNodeColor = (
    isNormal: boolean,
    curIndex: number = curSpotIndex,
    remarkVal?: any,
  ) => {
    markers[curIndex].setIcon({ image: isNormal ? markerGreen : markerRed });

    // 更新icon
    const treeDataArr = treeData.slice();
    treeDataArr.forEach((item: any) => {
      // layer 1
      if (item.list && item.list.length) {
        // layer2
        item.list.forEach((val: any) => {
          if (val.list && val.list.length) {
            // layer 3
            val.list.forEach((childVal: any) => {
              if (childVal?.list?.length) {
                // layer 4
                childVal.list.forEach((childItem: any) => {
                  if (childItem.key === curPosList[curIndex].key) {
                    childItem.icon = isNormal ? GreenIcon : RedIcon;
                    childItem.remark = remarkVal || '';
                  }
                });
              }
            });
          }
        });
      }
    });
    setTreeData(treeDataArr);

    // 更改curPosList 里面点位的状态
    curPosList[curIndex].geoStatus = isNormal ? 1 : 2;
  };

  const singleSpotOp = async (todo: string, opIndex: number) => {
    let curIndex = opIndex;
    if ((todo === 'next' || todo === 'prev') && !curScenePosList[curIndex].geoStatus) {
      // 让当前点颜色状态改变 变为已排查
      const params = {
        // trackIds: [curScenePosList[curIndex].id],
        proFacSceneTrackIds: [curScenePosList[curIndex].proFacSceneTrackId],
      };
      const res = await nextPoint(params);
      if (res.status === 0) {
        // todo
        // 前端做改变处理 否则刷新所有点 影响性能和体验
        const index = curPosList.findIndex(
          (item: any) => item.key === curScenePosList[curIndex].key,
        );
        handleUpdateTreeAndMapNodeColor(true, index);
      }
    }

    if (todo === 'next') {
      if (curIndex === curScenePosList.length - 1) return;
      curIndex += 1;
    } else if (todo === 'prev') {
      if (curIndex === 0) return;
      curIndex -= 1;
    }
    setPosImgList([]);

    // 滚动到目标点
    document
      .querySelector('.sceneTreeWrapper .ant-tree-treenode-selected')
      ?.scrollIntoView({ block: 'center' });

    const markerIndex = curPosList.findIndex(
      (item: any) => item.key === curScenePosList[curIndex].key,
    );
    markers[markerIndex].emit('click', {
      target: markers[markerIndex],
    });
  };

  const handleTogglePos = async (todo: string) => {
    const curScenePosIndex = curScenePosList.findIndex(
      (item: any) => item.key === curPosList[curSpotIndex].key,
    );

    const ids: any = [];
    let startIndex = -1;
    let endIndex = -1;
    const sceneLen = curScenePosList.length;
    if (todo === 'top') {
      if (curScenePosIndex === 0) return;
      if (sceneLen > 9 && curScenePosIndex > 9) {
        startIndex = curScenePosIndex - 9;
      } else {
        startIndex = 0;
      }
      for (let i = curScenePosIndex; i >= startIndex; i--) {
        if (!curScenePosList[i].geoStatus) {
          ids.push(curScenePosList[i].proFacSceneTrackId);
        }
      }
    }
    if (todo === 'bottom') {
      if (curScenePosIndex === sceneLen - 1) return;
      if (sceneLen - curScenePosIndex > 9) {
        endIndex = curScenePosIndex + 9;
      } else {
        endIndex = sceneLen - 1;
      }
      for (let i = curScenePosIndex; i <= endIndex; i++) {
        if (!curScenePosList[i].geoStatus) {
          // ids.push(curScenePosList[i].id);
          ids.push(curScenePosList[i].proFacSceneTrackId);
        }
      }
    }
    if (['top', 'bottom'].includes(todo)) {
      const params = {
        // trackIds: ids.join(),
        proFacSceneTrackIds: ids,
      };
      if (ids.length) {
        const res = await nextPoint(params);
        if (res.status === 0) {
          // 批量更改
          const indexArr: any = [];
          // 更改curPosList 里面点位的状态
          curPosList.forEach((item: any, i: number) => {
            if (ids.includes(item.proFacSceneTrackId)) {
              indexArr.push(i);
              item.geoStatus = 1;
            }
          });

          markers.forEach((marker: any, i: number) => {
            if (indexArr.includes(i)) {
              marker.setIcon({ image: markerGreen });
            }
          });

          // 更新icon
          const treeDataArr = treeData.slice();
          treeDataArr.forEach((item: any) => {
            // layer 1
            if (item.list && item.list.length) {
              // layer2
              item.list.forEach((val: any) => {
                if (val.list && val.list.length) {
                  // layer 3
                  val.list.forEach((childVal: any) => {
                    if (childVal?.list?.length) {
                      // layer 4
                      childVal.list.forEach((childItem: any) => {
                        if (ids.includes(childItem.proFacSceneTrackId)) {
                          childItem.icon = GreenIcon;
                        }
                      });
                    }
                  });
                }
              });
            }
          });
          setTreeData(treeDataArr);
        }
      }
      setTimeout(() => {
        // 滚动到目标点
        document
          .querySelector('.sceneTreeWrapper .ant-tree-treenode-selected')
          ?.scrollIntoView({ block: 'center' });
      }, 200);

      // 切换到最后一个点位
      const toSpotIndex = todo === 'top' ? startIndex : endIndex;
      const markerIndex = curPosList.findIndex(
        (item: any) => item.key === curScenePosList[toSpotIndex].key,
      );

      setPosImgList([]);
      markers[markerIndex].emit('click', {
        target: markers[markerIndex],
      });
    } else {
      singleSpotOp(todo, curScenePosIndex);
    }
  };

  const handleTreeData = (data: any) => {
    if (!Object.keys(data[0])?.length) return;

    const loadedKeysRes = loadedKeys.slice();
    // 添加key layer1
    data.forEach((item: any, i: number) => {
      item.key = `${i}`;

      loadedKeysRes.push(item.key);

      if (item?.list?.length) {
        // layer2
        item?.list.forEach((val: any, i2: number) => {
          val.key = `${i}-${i2}`;

          loadedKeysRes.push(val.key);

          if (val?.list?.length) {
            // layer3
            val?.list.forEach((childVal: any, i3: number) => {
              childVal.key = `${i}-${i2}-${i3}`;
              childVal.name = `${childVal.name}(${
                childVal.doneStatus === 0 ? '未完成' : '已完成'
              })`;

              if (childVal?.list?.length) {
                // layer 4
                childVal.list.forEach((childItem: any, i4: number) => {
                  childItem.key = `${i}-${i2}-${i3}-${i4}`;
                  // 默认第一层级的第三层级 需要手动组装数据
                  childItem.name = `${childItem.stackDirection === 0 ? '上行' : '下行'} ${
                    childItem?.stackNo
                  }`;
                  childItem.value = `${childItem.stackDirection === 0 ? '上行' : '下行'} ${
                    childItem?.stackNo
                  }`;
                  childItem.isLeaf = true;
                  if (!childItem.geoStatus) {
                    childItem.icon = GrayIcon;
                  } else {
                    childItem.icon = childItem.geoStatus === 2 ? RedIcon : GreenIcon;
                  }
                });
              } else {
                childVal.list = [];
              }
            });
          } else {
            val.list = [];
          }
        });
      } else {
        item.list = [];
      }
    });
    // loadedKeysRes.push(data[0]?.list[0]?.key);
    setTreeData(data);
    setLoadedKeys(loadedKeysRes);
    setSelectedKeys([data[0]?.list[0]?.list[0]?.list[0]?.key]);

    // 默认展示第一个树层级子节点的点信息
    const layerInfo = data[0]?.list[0]?.list[0]?.list;
    if (layerInfo?.length) {
      handleShowMapNode(layerInfo);
      curPosList = layerInfo;
      curScenePosList = layerInfo;
    }
    // 第一个点被点击
    if (markers.length > 0) {
      markers[0].emit('click', {
        target: markers[0],
      });
    }
  };
  // 获取前三级场景树
  const handleCheckShowInfo = async () => {
    const params = {
      proFacId: projectId,
    };
    const res = await checkShowInfo(params);
    if (res.status === 0) {
      // todo
      handleTreeData([res?.data || {}]);
    }
  };

  const handleToggleDoneStatus = (nodeInfo: any) => {
    const treeDataRaw = treeData.slice();
    // layer1
    treeDataRaw.forEach((item: any) => {
      // lay2
      item?.list.forEach((val: any) => {
        if (val?.list?.length) {
          // layer3
          val?.list.forEach((childVal: any) => {
            if (childVal.key === nodeInfo.key) {
              const firstI = childVal.name.indexOf('(');
              const lastI = childVal.name.indexOf(')');
              const sourceStr = childVal.name.slice(firstI + 1, lastI);
              const retStr = childVal.name.replace(
                sourceStr,
                childVal.doneStatus === 0 ? '已完成' : '未完成',
              );
              childVal.name = retStr;
              childVal.doneStatus = childVal.doneStatus === 0 ? 1 : 0;
            }
          });
        } else {
          val.list = [];
        }
      });
    });
    setTreeData(treeDataRaw);
  };

  const handleNodeSelect = async (selectedKeysArr: any, e: any) => {
    console.log(selectedKeysArr, e, 'selectedKeys, e');
    const nodeInfo = e?.node;

    // 第三层级
    if (nodeInfo?.key.split('-').length === 3) {
      const res = await updateDoneStatus({
        proFacSceneId: nodeInfo?.id,
        status: nodeInfo?.doneStatus === 0 ? 1 : 0,
      });
      if (res.status === 0) {
        handleToggleDoneStatus(nodeInfo);
        message.success({
          content: '状态切换成功',
          key: '状态切换成功',
        });
      }
    }

    if (!nodeInfo.isLeaf) return;

    const parentKey = nodeInfo.key.slice(0, nodeInfo.key.lastIndexOf('-'));
    curScenePosList = curPosList.filter(
      (item: any) => item.key.includes(parentKey) && item.key.indexOf(parentKey) === 0,
    );
    // setQuestionList(nodeInfo?.questionList || []);
    setPosImgList(nodeInfo?.imgList || []);
    if (nodeInfo?.imgList?.length) {
      setSceneImgPreview(nodeInfo?.imgList[checkPicIndex]);
    }
    setSelectedKeys([nodeInfo.key]);

    // 地图点被点击
    const mapMarkerIndex = curPosList.findIndex(
      (item: any) => item.id === nodeInfo.id && nodeInfo.key === item.key,
    );
    // clickTreeNodeIndex = mapMarkerIndex;
    markers[mapMarkerIndex].emit('click', {
      target: markers[mapMarkerIndex],
    });
  };
  useEffect(() => {
    handleCheckShowInfo();
  }, []);

  const imgListPosMap = {
    0: '左',
    1: '中',
    2: '右',
  };

  const handleUpdateSpotStatus = (flag: boolean, remarkVal: any) => {
    // 更新对应树节点 地图点  和 隐患问题列表
    handleUpdateTreeAndMapNodeColor(flag, curSpotIndex, remarkVal);

    setPosImgList([]);
    markers[curSpotIndex].emit('click', {
      target: markers[curSpotIndex],
    });
  };
  const IMG_RATIO_W = 320 / (320 + 1352);
  const MAP_RATIO_W = 1352 / (320 + 1352);
  const PREVIEW_IMG_H = 550 / 1080;
  // const MAP_PATIO_H = 326 / 1080;

  // 键盘方向键切换
  const handleDirKeyToggle = (e: any) => {
    // e.preventDefault();
    // left  100 -->数字键盘的 4
    let todo = '';
    if ([37].includes(e.keyCode)) {
      todo = 'prev';
    }
    // top
    if ([38].includes(e.keyCode)) {
      todo = 'top';
    }
    // right
    if ([39].includes(e.keyCode)) {
      todo = 'next';
    }
    // bottom
    if ([40].includes(e.keyCode)) {
      todo = 'bottom';
    }
    if ([37, 38, 39, 40].includes(e.keyCode)) {
      handleTogglePos(todo);
    }
  };
  useEffect(() => {
    if (curPosList.length > 0) {
      document.addEventListener('keydown', handleDirKeyToggle, { passive: false });
    }
    return () => {
      document.removeEventListener('keydown', handleDirKeyToggle);
    };
  }, [curPosList.length]);

  const handleSubmitSpotCheck = (isSubmit?: boolean) => {
    if (!isSubmit) {
      setIsShowSpotCheck(false);
    } else {
      spotCheckRef.current.handleCheckRemark();
      spotCheckRef.current.submit();
      setIsShowSpotCheck(false);
    }
    isOpenSpotCheckPage = false;
  };

  return (
    <div className={styles.ScenarioCheckWrapper} ref={scenarioCheckRef}>
      {/* <div className={styles.backList} onClick={() => handleGoBack()}>
         <span>项目列表</span>
      </div> */}
      <div className={styles.sceneCheckContentWrapper}>
        <div className={`${styles.sceneName} ${isShowSpotCheck ? styles.sceneNameSpotCheck : ''}`}>
          <div className={styles.back}>
            <img src={'images/back.svg'} onClick={() => handleGoBack()} />
            <span>{isShowSpotCheck ? '点排查' : '场景排查'}</span>
          </div>
          {isShowSpotCheck && (
            <div>
              <Button onClick={() => handleSubmitSpotCheck()} style={{ marginRight: '10px' }}>
                取消
              </Button>
              <Button onClick={() => handleSubmitSpotCheck(true)} type="primary">
                提交
              </Button>
            </div>
          )}
        </div>
        <div className={styles.sceneContent}>
          <div
            className={styles.navSideLeft}
            style={{ width: (window.innerWidth - 208 - 40) * IMG_RATIO_W }}
          >
            <div ref={treeWrapperRef} className={`${styles.sceneTreeWrapper} sceneTreeWrapper`}>
              {treeData.length > 0 && (
                <Tree
                  showIcon
                  loadedKeys={loadedKeys}
                  defaultExpandedKeys={['0-0-0']}
                  loadData={(curNode) => onLoadData(curNode)}
                  treeData={treeData}
                  fieldNames={fieldNames}
                  selectedKeys={selectedKeys}
                  onSelect={(selectedKeysArr: any, e: any) => handleNodeSelect(selectedKeysArr, e)}
                />
              )}
              {!treeData.length && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} className={styles.customEmptyImg} />
              )}
            </div>
            <div className={styles.sceneQuestions}>
              <div className={styles.questionTitle}>隐患问题</div>
              <div className={styles.questionDetail}>
                {questionList &&
                  questionList.length > 0 &&
                  questionList.map((item: any, i: number) => {
                    return (
                      <div key={i} className={styles.qItem}>
                        <span>{`${i + 1}、 `}</span>
                        <span className={styles.qLabel}>{item.fkCheckName}-- </span>
                        <span className={styles.qVal}>{plainOpsMap[item.resultKey] || '-'}</span>
                      </div>
                    );
                  })}
                {!questionList.length &&
                  (!showNoDanger ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      className={`${styles.customEmptyImg} ${styles.sceneEmptyImg}`}
                    />
                  ) : (
                    <div>暂无隐患！</div>
                  ))}
              </div>
            </div>
          </div>
          <div
            className={styles.mapArea}
            style={{
              display: !isShowSpotCheck ? 'block' : 'none',
              width: (window.innerWidth - 208 - 40) * MAP_RATIO_W,
            }}
          >
            <div className={`${styles.sceneImgs2} sceneImgs`}>
              {posImgList.length > 0 && (
                <div className={styles.sceneImgWrapper}>
                  <div className={styles.sceneImgPreview} onClick={() => handleToSpotCheck()}>
                    <span className={styles.sceneImgIndex}>{imgListPosMap[checkPicIndex]}</span>
                    <ScenarioCheckImg
                      height={window.innerHeight * PREVIEW_IMG_H - 12}
                      imgInfo={sceneImgPreview}
                    ></ScenarioCheckImg>
                  </div>
                  <div
                    className={styles.sceneImgList}
                    style={{ height: `${window.innerHeight * PREVIEW_IMG_H}px` }}
                  >
                    {posImgList.map((item: any, i: number) => {
                      return (
                        <div
                          className={
                            checkPicIndex === i
                              ? `${styles.activeSceneImg} ${styles.sceneImg}`
                              : `${styles.sceneImg}`
                          }
                          key={i}
                          onClick={() => handleOpenSpotCheck(i)}
                        >
                          <span className={styles.sceneImgIndex}>{imgListPosMap[i]}</span>
                          <div>
                            <ScenarioCheckImg
                              width={372}
                              height={(window.innerHeight * PREVIEW_IMG_H - 25) / 3}
                              imgInfo={item}
                            ></ScenarioCheckImg>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {posImgList.length < 1 && (
                <Empty
                  style={{ height: `${window.innerHeight * PREVIEW_IMG_H}px` }}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className={styles.customEmptyImg}
                />
              )}
            </div>
            <div className={styles.sceneOpBtns}>
              <Button
                disabled={(curPosList && curPosList.length < 1) || !posImgList.length}
                type="primary"
                onClick={() => handleToSpotCheck()}
              >
                排查
              </Button>
              <Button
                disabled={curPosList && curPosList.length < 1}
                onClick={() => handleTogglePos('prev')}
              >
                上一点位
              </Button>
              <Button
                disabled={curPosList && curPosList.length < 1}
                onClick={() => handleTogglePos('next')}
              >
                下一点位
              </Button>
            </div>
            <div
              id={'container'}
              className={styles.sceneMap}
              style={{ height: `calc(100% - ${window.innerHeight * PREVIEW_IMG_H}px` }}
            ></div>

            <div className={styles.mapLegend}>
              <div className={styles.legendItem}>
                <Image height={16} width={16} src={markerGreen} preview={false}></Image>
                <span>无隐患</span>
              </div>
              <div className={styles.legendItem}>
                <Image height={16} width={16} src={markerRed} preview={false}></Image>
                <span>有隐患</span>
              </div>
              <div className={styles.legendItem}>
                <Image height={16} width={16} src={markerGray} preview={false}></Image>
                <span>未排查</span>
              </div>
            </div>
          </div>
          {isShowSpotCheck && (
            <SpotCheck
              updateSpotStatus={(flag: boolean, remarkVal: any) =>
                handleUpdateSpotStatus(flag, remarkVal)
              }
              sceneTrackId={sceneTrackId}
              isShow={isShowSpotCheck}
              curSpotInfo={curSpotInfo}
              curPosGpsInfo={curPosGpsInfo}
              onCancel={() => handleCloseSpotCheck()}
              spotCheckRef={spotCheckRef}
              resetSpotCheckIcon={resetSpotCheckIcon}
              checkPicIndex={checkPicIndex}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EdtMod;
