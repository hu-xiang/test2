import React, { useState, useRef, useEffect } from 'react';
import { Modal, Form, Select, message, Spin, Input, InputNumber } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { calcBoundaryCoord } from './calcVal';
// import { getNextInfo, saveImgInfo, addErr, credisNO } from './service';
// import { diseaseUrgency } from '../../../../../../utils/dataDic';
import {
  useCompare,
  commonRequest,
  commonDel,
  getDictData,
} from '../../../../../../utils/commonMethod';

const requestList = [
  { url: '/traffic/road/project/nextImage', method: 'GET' },
  { url: '/traffic/road/project/previousImage', method: 'GET' },
  { url: '/traffic/road/project/along/nextImage', method: 'GET' },
  { url: '/traffic/road/project/alone/previousImage', method: 'GET' },
  { url: '/traffic/road/project/sdk', method: 'GET' },
  { url: '/traffic/road/project/save', method: 'post' },
  { url: '/traffic/road/project/img', method: 'GET' },
  { url: '/traffic/road/project/del/tagging', method: 'DELETE' },
  { url: '/traffic/road/project/alone/disease', method: 'get' },
  // { url: '/traffic/road/project/diseaseTypeSelect', method: 'get' },
];

type point = { X: number; Y: number };
type dataItemType = {
  flag: number;
  imgName: string;
  imgUrl: string;
  list: any;
  dataNull: any;
};
const dataItem: dataItemType = {
  flag: 0,
  imgName: '',
  imgUrl: '',
  list: [],
  dataNull: true,
};
const { Option } = Select;
let bboxVal: { top: number; left: number; index: number; ids: number; ind: number }[] = [];
let img: any = null;
let imgReloadNum = 0; // 图片错误加载次数
let naturalWidth = 0;
let naturalHeight = 0;
let imgNaturalHeight = 0;
let selectedRowKeyData;

type Iprops = {
  DataFn: Function;
  preItemFn: Function;
  nextItemFn: Function;
  setImgUrl: (dataUrl: string) => void;
  setFirstClick: () => void;
  isAdd: boolean;
  setAdd: any;
  isGetNext: Function;
  flags: boolean;
  selectedRowKey: any;
  colorInd: any;
  setSelectedRowKey: any;
  selObj: any;
  setColorInd: any;
  currentTab?: string | number;
  setDisabled: Function;
  currentData1?: any;
  currentData2?: any;
};

