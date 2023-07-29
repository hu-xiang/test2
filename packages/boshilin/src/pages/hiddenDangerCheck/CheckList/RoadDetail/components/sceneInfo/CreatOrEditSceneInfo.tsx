import React, { Input, Modal, Select, Form, message, Button, Image, Switch } from 'antd';
import { useRef, useState, useEffect } from 'react';
// import ProTable from '@ant-design/pro-table';
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import styles from '../../styles_wdz.less';
// import { useAccess } from 'umi';
import html2canvas from 'html2canvas';
// import { ImageLayer } from '@antv/l7';
import { isEqual, debounce } from 'lodash';
// import Request from 'umi-request';

import { ReactComponent as DelWhiteIcon } from '@/assets/img/delWhiteIcon.svg';
// import { ReactComponent as CloseModalIcon } from '@/assets/img/closeModalIcon.svg';
import { queryGpsInfo, tailorUpImg } from '../../../service';
import {
  roadDetail,
  sceneTypeSelect,
  addScene,
  sceneShowEdit,
  editScene,
  matchStakeNo,
} from '../../service';
import ScenarioCheckImg from '../../../components/ScenarioCheckImg';

const { TextArea } = Input;
// const { CancelToken } = Request;

type Iprops = {
  isShow: boolean;
  isCreate: boolean;
  onCancel: Function;
  onsetkey: Function;
  editInfo: any;
  id: string;
  fkFacId: string;
  onContinue: Function;
};

export type Member = {};
// const { confirm } = Modal;
// let pathArr: any[] = [];
// let moveDirect: number = -1;
// let pointDirect: number = -1;
let map: any = null; // 全局map
let markers: any = [];
let layer: any = null;
let allPos: any = []; // 所有点信息
let infoWindow: any = null;
let cropInfo: any = {
  upStartIndex: -1,
  upEndIndex: -1,
  downStartIndex: -1,
  downEndIndex: -1,
};
let cropInfo1: any = {
  upStartIndex1: '',
  upEndIndex1: '',
  downStartIndex1: '',
  downEndIndex1: '',
};
let toSelectType: any = 'upStart';
let previewIndex: number = -1;
let mapCropImgUrl: any = '';
let cachedIndex: any = [];
let list2: any = []; // 前一次可视区域内的数据
let flag: any = false;
let isSwitch: any = false;
let previewImgList: any = [];
let previewImgIndex: number = 2;

