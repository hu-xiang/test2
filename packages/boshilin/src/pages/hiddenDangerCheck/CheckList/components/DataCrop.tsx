import { Modal, message, Select, Button, Image } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles.less';
import html2canvas from 'html2canvas';
import { getSceneTailorInfo, sceneTailorSave, tailorUpImg, queryGpsInfo } from '../service';
// import { useParams } from 'umi';
import ScenarioCheckImg from './ScenarioCheckImg';

type Iprops = {
  isShow: boolean;
  isCreate?: boolean;
  onCancel: () => void;
  onOk: (cropImgUrl: string) => void;
  sceneData?: any;
  // projectId?: string;
};

let map: any = null; // 全局map
let markers: any = [];
let layer: any = null;
let infoWindow: any = null;
let currentMarker: any = null;
let curPosDir: any = null; // 当前点 上下行方向  0 上行  1下行
let allPos: any = []; // 所有点信息
let downList: any = [];
let upList: any = [];
const kind = {
  0: '上行起点',
  1: '上行终点',
  2: '下行起点',
  3: '下行终点',
};
let kindOps: any = kind; // 下拉弹窗选项
let mapCropImgUrl: any = '';
let cropInfo: any = {
  upStartIndex: -1,
  upEndIndex: -1,
  downStartIndex: -1,
  downEndIndex: -1,
};
let timeHandler: any = null;
const { Option } = Select;

