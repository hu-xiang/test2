import { Image as AntdImg, Radio, Form, Dropdown, Input, message, Tooltip } from 'antd';
import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
// import React from 'react';
import styles from '../styles.less';

import { Stage, Layer, Image as KonvaImg } from 'react-konva';
// import Konva from 'konva';
import useImage from 'use-image';
import { queryAllCheck, saveCheck } from '../service';

import Rectangle from './CustomRect';
import CustomText from './CustomText';
import CustomCircle from './CustomCircle';
import CustomTriangle from './CustomTriangle';
import CustomSignIcon from './CustomSignIcon';
import { getMenuItem } from 'baseline/src/utils/commonMethod';

const Warn0 = 'images/spotCheck/warn0.svg';
const Warn1 = 'images/spotCheck/warn1.svg';
const Warn2 = 'images/spotCheck/warn2.svg';
const Warn3 = 'images/spotCheck/warn3.svg';
const Warn4 = 'images/spotCheck/warn4.svg';
const Warn5 = 'images/spotCheck/warn5.svg';
const Warn6 = 'images/spotCheck/warn6.svg';
const Warn7 = 'images/spotCheck/warn7.svg';
const Warn8 = 'images/spotCheck/warn8.svg';
const Warn9 = 'images/spotCheck/warn9.svg';
const Warn10 = 'images/spotCheck/warn10.png';
const Warn11 = 'images/spotCheck/warn11.png';
const Warn12 = 'images/spotCheck/warn12.svg';

const Ban0 = 'images/spotCheck/ban0.svg';
const Ban1 = 'images/spotCheck/ban1.svg';
const Ban2 = 'images/spotCheck/ban2.svg';
const Ban3 = 'images/spotCheck/ban3.svg';
const Ban4 = 'images/spotCheck/ban4.svg';
const Ban5 = 'images/spotCheck/ban5.png';
const Ban6 = 'images/spotCheck/ban6.png';
const Ban7 = 'images/spotCheck/ban7.png';
const Ban8 = 'images/spotCheck/ban8.png';

const Road0 = 'images/spotCheck/road0.svg';
const Road1 = 'images/spotCheck/road1.svg';
const Road2 = 'images/spotCheck/road2.svg';
const Road3 = 'images/spotCheck/road3.svg';

const Ect0 = 'images/spotCheck/ect0.svg';
const Ect1 = 'images/spotCheck/ect1.svg';
const Ect2 = 'images/spotCheck/ect2.svg';
const Ect3 = 'images/spotCheck/ect3.svg';
const Ect4 = 'images/spotCheck/ect4.svg';
const Ect5 = 'images/spotCheck/ect5.svg';
const Ect6 = 'images/spotCheck/ect6.svg';
const Ect7 = 'images/spotCheck/ect7.svg';
const Ect8 = 'images/spotCheck/ect8.svg';
const Ect9 = 'images/spotCheck/ect9.svg';

const spotCheckTips = 'images/spotCheck/spotCheckTips.svg';

const newArrWarn = [
  { key: 0, val: Warn0, label: '缺少交叉口标志', width: '40px', height: '100px' },
  { key: 1, val: Warn1, label: '缺少交叉口标志', width: '40px', height: '100px' },
  { key: 2, val: Warn2, label: '缺少交叉口标志', width: '40px', height: '100px' },
  { key: 3, val: Warn3, label: '缺少注意行人标志', width: '40px', height: '100px' },
  { key: 4, val: Warn4, label: '缺少村庄标志', width: '40px', height: '100px' },
  { key: 5, val: Warn5, label: '缺少上陡坡标志', width: '40px', height: '100px' },
  { key: 6, val: Warn6, label: '缺少下陡坡标志', width: '40px', height: '100px' },
  { key: 7, val: Warn7, label: '缺少左急弯标志', width: '40px', height: '100px' },
  { key: 8, val: Warn8, label: '缺少右急弯标志', width: '40px', height: '100px' },
  { key: 9, val: Warn9, label: '缺少注意儿童标志', width: '40px', height: '100px' },
  { key: 10, val: Warn10, label: '缺少道路不平标志', width: '40px', height: '100px' },
  { key: 11, val: Warn11, label: '缺少反向弯路标志', width: '40px', height: '100px' },
  { key: 12, val: Warn12, label: '缺少连续弯道标志', width: '40px', height: '100px' },
];
const newArrBan = [
  { key: 0, val: Ban0, label: '缺少让行标志', width: '40px', height: '100px' },
  { key: 1, val: Ban1, label: '缺少限速标志', width: '40px', height: '100px' },
  { key: 2, val: Ban2, label: '缺少限速标志', width: '40px', height: '100px' },
  { key: 3, val: Ban3, label: '缺少限速标志', width: '40px', height: '100px' },
  { key: 4, val: Ban4, label: '缺少限速标志', width: '40px', height: '100px' },
  { key: 5, val: Ban5, label: '缺少解除禁止超车标志', width: '40px', height: '100px' },
  { key: 6, val: Ban6, label: '缺少解除限制速度标志', width: '40px', height: '100px' },
  { key: 7, val: Ban7, label: '缺少禁止超车标志', width: '40px', height: '100px' },
  { key: 8, val: Ban8, label: '缺少鸣笛标志', width: '40px', height: '100px' },
];
const newArrRoad = [
  { key: 0, val: Road0, label: '缺少道口标注', width: '40px', height: '100px' },
  { key: 1, val: Road1, label: '缺少减速带', width: '40px', height: '100px' },
  { key: 2, val: Road2, label: '建议增设道路交通危险警示灯', width: '85px', height: '100px' },
  { key: 3, val: Road3, label: '缺少指路标志', width: '40px', height: '100px' },
];
const newArrEct = [
  { key: 0, val: Ect0, label: '路面破损', width: '40px', height: '100px' },
  { key: 1, val: Ect1, label: '标线磨损', width: '40px', height: '100px' },
  { key: 2, val: Ect2, label: '人行横道标线磨损', width: '40px', height: '100px' },
  { key: 3, val: Ect3, label: '此为路口', width: '40px', height: '100px' },
  { key: 4, val: Ect4, label: '此为路口', width: '40px', height: '100px' },
  { key: 5, val: Ect5, label: '缺少线形诱导标志', width: '40px', height: '100px' },
  { key: 6, val: Ect6, label: '缺少线形诱导标志', width: '40px', height: '100px' },
  { key: 7, val: Ect7, label: '建筑物遮档视距不良', width: '40px', height: '100px' },
  { key: 8, val: Ect8, label: '绿植遮档视距不良', width: '40px', height: '100px' },
  { key: 9, val: Ect9, label: '缺少人行横道标志', width: '40px', height: '100px' },
];
type Iprops = {
  isShow?: boolean;
  isCreate?: boolean;
  onCancel?: () => void;
  curSpotInfo?: any;
  curPosGpsInfo?: any;
  sceneTrackId?: any;
  updateSpotStatus: (isAllNormal: boolean, remarkVal: any) => void;
  spotCheckRef?: any;
  resetSpotCheckIcon?: number;
  checkPicIndex: number;
};
let ratioArr: any = [
  { w: 1, h: 1 },
  { w: 1, h: 1 },
  { w: 1, h: 1 },
];
let base64Info: any = {};
const { TextArea } = Input;
let isSwitch2JPGInProgress = false;
let remarkVal: any = null;
let clipboard: any = [];

const menuStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  // margin: '-10px 0 0 35px',
};