const DistressCanvas: React.FC<Iprops> = (props) => {
  const formref = useRef<any>();
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  // const [imgNaturalHeight, setImgNaturalHeight] = useState(0); // 图片原始高度
  const [data, setData] = useState<any>(dataItem);
  const [defectInfos, setDefectInfos] = useState<any>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasToolRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<any>(null);
  const ctxToolRef = useRef<any>(null);
  const canvasParent = useRef<any>();
  const [bboxClose, setBboxClose] = useState(bboxVal);

  const [area, setArea] = useState<number>(0);
  const [length, setLength] = useState<any>(0);
  const [stakeNo1, setStakeNo1] = useState<any>();
  const [stakeNo2, setStakeNo2] = useState<any>();
  const [diseaseSelectedType, setDiseaseSelectedType] = useState<any>();
  const [diseaseSelectedName, setDiseaseSelectedName] = useState<any>();
  const [nowTime, setNowTime] = useState<any>();
  const [nextDisabled, setNextDisabled] = useState<boolean>(false);
  const [preDisabled, setPreDisabled] = useState<boolean>(false);
  const [firstImg, setFirstImg] = useState<any>();
  const [lastImg, setLastImg] = useState<any>();
  const [firstImg1, setFirstImg1] = useState<any>();
  const [lastImg1, setLastImg1] = useState<any>();
  const [diseaseAlone, setDiseaseAlone] = useState<any>();
  const [diseaseRoad, setDiseaseRoad] = useState<any>([]);
  const [oriLength, setOriLength] = useState<any>();
  const [diseaseSelectedEn, setDiseaseSelectedEn] = useState<any>();
  const [cementOrAsphalt, setCementOrAsphalt] = useState<any>();

  const [startX, setStartX] = useState<any>();
  const [startY, setStartY] = useState<any>();
  const [endX, setEndtX] = useState<any>();
  const [endY, setEndY] = useState<any>();
  const [isdown, setIsdown] = useState(false);
  // const [isAdd, setAdd] = useState(props.isAdd);
  const [modFlag, setModFlag] = useState(false);
  // const [disKey, setDisKey] = useState<any>('');
  const [taskType, setTaskType] = useState<number>(1);
  // const [diseaseImpType] = useState(diseaseUrgency);
  const {
    selectedRowKey,
    colorInd,
    setColorInd,
    setSelectedRowKey,
    selObj,
    currentTab,
    currentData1,
    currentData2,
  } = props;
  const [loading, setLoading] = useState(false);
  const [delDataList, setDelDataList] = useState<any>([]);
  // const conFields = ['collectTime', 'direct', 'stakeNo', 'inspectionId'];

  selectedRowKeyData = useCompare(selectedRowKey);

  useEffect(() => {
    props?.setDisabled(nextDisabled, preDisabled);
  }, [nextDisabled, preDisabled]);

  useEffect(() => {
    if (data?.entity?.id === firstImg || data?.entity?.id === firstImg1) {
      setPreDisabled(true);
    }
  }, [data?.entity?.id]);

  const getNextImageData = async (pre = false, isMarker = false, isSwitch = false) => {
    imgReloadNum = 0;
    img = null;
    setDefectInfos([]);
    setColorInd(undefined);
    const params =
      currentTab === '1'
        ? {
            pavementId: selObj?.direct,
            // imgId: data?.entity?.id,
          }
        : {
            direct: selObj?.direct === '0' || selObj?.direct === '1' ? selObj?.direct : 0,
            projectId: selObj?.projectId,
            // imgId: data?.entity?.id,
          };
    if (!isSwitch) {
      let imgid = data?.entity?.id;
      if (pre) {
        if (currentTab === '1') {
          imgid = data?.entity?.id || lastImg?.id;
        } else {
          imgid = data?.entity?.id || lastImg1?.id;
        }
      }
      Object.assign(params, { imgId: imgid });
    }
    try {
      // const res = await getNextInfo(obj, selObjs?.tenant_id || selObj?.tenant_id);
      let res: any = null;
      if (currentTab === '1') {
        res = isMarker
          ? await commonRequest({ ...requestList[6], params: { id: isMarker, type: 0 } })
          : await commonRequest(
              pre
                ? { ...requestList[1], params: { ...params, id: data?.entity?.id || lastImg?.id } }
                : { ...requestList[0], params },
            );
      } else {
        res = isMarker
          ? await commonRequest({ ...requestList[6], params: { id: isMarker, type: 1 } })
          : await commonRequest(
              pre
                ? { ...requestList[3], params: { ...params, id: data?.entity?.id || lastImg1?.id } }
                : { ...requestList[2], params },
            );
      }
      props.setFirstClick();
      if (res.status !== 0) {
        setData({ ...dataItem, dataNull: false });
      } else {
        ctxRef.current!.clearRect(0, 0, naturalWidth, naturalHeight);
        setBboxClose([]);

        if (!res?.data?.entity) {
          /* eslint-disable */
          if (data?.entity?.imgUrl && !isSwitch) {
            if (currentTab === '1') {
              if (!pre) setLastImg(data?.entity);
            } else {
              if (!pre) setLastImg1(data?.entity);
            }
            if (pre) {
              setNextDisabled(false);
              setPreDisabled(true);
            } else {
              setDefectInfos(data?.list);
              setNextDisabled(true);
              setPreDisabled(false);
            }
          } else {
            if (currentTab === '1') {
              setFirstImg('');
              setLastImg(null);
            } else {
              setFirstImg1('');
              setLastImg1(null);
            }
            setData({ ...dataItem, dataNull: false });
            setNextDisabled(true);
            setPreDisabled(true);
          }
          /* eslint-enable */
          // setData({ ...dataItem, dataNull: false });
          message.warning({
            content: '暂无数据，请重试！',
            key: '暂无数据，请重试！',
          });
          setLoading(false);
          setNowTime(new Date().valueOf());
          return false;
        }
        setData({ ...res.data, dataNull: true, flag: 0 });
        setDefectInfos(res.data.list);
        /* eslint-disable */
        if (isSwitch) {
          if (currentTab === '1') {
            if (!currentData1?.entity) {
              setFirstImg(res?.data?.entity?.id);
            }
          } else {
            if (!currentData2?.entity) {
              setFirstImg1(res?.data?.entity?.id);
            }
          }
        } else {
          if (pre) {
            setNextDisabled(false);
          } else {
            setPreDisabled(false);
          }
        }
        /* eslint-enable */

        const indList: any = [];

        selectedRowKey.length = 0;
        setSelectedRowKey([]);
        res.data.list.forEach((i: any, index: any) => {
          res.data.list[index].ind = index;
          indList.push(i.id);
          selectedRowKey.push(i.id);
          if (index === res.data.list.length - 1) {
            setSelectedRowKey(indList);
          }
        });
      }
      setNowTime(new Date().valueOf());
      return true;
    } catch (error) {
      // message.error({
      //   content: '操作失败!',
      //   key: '操作失败!',
      // });
      props.setFirstClick();
      setData({ ...dataItem, dataNull: false });
      return false;
    }
  };

  /**
   * 画布上绘制字体
   */
  const drawText = (item: any, ctx: CanvasRenderingContext2D, index: number) => {
    let minY = item.minY - 50;
    let left = 0;
    if (item.minY <= 50) {
      minY = item.minY + 20;
    }
    ctx.beginPath();
    ctx.moveTo(item.minX, minY);
    if (item.id === colorInd) {
      ctx.fillStyle = 'yellow'; // 设置填充颜色为黄色
    } else {
      ctx.fillStyle = '#05FF00'; // 设置填充颜色为绿色
    }

    if (naturalWidth > 2048) {
      ctx.font = '32px "微软雅黑"'; // 设置字体
    } else {
      ctx.font = '20px "微软雅黑"'; // 设置字体
    }

    ctx.textBaseline = 'top'; // 设置字体底线对齐绘制基线
    ctx.textAlign = 'left'; // 设置字体对齐的方式
    let text: any;
    const typeLength: any = currentTab === '1' ? [1, 2, 16, 81, 20, 23, 25, 27, 28, 30] : [3, 4];
    const typeArea: any = currentTab === '1' ? [0, 4, 7, 15, 17, 80, 21, 22, 24, 26, 29, 31] : [];
    const roadTypeTitle: any = item?.cementOrAsphalt === 1 ? '水泥路面' : '沥青路面';
    const isHas =
      !(item?.diseaseZh?.indexOf('水泥') < 0) || !(item?.diseaseZh?.indexOf('沥青') < 0);
    /* eslint-disable */
    if (typeLength?.includes(item.diseaseType * 1)) {
      if (!isHas && currentTab === '1') {
        text = `${index + 1} ${roadTypeTitle}-${item.diseaseZh} ${
          !item.length ? '' : `${(item.length * 1).toFixed(4)}m`
        }`;
      } else {
        text = `${index + 1} ${item.diseaseZh} ${!item.length ? '' : `${item.length * 1}m`}`;
      }
    } else if (typeArea?.includes(item.diseaseType * 1)) {
      if (!isHas && currentTab === '1') {
        text = `${index + 1} ${roadTypeTitle}-${item.diseaseZh} ${
          !item.area ? '' : `${(item.area * 1).toFixed(4)}m²`
        }`;
      } else {
        text = `${index + 1} ${item.diseaseZh} ${
          !item.area ? '' : `${(item.area * 1).toFixed(4)}m²`
        }`;
      }
    } else {
      if (!isHas && currentTab === '1') {
        text = `${index + 1} ${roadTypeTitle}-${item.diseaseZh}`;
      } else {
        text = `${index + 1} ${item.diseaseZh}`;
      }
    }
    /* eslint-enable */

    // 计算原图缩小到适合画布大小的比例
    const ratio = naturalHeight / imgNaturalHeight;

    if (ctx.measureText(text).width + item.minX * ratio >= naturalWidth) {
      ctx.fillText(text, naturalWidth - ctx.measureText(text).width - 30, minY * ratio);
      left = naturalWidth - 30;
    } else {
      ctx.fillText(text, item.minX * ratio, minY * ratio); // 填充文字
      left = item.minX * ratio + ctx.measureText(text).width;
    }

    if (minY && naturalHeight && imgNaturalHeight && bboxVal.length !== defectInfos.length) {
      const obj = {
        top: minY * ratio,
        left,
        index,
        ind: item.ind,
        ids: item.ids,
        id: item.id,
      };

      bboxVal.push(obj);
      setBboxClose([...bboxVal]);
    }
  };

  /**
   * 绘制画布上病害区域
   * @param points 坐标值 array
   * @param ctx
   * @param naturalWidthTemp
   * @param naturalHeightTemp
   * @param originalSize 是否源尺寸进行绘制
   */
  const drawContour = (
    points: point[],
    ctx: CanvasRenderingContext2D,
    naturalWidthTemp?: number,
    naturalHeightTemp?: number,
    originalSize: boolean = false,
  ) => {
    if (!points) return;
    points.forEach((point: point, index: number) => {
      if (index === 0) {
        ctx.beginPath();
        ctx.moveTo(
          (originalSize ? 1 : naturalHeight / imgNaturalHeight) * point.X,
          (originalSize ? 1 : naturalHeight / imgNaturalHeight) * point.Y,
        );
      } else {
        ctx.lineTo(
          (originalSize ? 1 : naturalHeight / imgNaturalHeight) * point.X,
          (originalSize ? 1 : naturalHeight / imgNaturalHeight) * point.Y,
        );
      }
    });
    ctx.closePath();
  };

  // 绘制原始图
  const performPresetImg = (imgs: any) => {
    if (!Number.isNaN(naturalWidth)) {
      ctxRef.current!.clearRect(0, 0, naturalWidth, naturalHeight);
      ctxRef.current!.drawImage(imgs, 0, 0, naturalWidth, naturalHeight);
    }
  };

  // 绘制病害区域框
  const highLightDefect = (dataLs: any) => {
    bboxVal = [];
    if (dataLs?.length) {
      dataLs.forEach((item: any, index: number) => {
        if (!item) return;
        const copyItem = item;
        if (item.bbox && typeof item.bbox === 'string') {
          copyItem.bbox = JSON.parse(item.bbox);
        }
        drawContour(copyItem.bbox, ctxRef.current!, naturalWidth, naturalHeight);
        if (item.id === colorInd) {
          ctxRef.current.strokeStyle = 'yellow';
        } else {
          ctxRef.current.strokeStyle = '#05FF00';
        }
        ctxRef.current.lineWidth = 1;
        ctxRef.current.stroke();

        item.ids = item.ind;
        drawText(item, ctxRef.current, index);

        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  };

  const preItem = async () => {
    setLoading(true);
    ctxToolRef.current.clearRect(0, 0, naturalWidth, naturalHeight);
    getNextImageData(true);
    props.setAdd(false);
    bboxVal = [];
  };

  const nextItem = async (isMarker = false) => {
    setLoading(true);
    ctxToolRef.current.clearRect(0, 0, naturalWidth, naturalHeight);
    getNextImageData(false, isMarker);
    props.setAdd(false);
    bboxVal = [];
  };
  useEffect(() => {
    props.preItemFn(preItem);
    props.nextItemFn(nextItem);
    props.DataFn(data);
  }, [data, defectInfos, selectedRowKey]);

  useEffect(() => {
    ctxRef.current = canvasRef.current?.getContext('2d');
    ctxToolRef.current = canvasToolRef.current?.getContext('2d');
    const resizeCanvas = () => {
      setCanvasHeight(canvasParent?.current?.clientHeight);
    };

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (currentTab && (selObj?.direct || selObj?.direct === '0')) {
      /* eslint-disable */
      if (currentTab === '1') {
        if (currentData1?.entity) {
          setNextDisabled(currentData1?.nextDisabled);
          setPreDisabled(currentData1?.preDisabled);
          setData({ ...currentData1 });
          setDefectInfos(currentData1?.list);
          props?.isGetNext(true);
          setNowTime(new Date().valueOf());
        } else {
          setNextDisabled(false);
          getNextImageData(false, false, true);
          props?.isGetNext(true);
        }
      } else {
        if (currentData2?.entity) {
          setNextDisabled(currentData2?.nextDisabled);
          setPreDisabled(currentData2?.preDisabled);
          setData({ ...currentData2 });
          setDefectInfos(currentData2?.list);
          props?.isGetNext(true);
          setNowTime(new Date().valueOf());
        } else {
          setNextDisabled(false);
          getNextImageData(false, false, true);
          props?.isGetNext(true);
        }
      }
      /* eslint-enable */
    }
  }, [selObj?.direct]);

  const renderImg = () => {
    img = new Image();
    img.setAttribute('crossOrigin', 'Anonymous');
    img.onload = () => {
      imgReloadNum = 0;
      naturalWidth = img?.naturalWidth * (canvasParent?.current?.clientHeight / img?.naturalHeight);
      naturalHeight = canvasParent?.current?.clientHeight;
      imgNaturalHeight = img?.naturalHeight;

      setCanvasHeight(canvasParent?.current?.clientHeight);
      setCanvasWidth(
        img?.naturalWidth * (canvasParent?.current?.clientHeight / img?.naturalHeight),
      );
      // setImgNaturalHeight(img.naturalHeight); // 图片初始高度

      performPresetImg(img);

      // 兼容图片丢包的情况，两个performPresetImg方法不能去掉，否则会不显示
      setTimeout(() => {
        performPresetImg(img);

        if (!selectedRowKey.length) {
          setBboxClose([]);
        }

        let defeList: any = [];
        defeList = defectInfos?.filter((item: any) => selectedRowKey?.includes(item.id));
        setTimeout(() => {
          highLightDefect(defeList);
        }, 100);

        const dataURL = canvasRef.current!.toDataURL('image/jpeg', 1);
        props.setImgUrl(dataURL);
      }, 10);
    };
    if (data?.entity?.imgUrl) {
      img.onerror = () => {
        if (imgReloadNum <= 4) {
          imgReloadNum += 1;
          setTimeout(() => {
            img.src = data?.entity?.imgUrl;
          }, 10);
        }
      };
    } else {
      setLoading(false);
    }
    img.src = data?.entity?.imgUrl;
  };

  useEffect(() => {
    data?.list?.map((item: any) => {
      const copyItem = item;
      if (item.bbox && typeof item.bbox === 'string') {
        copyItem.bbox = JSON.parse(item.bbox);
      }
      if (copyItem.bbox) {
        const boundaryObj = calcBoundaryCoord([{ Points: copyItem.bbox }]);
        copyItem.minX = boundaryObj.minX;
        copyItem.maxY = boundaryObj.maxY;
        copyItem.minY = boundaryObj.minY;
        copyItem.width = boundaryObj.maxX - boundaryObj.minX;
        copyItem.height = boundaryObj.maxY - boundaryObj.minY;
      }
      return copyItem;
    });
  }, [nowTime, data]);

  useEffect(() => {
    renderImg();
  }, [selectedRowKeyData, canvasHeight, colorInd, nowTime]);

  const clearRect = async (id: string) => {
    const params = {
      id,
      imgId: data?.entity?.id,
      type: currentTab === '1' ? 0 : 1,
    };
    const res: any = await commonDel('标注信息将删除，是否继续？', {
      ...requestList[7],
      params,
    });
    if (res) {
      let delData: any;
      const newDefectInfos = defectInfos.filter((item: any) => {
        if (item.id === id) delData = item;
        return item.id !== id;
      });
      if (!delDataList.length || delDataList.findIndex((i: any) => i === delData) === -1) {
        setDelDataList([
          ...delDataList,
          { ...delData, errorDescription: '病害误检', errorType: 1 },
        ]);
      }
      if (delDataList.findIndex((i: any) => i === delData) !== -1) {
        const copydelList = [...delDataList];
        copydelList.splice(
          delDataList.findIndex((i: any) => i === delData),
          1,
        );
        setDelDataList([...copydelList]);
      }
      // bboxVal.splice(index, 1);
      data.flag = 1;
      setColorInd(undefined);
      setDefectInfos([...newDefectInfos]);
      setData({ ...data, list: newDefectInfos });
      //  bboxVal = [];
    }
  };

  // sdk计算框信息
  const sdkInfo = async (params: any) => {
    if (currentTab === '2' && !diseaseAlone) {
      const res: any = await commonRequest({ ...requestList[8] });
      setDiseaseAlone(res?.data);
    }
    if (currentTab === '1' && !diseaseRoad?.length) {
      const res: any = await getDictData({
        type: 2,
        dictCodes: ['asphalt', 'cement'],
        scenesType: 4,
      });
      setDiseaseRoad(res);
    }
    setModFlag(true);
    const res = await commonRequest({ ...requestList[4], params });

    if (typeof res?.data === 'string') {
      const sdkData = JSON.parse(res?.data);
      setArea(sdkData?.area?.toFixed(4) || null);
      let formatLength = sdkData?.diagonalLength?.toFixed(4) || null;
      if (currentTab === '2' && sdkData?.diagonalLength) {
        formatLength = sdkData?.diagonalLength < 10 ? 10 : Math.round(sdkData?.diagonalLength);
      }
      setLength(formatLength);
      const stakeList = data?.entity?.stakeNo?.split('+');
      if (stakeList) {
        setStakeNo1(stakeList[0]?.slice(1));
        setStakeNo2(stakeList[1]);
      }

      formref?.current?.setFieldsValue({
        area: sdkData?.area?.toFixed(4) || null,
        length: formatLength,
        stakeNo2: stakeList?.length ? stakeList[1] : '',
      });
    }
  };

  useEffect(() => {
    if (currentTab === '2') {
      formref?.current?.setFieldsValue({
        stakeNo2,
      });
    }
  }, [stakeNo2]);

  useEffect(() => {
    if (!modFlag && currentTab === '2') {
      setOriLength(null);
    }
  }, [modFlag]);

  const onMouseDown = (event: any) => {
    event.preventDefault();
    setIsdown(true);
    const clientRect = event.target.getBoundingClientRect();
    const nowOffsetX = event.clientX - clientRect.left;
    const nowOffsetY = event.clientY - clientRect.top;
    setStartX(nowOffsetX);
    setStartY(nowOffsetY);
  };
  const onMouseUp = (event: any) => {
    event.preventDefault();
    setIsdown(false);
    formref?.current?.resetFields();
    if (endX && startX !== endX && endY && startY !== endY) {
      const params = {
        extName: data?.entity?.extName,
        // deviceId: `${data?.entity?.deviceId ? data?.entity?.deviceId : ''}${
        //   data?.entity?.channelId ? data?.entity?.channelId : ''
        // }`,
        leftX: Math?.round((startX * imgNaturalHeight) / naturalHeight),
        leftY: Math?.round((startY * imgNaturalHeight) / naturalHeight),
        rightX: Math?.round((endX * imgNaturalHeight) / naturalHeight),
        rightY: Math?.round((endY * imgNaturalHeight) / naturalHeight),
      };
      sdkInfo(params);
    }
  };
  const onMouseMove = (event: any) => {
    if (!isdown) return;
    event.preventDefault();
    ctxToolRef.current.lineWidth = 1;
    ctxToolRef.current.clearRect(0, 0, naturalWidth, naturalHeight);
    ctxToolRef.current.strokeStyle = '#05FF00';
    ctxToolRef.current.beginPath();

    const clientRect = event.target.getBoundingClientRect();
    const nowOffsetX = event.clientX - clientRect.left;
    const nowOffsetY = event.clientY - clientRect.top;
    setEndtX(nowOffsetX);
    setEndY(nowOffsetY);
    ctxToolRef.current.moveTo(startX, startY);
    ctxToolRef.current.lineTo(nowOffsetX, startY); // shang heng
    ctxToolRef.current.lineTo(nowOffsetX, nowOffsetY); // you
    ctxToolRef.current.lineTo(startX, nowOffsetY); // zuo
    ctxToolRef.current.closePath();
    ctxToolRef.current.stroke();
  };
  const endManualDrawPoing = (event?: any) => {
    event?.preventDefault();
    ctxToolRef.current.closePath();
  };
  const submit = () => {
    formref.current.validateFields().then(async () => {
      try {
        // const { list } = data;
        const bbox = [
          {
            X: (startX * imgNaturalHeight) / naturalHeight,
            Y: (startY * imgNaturalHeight) / naturalHeight,
          },
          {
            X: (endX * imgNaturalHeight) / naturalHeight,
            Y: (startY * imgNaturalHeight) / naturalHeight,
          },
          {
            X: (endX * imgNaturalHeight) / naturalHeight,
            Y: (endY * imgNaturalHeight) / naturalHeight,
          },
          {
            X: (startX * imgNaturalHeight) / naturalHeight,
            Y: (endY * imgNaturalHeight) / naturalHeight,
          },
        ];
        // const resNo = await credisNO({ fkImgId }, selObj.tenant_id);
        const params = {
          area: formref?.current?.getFieldsValue()?.area,
          diseaseType: diseaseSelectedType,
          diseaseZh: diseaseSelectedName,
          length,
          bbox: JSON.stringify(bbox),
          imageId: data?.entity?.id,
          stakeNo: currentTab === '1' ? data?.entity?.stakeNo : `K${stakeNo1}+${stakeNo2}`,
          type: currentTab === '1' ? 0 : 1,
        };
        if (currentTab === '1') {
          Object.assign(params, {
            diseaseEn: diseaseSelectedEn,
            pavementId: selObj?.direct,
            cementOrAsphalt,
          });
        } else {
          Object.assign(params, {
            projectId: selObj?.projectId,
            direct: selObj?.direct,
          });
        }
        const res = await commonRequest({ ...requestList[5], params });
        if (res?.status === 0) {
          message.success({
            content: '提交成功！',
            key: '提交成功！',
          });
          props.setAdd(false);
          setModFlag(false);
          setStartX(undefined);
          setStartY(undefined);
          setEndtX(undefined);
          setEndY(undefined);
        }
        const addData = {
          area: params?.area,
          length,
          stakeNo: currentTab === '1' ? data?.entity?.stakeNo : `K${stakeNo1}+${stakeNo2}`,
          bbox,
          id: res?.data,
          diseaseZh: diseaseSelectedName,
          cementOrAsphalt,
          diseaseType: diseaseSelectedType * 1,
          // diseaseImp: diseaseImpType[diseaseSelectedType] === '紧急' ? 1 : 0,
          errorDescription: '病害漏检',
          errorType: 2,
          sourceType: 4,
          checkType: 1,
        };
        const newmapdata: any = {};
        let newdata: any = { ...addData, ...newmapdata };
        if (taskType) {
          newdata = { ...addData, ...newmapdata, taskType };
        }
        defectInfos.push(newdata);
        setDelDataList([...delDataList, newdata]);
        // data.flag = 1;
        defectInfos.forEach((item: any) => {
          const copyItem = item;
          if (typeof item.bbox !== 'string') {
            copyItem.bbox = JSON.stringify(item.bbox);
          }
        });
        defectInfos.map((item: any) => {
          const copyItem = item;
          if (item.bbox && typeof item.bbox === 'string') {
            copyItem.bbox = JSON.parse(item.bbox);
          }
          if (copyItem.bbox) {
            const boundaryObj = calcBoundaryCoord([{ Points: copyItem.bbox }]);
            copyItem.minX = boundaryObj.minX;
            copyItem.maxY = boundaryObj.maxY;
            copyItem.minY = boundaryObj.minY;
            copyItem.width = boundaryObj.maxX - boundaryObj.minX;
            copyItem.height = boundaryObj.maxY - boundaryObj.minY;
          }
          return copyItem;
        });
        setTimeout(() => {
          setDefectInfos([...defectInfos]);
        }, 10);
        setData({ ...data, dataNull: true, list: defectInfos, flag: 1 });

        ctxToolRef.current.clearRect(0, 0, naturalWidth, naturalHeight);
        formref?.current?.resetFields();
      } catch (error) {
        console.log(error);
        message.error({
          content: '操作失败!',
          key: '操作失败!',
        });
      }
    });
  };

  const onChange = (e: any, obj: any) => {
    console.log(e, obj);
    const type = currentTab === '1' ? obj?.key?.split('-')[1] : obj?.key;
    if (type === '2') setTaskType(2);

    setDiseaseSelectedType(currentTab === '2' ? obj?.key : type);
    setDiseaseSelectedName(e);
    setCementOrAsphalt(obj?.key?.split('-')[0]);

    if (currentTab === '1') {
      setDiseaseSelectedEn(obj?.key?.split('-')[2]);
    }
    if (currentTab === '2' && [0, 1, 2].includes(obj?.key * 1)) {
      if (!oriLength) {
        setOriLength(length);
      }
      setLength(null);
      formref?.current?.setFieldsValue({
        length: null,
      });
    } else if (currentTab === '2' && [3, 4].includes(obj?.key * 1)) {
      if (!length) {
        setLength(oriLength);
        formref?.current?.setFieldsValue({
          length: oriLength,
        });
      }
    }
    if (currentTab === '1') {
      if (['1', '2', '16', '30'].includes(obj?.key?.split('-')[1])) {
        formref?.current?.setFieldsValue({
          area: length ? (length * 0.2).toFixed(4) : null,
        });
      } else if (['23', '20', '25', '27', '28'].includes(obj?.key?.split('-')[1])) {
        formref?.current?.setFieldsValue({
          area: length ? length * 1 : null,
        });
      } else {
        formref?.current?.setFieldsValue({
          area: area || null,
        });
      }
    }
  };

  return (
    <>
      <div
        ref={canvasParent}
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          margin: 'auto',
        }}
      >
        <Spin spinning={loading}>
          <div
            style={{
              position: 'relative',
              width: canvasWidth,
              height: canvasHeight,
            }}
          >
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', zIndex: 5 }}
              width={canvasWidth}
              height={canvasHeight}
              // height={'100%'}
            />
            <canvas
              ref={canvasToolRef}
              style={{
                position: 'absolute',
                zIndex: props.isAdd ? 10 : 1,
                userSelect: 'none',
                height: '100%',
              }}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseMove={onMouseMove}
              onContextMenu={endManualDrawPoing}
              width={canvasWidth}
              height={canvasHeight}
              // height={'100%'}
            />
            {selectedRowKeyData?.length
              ? bboxClose.map((item: any) => (
                  <CloseCircleOutlined
                    onClick={() => clearRect(item.id)}
                    key={item.id}
                    style={{
                      position: 'absolute',
                      color: '#f60',
                      fontSize: '36px',
                      zIndex: 5,
                      fontWeight: 'bold',
                      top: item.top - 10,
                      left: item.left,
                    }}
                  />
                ))
              : ''}
          </div>
        </Spin>
      </div>

      {modFlag ? (
        <Modal
          title="添加标注"
          width={'513px'}
          maskClosable={false}
          closable={false}
          destroyOnClose={true}
          open={modFlag}
          onCancel={() => {
            setModFlag(false);
            setStartX(undefined);
            setStartY(undefined);
            setEndtX(undefined);
            setEndY(undefined);
            props.setAdd(false);
            ctxToolRef.current.clearRect(0, 0, naturalWidth, naturalHeight);
          }}
          onOk={() => {
            submit();
          }}
          style={{ top: 'calc(50vh - 200px)' }}
        >
          <Form
            labelAlign="right"
            labelCol={{ flex: '78px' }}
            labelWrap
            wrapperCol={{ flex: 1 }}
            colon={false}
            ref={formref}
          >
            <Form.Item
              label="病害类型"
              name="distressType"
              rules={[{ required: true, message: '请选择病害类型' }]}
            >
              {currentTab === '2' ? (
                <Select onChange={onChange} style={{ height: 40 }}>
                  {Object?.keys(diseaseAlone).map((item: any) => (
                    <Option key={item} value={diseaseAlone[item]}>
                      {diseaseAlone[item]}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Select onChange={onChange} style={{ height: 40 }}>
                  {diseaseRoad?.map((item: any) => (
                    <Option
                      key={`${item.parentKey}-${item.dictKey}-${item.dictCode}`}
                      value={`${item?.parentName}-${item?.dictName}`}
                    >
                      {`${item.parentName}-${item.dictName}`}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>

            {currentTab === '1' && (
              // defaultValue={area}
              <Form.Item label="面积(㎡)" name="area" initialValue={area}>
                <Input disabled autoComplete="off" />
              </Form.Item>
            )}
            <Form.Item
              label="长度(m)"
              name="length"
              initialValue={length}
              rules={[
                {
                  required:
                    currentTab !== '1' &&
                    (diseaseSelectedType === '4' || diseaseSelectedType === '3'),
                  message: '请输入长度(m)',
                },
              ]}
            >
              {currentTab !== '1' &&
              (diseaseSelectedType === '4' || diseaseSelectedType === '3') ? (
                <InputNumber
                  placeholder="长度(m)"
                  style={{ width: '100%' }}
                  min={0}
                  precision={currentTab !== '1' ? 0 : 4}
                  onChange={(e: any) => {
                    if (e < 10 && currentTab !== '1') {
                      setLength(10);
                      formref?.current?.setFieldsValue({
                        length: 10,
                      });
                    } else {
                      setLength(e);
                    }
                  }}
                ></InputNumber>
              ) : (
                <Input disabled autoComplete="off" />
              )}
            </Form.Item>
            <Form.Item
              label="桩号"
              name="stakeNo2"
              rules={[{ required: !!(currentTab !== '1'), message: '请输入桩号' }]}
            >
              <>
                K <Input disabled autoComplete="off" value={stakeNo1} style={{ width: '108px' }} />+{' '}
                <Input
                  disabled={!!(currentTab === '1')}
                  autoComplete="off"
                  value={stakeNo2}
                  onChange={(e) => setStakeNo2(e?.target?.value)}
                  style={{ width: '108px' }}
                />
              </>
            </Form.Item>
          </Form>
        </Modal>
      ) : (
        ''
      )}
    </>
  );
};

export default DistressCanvas;