const EdtMod: React.FC<Iprops> = (props) => {
  const modalRef = useRef<any>();
  const [modalShow, setModalShow] = useState<any>(false);
  const [pointType, setPointType] = useState<any>(null); // 可能的值 0 1 2 3
  const [pointTypeList, setPointTypeList] = useState<any>([]);
  const [isStartOrEnd, setIsStartOrEnd] = useState<any>(false);

  const [nextDisabled, setNextDisabled] = useState<any>(false);
  const [prevDisabled, setPrevDisabled] = useState<any>(false);

  const [mapCropUrl, setMapCropUrl] = useState<any>(null);

  const [selectOps, setSelectOps] = useState<any>();
  const [curPosCenterImg, setCurPosCenterImg] = useState<any>();
  // const [cropInfo, setCropInfo] = useState<any>({});

  // 当有上行数据  或 下行数据时 curMarkerIndex curPosIndex不相等 ！
  const [curMarkerIndex, setCurMarkerIndex] = useState<any>(); // 当前Marker在整个allPos中的index
  const [curPosMarkerIndex, setCurPosMarkerIndex] = useState<any>(); // 当前Marker在整个markers中的index
  const [cropBtnDisabled, setCropBtnDisabled] = useState<boolean>(true);

  const normal = 'images/mapScenes/normal.png';
  const upStart = 'images/mapScenes/upStart.png';
  const up = 'images/mapScenes/up.png';
  const upEnd = 'images/mapScenes/upEnd.png';
  const downStart = 'images/mapScenes/downStart.png';
  const down = 'images/mapScenes/down.png';
  const downEnd = 'images/mapScenes/downEnd.png';

  const projectId = sessionStorage.getItem('checkList_proId');

  const { sceneData } = props;

  const { AMap }: any = window;

  const findCurPosDir = (pos: any) => {
    const res = allPos.slice();
    const index = res.findIndex((item: any) => {
      return item.longitude === pos[0] && item.latitude === pos[1];
    });

    // 0 上行  1下行
    curPosDir = res[index].stackDirection;
  };

  const handleQueryGpsInfo = async (id: string) => {
    const parmas = {
      trackId: id,
    };
    return await queryGpsInfo(parmas);
  };
  const handleRenderLaberMarker = (
    curPos: any,
    icon: any,
    direction: any,
    isEdge: boolean,
    index: number,
  ) => {
    const curData = {
      position: curPos,
      icon,
      zooms: [2, 30],
    };
    const labelMarker = new AMap.LabelMarker(curData);

    // todo 上行  下行方向的起始点 终点 设额外参数
    if (direction === 'up' || direction === 'down') {
      if (isEdge) {
        let pointTypeRes = -1;
        if (direction === 'up') {
          if (index === 0) {
            pointTypeRes = 0;
          } else {
            pointTypeRes = 1;
          }
        }
        if (direction === 'down') {
          if (index === 0) {
            pointTypeRes = 2;
          } else {
            pointTypeRes = 3;
          }
        }
        labelMarker?.setExtData({ pointType: pointTypeRes });
      }
    }

    markers.push(labelMarker);

    labelMarker.on('click', async function (e: any) {
      // 所有标注图恢复默认大小
      markers.forEach((marker: any, i: number) => {
        marker?.setIcon({ size: [30, 40] });

        // 获取当前点在markers中的位置
        if (
          marker.getPosition().lng === +e?.data?.data?.position[0].toFixed(6) &&
          marker.getPosition().lat === +e?.data?.data?.position[1].toFixed(6)
        ) {
          setCurPosMarkerIndex(i);
        }
      });

      e.target.setIcon({ size: [45, 60] });

      // 判断当前点的起始方向
      const curPosition = e?.data?.data?.position;
      findCurPosDir(curPosition);

      // todo 判断当前点 是否为上下行的起始点
      if (labelMarker.getExtData()?.pointType || labelMarker.getExtData()?.pointType === 0) {
        setPointType(labelMarker.getExtData()?.pointType);
        setIsStartOrEnd(true);
      } else {
        setIsStartOrEnd(false);
      }

      // 获取当前点在所有点集合中的位置
      const curPosIndex = allPos.findIndex((item: any) => {
        return item.longitude === curPosition[0] && item.latitude === curPosition[1];
      });

      setCurMarkerIndex(curPosIndex);
      const res = await handleQueryGpsInfo(allPos[curPosIndex].id);
      if (res.status === 0) {
        setCurPosCenterImg(res?.data?.imgList[1]);
        // todo 选起始点 终点要匹配 桩号方向
        // let kindOpsRes = Object.keys(kind);
        let kindOpsRes: any = [];
        if (curPosDir === 0) {
          if (!upList.length) {
            if (cropInfo.upStartIndex > -1) {
              kindOpsRes.push('1');
            }
            if (cropInfo.upEndIndex > -1) {
              kindOpsRes.push('0');
            }
          }
          if (cropInfo.upStartIndex === -1 && cropInfo.upEndIndex === -1) {
            kindOpsRes = ['0', '1'];
          }
          // kindOpsRes = kindOpsRes.filter((item: any) => ['0', '1'].includes(item));
        }
        if (curPosDir === 1) {
          if (!downList.length) {
            if (cropInfo.downStartIndex > -1) {
              kindOpsRes.push('3');
            }
            if (cropInfo.downEndIndex > -1) {
              kindOpsRes.push('2');
            }
          }
          if (cropInfo.downStartIndex === -1 && cropInfo.downEndIndex === -1) {
            kindOpsRes = ['2', '3'];
          }
          // kindOpsRes = kindOpsRes.filter((item: any) => ['2', '3'].includes(item));
        }
        const ops = {};
        kindOpsRes.forEach((item: any) => {
          ops[item] = kind[item];
        });
        kindOps = ops;
        setSelectOps(ops);

        setModalShow(true);
        currentMarker = labelMarker;
        infoWindow.setContent(modalRef?.current || '');
        infoWindow.open(map, labelMarker?.getPosition());
      }
    });

    // 一次性将海量点添加到图层
    layer.add(markers);
  };

  const getTitle = () => {
    let title: any = '';
    switch (pointType) {
      case 0:
        title = '上行起点';
        break;
      case 1:
        title = '上行终点';
        break;
      case 2:
        title = '下行起点';
        break;
      case 3:
        title = '下行终点';
        break;

      default:
        title = '上行起点';
        break;
    }
    return `是否取消该点的${title}设置？`;
  };
  const handleCancel = () => {
    setPointType(null);
    setIsStartOrEnd(false);
    map.clearInfoWindow();
  };

  // 获取裁剪数据相关
  const handleRenderPos = (list: any, direction: string) => {
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
      image: normal,
      size: [30, 36],
      anchor: 'bottom-center',
    };

    for (let i = 0; i < list.length; i++) {
      const pos = [list[i].longitude, list[i].latitude];

      if (direction === 'down') {
        if (i === 0) {
          icon.image = downStart;
        } else if (i === list.length - 1) {
          icon.image = downEnd;
        } else {
          icon.image = down;
        }
      }
      if (direction === 'up') {
        if (i === 0) {
          icon.image = upStart;
        } else if (i === list.length - 1) {
          icon.image = upEnd;
        } else {
          icon.image = up;
        }
      }
      const isEdge = i === 0 || i === list.length - 1;
      handleRenderLaberMarker(pos, icon, direction, isEdge, i);
    }
  };
  // 替换数据
  const handleReplaceIcon = () => {
    const upStartI = markers.findIndex((marker: any) => {
      return marker.getExtData()?.pointType === 0;
    });
    const upEndI = markers.findIndex((marker: any) => {
      return marker.getExtData()?.pointType === 1;
    });
    const downStartI = markers.findIndex((marker: any) => {
      return marker.getExtData()?.pointType === 2;
    });
    const downEndI = markers.findIndex((marker: any) => {
      return marker.getExtData()?.pointType === 3;
    });

    markers.forEach((marker: any, i: number) => {
      let imageRes = normal;

      if (curPosDir === 0) {
        if (upStartI > upEndI) {
          if (i < upStartI && i > upEndI) {
            imageRes = up;
          }
        }
        if (i < upEndI && i > upStartI) {
          imageRes = up;
        }
        if (i === upStartI) {
          imageRes = upStart;
        }
        if (i === upEndI) {
          imageRes = upEnd;
        }
        // fix 不能把已有的下行方向的点 置灰
        if (downStartI > -1 && downEndI > -1) {
          if (downStartI > downEndI) {
            if (i < downStartI && i > downEndI) {
              imageRes = down;
            }
          }

          if (i < downEndI && i > downStartI) {
            imageRes = down;
          }
          if (i === downStartI) {
            imageRes = downStart;
          }
          if (i === downEndI) {
            imageRes = downEnd;
          }
        }
      }
      if (curPosDir === 1) {
        if (downStartI > downEndI) {
          if (i < downStartI && i > downEndI) {
            imageRes = down;
          }
        }

        if (i < downEndI && i > downStartI) {
          imageRes = down;
        }
        if (i === downStartI) {
          imageRes = downStart;
        }
        if (i === downEndI) {
          imageRes = downEnd;
        }

        // fix 不能把已有的上行方向的点 置灰
        if (upStartI > -1 && upEndI > -1) {
          if (upStartI > upEndI) {
            if (i < upStartI && i > upEndI) {
              imageRes = up;
            }
          }
          if (i < upEndI && i > upStartI) {
            imageRes = up;
          }
          if (i === upStartI) {
            imageRes = upStart;
          }
          if (i === upEndI) {
            imageRes = upEnd;
          }
        }
      }

      marker.setIcon({ image: imageRes });
    });
  };
  // 首尾中间的标记点替换
  const markerChange = () => {
    // todo 校准首位序号
    const { upStartIndex, upEndIndex, downStartIndex, downEndIndex } = cropInfo;
    if (curPosDir === 0) {
      if (upStartIndex >= 0 && upEndIndex >= 0) {
        if (upStartIndex > upEndIndex) {
          cropInfo.upStartIndex = upEndIndex;
          cropInfo.upEndIndex = upStartIndex;
        }
        upList = allPos.slice(cropInfo.upStartIndex, cropInfo.upEndIndex + 1);
      } else {
        return;
      }
    }
    if (curPosDir === 1) {
      if (downStartIndex >= 0 && downEndIndex >= 0) {
        if (downStartIndex > downEndIndex) {
          cropInfo.downStartIndex = downEndIndex;
          cropInfo.downEndIndex = downStartIndex;
        }
        downList = allPos.slice(cropInfo.downStartIndex, cropInfo.downEndIndex + 1);
      } else {
        return;
      }
    }
    // marker图标重新变更 fix 多次裁剪
    if (markers.length) {
      markers.forEach((marker: any) => {
        marker.setIcon({ image: normal, size: [30, 40] });
      });
    }

    handleReplaceIcon();
  };
  /* eslint-disable */
  const handleOk = () => {
    let icon: any = null;
    switch (pointType) {
      case 0:
        icon = upStart;
        break;
      case 1:
        icon = upEnd;
        break;
      case 2:
        icon = downStart;
        break;
      case 3:
        icon = downEnd;
        break;

      default:
        icon = normal;
        break;
    }
    currentMarker.setIcon({
      type: 'image',
      image: isStartOrEnd ? normal : icon,
      size: [30, 36],
      anchor: 'bottom-center',
    });
    let list: any = [];

    const pointTypeRes = currentMarker?.getExtData()?.pointType;

    // 存上下行信息
    if (curPosDir === 0) {
      if (pointType === 0) {
        cropInfo.upStartIndex = curMarkerIndex;
      }
      if (pointType === 1) {
        cropInfo.upEndIndex = curMarkerIndex;
      }
      if (isStartOrEnd) {
        if (pointTypeRes === 0) {
          const upEndI = markers.findIndex((marker: any) => {
            return marker.getExtData()?.pointType === 1;
          });
          const upStartI = markers.findIndex((marker: any) => {
            return marker.getExtData()?.pointType === 0;
          });
          // todo 该点到终点前一个到图标为灰色
          markers.forEach((marker: any, i: number) => {
            // if (i < upEndI) {
            //   marker.setIcon({ image: normal });
            // }
            if (upEndI >= 0) {
              if (upStartI > upEndI) {
                if (i >= upEndI && i < upStartI) {
                  marker.setIcon({ image: normal });
                }
              } else {
                if (i >= upStartI && i < upEndI) {
                  marker.setIcon({ image: normal });
                }
              }
            } else {
              // 本身置灰
              if (i === upEndI) {
                marker.setIcon({ image: normal });
              }
            }
          });
          cropInfo.upStartIndex = -1;
        }
        if (pointTypeRes === 1) {
          const upStartI = markers.findIndex((marker: any) => {
            return marker.getExtData()?.pointType === 0;
          });
          const upEndI = markers.findIndex((marker: any) => {
            return marker.getExtData()?.pointType === 1;
          });
          markers.forEach((marker: any, i: number) => {
            // if (i > upStartI) {
            //   marker.setIcon({ image: normal });
            // }
            if (upStartI >= 0) {
              if (upStartI > upEndI) {
                if (i > upEndI && i <= upStartI) {
                  marker.setIcon({ image: normal });
                }
              } else {
                if (i > upStartI && i <= upEndI) {
                  marker.setIcon({ image: normal });
                }
              }
            } else {
              // 本身置灰
              if (i === upEndI) {
                marker.setIcon({ image: normal });
              }
            }
          });
          cropInfo.upEndIndex = -1;
        }
      }
    }
    if (curPosDir === 1) {
      if (pointType === 2) {
        cropInfo.downStartIndex = curMarkerIndex;
      }
      if (pointType === 3) {
        cropInfo.downEndIndex = curMarkerIndex;
      }
      if (isStartOrEnd) {
        // fix 二次裁剪
        if (pointTypeRes === 2) {
          const downEndI = markers.findIndex((marker: any) => {
            return marker.getExtData()?.pointType === 3;
          });
          const downStartI = markers.findIndex((marker: any) => {
            return marker.getExtData()?.pointType === 2;
          });
          console.log(downStartI, downEndI, 'downStartI, downEndI');
          markers.forEach((marker: any, i: number) => {
            // if (i < downEndI) {
            //   marker.setIcon({ image: normal });
            // }
            if (downEndI >= 0) {
              if (downStartI > downEndI) {
                if (i >= downEndI && i < downStartI) {
                  marker.setIcon({ image: normal });
                }
              } else {
                if (i >= downStartI && i < downEndI) {
                  marker.setIcon({ image: normal });
                }
              }
            } else {
              // 本身置灰
              if (i === downStartI) {
                marker.setIcon({ image: normal });
              }
            }
          });
          cropInfo.downStartIndex = -1;
        }
        if (pointTypeRes === 3) {
          const downStartI = markers.findIndex((marker: any) => {
            return marker.getExtData()?.pointType === 2;
          });
          const downEndI = markers.findIndex((marker: any) => {
            return marker.getExtData()?.pointType === 3;
          });
          console.log(downStartI, downEndI, 'downStartI, downEndI');
          markers.forEach((marker: any, i: number) => {
            if (downStartI >= 0) {
              if (downStartI > downEndI) {
                if (i > downEndI && i <= downStartI) {
                  marker.setIcon({ image: normal });
                }
              } else {
                if (i > downStartI && i <= downEndI) {
                  marker.setIcon({ image: normal });
                }
              }
            } else {
              // 本身置灰
              if (i === downEndI) {
                marker.setIcon({ image: normal });
              }
            }
            // if (i > downStartI) {

            //   marker.setIcon({ image: normal });
            // }
          });
          cropInfo.downEndIndex = -1;
        }
      }
    }

    currentMarker?.setExtData(
      isStartOrEnd
        ? {}
        : {
            pointType,
          },
    );

    if (isStartOrEnd) {
      if (curPosDir === 0) {
        upList = [];
      } else {
        downList = [];
      }
      list = pointTypeList.filter((item: any) => item !== pointType);
    }
    if ((pointTypeList.length ? !pointTypeList.includes(pointType) : true) && !isStartOrEnd) {
      list = [...pointTypeList, pointType];
    }

    setPointTypeList(list);
    setPointType(null);
    markerChange();
    map.clearInfoWindow();
  };
  /* eslint-enable */

  // 地图相关
  useEffect(() => {
    infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30), isCustom: true });
    map = new AMap.Map('container', {
      zoom: 13,
      zooms: [5, 30],
      center: [114.64, 38.03],
      WebGLParams: {
        preserveDrawingBuffer: true,
      },
    });

    return () => {
      clearTimeout(timeHandler);
      timeHandler = null;
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

  const handleUploadCropImg = async (url: any) => {
    const bytes = window.atob(url.split(',')[1]);
    const ab = new ArrayBuffer(bytes.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i++) {
      ia[i] = bytes.charCodeAt(i);
    }
    const file = new File([ab], 'mapCrop.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', file);
    const res = await tailorUpImg(formData);
    if (res.status === 0) {
      mapCropImgUrl = res?.data;
      message.success({
        content: '上传成功',
        key: '上传成功',
      });
    }
  };

  const handleMapCrop = () => {
    const mapCanvas: any = document.querySelector('.dataCropMap');
    html2canvas(mapCanvas).then((canvas) => {
      const url = canvas.toDataURL();
      handleUploadCropImg(url);
      setMapCropUrl(url);
    });
  };

  const saveMapCropData = async () => {
    if (!upList.length && !downList.length) {
      message.warning({
        content: '请选择完整上行或下行方向的起点和终点',
        key: '请选择完整上行或下行方向的起点和终点',
      });
      return;
    }

    //  fix 只有上行 下行 只选一边
    if (upList.length === 0 && downList.length > 0) {
      if (!(cropInfo?.upStartIndex === -1 && cropInfo?.upEndIndex === -1)) {
        message.warning({
          content: '请选择完整上行或下行方向的起点和终点',
          key: '请选择完整上行或下行方向的起点和终点',
        });
        return;
      }
    }
    if (downList.length === 0 && upList.length > 0) {
      if (!(cropInfo?.downStartIndex === -1 && cropInfo?.downEndIndex === -1)) {
        message.warning({
          content: '请选择完整上行或下行方向的起点和终点',
          key: '请选择完整上行或下行方向的起点和终点',
        });
        return;
      }
    }
    if (!mapCropUrl) {
      message.warning({
        content: '请进行位置截图',
        key: '请进行位置截图',
      });
      return;
    }
    const params: any = {
      fkProId: sceneData?.fkProId,
      id: sceneData?.id,
      sceneImgUrl: mapCropImgUrl,
    };
    if (downList.length) {
      params.downList = downList;
      params.downEndPoint = downList[downList.length - 1].stackNo;
      params.downStartPoint = downList[0].stackNo;
    }
    if (upList.length) {
      params.upList = upList;
      params.upStartPoint = upList[upList.length - 1].stackNo;
      params.upEndPoint = upList[0].stackNo;
    }
    const res = await sceneTailorSave(params);

    if (res.status === 0) {
      downList = [];
      upList = [];
      message.success({
        content: '保存成功',
        key: '保存成功',
      });

      props.onOk(mapCropImgUrl);
    }
  };

  const handleClearMapCropImg = () => {
    setMapCropUrl(null);
  };

  const handlePosData = (data: any) => {
    allPos = data?.allLs;

    // 裁剪图片
    // setMapCropUrl(data?.sceneImgUrl);

    // 优先渲染  上下行点  若无则渲染所有原始点
    if (data?.downList.length > 0) {
      downList = data?.downList || [];
      handleRenderPos(data?.downList, 'down');

      const startIndex = allPos.findIndex((item: any) => {
        return item.id === data?.downList[0]?.id;
      });
      const endIndex = allPos.findIndex((item: any) => {
        return item.id === data?.downList[data?.downList.length - 1]?.id;
      });
      cropInfo.downStartIndex = startIndex;
      cropInfo.downEndIndex = endIndex;
    }
    if (data?.upList.length > 0) {
      upList = data?.upList || [];
      handleRenderPos(data?.upList, 'up');

      const startIndex = allPos.findIndex((item: any) => {
        return item.id === data?.upList[0]?.id;
      });
      const endIndex = allPos.findIndex((item: any) => {
        return item.id === data?.upList[data?.upList.length - 1]?.id;
      });
      cropInfo.upStartIndex = startIndex;
      cropInfo.upEndIndex = endIndex;
    }
    if (!data?.upList.length && !data?.downList.length) {
      handleRenderPos(data?.allLs, 'none');
    }

    // 设置地图中心
    if (data?.allLs.length) {
      const index = Math.ceil(data?.allLs.length / 2);
      const center = [data?.allLs[index]?.longitude, data?.allLs[index]?.latitude];
      map.setCenter(center);

      // // 此时渲染完点 裁剪功能可用
      timeHandler = setTimeout(() => {
        setCropBtnDisabled(false);
        // // 裁剪图片
        setMapCropUrl(data?.sceneImgUrl);
      }, 1000);
    }
  };
  const handleGetSceneTailorInfo = async () => {
    const params = {
      projectId,
      sceneId: sceneData?.id,
    };
    const res = await getSceneTailorInfo(params);
    if (res.status === 0) {
      // todo
      handlePosData(res?.data);
    }
  };

  // 清除选择项
  const handleClearMap = () => {
    // todo 清除 已选的上行  下行的起始点 终点

    cropInfo = {
      upStartIndex: -1,
      upEndIndex: -1,
      downStartIndex: -1,
      downEndIndex: -1,
    };
    if (markers.length) {
      map.remove(markers);
      markers = [];
    }
    if (layer) map.remove(layer);
    map.clearInfoWindow();
    map.clearMap();
    setPointTypeList([]);

    currentMarker = null;

    curPosDir = null;
    downList = [];
    upList = [];
    layer = null;
    // markers = [];

    handleRenderPos(allPos, 'none');
  };
  useEffect(() => {
    handleGetSceneTailorInfo();
  }, []);

  const handleToggleMarkerInfo = async (todo: string) => {
    const direct = allPos[curMarkerIndex]?.stackDirection;

    markers[curPosMarkerIndex].setIcon({ size: [30, 45] });

    if (todo === 'next') {
      // 上行
      if (direct === 0) {
        // 在上行方向数据内切换
        if (upList.length) {
          const upListIndex = upList.findIndex((item: any) => {
            return item.id === allPos[curMarkerIndex]?.id;
          });
          if (upListIndex === upList.length - 1) {
            setNextDisabled(true);
            return;
          }
          const nextMarkerIndex = curMarkerIndex + 1;
          setCurMarkerIndex(curMarkerIndex + 1);
          // 更新图片
          const res: any = await handleQueryGpsInfo(allPos[nextMarkerIndex]?.id);
          if (res?.status === 0) {
            setCurPosCenterImg(res?.data?.imgList[1]);
            // info弹窗位置变更
            infoWindow.setContent(modalRef?.current || '');
            infoWindow.open(map, res?.data?.lnglat);
          }
        } else {
          if (curMarkerIndex === allPos.length - 1) {
            setNextDisabled(true);
            return;
          }
          const nextMarkerIndex = curMarkerIndex + 1;
          setCurMarkerIndex(curMarkerIndex + 1);

          // 更新图片
          const res: any = await handleQueryGpsInfo(allPos[nextMarkerIndex]?.id);
          if (res?.status === 0) {
            setCurPosCenterImg(res?.data?.imgList[1]);
            // info弹窗位置变更
            infoWindow.setContent(modalRef?.current || '');

            infoWindow.open(map, res?.data?.lnglat);
          }
        }
      }
      if (direct === 1) {
        // 在下行方向数据内切换
        if (downList.length) {
          const downListIndex = downList.findIndex((item: any) => {
            return item.id === allPos[curMarkerIndex]?.id;
          });
          if (downListIndex === downList.length - 1) {
            setNextDisabled(true);
            return;
          }
          const nextMarkerIndex = curMarkerIndex + 1;
          setCurMarkerIndex(curMarkerIndex + 1);

          // 更新图片
          const res: any = await handleQueryGpsInfo(allPos[nextMarkerIndex]?.id);
          if (res?.status === 0) {
            setCurPosCenterImg(res?.data?.imgList[1]);
            // info弹窗位置变更
            infoWindow.setContent(modalRef?.current || '');
            infoWindow.open(map, res?.data?.lnglat);
          }
        } else {
          if (curMarkerIndex === allPos.length - 1) {
            setNextDisabled(true);
            return;
          }
          const nextMarkerIndex = curMarkerIndex + 1;
          setCurMarkerIndex(curMarkerIndex + 1);

          // 更新图片
          const res: any = await handleQueryGpsInfo(allPos[nextMarkerIndex]?.id);
          if (res?.status === 0) {
            setCurPosCenterImg(res?.data?.imgList[1]);
            // info弹窗位置变更
            infoWindow.setContent(modalRef?.current || '');
            infoWindow.open(map, res?.data?.lnglat);
          }
        }
      }
      setCurPosMarkerIndex(curPosMarkerIndex + 1);
      currentMarker = markers[curPosMarkerIndex + 1];
      currentMarker?.setIcon({ size: [45, 60] });
      const nextPosPointType = currentMarker?.getExtData()?.pointType;
      if (![0, 1, 2, 3].includes(nextPosPointType)) {
        setIsStartOrEnd(false);
      } else {
        setIsStartOrEnd(true);
      }
      setPointType(null);
    }
    if (todo === 'prev') {
      // info弹窗位置变更
      // 更新图片

      // 上行
      if (direct === 0) {
        // 在上行方向数据内切换
        if (upList.length) {
          const upListIndex = upList.findIndex((item: any) => {
            return item.id === allPos[curMarkerIndex]?.id;
          });
          if (upListIndex === 0) {
            setPrevDisabled(true);
            return;
          }
          const prevCurMarkerIndex = curMarkerIndex - 1;
          setCurMarkerIndex(curMarkerIndex - 1);
          const res: any = await handleQueryGpsInfo(allPos[prevCurMarkerIndex]?.id);
          if (res?.status === 0) {
            setCurPosCenterImg(res?.data?.imgList[1]);

            // const prevPosPointType = markers[curPosMarkerIndex-1]?.getExtData()?.pointType;
            // if(![0, 1, 2, 3].includes(prevPosPointType)){
            //   setIsStartOrEnd(false)
            // }else{
            //   setIsStartOrEnd(true)
            // }

            infoWindow.setContent(modalRef?.current || '');
            // infoWindow.open(map, markers[prevCurMarkerIndex]?.getPosition());
            infoWindow.open(map, res?.data?.lnglat);
          }
        } else {
          if (curMarkerIndex === 0) {
            setPrevDisabled(true);
            return;
          }
          const prevCurMarkerIndex = curMarkerIndex - 1;
          setCurMarkerIndex(curMarkerIndex - 1);
          const res: any = await handleQueryGpsInfo(allPos[prevCurMarkerIndex]?.id);
          if (res?.status === 0) {
            setCurPosCenterImg(res?.data?.imgList[1]);

            // const prevPosPointType = markers[curPosMarkerIndex-1]?.getExtData()?.pointType;
            // if(![0, 1, 2, 3].includes(prevPosPointType)){
            //   setIsStartOrEnd(false)
            // }else{
            //   setIsStartOrEnd(true)
            // }

            infoWindow.setContent(modalRef?.current || '');
            // infoWindow.open(map, markers[prevCurMarkerIndex]?.getPosition());
            infoWindow.open(map, res?.data?.lnglat);
          }
        }
      }
      if (direct === 1) {
        // 在下行方向数据内切换
        if (downList.length) {
          const downListIndex = downList.findIndex((item: any) => {
            return item.id === allPos[curMarkerIndex]?.id;
          });
          if (downListIndex === 0) {
            setPrevDisabled(true);
            return;
          }
          const prevCurMarkerIndex = curMarkerIndex - 1;
          setCurMarkerIndex(curMarkerIndex - 1);

          const res: any = await handleQueryGpsInfo(allPos[prevCurMarkerIndex]?.id);
          if (res?.status === 0) {
            setCurPosCenterImg(res?.data?.imgList[1]);

            // const prevPosPointType = markers[curPosMarkerIndex-1]?.getExtData()?.pointType;
            // if(![0, 1, 2, 3].includes(prevPosPointType)){
            //   setIsStartOrEnd(false)
            // }else{
            //   setIsStartOrEnd(true)
            // }

            infoWindow.setContent(modalRef?.current || '');

            infoWindow.open(map, res?.data?.lnglat);
          }
        } else {
          if (curMarkerIndex === 0) {
            setPrevDisabled(true);
            return;
          }
          const prevCurMarkerIndex = curMarkerIndex - 1;
          setCurMarkerIndex(curMarkerIndex - 1);
          const res: any = await handleQueryGpsInfo(allPos[prevCurMarkerIndex]?.id);
          if (res?.status === 0) {
            setCurPosCenterImg(res?.data?.imgList[1]);

            // const prevPosPointType = markers[curPosMarkerIndex-1]?.getExtData()?.pointType;
            // if(![0, 1, 2, 3].includes(prevPosPointType)){
            //   setIsStartOrEnd(false)
            // }else{
            //   setIsStartOrEnd(true)
            // }

            infoWindow.setContent(modalRef?.current || '');
            // infoWindow.open(map, markers[prevCurMarkerIndex]?.getPosition());
            infoWindow.open(map, res?.data?.lnglat);
          }
        }
      }
      setCurPosMarkerIndex(curPosMarkerIndex - 1);
      currentMarker = markers[curPosMarkerIndex - 1];
      currentMarker?.setIcon({ size: [45, 60] });

      const prevPosPointType = currentMarker?.getExtData()?.pointType;
      if (![0, 1, 2, 3].includes(prevPosPointType)) {
        setIsStartOrEnd(false);
      } else {
        setIsStartOrEnd(true);
      }
      setPointType(null);
    }
  };

  return (
    <Modal
      title={`数据裁剪`}
      open={props.isShow}
      onCancel={() => props.onCancel()}
      onOk={() => saveMapCropData()}
      className={`crtedtDev ${styles.dataCropModalWrapper}`}
      destroyOnClose
      okText={'提交'}
      width={'66vw'}
    >
      <div className={styles.dataCropContent}>
        <div id={'container'} className={`${styles.DataCropMapArea} dataCropMap`}></div>
        <div className={`${styles.optLayer}`}>
          <Button className={styles.opBtn} onClick={() => handleClearMap()}>
            清除地图
          </Button>
          <Button
            className={styles.opBtn}
            onClick={() => handleMapCrop()}
            disabled={mapCropUrl || cropBtnDisabled}
          >
            位置截图
          </Button>
          <div className={`${styles.imgPos}`} style={{ display: !mapCropUrl ? 'none' : 'block' }}>
            {mapCropUrl && (
              <Image
                className={styles.closeIcon}
                src={'images/mapScenes/delete.svg'}
                preview={false}
                onClick={() => handleClearMapCropImg()}
              ></Image>
            )}
            {mapCropUrl && (
              <Image className={styles.mapCropImg} src={mapCropUrl} preview={false}></Image>
            )}
          </div>
        </div>
      </div>

      {/* 选择上下行起点、终点 */}
      {modalShow && (
        <div ref={modalRef} className={styles.infoWindow}>
          {!isStartOrEnd ? (
            <div className={styles.mapWinTitle}>
              <Select
                style={{ width: '352px' }}
                placeholder="请选择上行/下行的起点/终点"
                allowClear
                onChange={(e) => setPointType(e)}
                value={pointType}
              >
                {Object.keys(selectOps).map((item: any) => (
                  <Option
                    key={item}
                    value={item * 1}
                    disabled={pointTypeList.length ? pointTypeList?.includes(item * 1) : false}
                  >
                    {kindOps[item]}
                  </Option>
                ))}
              </Select>
            </div>
          ) : (
            <div className={styles.mapWinTitle}>{getTitle()}</div>
          )}
          <div className={styles.markerIconGroup}>
            <LeftOutlined
              className={`${styles.markerToggleLeft} ${styles.markerToggle} ${
                prevDisabled ? styles.markerToggleDisabled : ''
              }`}
              // src={'images/mapScenes/mapArrLeftIcon.svg'}
              // preview={false}
              onClick={() => handleToggleMarkerInfo('prev')}
            ></LeftOutlined>
            <div className={styles.markerCenterImg}>
              <ScenarioCheckImg
                height={250}
                width={352}
                imgInfo={curPosCenterImg}
              ></ScenarioCheckImg>
            </div>
            <RightOutlined
              className={`${styles.markerToggleRight} ${styles.markerToggle} ${
                nextDisabled ? styles.markerToggleDisabled : ''
              }`}
              // src={'images/mapScenes/mapArrRightIcon.svg'}
              // preview={false}
              onClick={() => handleToggleMarkerInfo('next')}
            ></RightOutlined>
          </div>

          <div className={styles.infoWindowBtn}>
            <Button size="small" onClick={handleCancel}>
              取消
            </Button>
            <Button type="primary" size="small" onClick={handleOk}>
              确定
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EdtMod;