const textStyle: React.CSSProperties = {
  color: 'red',
  fontSize: '12px',
  marginTop: '10px',
  width: '48px',
};

const EdtMod: React.FC<Iprops> = (props) => {
  const { curPosGpsInfo, sceneTrackId } = props;
  const imgListArr = curPosGpsInfo?.imgList || [];
  const imgList: any = [{}, {}, {}];
  if (imgListArr.length) {
    imgListArr.forEach((item: any) => {
      if (item?.imgPosition === 0) {
        imgList[0] = item;
      }
      if (item?.imgPosition === 1) {
        imgList[2] = item;
      }
      if (item?.imgPosition === 2) {
        imgList[1] = item;
      }
    });
  }
  const questionList = curPosGpsInfo?.questionList || [];
  const [sourceImg, setSourceImg] = useState<any>();
  const stageRef = useRef<any>();
  const layerRef: any = useRef<any>();
  const formRef = useRef<any>();
  const delRef = useRef<any>();
  const ctrlCRef = useRef<any>();
  const ctrlVRef = useRef<any>();

  const [rectangles, setRectangles] = useState<any[]>([]); // 矩形
  const [circles, setCircles] = useState<any[]>([]); // 圆形
  const [triangles, setTriangles] = useState<any[]>([]); // 三角形
  const [textContentArr, setTextContentArr] = useState<any[]>([]); // 文本
  const [warnIcons, setWarnIcons] = useState<any[]>([]); // 交通标识
  const [banIcons, setBanIcons] = useState<any[]>([]); // 交通标识
  const [roadIcons, setRoadIcons] = useState<any[]>([]); // 交通标识
  const [ectIcons, setEctIcons] = useState<any[]>([]); // 交通标识

  const [selectedId, setSelectedId] = useState<any>(null);

  const [btnActIndex, setBtnActIndex] = useState<number>(1);
  const [graphicType, setGraphicType] = useState<string>('');

  // tab相关
  const [tabActIndex, setTabActIndex] = useState<number>(-1);
  const [tabList, setTabList] = useState<any>([]);
  const [tabResList, setTabResList] = useState<any>([]);
  const [showTabResList, setShowTabResList] = useState<any>(false);

  // 分别是前中后  三个位置的图片信息
  const imgPosInfo: any = [
    {
      rect: [],
      circle: [],
      triangle: [],
      text: [],
      warn: [],
      ban: [],
      road: [],
      ect: [],
    },
    {
      rect: [],
      circle: [],
      triangle: [],
      text: [],
      warn: [],
      ban: [],
      road: [],
      ect: [],
    },
    {
      rect: [],
      circle: [],
      triangle: [],
      text: [],
      warn: [],
      ban: [],
      road: [],
      ect: [],
    },
  ];
  const [imgPosArr, setImgPosArr] = useState<any>(imgPosInfo);

  // 获取原始图片
  const [bgImage0] = useImage(imgList[0]?.imgUrl, 'anonymous');
  const [bgImage1] = useImage(imgList[1]?.imgUrl, 'anonymous');
  const [bgImage2] = useImage(imgList[2]?.imgUrl, 'anonymous');

  // 初始化 各种交通图标
  const [warn0] = useImage('images/spotCheck/warn0.svg', 'anonymous');
  const [warn1] = useImage('images/spotCheck/warn1.svg', 'anonymous');
  const [warn2] = useImage('images/spotCheck/warn2.svg', 'anonymous');
  const [warn3] = useImage('images/spotCheck/warn3.svg', 'anonymous');
  const [warn4] = useImage('images/spotCheck/warn4.svg', 'anonymous');
  const [warn5] = useImage('images/spotCheck/warn5.svg', 'anonymous');
  const [warn6] = useImage('images/spotCheck/warn6.svg', 'anonymous');
  const [warn7] = useImage('images/spotCheck/warn7.svg', 'anonymous');
  const [warn8] = useImage('images/spotCheck/warn8.svg', 'anonymous');
  const [warn9] = useImage('images/spotCheck/warn9.svg', 'anonymous');
  const [warn10] = useImage('images/spotCheck/warn10.png', 'anonymous');
  const [warn11] = useImage('images/spotCheck/warn11.png', 'anonymous');
  const [warn12] = useImage('images/spotCheck/warn12.svg', 'anonymous');

  const [ban0] = useImage('images/spotCheck/ban0.svg', 'anonymous');
  const [ban1] = useImage('images/spotCheck/ban1.svg', 'anonymous');
  const [ban2] = useImage('images/spotCheck/ban2.svg', 'anonymous');
  const [ban3] = useImage('images/spotCheck/ban3.svg', 'anonymous');
  const [ban4] = useImage('images/spotCheck/ban4.svg', 'anonymous');
  const [ban5] = useImage('images/spotCheck/ban5.png', 'anonymous');
  const [ban6] = useImage('images/spotCheck/ban6.png', 'anonymous');
  const [ban7] = useImage('images/spotCheck/ban7.png', 'anonymous');
  const [ban8] = useImage('images/spotCheck/ban8.png', 'anonymous');

  const [road0] = useImage('images/spotCheck/road0.svg', 'anonymous');
  const [road1] = useImage('images/spotCheck/road1.svg', 'anonymous');
  const [road2] = useImage('images/spotCheck/road2.svg', 'anonymous');
  const [road3] = useImage('images/spotCheck/road3.svg', 'anonymous');

  const [ect0] = useImage('images/spotCheck/ect0.svg', 'anonymous');
  const [ect1] = useImage('images/spotCheck/ect1.svg', 'anonymous');
  const [ect2] = useImage('images/spotCheck/ect2.svg', 'anonymous');
  const [ect3] = useImage('images/spotCheck/ect3.svg', 'anonymous');
  const [ect4] = useImage('images/spotCheck/ect4.svg', 'anonymous');
  const [ect5] = useImage('images/spotCheck/ect5.svg', 'anonymous');
  const [ect6] = useImage('images/spotCheck/ect6.svg', 'anonymous');
  const [ect7] = useImage('images/spotCheck/ect7.svg', 'anonymous');
  const [ect8] = useImage('images/spotCheck/ect8.svg', 'anonymous');
  const [ect9] = useImage('images/spotCheck/ect9.svg', 'anonymous');

  const plainOpsMap = {
    1: '正常',
    2: '错误',
    3: '缺失',
    4: '遮档',
    5: '损坏',
    6: '磨损',
    7: '不良',
  };
  const checkTypeMap = {
    1: '道路技术指标',
    2: '交通标志标线',
    3: '隔离防护设施',
    4: '科技管控设施',
    99: '其他',
  };

  const IMG_RATIO_W = 1352 / (320 + 1352);
  const IMG_RATIO_H = 762 / 937;
  const IMG_H = window.innerHeight - 175;

  // 重新渲染
  const handleReRenderGraphic = (index: number, isFirstLoad?: boolean, data?: any) => {
    if (isFirstLoad) {
      // 获取原始图片
      const { rect, circle, triangle, text, warn, ban, road, ect } = data[index];

      setRectangles(rect);
      setCircles(circle);
      setTriangles(triangle);
      setTextContentArr(text);

      setWarnIcons(warn);
      setBanIcons(ban);
      setRoadIcons(road);
      setEctIcons(ect);
    } else {
      const imgPosArrCopy = imgPosArr.slice();
      // 获取原始图片
      const { rect, circle, triangle, text, warn, ban, road, ect } = imgPosArrCopy[index];

      setRectangles(rect);
      setCircles(circle);
      setTriangles(triangle);
      setTextContentArr(text);

      setWarnIcons(warn);
      setBanIcons(ban);
      setRoadIcons(road);
      setEctIcons(ect);
    }
  };

  // 回显图片信息  根据原图缩放比例  // item.scaleRatio.w 要改完重新算 比例 不然 1366 回显到1920上有问题
  const handleResetSizeInfo = (data: any) => {
    data.forEach((item: any, i: number) => {
      if (item.rect.length) {
        item.rect.forEach((val: any) => {
          if (!item?.scaleRatio?.w) return;
          val.x = Math.floor(val.x / ratioArr[i].w);
          val.y = Math.floor(val.y / ratioArr[i].h);
          val.width = Math.floor(val.width / ratioArr[i].w);
          val.height = Math.floor(val.height / ratioArr[i].h);
        });
      }
      if (item.circle.length) {
        item.circle.forEach((val: any) => {
          if (!item?.scaleRatio?.w) return;
          val.x = Math.floor(val.x / ratioArr[i].w);
          val.y = Math.floor(val.y / ratioArr[i].h);
          const biggerRatio = Math.max(ratioArr[i].h, ratioArr[i].w);
          val.radius = Math.floor(val.radius / biggerRatio);
        });
      }
      if (item.triangle.length) {
        item.triangle.forEach((val: any) => {
          if (!item?.scaleRatio?.w) return;
          val.x = Math.floor(val.x / ratioArr[i].w);
          val.y = Math.floor(val.y / ratioArr[i].h);
          val.width = Math.floor(val.width / ratioArr[i].w);
          val.radius = Math.floor(val.radius / ratioArr[i].w);
          val.height = Math.floor(val.height / ratioArr[i].h);
        });
      }
      if (item.text.length) {
        item.text.forEach((val: any) => {
          if (!item?.scaleRatio?.w) return;
          val.x = Math.floor(val.x / ratioArr[i].w);
          val.y = Math.floor(val.y / ratioArr[i].h);
          val.width = Math.floor(val.width / ratioArr[i].w);
          val.height = Math.floor(val.height / ratioArr[i].h);
          val.fontSize = Math.floor(val.fontSize / ratioArr[i].w);
        });
      }
      if (item?.warn?.length) {
        item.warn.forEach((val: any) => {
          if (!item?.scaleRatio?.w) return;
          val.x = Math.floor(val.x / ratioArr[i].w);
          val.y = Math.floor(val.y / ratioArr[i].h);
          val.width = Math.floor(val.width / ratioArr[i].w);
          val.height = Math.floor(val.height / ratioArr[i].h);
          const type = val.id.slice(val.id.lastIndexOf('_') + 1);
          const typeMap = {
            0: warn0,
            1: warn1,
            2: warn2,
            3: warn3,
            4: warn4,
            5: warn5,
            6: warn6,
            7: warn7,
            8: warn8,
            9: warn9,
            10: warn10,
            11: warn11,
            12: warn12,
          };
          val.image = typeMap[type];
        });
      } else {
        item.warn = [];
      }
      if (item?.ban?.length) {
        item.ban.forEach((val: any) => {
          if (!item?.scaleRatio?.w) return;
          val.x = Math.floor(val.x / ratioArr[i].w);
          val.y = Math.floor(val.y / ratioArr[i].h);
          val.width = Math.floor(val.width / ratioArr[i].w);
          val.height = Math.floor(val.height / ratioArr[i].h);
          const type = val.id.slice(val.id.lastIndexOf('_') + 1);
          const typeMap = {
            0: ban0,
            1: ban1,
            2: ban2,
            3: ban3,
            4: ban4,
            5: ban5,
            6: ban6,
            7: ban7,
            8: ban8,
          };
          val.image = typeMap[type];
        });
      } else {
        item.ban = [];
      }
      if (item?.road?.length) {
        item.road.forEach((val: any) => {
          if (!item?.scaleRatio?.w) return;
          val.x = Math.floor(val.x / ratioArr[i].w);
          val.y = Math.floor(val.y / ratioArr[i].h);
          val.width = Math.floor(val.width / ratioArr[i].w);
          val.height = Math.floor(val.height / ratioArr[i].h);
          const type = val.id.slice(val.id.lastIndexOf('_') + 1);
          const typeMap = {
            0: road0,
            1: road1,
            2: road2,
            3: road3,
          };
          val.image = typeMap[type];
        });
      } else {
        item.road = [];
      }
      if (item?.ect?.length) {
        item.ect.forEach((val: any) => {
          if (!item?.scaleRatio?.w) return;
          val.x = Math.floor(val.x / ratioArr[i].w);
          val.y = Math.floor(val.y / ratioArr[i].h);
          val.width = Math.floor(val.width / ratioArr[i].w);
          val.height = Math.floor(val.height / ratioArr[i].h);
          const type = val.id.slice(val.id.lastIndexOf('_') + 1);
          const typeMap = {
            0: ect0,
            1: ect1,
            2: ect2,
            3: ect3,
            4: ect4,
            5: ect5,
            6: ect6,
            7: ect7,
            8: ect8,
            9: ect9,
          };
          val.image = typeMap[type];
        });
      } else {
        item.ect = [];
      }
    });
    return data;
  };
  useEffect(() => {
    // 确保所有交通标注图已加载 方便回显
    if (
      !(
        warn0 &&
        warn1 &&
        warn2 &&
        warn3 &&
        warn4 &&
        warn5 &&
        warn6 &&
        warn7 &&
        warn8 &&
        warn9 &&
        warn10 &&
        warn11 &&
        warn12 &&
        ban0 &&
        ban1 &&
        ban2 &&
        ban3 &&
        ban4 &&
        ban5 &&
        ban6 &&
        ban7 &&
        ban8 &&
        road0 &&
        road1 &&
        road2 &&
        road3 &&
        ect0 &&
        ect1 &&
        ect2 &&
        ect3 &&
        ect4 &&
        ect5 &&
        ect6 &&
        ect7 &&
        ect8 &&
        ect9
      )
    ) {
      return;
    }

    if (imgList && imgList.length) {
      const imgPosArrRes: any = [];
      const emptyObj = {
        rect: [],
        circle: [],
        triangle: [],
        text: [],
        warn: [],
        ban: [],
        road: [],
        ect: [],
      };
      imgList.forEach((item: any) => {
        imgPosArrRes.push(JSON.parse(item?.bbox || JSON.stringify(emptyObj)));
      });
      // todo 回显中间位置图形及文字信息
      const resImgList = handleResetSizeInfo(imgPosArrRes);
      setImgPosArr(resImgList);
      // handleReRenderGraphic(btnActIndex, true, resImgList);
      setBtnActIndex(props.checkPicIndex);
      handleReRenderGraphic(props.checkPicIndex, true, resImgList);
    }
  }, [
    warn0,
    warn1,
    warn2,
    warn3,
    warn4,
    warn5,
    warn6,
    warn7,
    warn8,
    warn9,
    warn10,
    warn11,
    warn12,
    ban0,
    ban1,
    ban2,
    ban3,
    ban4,
    ban5,
    ban6,
    ban7,
    ban8,
    road0,
    road1,
    road2,
    road3,
    ect0,
    ect1,
    ect2,
    ect3,
    ect4,
    ect5,
    ect6,
    ect7,
    ect8,
    ect9,
    props.resetSpotCheckIcon,
  ]);

  // 添加每个图片对应原图的缩放信息
  const handleAddRatioInfo = (sourceWidth: number, sourceHeight: number, imgIndex: number) => {
    ratioArr[imgIndex] = {
      w: sourceWidth / (window.innerWidth * IMG_RATIO_W),
      h: sourceHeight / (window.innerHeight * IMG_RATIO_H),
    };
  };
  useEffect(() => {
    // 获取原始图片  默认显示中间
    if (bgImage1) {
      // setSourceImg(bgImage1);
      handleAddRatioInfo(bgImage1?.naturalWidth, bgImage1?.naturalHeight, 1);
    }
    if (bgImage0) {
      handleAddRatioInfo(bgImage0?.naturalWidth, bgImage0?.naturalHeight, 0);
    }
    if (bgImage2) {
      handleAddRatioInfo(bgImage2?.naturalWidth, bgImage2?.naturalHeight, 2);
    }
    if (bgImage1 && bgImage0 && bgImage2) {
      const btnActIndexMap = {
        0: bgImage0,
        1: bgImage1,
        2: bgImage2,
      };
      // setSourceImg(btnActIndexMap[btnActIndex]);
      setSourceImg(btnActIndexMap[props.checkPicIndex]);
    }
  }, [bgImage0, bgImage1, bgImage2]);

  // 显示各位置图片图形信息
  const handleCategoryIcon = (list: any[], type: string) => {
    if (!list.length) return;

    const setTypeMap = {
      text: setTextContentArr,
      rect: setRectangles,
      cir: setCircles,
      tri: setTriangles,
      warn: setWarnIcons,
      ban: setBanIcons,
      road: setRoadIcons,
      ect: setEctIcons,
    };
    const typeMap = {
      text: textContentArr.slice(),
      rect: rectangles.slice(),
      cir: circles.slice(),
      tri: triangles.slice(),
      warn: warnIcons.slice(),
      ban: banIcons.slice(),
      road: roadIcons.slice(),
      ect: ectIcons.slice(),
    };

    list.forEach((item: any, i: number) => {
      if (item.id === selectedId) {
        const idArr = item.id.split('_');
        if (type === 'copy') {
          let id = '';
          // 要保存的标注图或文字
          if (idArr.length === 2) {
            id = `${idArr[0]}_${new Date().getTime()}`;
          } else {
            id = `${idArr[0]}_${new Date().getTime()}_${idArr[2]}`;
          }
          clipboard = [
            {
              ...item,
              x: item.x + 20,
              y: item.y + 20,
              id,
            },
          ];
        } else if (type === 'paste') {
          if (!clipboard.length) return;
          const ret = typeMap[idArr[0]];
          ret.push(clipboard[0]);
          setTypeMap[idArr[0]](ret);
          clipboard = [];
        } else if (type === 'del') {
          setGraphicType('del');
          let resArr = [];
          resArr = typeMap[idArr[0]];
          resArr.splice(i, 1);
          setTypeMap[idArr[0]](resArr);
        }
      }
    });
  };

  const handleCtrlCV = (type: string) => {
    const iconsList = [
      rectangles,
      textContentArr,
      circles,
      triangles,
      warnIcons,
      roadIcons,
      banIcons,
      ectIcons,
    ];
    iconsList.forEach((item: any) => handleCategoryIcon(item, type));
  };

  useEffect(() => {
    const container: any = stageRef?.current?.container() || {};
    container.tabIndex = 4;
    container?.addEventListener('keydown', (e: any) => {
      const { metaKey, ctrlKey, key } = e;
      const isCtrlOrCommand = ctrlKey || metaKey;
      if (isCtrlOrCommand && key.toLocaleLowerCase() === 'c') {
        ctrlCRef.current.click();
      }
      if (isCtrlOrCommand && key.toLocaleLowerCase() === 'v') {
        ctrlVRef.current.click();
      }
      if (['Delete', 'Backspace'].includes(key)) {
        delRef.current.click();
      }
    });
  }, []);

  useEffect(() => {
    const container: any = stageRef?.current?.container() || {};
    container.tabIndex = 4;
    container?.addEventListener('keydown', (e: any) => {
      if (e.keyCode === 46) {
        delRef.current.click();
      }
      if (e.ctrlKey && e.keyCode === 67) {
        ctrlCRef.current.click();
        // ctrl + c
      }
      if (e.ctrlKey && e.keyCode === 86) {
        // ctrl + v
        ctrlVRef.current.click();
      }
    });
  }, []);

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target?.attrs?.id || e?.target?.attrs?.name;
    if (!clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  // 添加文本
  const handleAddText = () => {
    setGraphicType('text');
    const ret = textContentArr.slice();
    ret.push({
      x: 200,
      y: 200,
      width: 200,
      height: 60,
      fontSize: 20,
      rotation: 0,
      fill: '#FF0000',
      text: 'some text',
      id: `text_${new Date().getTime()}`,
    });
    setTextContentArr(ret);
  };

  // 添加矩形
  const handleAddRect = () => {
    setGraphicType('rect');
    const ret = rectangles.slice();
    ret.push({
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      stroke: '#FF0000',
      rotation: 0,
      id: `rect_${new Date().getTime()}`,
    });
    setRectangles(ret);
  };

  // 添加圆形
  const handleAddCircle = () => {
    setGraphicType('circle');
    const ret = circles.slice();
    ret.push({
      x: 200,
      y: 200,
      radius: 50,
      stroke: '#FF0000',
      rotation: 0,
      id: `cir_${new Date().getTime()}`,
    });
    setCircles(ret);
  };
  // 添加三角形
  const handleAddTriangle = () => {
    setGraphicType('triangle');
    const ret = triangles.slice();
    ret.push({
      x: 200,
      y: 200,
      height: 200,
      width: 200,
      sides: 3,
      radius: 70,
      stroke: '#FF0000',
      rotation: 0,
      id: `tri_${new Date().getTime()}`,
    });
    setTriangles(ret);
  };

  // 删除选中项图形或文字
  const handleDel = () => {
    handleCtrlCV('del');
  };

  const handleUpdateCheckStatus = () => {
    let isAllNormal = true;
    tabResList.forEach((item: any) => {
      if (item.resultKey !== 1) {
        isAllNormal = false;
      }
    });
    props.updateSpotStatus(isAllNormal, remarkVal);
  };

  const compressIMG = (sourceBase64: string, cb: any) => {
    isSwitch2JPGInProgress = true;
    const img = new Image();
    img.setAttribute('crossOrigin', 'Anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx?.drawImage(img, 0, 0);
      const resBase64 = canvas.toDataURL('image/jpeg', 0.8);
      cb(resBase64);
      isSwitch2JPGInProgress = false;
    };
    img.onerror = () => {
      isSwitch2JPGInProgress = false;
    };
    img.src = sourceBase64;
  };
  const reset = () => {
    remarkVal = null;
    base64Info = {};
    isSwitch2JPGInProgress = false;
    ratioArr = [
      { w: 1, h: 1 },
      { w: 1, h: 1 },
      { w: 1, h: 1 },
    ];
    // formRef?.current?.resetFields();
  };
  const submit = async () => {
    const submitFn = async () => {
      const imgPosArrRes = imgPosArr.slice();
      imgPosArrRes[btnActIndex] = {
        rect: rectangles.slice(),
        circle: circles.slice(),
        triangle: triangles.slice(),
        text: textContentArr.slice(),
        warn: warnIcons.slice(),
        ban: banIcons.slice(),
        road: roadIcons.slice(),
        ect: ectIcons.slice(),
      };
      imgPosArrRes.forEach((item: any, i: number) => {
        if (item.rect.length) {
          base64Info[`bbox${i}`] = true;
          item.rect.forEach((val: any) => {
            val.x *= ratioArr[i].w;
            val.y *= ratioArr[i].h;
            val.width *= ratioArr[i].w;
            val.height *= ratioArr[i].h;
          });
        }
        if (item.circle.length) {
          base64Info[`bbox${i}`] = true;
          item.circle.forEach((val: any) => {
            val.x *= ratioArr[i].w;
            val.y *= ratioArr[i].h;
            const biggerRatio = Math.max(ratioArr[i].w, ratioArr[i].h);
            val.radius *= biggerRatio;
          });
        }
        if (item.triangle.length) {
          base64Info[`bbox${i}`] = true;
          item.triangle.forEach((val: any) => {
            val.x *= ratioArr[i].w;
            val.y *= ratioArr[i].h;
            val.radius *= ratioArr[i].w;
            val.width *= ratioArr[i].w;
            val.height *= ratioArr[i].h;
          });
        }
        if (item.text.length) {
          base64Info[`bbox${i}`] = true;
          item.text.forEach((val: any) => {
            val.x *= ratioArr[i].w;
            val.y *= ratioArr[i].h;
            val.width *= ratioArr[i].w;
            val.height *= ratioArr[i].h;
            val.fontSize *= ratioArr[i].w;
          });
        }
        if (item.warn.length) {
          base64Info[`bbox${i}`] = true;
          item.warn.forEach((val: any) => {
            val.x *= ratioArr[i].w;
            val.y *= ratioArr[i].h;
            val.width *= ratioArr[i].w;
            val.height *= ratioArr[i].h;
            val.image = ''; // 方便后续转bbox
          });
        }
        if (item.ban.length) {
          base64Info[`bbox${i}`] = true;
          item.ban.forEach((val: any) => {
            val.x *= ratioArr[i].w;
            val.y *= ratioArr[i].h;
            val.width *= ratioArr[i].w;
            val.height *= ratioArr[i].h;
            val.image = ''; // 方便后续转bbox
          });
        }
        if (item.road.length) {
          base64Info[`bbox${i}`] = true;
          item.road.forEach((val: any) => {
            val.x *= ratioArr[i].w;
            val.y *= ratioArr[i].h;
            val.width *= ratioArr[i].w;
            val.height *= ratioArr[i].h;
            val.image = ''; // 方便后续转bbox
          });
        }
        if (item.ect.length) {
          base64Info[`bbox${i}`] = true;
          item.ect.forEach((val: any) => {
            val.x *= ratioArr[i].w;
            val.y *= ratioArr[i].h;
            val.width *= ratioArr[i].w;
            val.height *= ratioArr[i].h;
            val.image = ''; // 方便后续转bbox
          });
        }
        item.scaleRatio = ratioArr[i];
      });

      // 更新图片及文字
      const curPosGpsInfoRes = { ...curPosGpsInfo };
      if (curPosGpsInfoRes.imgList && curPosGpsInfoRes.imgList.length) {
        curPosGpsInfoRes.imgList.forEach((item: any) => {
          // 调整对应图片顺序 imgPosition 0 左  2  中间  1右
          let resIndex = -1;
          if (item?.imgPosition === 0) {
            resIndex = 0;
          }
          if (item?.imgPosition === 1) {
            resIndex = 2;
          }
          if (item?.imgPosition === 2) {
            resIndex = 1;
          }

          item.bbox = JSON.stringify(imgPosArrRes[resIndex]);

          if (base64Info[`bbox${resIndex}`]) {
            item.existInfo = true;
            const [res0, res] = (base64Info[resIndex] &&
              base64Info[resIndex].split('data:image/jpeg;base64,')) || ['', ''];
            console.log(res0, 'res0');
            item.imgBase64 = res;
          } else {
            item.existInfo = false;
          }
        });
      }
      curPosGpsInfoRes.questionList = [...tabResList];

      // const formList = formRef.current?.getFieldsValue();
      const params = {
        ...curPosGpsInfoRes,
        proFacSceneTrackId: props.sceneTrackId,
        remark: remarkVal,
      };
      const res = await saveCheck(params);
      if (res.status === 0) {
        // update 点位状态
        handleUpdateCheckStatus();

        message.success({
          content: '保存成功',
          key: '保存成功',
        });
        reset();
      }
    };
    // todo 更新 缩放比例相关后的数据
    // base64Info[btnActIndex] = stageRef?.current?.toDataURL();
    compressIMG(stageRef?.current?.toDataURL(), (resBase: string) => {
      base64Info[btnActIndex] = resBase;
      submitFn();
    });
  };
  const handleCheckRemark = () => {
    const formList = formRef?.current?.getFieldsValue();
    remarkVal = formList?.remark;
  };

  useImperativeHandle(props.spotCheckRef, () => {
    return {
      submit,
      handleCheckRemark,
      reset,
    };
  });

  const saveGraphicInfo = (curPosIndex: number) => {
    // base64Info[btnActIndex] = stageRef?.current?.toDataURL();

    compressIMG(stageRef?.current?.toDataURL(), (resBase64: string) => {
      base64Info[curPosIndex] = resBase64;
    });
  };

  const handleToggleBtn = (index: number) => {
    if (isSwitch2JPGInProgress) return;
    // 保存当前位置的图形及文字
    const imgPosArrCopy = imgPosArr.slice();
    imgPosArrCopy[btnActIndex] = {
      rect: rectangles.slice(),
      circle: circles.slice(),
      triangle: triangles.slice(),
      text: textContentArr.slice(),
      warn: warnIcons.slice(),
      ban: banIcons.slice(),
      road: roadIcons.slice(),
      ect: ectIcons.slice(),
    };
    setImgPosArr(imgPosArrCopy);

    // todo 保存当前页面图形加图片 给后台
    saveGraphicInfo(btnActIndex);

    setBtnActIndex(index);
    // 切换背景图
    if (index === 0) {
      setSourceImg(bgImage0);
    }
    if (index === 1) {
      setSourceImg(bgImage1);
    }
    if (index === 2) {
      setSourceImg(bgImage2);
    }
    handleReRenderGraphic(index);
  };

  // tab相关
  // const onTabChange = (key: string) => {
  //   console.log(key);
  //   setTabActIndex(key);
  // };

  const handleRadioChange = (label: any, e: any) => {
    // 获取各label对应的value
    console.log(label, e?.target?.value);

    const TabResArr = tabResList.slice();
    TabResArr.forEach((item: any) => {
      if (item.fkCheckName === label) {
        item.resultKey = e?.target?.value;
        item.resultName = plainOpsMap[e?.target?.value];
      }
    });
    setTabResList(TabResArr);
  };

  // 处理tab 格式
  const handleTabData = (data: any) => {
    if (!data.length) return;
    const tabListArr: any = [];
    const tabResArr: any = [];

    data.forEach((item: any) => {
      // 右侧tab问题项列表
      tabResArr.push({
        resultName: '',
        resultKey: '',
        fkCheckId: item.id,
        fkCheckName: item.checkName,
        fkTrackId: curPosGpsInfo?.id,
      });

      const index = tabListArr.findIndex(
        (tabItem: any) => tabItem.title === checkTypeMap[item.checkType],
      );
      // 存在同类别
      if (index > -1) {
        tabListArr[index].content.push({
          label: item.checkName,
          options: item.optionsList,
          value: item.optionsList[0],
          standardContent: item?.standardContent || '',
        });
      } else {
        tabListArr.push({
          title: checkTypeMap[item.checkType],
          content: [
            {
              label: item.checkName,
              options: item.optionsList,
              value: item.optionsList[0],
              standardContent: item?.standardContent || '',
            },
          ],
        });
      }
    });

    // tab中的若有“其他” 放到最后
    const otherIndex = tabListArr.findIndex((item: any) => {
      return item.title === '其他';
    });
    if (otherIndex > -1) {
      const other = tabList.splice(otherIndex, 1);
      tabList.unshift(other);
    }

    // 回显questionList
    if (questionList.length) {
      questionList.forEach((item: any) => {
        tabListArr.forEach((val: any) => {
          val.content.forEach((childVal: any) => {
            if (childVal.label === item.fkCheckName) {
              childVal.value = item.resultKey;
            }
          });
        });
      });
    }

    // 只有 questionList 有的才回显
    tabListArr.forEach((item: any) => {
      item.content.forEach((val: any) => {
        // 更新
        if (val.value) {
          const index = tabResArr.findIndex(
            (tabResItem: any) => tabResItem.fkCheckName === val.label,
          );
          if (index > -1) {
            tabResArr[index].resultKey = val.value;
            tabResArr[index].resultName = plainOpsMap[val.value];
          }
        }
      });
    });
    setTabList(tabListArr);
    setTabResList(tabResArr);

    const cacheCurSpotInfo: any = JSON.parse(sessionStorage.getItem('scene_curSpotInfo') || '{}');
    remarkVal = cacheCurSpotInfo?.remark;
    formRef.current?.setFieldValue('remark', remarkVal);
  };

  const handleQueryAllCheck = async () => {
    const params = {
      sceneTrackId,
    };
    const res = await queryAllCheck(params);
    if (res.status === 0) {
      // todo
      handleTabData(res?.data);
    }
  };

  useEffect(() => {
    setTabList([]);
    setTabResList([]);
    handleQueryAllCheck();
  }, [props.curPosGpsInfo]);

  useEffect(() => {
    if (showTabResList) {
      if (remarkVal !== null) {
        formRef.current?.setFieldValue('remark', remarkVal);
      } else {
        const cacheCurSpotInfo: any = JSON.parse(
          sessionStorage.getItem('scene_curSpotInfo') || '{}',
        );
        remarkVal = cacheCurSpotInfo?.remark;
        formRef.current?.setFieldValue('remark', remarkVal);
      }
    }
  }, [showTabResList]);

  const handleTextWithIcon = (key: number, type: string, width: number, height: number) => {
    let text = '';
    let txtItem: any = [];
    switch (type) {
      case 'warn':
        txtItem = newArrWarn.filter((item: any) => item.key === +key);
        break;
      case 'ban':
        txtItem = newArrBan.filter((item: any) => item.key === +key);
        break;
      case 'road':
        txtItem = newArrRoad.filter((item: any) => item.key === +key);
        break;
      case 'ect':
        txtItem = newArrEct.filter((item: any) => item.key === +key);
        break;
      default:
        break;
    }
    text = txtItem[0].label;

    const ret = textContentArr.slice();
    ret.push({
      x: 200,
      y: 200 + height + 20,
      width: 200,
      height: 60,
      fontSize: 20,
      rotation: 0,
      fill: '#FF0000',
      text,
      id: `text_${new Date().getTime()}`,
    });
    setTextContentArr(ret);
  };

  const handleClickIcon = (key: any, type: any) => {
    setGraphicType(type);
    const trafficIconMap = {
      warn: {
        0: warn0,
        1: warn1,
        2: warn2,
        3: warn3,
        4: warn4,
        5: warn5,
        6: warn6,
        7: warn7,
        8: warn8,
        9: warn9,
        10: warn10,
        11: warn11,
        12: warn12,
      },
      ban: {
        0: ban0,
        1: ban1,
        2: ban2,
        3: ban3,
        4: ban4,
        5: ban5,
        6: ban6,
        7: ban7,
        8: ban8,
      },
      road: {
        0: road0,
        1: road1,
        2: road2,
        3: road3,
      },
      ect: {
        0: ect0,
        1: ect1,
        2: ect2,
        3: ect3,
        4: ect4,
        5: ect5,
        6: ect6,
        7: ect7,
        8: ect8,
        9: ect9,
      },
    };
    const resIconMap = {
      warn: warnIcons.slice(),
      ban: banIcons.slice(),
      road: roadIcons.slice(),
      ect: ectIcons.slice(),
    };
    const resSetIconMap = {
      warn: setWarnIcons,
      ban: setBanIcons,
      road: setRoadIcons,
      ect: setEctIcons,
    };

    const ret = resIconMap[type];
    let width = 60;
    let height = 132;
    const rotation = 0;
    if (type === 'road' && key === '1') {
      width = 160;
    }
    if (type === 'ect' && key === '0') {
      width = 100;
      height = 60;
    }
    if (type === 'ect' && key === '1') {
      width = 100;
      height = 60;
    }
    if (type === 'ect' && ['7', '8'].includes(key)) {
      width = 50;
      height = 40;
    }
    if (type === 'ban' && key === '0') {
      height = 80;
      width = 20;
    }
    if (type === 'ban' && key === '1') {
      height = 30;
      width = 30;
    }
    ret.push({
      x: 200,
      y: 200,
      width,
      height,
      rotation,
      image: trafficIconMap[type][key],
      id: `${type}_${new Date().getTime()}_${key}`,
    });
    resSetIconMap[type](ret);

    // 添加图片后带出相关文字
    handleTextWithIcon(key, type, width, height);
  };
  const warnIconMenu: any = () => {
    return newArrWarn.map((it: any) => {
      return getMenuItem(
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '100px', lineHeight: '100px' }}>
            <AntdImg
              src={it?.val}
              preview={false}
              style={{ width: it?.width, height: it?.height }}
            ></AntdImg>
          </div>
          <div style={textStyle}>{it?.label}</div>
        </div>,
        it?.key,
      );
    });
  };
  const banIconMenu: any = () => {
    return newArrBan.map((it: any) => {
      return getMenuItem(
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '100px', lineHeight: '100px' }}>
            <AntdImg
              src={it?.val}
              preview={false}
              style={{ width: it?.width, height: it?.height }}
            ></AntdImg>
          </div>
          <div style={textStyle}>{it?.label}</div>
        </div>,
        it?.key,
      );
    });
  };
  const roadIconMenu: any = () => {
    return newArrRoad.map((it: any, i: number) => {
      return getMenuItem(
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '100px', lineHeight: '100px' }}>
            <AntdImg
              src={it?.val}
              preview={false}
              style={{ width: it?.width, height: it?.height }}
            ></AntdImg>
          </div>

          <div style={{ ...textStyle, width: i === 2 ? '85px' : '48px' }}>{it?.label}</div>
        </div>,
        it?.key,
      );
    });
  };
  const ectIconMenu = () => {
    return newArrEct.map((it: any) => {
      return getMenuItem(
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '100px', lineHeight: '100px' }}>
            <AntdImg
              src={it?.val}
              preview={false}
              style={{ width: it?.width, height: it?.height }}
            ></AntdImg>
          </div>
          <div style={textStyle}>{it?.label}</div>
        </div>,
        it?.key,
      );
    });
  };

  const handleResetFormField = () => {
    const tabResArr = tabResList.slice();
    const tabListArr = tabList.slice();
    tabListArr.forEach((item: any) => {
      item.content.forEach((val: any) => {
        // 更新
        if (val.value) {
          const index = tabResArr.findIndex(
            (tabResItem: any) => tabResItem.fkCheckName === val.label,
          );
          if (index > -1) {
            val.value = tabResArr[index].resultKey;
          }
        }
      });
    });
    setTabList(tabListArr);
    setTabResList(tabResArr);
    if (formRef.current) {
      remarkVal = formRef.current?.getFieldValue('remark');
    }
  };
  const handleToggleSpotCheckType = (index: number) => {
    // todo 回显之前选过的值
    handleResetFormField();
    if (index === tabActIndex) {
      setTabActIndex(-1);
      setShowTabResList(false);
      return;
    }

    setTabActIndex(index);
    setShowTabResList(true);
  };
  // const ASIDE_RATIO_W = 1352 / 1920;
  return (
    <div
      className={styles.spotCheckWrapper}
      style={{ width: IMG_RATIO_W * (window.innerWidth - 208 - 40) }}
    >
      <div className={styles.sourceImg}>
        {/* 左前后 */}
        <div className={styles.posLayer}>
          <span
            onClick={() => handleToggleBtn(0)}
            className={btnActIndex === 0 ? styles.activeBtn : styles.commonBtn}
          >
            左
          </span>
          <span
            onClick={() => handleToggleBtn(1)}
            className={btnActIndex === 1 ? styles.activeBtn : styles.commonBtn}
          >
            中
          </span>
          <span
            onClick={() => handleToggleBtn(2)}
            className={btnActIndex === 2 ? styles.activeBtn : styles.commonBtn}
          >
            右
          </span>
        </div>

        {/* 相关canvas图层 */}
        <div className={`${styles.canvasWrapper} stageWrapper`}>
          <Stage
            ref={stageRef}
            width={(window.innerWidth - 208 - 40) * IMG_RATIO_W}
            // height={window.innerHeight * IMG_RATIO_H}
            height={IMG_H}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
          >
            <Layer ref={layerRef}>
              {/* 背景图 */}
              <KonvaImg
                image={sourceImg}
                width={(window.innerWidth - 208 - 40) * IMG_RATIO_W}
                // height={window.innerHeight * IMG_RATIO_H}
                height={IMG_H}
              />

              {/* 矩形 */}
              {rectangles.map((rect, i) => {
                return (
                  <Rectangle
                    key={`rect_${i}`}
                    shapeProps={rect}
                    isSelected={rect.id === selectedId}
                    onSelect={() => {
                      setSelectedId(rect.id);
                    }}
                    onChange={(newAttrs: any) => {
                      const rects = rectangles.slice();
                      rects[i] = newAttrs;
                      setRectangles(rects);
                    }}
                  />
                );
              })}

              {/* 圆形 */}
              {circles.map((rect, i) => {
                return (
                  <CustomCircle
                    key={`circle_${i}`}
                    shapeProps={rect}
                    isSelected={rect.id === selectedId}
                    onSelect={() => {
                      setSelectedId(rect.id);
                    }}
                    onChange={(newAttrs: any) => {
                      const cirs = circles.slice();
                      cirs[i] = newAttrs;
                      setCircles(cirs);
                    }}
                  />
                );
              })}

              {/* 三角形 */}
              {triangles.map((rect, i) => {
                return (
                  <CustomTriangle
                    key={`triangle_${i}`}
                    shapeProps={rect}
                    isSelected={rect.id === selectedId}
                    onSelect={() => {
                      setSelectedId(rect.id);
                    }}
                    onChange={(newAttrs: any) => {
                      const tris = triangles.slice();
                      tris[i] = newAttrs;
                      setTriangles(tris);
                    }}
                  />
                );
              })}

              {/* 文本 */}
              {textContentArr.map((text, i) => {
                return (
                  <CustomText
                    key={`text_${i}`}
                    shapeProps={text}
                    isSelected={text.id === selectedId}
                    onSelect={() => {
                      setSelectedId(text.id);
                    }}
                    onChange={(newAttrs: any) => {
                      const texts = textContentArr.slice();
                      texts[i] = newAttrs;
                      setTextContentArr(texts);
                    }}
                    stageHandler={stageRef.current}
                  />
                );
              })}

              {/* 交通指示牌 */}
              {warnIcons.map((text, i) => {
                return (
                  <CustomSignIcon
                    key={`warn_${i}`}
                    shapeProps={text}
                    isSelected={text.id === selectedId}
                    onSelect={() => {
                      setSelectedId(text.id);
                    }}
                    onChange={(newAttrs: any) => {
                      const texts = warnIcons.slice();
                      texts[i] = newAttrs;
                      setWarnIcons(texts);
                    }}
                  />
                );
              })}
              {banIcons.map((text, i) => {
                return (
                  <CustomSignIcon
                    key={`ban_${i}`}
                    shapeProps={text}
                    isSelected={text.id === selectedId}
                    onSelect={() => {
                      setSelectedId(text.id);
                    }}
                    onChange={(newAttrs: any) => {
                      const texts = banIcons.slice();
                      texts[i] = newAttrs;
                      setBanIcons(texts);
                    }}
                  />
                );
              })}
              {roadIcons.map((text, i) => {
                return (
                  <CustomSignIcon
                    key={`road_${i}`}
                    shapeProps={text}
                    isSelected={text.id === selectedId}
                    onSelect={() => {
                      setSelectedId(text.id);
                    }}
                    onChange={(newAttrs: any) => {
                      const texts = roadIcons.slice();
                      texts[i] = newAttrs;
                      setRoadIcons(texts);
                    }}
                  />
                );
              })}
              {ectIcons.map((text, i) => {
                return (
                  <CustomSignIcon
                    key={`ect_${i}`}
                    shapeProps={text}
                    isSelected={text.id === selectedId}
                    onSelect={() => {
                      setSelectedId(text.id);
                    }}
                    onChange={(newAttrs: any) => {
                      const texts = ectIcons.slice();
                      texts[i] = newAttrs;
                      setEctIcons(texts);
                    }}
                  />
                );
              })}
            </Layer>
          </Stage>
        </div>
        {/* 操作图层 */}
        <div className={styles.utilsLayer}>
          <div className={styles.graphicType}>
            <div className={styles.graphicTypeTop}>
              <span
                className={
                  graphicType === 'warn' ? `${styles.graphicIcon} ${styles.startIcon}` : ''
                }
              >
                <Dropdown
                  trigger={['click']}
                  overlayClassName={styles.customDropdownWrapper}
                  placement="bottomLeft"
                  menu={{
                    items: warnIconMenu(),
                    style: menuStyle,
                    onClick: ({ key }) => handleClickIcon(key, 'warn'),
                  }}
                >
                  <Tooltip
                    placement="rightBottom"
                    title="警告标志"
                    color="#fff"
                    overlayInnerStyle={{ color: '#000' }}
                  >
                    <AntdImg
                      src={'images/icon-warn.svg'}
                      preview={false}
                      height={14}
                      width={14}
                    ></AntdImg>
                  </Tooltip>
                </Dropdown>
              </span>
              <span className={graphicType === 'ban' ? `${styles.graphicIcon}` : ''}>
                <Dropdown
                  trigger={['click']}
                  overlayClassName={styles.customDropdownWrapper}
                  placement="bottomLeft"
                  menu={{
                    items: banIconMenu(),
                    style: menuStyle,
                    onClick: ({ key }) => handleClickIcon(key, 'ban'),
                  }}
                >
                  <Tooltip
                    placement="rightBottom"
                    title="禁令标志"
                    color="#fff"
                    overlayInnerStyle={{ color: '#000' }}
                  >
                    <AntdImg
                      src={'images/icon-ban.svg'}
                      preview={false}
                      height={14}
                      width={14}
                    ></AntdImg>
                  </Tooltip>
                </Dropdown>
              </span>
              <span className={graphicType === 'road' ? `${styles.graphicIcon}` : ''}>
                <Dropdown
                  trigger={['click']}
                  overlayClassName={styles.customDropdownWrapper}
                  placement="bottomLeft"
                  menu={{
                    items: roadIconMenu(),
                    style: menuStyle,
                    onClick: ({ key }) => handleClickIcon(key, 'road'),
                  }}
                >
                  <Tooltip
                    placement="rightBottom"
                    title="道路设施"
                    color="#fff"
                    overlayInnerStyle={{ color: '#000' }}
                  >
                    <AntdImg
                      src={'images/icon-road.svg'}
                      preview={false}
                      height={14}
                      width={14}
                    ></AntdImg>
                  </Tooltip>
                </Dropdown>
              </span>
              <span className={graphicType === 'ect' ? `${styles.graphicIcon}` : ''}>
                <Dropdown
                  trigger={['click']}
                  overlayClassName={styles.customDropdownWrapper}
                  placement="bottomLeft"
                  menu={{
                    items: ectIconMenu(),
                    style: menuStyle,
                    onClick: ({ key }) => handleClickIcon(key, 'ect'),
                  }}
                >
                  <Tooltip
                    placement="rightBottom"
                    title="其他标志"
                    color="#fff"
                    overlayInnerStyle={{ color: '#000' }}
                  >
                    <AntdImg
                      src={'images/icon-ect.svg'}
                      preview={false}
                      height={14}
                      width={14}
                    ></AntdImg>
                  </Tooltip>
                </Dropdown>
              </span>
            </div>
            <div className={styles.graphicTypeBottom}>
              <span
                onClick={() => handleAddRect()}
                className={
                  graphicType === 'rect' ? `${styles.graphicIcon} ${styles.startIcon}` : ''
                }
              >
                <Tooltip
                  placement="rightBottom"
                  title="矩形"
                  color="#fff"
                  overlayInnerStyle={{ color: '#000' }}
                >
                  <AntdImg src={'images/rect.svg'} preview={false} height={14} width={14}></AntdImg>
                </Tooltip>
              </span>
              <span
                onClick={() => handleAddCircle()}
                className={graphicType === 'circle' ? styles.graphicIcon : ''}
              >
                <Tooltip
                  placement="rightBottom"
                  title="圆形"
                  color="#fff"
                  overlayInnerStyle={{ color: '#000' }}
                >
                  <AntdImg
                    src={'images/circle.svg'}
                    preview={false}
                    height={14}
                    width={14}
                  ></AntdImg>
                </Tooltip>
              </span>
              <span
                onClick={() => handleAddTriangle()}
                className={graphicType === 'triangle' ? styles.graphicIcon : ''}
              >
                <Tooltip
                  placement="rightBottom"
                  title="三角形"
                  color="#fff"
                  overlayInnerStyle={{ color: '#000' }}
                >
                  <AntdImg
                    className={styles.graphicIcon}
                    src={'images/triangle.svg'}
                    preview={false}
                    height={14}
                    width={14}
                  ></AntdImg>
                </Tooltip>
              </span>
              <span
                onClick={() => handleAddText()}
                className={graphicType === 'text' ? styles.graphicIcon : ''}
              >
                <Tooltip
                  placement="rightBottom"
                  title="文字"
                  color="#fff"
                  overlayInnerStyle={{ color: '#000' }}
                >
                  <AntdImg src={'images/text.svg'} preview={false} height={14} width={14}></AntdImg>
                </Tooltip>
              </span>
              <span
                ref={delRef}
                onClick={() => handleDel()}
                className={graphicType === 'del' ? `${styles.graphicIcon} ${styles.endIcon}` : ''}
              >
                <Tooltip
                  placement="rightBottom"
                  title="删除"
                  color="#fff"
                  overlayInnerStyle={{ color: '#000' }}
                >
                  <AntdImg
                    src={'images/delete.svg'}
                    preview={false}
                    height={14}
                    width={14}
                  ></AntdImg>
                </Tooltip>
              </span>
            </div>
            <div>
              <i
                ref={ctrlCRef}
                onClick={() => {
                  console.log('copy');
                  handleCtrlCV('copy');
                }}
                style={{ display: 'none' }}
              >
                hidden node
              </i>
              <i
                ref={ctrlVRef}
                onClick={() => {
                  console.log('paste');
                  handleCtrlCV('paste');
                }}
                style={{ display: 'none' }}
              >
                hidden node
              </i>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.spotTypeWrapper}>
        <div className={styles.spotCheckType}>
          {tabList.length > 0 &&
            tabList.map((item: any, i: number) => {
              return (
                <div
                  key={i}
                  className={
                    tabActIndex === i ? `${styles.activeTab} ${styles.itemTab}` : styles.itemTab
                  }
                  onClick={() => handleToggleSpotCheckType(i)}
                >
                  {item.title}
                </div>
              );
            })}
        </div>
        {
          <div
            className={`${styles.spotCheckContent} scroll-class`}
            style={{
              display: showTabResList ? 'block' : 'none',
              maxHeight: `${window.innerHeight * (879 / 1080)}px`,
            }}
          >
            {tabList[tabActIndex]?.content.length > 0 && (
              <Form ref={formRef}>
                {tabList[tabActIndex].content.map((val: any, i: number) => {
                  return (
                    <Form.Item
                      // label={val.label}
                      label={
                        <div className={styles.spotCheckItemTips}>
                          <span style={{ marginRight: '5px' }}>{val.label}</span>
                          {val?.standardContent && (
                            <Tooltip
                              title={val.standardContent}
                              color={'#fff'}
                              overlayInnerStyle={{ color: '#666', padding: '12px' }}
                            >
                              <AntdImg
                                preview={false}
                                src={spotCheckTips}
                                height={14}
                                width={14}
                              ></AntdImg>
                            </Tooltip>
                          )}
                        </div>
                      }
                      colon={false}
                      key={`${tabActIndex}-${i}`}
                      className={styles.tabRadioItem}
                    >
                      <Radio.Group
                        name="radiogroup"
                        defaultValue={val.value}
                        onChange={(e: any) => handleRadioChange(val.label, e)}
                      >
                        {val.options.length &&
                          val.options.map((option: any, i2: number) => {
                            return (
                              <Radio value={option} key={`${tabActIndex}-${i}-${i2}`}>
                                {plainOpsMap[option]}
                              </Radio>
                            );
                          })}
                      </Radio.Group>
                    </Form.Item>
                  );
                })}
                <Form.Item label={'备注'} className={styles.remarkItem} name="remark">
                  <TextArea rows={4} placeholder="特殊情况说明" maxLength={100} />
                </Form.Item>
              </Form>
            )}
          </div>
        }
      </div>
      {showTabResList && (
        <div
          className={styles.spotTypeMask}
          onClick={() => handleToggleSpotCheckType(tabActIndex)}
        ></div>
      )}
    </div>
  );
};

export default EdtMod;