const EdtMod: React.FC<Iprops> = (props) => {
  // const { id } = props;
  // const queRef = useRef<any>();
  const { AMap }: any = window;

  const formref = useRef<any>();
  const modalRef = useRef<any>();

  const [nowTime, setNowTime] = useState<any>();
  const [switchChecked, setSwitchChecked] = useState<boolean>(false);

  const [mapCropUrl, setMapCropUrl] = useState<any>(null);
  const [modalShow, setModalShow] = useState<any>(false);
  const [nextDisabled, setNextDisabled] = useState<any>(false);
  const [prevDisabled, setPrevDisabled] = useState<any>(false);
  const [curPosCenterImg, setCurPosCenterImg] = useState<any>();
  const [sceneTypeOps, setSceneTypeOps] = useState<any>([]);
  const [fkSceneTypeId, setFkSceneTypeId] = useState<any>('');
  const [fkSceneTypeName, setFkSceneTypeName] = useState<any>('');
  const [updatePosImg, setUpdatePosImg] = useState<boolean>(false);
  const [stackNo, setStackNo] = useState<any>('');
  const [stackDirection, setStackDirection] = useState<any>('');
  const [list, setList] = useState<any>([]); // 编辑时的源数据
  const [list1, setList1] = useState<any>([]); // 创建时的源数据
  const [length1, setLength1] = useState<number>(0);
  const [length2, setLength2] = useState<number>(0);
  const [selectType, setSelectType] = useState<string>('upStart');

  const normal = 'images/mapScenes/normal.png';
  const upStart = 'images/mapScenes/upStart.png';
  const up = 'images/mapScenes/up.png';
  const upEnd = 'images/mapScenes/upEnd.png';
  const downStart = 'images/mapScenes/downStart.png';
  const down = 'images/mapScenes/down.png';
  const downEnd = 'images/mapScenes/downEnd.png';

  // 存地图可视区域四个角位置数据
  const [pathBound, setPathBound] = useState<any>([]);
  const compareMapRef = useRef<any>(null);

  // const handleAbort = () => {
  //   if (queRef && queRef?.current) {
  //     queRef?.current();
  //     queRef.current = null;
  //   }
  // };

  // 是否在可视区域
  const isInview = () => {
    if (map) {
      const bounds = map?.getBounds();
      const NorthEast = bounds?.getNorthEast();
      const SouthWest = bounds?.getSouthWest();
      const SouthEast = [NorthEast.lng, SouthWest.lat];
      const NorthWest = [SouthWest.lng, NorthEast.lat];
      const path = [
        [NorthEast.lng, NorthEast.lat],
        SouthEast,
        [SouthWest.lng, SouthWest.lat],
        NorthWest,
      ]; // 将地图可视区域四个角位置按照顺序放入path，用于判断point是否在可视区域
      setPathBound(path);
      // pathArr = path;
    }
  };

  const debounceMapEvent = debounce(
    () => {
      isInview();
    },
    500,
    {
      leading: false,
      trailing: true,
    },
  );
  const handleEvent = () => {
    // console.log('e',e )
    if (!flag) {
      isInview();
      // debounceMapEvent();
    }
    flag = false;
  };
  // const handleDragEvent = () => {
  //   // console.log('edrag',e )
  //   if (!flag) {
  //     isInview()
  //     // debounceMapEvent();
  //   }
  //   flag = false;
  //   // map.setDefaultCursor('grab');
  // };

  const newPathData = (val: any) => {
    if (!isEqual(compareMapRef.current, val)) {
      compareMapRef.current = val;
    }
    return compareMapRef.current;
  };
  const resetPreviewImgInfo = () => {
    previewImgList = [];
    previewImgIndex = 2;
  };
  useEffect(() => {
    map = new AMap.Map('container', {
      zoom: 15,
      zooms: [15, 30],
      center: [114.514859, 38.042306],
      WebGLParams: {
        preserveDrawingBuffer: true,
      },
      pitch: 40, // 地图俯仰角度，有效范围 0 度- 83 度
      viewMode: '3D', // 地图模式
      keyboardEnable: false,
    });
    // const height = document.querySelector('#container')!.clientHeight / 2;
    // const width = document.querySelector('#container')!.clientWidth / 2;
    infoWindow = new AMap.InfoWindow({
      offset: new AMap.Pixel(0, -30),
      isCustom: true,
      autoMove: true,
      // avoid: [height - 142, width - 186, height - 142, width - 186],
    });

    // map.on('zoomstart', () => {
    //   // stopInterval();
    // });
    // map.on('zoomend', handleEvent);

    // map.on('movestart', () => {
    //   // stopInterval();
    // });
    // map.on('zoomchange', () => {
    //    console.log('ddgg',map.getZooms(),map.getZoom())
    //   });
    map.on('moveend', handleEvent);
    // map.on('dragstart', () => {
    //   // map.setDefaultCursor('grabbing');
    //   // stopInterval();
    // });
    // map.on('dragend', handleDragEvent);
    debounceMapEvent();

    return () => {
      resetPreviewImgInfo();
      cropInfo1 = {
        upStartIndex1: '',
        upEndIndex1: '',
        downStartIndex1: '',
        downEndIndex1: '',
      };
      // pathArr = [];
      // moveDirect = -1;
      // pointDirect = -1;
      setPathBound([]);
      setList([]);
      setList1([]);
      isSwitch = false;
      setSelectType(upStart);
      toSelectType = 'upStart';
      cachedIndex = [];
      cropInfo = {
        upStartIndex: -1,
        upEndIndex: -1,
        downStartIndex: -1,
        downEndIndex: -1,
      };
      previewIndex = -1;
      // map.off('zoomend', handleEvent);
      map.off('moveend', handleEvent);
      // map.off('dragend', handleDragEvent);
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
    const file = new File([ab], `mapCrop${new Date().getTime()}.png`, { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', file);
    const res = await tailorUpImg(formData);
    if (res.status === 0) {
      mapCropImgUrl = res?.data;
      formref.current.setFieldValue('sceneImgUrl', mapCropImgUrl);
      message.success({
        content: '上传成功',
        key: '上传成功',
      });
    }
  };

  // 地图 ========start==============
  const handleCloseInfoWin = () => {
    map.clearInfoWindow();
    isSwitch = false;
  };
  const handleMapCrop = () => {
    handleCloseInfoWin();
    const mapCanvas: any = document.querySelector('.dataCropMap');
    html2canvas(mapCanvas).then((canvas) => {
      const url = canvas.toDataURL();
      handleUploadCropImg(url);
      setMapCropUrl(url);
    });
  };
  const handleQueryGpsInfo = async (id: string) => {
    const parmas = {
      trackId: id,
    };
    return await queryGpsInfo(parmas);
  };
  const findPoint = async (other: number, direction: number, stack: any) => {
    const isTrue =
      direction > 0
        ? !!(cropInfo.upEndIndex < 0 || cropInfo.upStartIndex < 0)
        : !!(cropInfo.downEndIndex < 0 || cropInfo.downStartIndex < 0);
    if (other > -1 && isTrue) {
      const res: any = await matchStakeNo({
        proFacId: props.id,
        direction: direction === 0 ? 1 : 0,
        startStakeNo: stack[0],
        endStakeNo: stack[1],
      });
      let index1: number = cropInfo.upStartIndex;
      let index2: number = cropInfo.upEndIndex;
      let index3: number = cropInfo.downStartIndex;
      let index4: number = cropInfo.downEndIndex;
      if (res?.data?.startStakeNo && index4 < 0 && direction === 0) {
        index4 = list1
          ?.slice(length1)
          ?.filter((item: any) => item?.stackNo === res?.data?.startStakeNo)[0]?.index;
      }
      if (res?.data?.endStakeNo && index3 < 0 && direction === 0) {
        index3 = list1
          ?.slice(length1)
          ?.filter((item: any) => item?.stackNo === res?.data?.endStakeNo)[0]?.index;
      }
      if (res?.data?.startStakeNo && index2 < 0 && direction === 1) {
        index2 = list1
          ?.slice(0, length1)
          ?.filter((item: any) => item?.stackNo === res?.data?.startStakeNo)[0]?.index;
      }
      if (res?.data?.endStakeNo && index1 < 0 && direction === 1) {
        index1 = list1
          ?.slice(0, length1)
          ?.filter((item: any) => item?.stackNo === res?.data?.endStakeNo)[0]?.index;
      }

      switch (direction) {
        case 0:
          if (index3 > -1 && index4 > -1) {
            cropInfo.downStartIndex = index3 > index4 ? index3 : index4;
            cropInfo.downEndIndex = index3 > index4 ? index4 : index3;
            cropInfo1.downStartIndex1 =
              index3 > index4 ? res?.data?.endStakeNo : res?.data?.startStakeNo;
            cropInfo1.downEndIndex1 =
              index3 > index4 ? res?.data?.startStakeNo : res?.data?.endStakeNo;
            formref.current.setFieldValue('downStart', cropInfo1.downStartIndex1);
            formref.current.setFieldValue('downEnd', cropInfo1.downEndIndex1);
          }
          break;
        case 1:
          if (index1 > -1 && index2 > -1) {
            cropInfo.upStartIndex = index1 < index2 ? index1 : index2;
            cropInfo.upEndIndex = index1 < index2 ? index2 : index1;
            cropInfo1.upStartIndex1 =
              index1 < index2 ? res?.data?.endStakeNo : res?.data?.startStakeNo;
            cropInfo1.upEndIndex1 =
              index1 < index2 ? res?.data?.startStakeNo : res?.data?.endStakeNo;
            formref.current.setFieldValue('upStart', cropInfo1.upStartIndex1);
            formref.current.setFieldValue('upEnd', cropInfo1.upEndIndex1);
          }
          break;

        default:
          break;
      }
    }
  };

  const handleSortPreviewImg = (listArr: any) => {
    if (!listArr.length) return [];
    const res: any = [];
    // 调整对应图片顺序 imgPosition 0 左  2  中间  1右
    listArr.forEach((item: any) => {
      if (item?.imgPosition === 0) {
        res[0] = item;
      }
      if (item?.imgPosition === 1) {
        res[2] = item;
      }
      if (item?.imgPosition === 2) {
        res[1] = item;
      }
    });
    return res;
  };

  const handleRenderLaberMarker = (
    curPos: any,
    icon: any,
    direction: any,
    stack: any,
    curPosIndex: number,
  ) => {
    const curData = {
      position: curPos,
      icon,
      zooms: [2, 30],
      extData: {
        stackDirection: direction,
        curPosIndex,
      },
    };
    const labelMarker = new AMap.LabelMarker(curData);

    markers.push(labelMarker);

    labelMarker.on('click', async function () {
      // 设置中心点

      flag = true;
      let image = '';
      // isPreview = true
      // 获取当前点在所有点集合中的位置
      // const curPosition = e?.data?.data?.position;
      // const curPosIndex = allPos.findIndex((item: any) => {
      //   return item.longitude === curPosition[0] && item.latitude === curPosition[1];
      // });
      previewIndex = curPosIndex;
      // previewIndex = markers.findIndex(
      //   (item: any) => item.getExtData()?.curPosIndex === curPosIndex,
      // );

      /* eslint-disable */
      // const index1 = list2?.findIndex((item: any) => item?.stackNo === stack);
      // if (index1 > -1) {
      //   markers[index1].setIcon({ image: up });
      // }
      if (direction === 0) {
        switch (toSelectType) {
          case 'upStart':
            if (cropInfo.upEndIndex > -1 && !(curPosIndex < cropInfo.upEndIndex)) {
              message.warning({
                content: '请在上行终点位置前选择起点',
                key: '请在上行终点位置前选择起点',
              });
              return;
            } else {
              image = upStart;
              // const index1 = list2?.findIndex((item: any) => item?.stackNo === stack);
              // if (index1 > -1) {
              //   markers[index1].setIcon({ image: up });
              // }
              cropInfo.upStartIndex = curPosIndex;
              cropInfo1.upStartIndex1 = stack;
              formref.current.setFieldValue('upStart', stack);
              if (props?.isCreate) {
                await findPoint(cropInfo.upEndIndex, 0, [stack, cropInfo1.upEndIndex1]);
              }
              handlePosData(list2);
            }
            break;
          case 'upEnd':
            if (cropInfo.upStartIndex > -1 && !(curPosIndex > cropInfo.upStartIndex)) {
              message.warning({
                content: '请在上行起点位置后选择终点',
                key: '请在上行起点位置后选择终点',
              });
              return;
            } else {
              image = upEnd;
              // const index1 = list2?.findIndex((item: any) => item?.stackNo === stack);
              // if (index1 > -1) {
              //   markers[index1].setIcon({ image: up });
              // }
              cropInfo.upEndIndex = curPosIndex;
              cropInfo1.upEndIndex1 = stack;
              formref.current.setFieldValue('upEnd', stack);
              if (props?.isCreate) {
                await findPoint(cropInfo.upStartIndex, 0, [cropInfo1.upStartIndex1, stack]);
              }
              handlePosData(list2);
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
            if (cropInfo.downEndIndex > -1 && !(curPosIndex > cropInfo.downEndIndex)) {
              message.warning({
                content: '请在下行终点位置后选择起点',
                key: '请在下行终点位置后选择起点',
              });
              return;
            } else {
              image = downStart;
              // if (cropInfo.downStartIndex > -1) {
              //   markers[cropInfo.downStartIndex].setIcon({ image: down });
              // }
              cropInfo.downStartIndex = curPosIndex;
              cropInfo1.downStartIndex1 = stack;
              formref.current.setFieldValue('downStart', stack);
              if (props?.isCreate) {
                await findPoint(cropInfo.downEndIndex, 1, [stack, cropInfo1.downEndIndex1]);
              }
              handlePosData(list2);
            }
            break;
          case 'downEnd':
            if (cropInfo.downStartIndex > -1 && !(curPosIndex < cropInfo.downStartIndex)) {
              message.warning({
                content: '请在下行起点位置前选择终点',
                key: '请在下行起点位置前选择终点',
              });
              return;
            } else {
              image = downEnd;
              // if (cropInfo.downEndIndex > -1) {
              //   markers[cropInfo.downEndIndex].setIcon({ image: down });
              // }
              cropInfo.downEndIndex = curPosIndex;
              cropInfo1.downEndIndex1 = stack;
              formref.current.setFieldValue('downEnd', stack);
              if (props?.isCreate) {
                await findPoint(cropInfo.downStartIndex, 1, [cropInfo1.downStartIndex1, stack]);
              }
              handlePosData(list2);
            }
            break;
        }
      }
      /* eslint-enable */

      // e.target.setIcon({ size: [26, 32], image });

      handleCloseInfoWin();

      const res = await handleQueryGpsInfo(allPos[curPosIndex].id);
      if (res.status === 0) {
        resetPreviewImgInfo();
        // const { stackNo, stackDirection } = res?.data || {};
        setStackNo(res?.data?.stackNo);
        setStackDirection(res?.data?.stackDirection);
        previewImgList = handleSortPreviewImg(res?.data?.imgList || []);
        // setCurPosCenterImg(res?.data?.imgList[2]);
        setCurPosCenterImg(previewImgList[2]);
        setModalShow(true);
        setUpdatePosImg(!updatePosImg);
        infoWindow.setContent(modalRef?.current || '');
        infoWindow.open(map, labelMarker?.getPosition());
      }
    });
  };
  // 获取裁剪数据相关
  const handleRenderPos = (arr: any) => {
    list2 = [...arr];
    if (layer) map?.remove(layer);
    if (map) map?.remove(markers);
    // 创建 AMap.LabelsLayer 图层
    layer = new AMap.LabelsLayer({
      zooms: [2, 30],
      zIndex: 1000,
      collision: false,
    });

    // 将图层添加到地图
    map?.add(layer);

    // 设置

    const icon = {
      type: 'image',
      image: normal,
      size: [20, 26],
      anchor: 'bottom-center',
    };
    markers = [];
    for (let i = 0; i < arr.length; i++) {
      const pos = [arr[i].longitude, arr[i].latitude];

      // icon.image = normal;
      // 区分上下行颜色
      icon.image = arr[i].stackDirection === 0 ? up : down;
      icon.size = [20, 26];

      // 继续创建 保留前次创建的点
      if (cachedIndex?.includes(arr[i]?.index)) {
        icon.image = normal;
      }

      if (cropInfo1?.upStartIndex1 && cropInfo1?.upStartIndex1 === arr[i]?.stackNo) {
        icon.image = upStart;
        icon.size = [26, 32];
      } else if (cropInfo1?.upEndIndex1 && cropInfo1?.upEndIndex1 === arr[i]?.stackNo) {
        icon.image = upEnd;
        icon.size = [26, 32];
      } else if (cropInfo1?.downStartIndex1 && cropInfo1?.downStartIndex1 === arr[i]?.stackNo) {
        icon.image = downStart;
        icon.size = [26, 32];
      } else if (cropInfo1?.downEndIndex1 && cropInfo1?.downEndIndex1 === arr[i]?.stackNo) {
        icon.image = downEnd;
        icon.size = [26, 32];
      }

      if (
        cropInfo.upStartIndex > -1 &&
        cropInfo.upEndIndex > -1 &&
        arr[i]?.index > cropInfo.upStartIndex &&
        arr[i]?.index < cropInfo.upEndIndex
      ) {
        icon.image = normal;
      }

      if (
        cropInfo.downStartIndex > -1 &&
        cropInfo.downEndIndex > -1 &&
        arr[i]?.index > cropInfo.downEndIndex &&
        arr[i]?.index < cropInfo.downStartIndex
      ) {
        icon.image = normal;
      }

      handleRenderLaberMarker(pos, icon, arr[i].stackDirection, arr[i].stackNo, arr[i]?.index);
    }
    // 一次性将海量点添加到图层
    layer.add(markers);
    setNowTime(new Date().valueOf());
  };
  const handlePosData = (data: any) => {
    allPos = props.isCreate ? list1 : list;

    if (!props.isCreate) {
      const { downEndIndex1, downStartIndex1, upEndIndex1, upStartIndex1 } = cropInfo1;
      allPos?.forEach((item: any, i: number) => {
        if (downEndIndex1 && downStartIndex1) {
          if (item.stackDirection === 1 && item.stackNo === downEndIndex1) {
            cropInfo.downEndIndex = i;
          }
          if (item.stackDirection === 1 && item.stackNo === downStartIndex1) {
            cropInfo.downStartIndex = i;
          }
          if (
            cropInfo.downStartIndex > -1 &&
            cropInfo.downEndIndex > -1 &&
            cropInfo.downStartIndex < cropInfo.downEndIndex
          ) {
            const { downStartIndex, downEndIndex } = cropInfo;
            cropInfo.downEndIndex = downStartIndex;
            cropInfo.downStartIndex = downEndIndex;
          }
        }
        if (upEndIndex1 && upStartIndex1) {
          if (item.stackDirection === 0 && item.stackNo === upEndIndex1) {
            cropInfo.upEndIndex = i;
          }
          if (item.stackDirection === 0 && item.stackNo === upStartIndex1) {
            cropInfo.upStartIndex = i;
          }
          if (
            cropInfo.upStartIndex > -1 &&
            cropInfo.upEndIndex > -1 &&
            cropInfo.upStartIndex > cropInfo.upEndIndex
          ) {
            const { upStartIndex, upEndIndex } = cropInfo;
            cropInfo.upEndIndex = upStartIndex;
            cropInfo.upStartIndex = upEndIndex;
          }
        }
      });
    }
    // 裁剪图片
    // if (!props.isCreate) {
    //   handleRenderPos(data);
    // } else {

    // }
    /* eslint no-lonely-if:0 */
    handleRenderPos(data);
    // if (map?.getZoom() > 15) {
    //   handleRenderPos(data);
    // } else {
    //   /* eslint no-lonely-if:0 */
    //   if (data?.length > 1000) {
    //     handleRenderPos(data?.slice(0, 1000));
    //   } else {
    //     handleRenderPos(data);
    //   }
    // }

    // 设置地图中心
    if (data?.length) {
      // const index = Math.ceil(data?.length / 2);
      // const center = [data[index]?.longitude, data[index]?.latitude];
      // map.setCenter(center);
    }
  };
  const handleGetSceneTailorInfo = async (params: any) => {
    const res: any = await roadDetail(params);
    if (res.status === 0) {
      // todo 按上行 下行 区分下再组合到一起
      const upArr = res?.data?.trackList.filter((item: any) => item.stackDirection === 0);
      const downArr = res?.data?.trackList.filter((item: any) => item.stackDirection === 1);
      setLength1(upArr?.length || 0);
      setLength2(downArr?.length || 0);
      const arr = [...upArr, ...downArr]?.map((item: any, index: number) => {
        return {
          ...item,
          index,
        };
      });
      res?.data?.points?.forEach((item: any) => {
        let index1 = -1;
        let index2 = -1;
        let index3 = -1;
        let index4 = -1;
        if (item?.upStartPoint) {
          index1 = upArr?.findIndex((i: any) => i?.stackNo === item?.upStartPoint);
        }
        if (item?.upEndPoint) {
          index2 = upArr?.findIndex((i: any) => i?.stackNo === item?.upEndPoint);
        }
        if (item?.downStartPoint) {
          index3 =
            upArr?.length + downArr?.findIndex((i: any) => i?.stackNo === item?.downStartPoint);
        }
        if (item?.downEndPoint) {
          index4 =
            upArr?.length + downArr?.findIndex((i: any) => i?.stackNo === item?.downEndPoint);
        }
        const range = (start: number, end: number, step: number) =>
          Array.from({ length: (end - start) / step + 1 }, (_, i) => start + i * step);
        if (index1 > -1 && index2 > -1) {
          cachedIndex = [...cachedIndex, ...range(index1, index2, 1)];
        } else if (index1 > -1 && index2 < 0) {
          cachedIndex.push(index1);
        } else if (index1 < 0 && index2 > -1) {
          cachedIndex.push(index2);
        }
        if (index3 > -1 && index4 > -1) {
          cachedIndex = [...cachedIndex, ...range(index4, index3, 1)];
        } else if (index3 > -1 && index4 < 0) {
          cachedIndex.push(index3);
        } else if (index3 < 0 && index4 > -1) {
          cachedIndex.push(index4);
        }
      });

      cachedIndex = [...new Set(cachedIndex)];

      setList1([...arr]);
    }
  };
  const submit = async (isContinue?: boolean) => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = formref.current.getFieldsValue();
        const { remark, fkKeySceneName } = formList;
        /* eslint-disable */
        const params: any = {
          fkKeySceneName,
          fkSceneTypeId: fkSceneTypeId,
          fkSceneTypeName: fkSceneTypeName,
          downEndPoint: formList.downEnd,
          downList: [],
          downStartPoint: formList.downStart,
          upEndPoint: formList.upEnd,
          upList: [],
          upStartPoint: formList.upStart,
          sceneImgUrl: mapCropImgUrl,
          remark,
          fkProFacId: props.id,
          originDestinationStatus: switchChecked ? 1 : 0,
        };
        /* eslint-enable */
        if (cropInfo.downStartIndex > -1 && cropInfo.downEndIndex > -1) {
          params.downList = allPos.slice(cropInfo.downEndIndex, cropInfo.downStartIndex + 1);
        }
        if (cropInfo.upStartIndex > -1 && cropInfo.upEndIndex > -1) {
          params.upList = allPos.slice(cropInfo.upStartIndex, cropInfo.upEndIndex + 1);
        }

        if (!params.downList.length && !params.upList.length) {
          message.warning({
            content: '请选择上行或下行的完整区间',
            key: '请选择上行或下行的完整区间',
          });
          return;
        }
        if (
          params.upList.length &&
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
          params.downList.length &&
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
          res = await addScene(params);
        } else {
          params.id = props.editInfo.id;
          params.fkKeySceneId = props.editInfo.fkKeySceneId;
          res = await editScene(params);
        }
        if (res.status === 0) {
          message.success({
            content: '保存成功',
            key: '保存成功',
          });
          toSelectType = 'upStart';
          setSelectType('upStart');
          if (isContinue) {
            const range = (start: number, end: number, step: number) =>
              Array.from({ length: (end - start) / step + 1 }, (_, i) => start + i * step);
            if (cropInfo?.upStartIndex > -1 && cropInfo?.upEndIndex > -1) {
              cachedIndex = [
                ...cachedIndex,
                ...range(cropInfo?.upStartIndex, cropInfo?.upEndIndex, 1),
              ];
            } else if (cropInfo?.upStartIndex > -1 && cropInfo?.upEndIndex < 0) {
              cachedIndex.push(cropInfo?.upStartIndex);
            } else if (cropInfo?.upStartIndex < 0 && cropInfo?.upEndIndex > -1) {
              cachedIndex.push(cropInfo?.upEndIndex);
            }
            if (cropInfo?.downStartIndex > -1 && cropInfo?.downEndIndex > -1) {
              cachedIndex = [
                ...cachedIndex,
                ...range(cropInfo?.downEndIndex, cropInfo?.downStartIndex, 1),
              ];
            } else if (cropInfo?.downStartIndex > -1 && cropInfo?.downEndIndex < 0) {
              cachedIndex.push(cropInfo?.downStartIndex);
            } else if (cropInfo?.downStartIndex < 0 && cropInfo?.downEndIndex > -1) {
              cachedIndex.push(cropInfo?.downEndIndex);
            }

            cachedIndex = [...new Set(cachedIndex)];
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
            cropInfo1 = {
              upStartIndex1: '',
              upEndIndex1: '',
              downStartIndex1: '',
              downEndIndex1: '',
            };
            setMapCropUrl('');
            props.onContinue();
            formref.current.resetFields();
            setSwitchChecked(false);

            handlePosData([...list2]);
          } else {
            props.onCancel();
          }
        }
      })
      .catch(() => {});
  };
  const handleContinue = (isClickContinueBtn?: boolean) => {
    if (isClickContinueBtn) {
      submit(true);
    } else {
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
  const handleDelMapCrop = () => {
    setMapCropUrl('');
    formref.current.setFieldValue('sceneImgUrl', '');
  };

  useEffect(() => {
    if (markers?.length && isSwitch) {
      const curMarkerIndex = markers.findIndex(
        (item: any) => item.getExtData()?.curPosIndex === previewIndex,
      );
      const isPre =
        previewIndex - 1 === cropInfo?.upStartIndex ||
        previewIndex - 1 === cropInfo?.upEndIndex ||
        previewIndex - 1 === cropInfo?.downStartIndex ||
        previewIndex - 1 === cropInfo?.downEndIndex;
      const isNext =
        previewIndex + 1 === cropInfo?.upStartIndex ||
        previewIndex + 1 === cropInfo?.upEndIndex ||
        previewIndex + 1 === cropInfo?.downStartIndex ||
        previewIndex + 1 === cropInfo?.downEndIndex;
      const preMarker = !isPre
        ? markers.filter((item: any) => item.getExtData()?.curPosIndex === previewIndex - 1)
        : [];
      const nextMarker = !isNext
        ? markers.filter((item: any) => item.getExtData()?.curPosIndex === previewIndex + 1)
        : [];

      if (preMarker?.length) {
        preMarker[0]?.setIcon({ size: [20, 26] });
      }
      if (nextMarker?.length) {
        nextMarker[0]?.setIcon({ size: [20, 26] });
      }
      markers[curMarkerIndex]?.setIcon({ size: [26, 32] });
      markers[curMarkerIndex]?.setTop(true);
      isSwitch = false;
    }
  }, [nowTime]);

  const handleTogglePic = (todo: string) => {
    setNextDisabled(false);
    setPrevDisabled(false);
    if (todo === 'prev') {
      if (previewImgIndex === 0) {
        return;
      }
      previewImgIndex -= 1;
      if (previewImgIndex === 0) {
        setPrevDisabled(true);
      }
    }
    if (todo === 'next') {
      if (previewImgIndex === 2) {
        return;
      }
      previewImgIndex += 1;
      if (previewImgIndex === 2) {
        setNextDisabled(true);
      }
    }
    setCurPosCenterImg(previewImgList[previewImgIndex]);
  };

  const handleToggleMarkerInfo = async (todo: string) => {
    // 区分键盘方向键
    if (previewIndex === -1) return;
    isSwitch = true;
    setNextDisabled(false);
    setPrevDisabled(false);
    if (todo === 'prev') {
      if (previewIndex !== 0) {
        previewIndex -= 1;
      } else {
        setPrevDisabled(true);
        return;
      }
    } else if (todo === 'next') {
      if (previewIndex !== allPos?.length - 1) {
        previewIndex += 1;
      } else {
        setNextDisabled(true);
        return;
      }
    } else if (todo === 'top') {
      if (previewIndex === 0) {
        setPrevDisabled(true);
        return;
      }
      if (allPos?.length > 9 && previewIndex > 9) {
        previewIndex -= 9;
      } else {
        previewIndex = 0;
      }
    } else if (todo === 'bottom') {
      if (previewIndex === allPos?.length - 1) {
        setPrevDisabled(true);
        return;
      }
      if (allPos?.length - previewIndex > 9) {
        previewIndex += 9;
      } else {
        previewIndex = allPos?.length - 1;
      }
    }

    const center = allPos[previewIndex]?.lnglat;

    // map?.setCenter(center, true);

    const { id } = allPos[previewIndex];
    const res = await handleQueryGpsInfo(id);
    if (res.status === 0) {
      resetPreviewImgInfo();
      setStackNo(res?.data?.stackNo);
      setStackDirection(res?.data?.stackDirection);
      previewImgList = handleSortPreviewImg(res?.data?.imgList || []);
      setCurPosCenterImg(previewImgList[2]);
      setModalShow(true);
      setUpdatePosImg(!updatePosImg);
      infoWindow.setContent(modalRef?.current || '');
      infoWindow.open(map, center);
    }
  };

  const handleGetEditInfo = async (sceneTypeOpsList: any) => {
    const params = {
      id: props.editInfo.id,
      proFacId: props.id,
    };
    const res = await sceneShowEdit(params);
    if (res.status === 0) {
      // todo
      // todo 按上行 下行 区分下再组合到一起
      const upArr = res?.data?.allLs.filter((item: any) => item.stackDirection === 0);
      const downArr = res?.data?.allLs.filter((item: any) => item.stackDirection === 1);
      setLength1(upArr?.length || 0);
      setLength2(downArr?.length || 0);
      const arr = [...upArr, ...downArr]?.map((item: any, index: number) => {
        return {
          ...item,
          index,
        };
      });
      setList([...arr]);

      setSwitchChecked(!!(res?.data?.originDestinationStatus === 1));
      // handlePosData([...upArr, ...downArr]);
      //  handlePosData(res.data?.allLs || []);
      const {
        fkKeySceneName,
        upEndPoint,
        upStartPoint,
        downEndPoint,
        downStartPoint,
        sceneImgUrl,
        remark,
      } = props.editInfo;
      cropInfo1 = {
        upStartIndex1: upStartPoint,
        upEndIndex1: upEndPoint,
        downStartIndex1: downStartPoint,
        downEndIndex1: downEndPoint,
      };
      const filterSceneType = sceneTypeOpsList.filter(
        (item: any) => item.name === props.editInfo.fkSceneTypeName,
      );
      const initVals = {
        upEnd: upEndPoint,
        upStart: upStartPoint,
        fkKeySceneName,
        downEnd: downEndPoint,
        downStart: downStartPoint,
        // deptType: props.editInfo.fkSceneTypeName,
        sceneImgUrl,
        remark,
        sceneType: filterSceneType[0]?.id,
      };

      setFkSceneTypeId(filterSceneType[0].id);
      setFkSceneTypeName(props.editInfo.fkSceneTypeName);
      setMapCropUrl(sceneImgUrl);
      mapCropImgUrl = sceneImgUrl;
      formref?.current?.setFieldsValue(initVals);
    }
  };
  // 场景类型下拉框
  const handleSceneTypeSelect = async () => {
    const res = await sceneTypeSelect({});
    if (res.status === 0) {
      // todo
      setSceneTypeOps(res.data);

      if (!props.isCreate) {
        handleGetEditInfo(res.data);
      }
    }
  };
  const isPointInRing = (path: any, arr: any) => {
    const arr1: any = [];
    for (let i = 0; i < arr?.length; i++) {
      if (arr1?.length < 5000) {
        if (AMap.GeometryUtil.isPointInRing(arr[i]?.lnglat, path)) {
          arr1?.push(arr[i]);
        }
      } else {
        // map?.setZooms([map?.getZoom(), 30]);
        break;
      }
    }
    // if (arr1?.length < 1000) {
    //   map?.setZooms([2, 30]);
    // }
    return arr1;
  };
  useEffect(() => {
    if (list1?.length) {
      setTimeout(() => {
        map?.setZoomAndCenter(18, list1[0]?.lnglat, true);
      }, 0);
    }
  }, [list1]);

  useEffect(() => {
    if (list?.length) {
      const { downStartPoint, upStartPoint } = props.editInfo;
      const upIndex = upStartPoint
        ? list?.filter((item: any) => item?.stackNo === upStartPoint)[0]?.lnglat
        : null;
      const downIndex = downStartPoint
        ? list?.filter((item: any) => item?.stackNo === downStartPoint)[0]?.lnglat
        : null;
      if (upIndex) {
        map?.setZoomAndCenter(18, upIndex, true);
        return;
      }
      if (downIndex) {
        map?.setZoomAndCenter(18, downIndex, true);
        return;
      }
      map?.setZoomAndCenter(18, list[0]?.lnglat, true);
    }
  }, [list]);
  // 地图可视区域四个角位置变化后请求聚合数据
  useEffect(() => {
    if (props.isCreate) {
      if (pathBound?.length) {
        if (props?.id) {
          let params: any = {
            id: props?.id,
          };
          // if (pathBound?.length > 0) {
          params = {
            id: props?.id,
            // latitude1: pathBound[0][1],
            // latitude2: pathBound[1][1],
            // latitude3: pathBound[2][1],
            // latitude4: pathBound[3][1],
            // longitude1: pathBound[0][0],
            // longitude2: pathBound[1][0],
            // longitude3: pathBound[2][0],
            // longitude4: pathBound[3][0],
          };
          // }
          if (!list1?.length) {
            handleGetSceneTailorInfo(params);
          } else {
            const arr: any = isPointInRing(pathBound, list1);
            if (layer) map?.remove(layer);
            if (map) map?.remove(markers);
            handlePosData(arr);
          }
        }
      }
    } else {
      if (list?.length) {
        const arr: any = isPointInRing(pathBound, list);
        if (layer) map?.remove(layer);
        if (map) map?.remove(markers);
        handlePosData(arr);
      }
    }
  }, [newPathData(pathBound)]);

  useEffect(() => {
    handleSceneTypeSelect();
    // if (props.isCreate) {
    //   handleGetSceneTailorInfo();
    // }
  }, []);
  // 地图 ========end==============
  useEffect(() => {
    if (modalShow) {
      setUpdatePosImg(!updatePosImg);
    }
  }, [modalShow]);
  const fieldNames = {
    label: 'name',
    value: 'id',
  };
  const handleSelectSceneType = (val: string, option: any) => {
    setFkSceneTypeId(val);
    setFkSceneTypeName(option.name);
  };
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
      handleToggleMarkerInfo(todo);
    }
  };
  useEffect(() => {
    document.addEventListener('keydown', handleDirKeyToggle, { passive: false });
    return () => {
      document.removeEventListener('keydown', handleDirKeyToggle);
    };
  }, [list]);
  return (
    <Modal
      title={props.isCreate ? '场景创建' : '场景编辑'}
      open={props.isShow}
      onCancel={() => handleContinue()}
      onOk={() => submit()}
      className={`crtedtDev  ${styles.sublineDialog}`}
      destroyOnClose
      width={window.innerWidth * (1710 / 1920)}
      // height={window.innerHeight * 0.8}
      footer={customFooter}
    >
      <div className={`${styles.sublineContent} ${styles.sceneContent}`}>
        <div
          id={'container'}
          className={`map ${styles.map} dataCropMap`}
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
            <div className={styles.legendItem}>
              <Image height={16} width={16} src={normal} preview={false}></Image>
              <span>已选位置</span>
            </div>
          </div>
        </div>
        <div className={styles.opsGroup}>
          <div className={styles.editTabWrapper}>
            <Form labelCol={{ flex: '78px' }} wrapperCol={{ flex: 1 }} ref={formref}>
              <Form.Item
                label="场景名称"
                name="fkKeySceneName"
                rules={[{ required: true, message: '请输入场景名称' }]}
              >
                <Input autoComplete="off" placeholder="请输入场景名称" />
              </Form.Item>
              <Form.Item
                label="场景类型"
                name="sceneType"
                rules={[{ required: true, message: '请选择场景类型' }]}
              >
                <Select
                  style={{ height: 40 }}
                  placeholder="请选择场景类型"
                  allowClear
                  fieldNames={fieldNames}
                  onSelect={(val: any, option: any) => handleSelectSceneType(val, option)}
                  options={sceneTypeOps}
                ></Select>
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
              <Form.Item label="前后选点" className={styles.cumstomDirItem}>
                <Switch
                  disabled={!!switchChecked}
                  checked={switchChecked}
                  onChange={(e: any) => {
                    if (
                      (cropInfo?.upStartIndex > -1 && cropInfo?.upEndIndex > 1) ||
                      (cropInfo?.downStartIndex > -1 && cropInfo?.downEndIndex > -1)
                    ) {
                      if (cropInfo?.upStartIndex > -1 && cropInfo?.upEndIndex > 1) {
                        cropInfo.upStartIndex =
                          cropInfo?.upStartIndex - 30 < 0 ? 0 : cropInfo?.upStartIndex - 30;
                        cropInfo.upEndIndex =
                          cropInfo?.upEndIndex + 10 > length1 - 1
                            ? length1 - 1
                            : cropInfo?.upEndIndex + 10;
                        cropInfo1.upStartIndex1 = allPos[cropInfo.upStartIndex]?.stackNo;
                        cropInfo1.upEndIndex1 = allPos[cropInfo.upEndIndex]?.stackNo;
                        formref?.current?.setFieldsValue({
                          upEnd: cropInfo1.upEndIndex1,
                          upStart: cropInfo1.upStartIndex1,
                        });
                      }
                      if (cropInfo?.downStartIndex > -1 && cropInfo?.downEndIndex > -1) {
                        // cropInfo.downStartIndex = cropInfo?.downStartIndex - 30 < length1 ? length1 : cropInfo?.downStartIndex - 30;
                        // cropInfo.downEndIndex = cropInfo?.downEndIndex + 10 > (length1 + length2 - 1) ? length1 + length2 - 1 : cropInfo?.downEndIndex + 10;
                        cropInfo.downStartIndex =
                          cropInfo?.downStartIndex + 30 > length1 + length2 - 1
                            ? length1 + length2 - 1
                            : cropInfo?.downStartIndex + 30;
                        cropInfo.downEndIndex =
                          cropInfo?.downEndIndex - 10 < length1
                            ? length1
                            : cropInfo?.downEndIndex - 10;
                        cropInfo1.downStartIndex1 = allPos[cropInfo.downStartIndex]?.stackNo;
                        cropInfo1.downEndIndex1 = allPos[cropInfo.downEndIndex]?.stackNo;
                        formref?.current?.setFieldsValue({
                          downEnd: cropInfo1.downEndIndex1,
                          downStart: cropInfo1.downStartIndex1,
                        });
                      }
                      handlePosData(list2);
                      setSwitchChecked(e);
                    } else {
                      message.warning({
                        content: '请先选择完整的上行起终点或下行起终点',
                        key: '1',
                      });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                label="位置截图"
                name="sceneImgUrl"
                rules={[{ required: true, message: '请点击生成位置截图' }]}
                className={styles.mapCropItem}
              >
                {!mapCropUrl ? (
                  <div className={styles.mapCropImg} onClick={() => handleMapCrop()}>
                    <span>+</span>
                    <span>点击生成</span>
                  </div>
                ) : (
                  <div className={styles.mapCrop}>
                    <div className={styles.ImgMask}></div>
                    <Image width={120} height={120} src={mapCropUrl} preview={false}></Image>
                    <div className={styles.delIcon} onClick={() => handleDelMapCrop()}>
                      <DelWhiteIcon />
                    </div>
                  </div>
                )}
              </Form.Item>
              <Form.Item label="备注" name="remark" className={styles.mapCropItem}>
                <TextArea placeholder={'请输入备注内容'} allowClear style={{ height: '100px' }} />
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

      {/* 选择上下行起点、终点 */}
      {modalShow && (
        <div ref={modalRef} className={styles.infoWindow}>
          <div className={styles.markerIconGroup}>
            <span className={styles.closeIconBtn} onClick={() => handleCloseInfoWin()}>
              <CloseOutlined />
            </span>
            <LeftOutlined
              style={{ color: curPosCenterImg ? '#fff' : 'gray' }}
              className={`${styles.markerToggleLeft} ${styles.markerToggle} ${
                prevDisabled ? styles.markerToggleDisabled : ''
              }`}
              // onClick={() => handleToggleMarkerInfo('prev')}
              onClick={() => handleTogglePic('prev')}
            ></LeftOutlined>
            <div
              className={styles.markerCenterImg}
              style={{
                height: `${window.innerHeight * (490 / 1080)}px`,
                width: `${window.innerWidth * (576 / 1920)}px`,
              }}
            >
              <span className={styles.sceneInfoTitle}>
                {`${stackNo} ${stackDirection === 0 ? '上行' : '下行'}`}
                {`${updatePosImg ? '' : ''}`}
              </span>
              <ScenarioCheckImg
                height={window.innerHeight * (490 / 1080)}
                width={window.innerWidth * (576 / 1920)}
                imgInfo={curPosCenterImg}
              ></ScenarioCheckImg>
            </div>
            <RightOutlined
              style={{ color: curPosCenterImg ? '#fff' : 'gray' }}
              className={`${styles.markerToggleRight} ${styles.markerToggle} ${
                nextDisabled ? styles.markerToggleDisabled : ''
              }`}
              // onClick={() => handleToggleMarkerInfo('next')}
              onClick={() => handleTogglePic('next')}
            ></RightOutlined>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EdtMod;
