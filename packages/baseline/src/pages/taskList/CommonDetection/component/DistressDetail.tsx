/*
 * @Author: wf
 * @Date: 2022-07-08 10:29:34
 * @Last Modified by: wf
 * @description:  先根据原图转换为base64，box数组转换为对应的坐标点，然后canvas画布上根据这些坐标点进行画图，并解析图片病害的长度和面积进行展示
 * @Last Modified time: 2023-02-25 17:26:01
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Space,
  Card,
  List,
  Button,
  Modal,
  Form,
  Select,
  Input,
  message,
  // Popconfirm,
  Checkbox,
  Tooltip,
  Spin,
} from 'antd';
// import { DeleteOutlined } from '@ant-design/icons';
import { queryImgInfo, addRevision, getRevisionList, queryDetailList } from '../service';
import { calcArea, calcLength, calcBoundaryCoord } from '../calcVal';
import styles from '../styles.less';
import PreviewImg from './DistressDetailImgPreview';
import { ReactComponent as LeftImg } from '../../../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightImg } from '../../../../assets/img/leftAndRight/rightImg.svg';
import DistressCanvas from '../../../../components/DistressCanvas';
import { drawMosaic } from '../../../../components/Mosaic/Mosaic';
import React from 'react';

const { Option } = Select;

interface Iprops {
  fkImgId: any;
  taskId: string;
  checkResult: number;
  detName: string;
  imglist: any;
  types: any;
  code: any;
  modelType: number;
  onBigImg: Function;
}

type point = { X: number; Y: number };
// let num: number = 0; // 点的数量
const contours: Record<'Points', point[]>[] = [];
const Point: point[] = [];

const DistressDetail: React.FC<Iprops> = (props) => {
  const { taskId, modelType } = props;
  const [data, setData] = useState<any>({ url: '', ls: [{ check: false }], contours: [] });
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  // const [isEdit, setIsEdit] = useState(false);
  const [calcModalVisible, setCalcModalVisible] = useState(false);
  const [revisionList, setRevisionList] = useState([{ check: true }]);
  const [diseaseNameZh, setDiseaseNameZh] = useState('');
  // const [canvasDataUrl, setCanvasDataUrl] = useState('');
  const [revisionForm] = Form.useForm();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const highLightCanvasRef = useRef<HTMLCanvasElement>(null);
  const toolCanvasRef = useRef<HTMLCanvasElement>(null);
  const revisionCanvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<any>(null);
  const highLightCtxRef = useRef<any>(null);
  const toolCtxRef = useRef<any>(null);
  const revisionCtxRef = useRef<any>(null);
  const fillColors = {
    horizontal_crack: 'rgba(219, 131, 125, .65)',
    vertical_crack: 'rgba(168, 125, 219, .65)',
    strip_patch: 'rgba(125, 203, 219, .35)',
    cracks: 'rgba(236, 222, 151, .65)',
    lumpy_patch: 'rgba(144, 182, 213, .35)',
    other: 'rgba(152, 240, 104, .35)',
  };
  const [flags, setFlags] = useState(false);

  const [diseaList, setDiseaList] = useState<any>([]);
  const [newNum, setNewNum] = useState<any>(0);
  const [numFlag, setNumFlag] = useState<boolean>(true);
  const [nextflag, setNextflag] = useState(false);
  const [preflag, setPreflag] = useState(false);
  const [flag, setFlag] = useState(false);
  const [fkImgId, setFkImgId] = useState<any>(props.fkImgId);
  const [listPage, setListPage] = useState(props.imglist.tabpage * 1);
  const listPageSize = props.imglist.tabpagesize * 1;
  const [imgNames, setImgNames] = useState('');
  const [dataLength, setDataLength] = useState(5);
  const [visible, setVisible] = useState(false);
  const [imgUrl, setImgUrl] = useState('');

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
    const width = naturalWidthTemp || naturalWidth;
    const height = naturalHeightTemp || naturalHeight;
    points.forEach((point: point, index: number) => {
      if (index === 0) {
        ctx.beginPath();
        ctx.moveTo(
          (originalSize ? 1 : 704 / width) * point.X,
          (originalSize ? 1 : 687 / height) * point.Y,
        );
      } else {
        ctx.lineTo(
          (originalSize ? 1 : 704 / width) * point.X,
          (originalSize ? 1 : 687 / height) * point.Y,
        );
      }
    });
    ctx.closePath();
  };

  const performPresetImg = (img: any) => {
    ctxRef.current!.clearRect(0, 0, 704, 687);
    highLightCtxRef.current!.clearRect(0, 0, 704, 687);
    ctxRef.current!.drawImage(img, 0, 0, 704, 687);
    toolCanvasRef.current!.width = img.naturalWidth;
    toolCanvasRef.current!.height = img.naturalHeight;
    toolCtxRef.current!.clearRect(0, 0, img.naturalWidth, img.naturalHeight);
    toolCtxRef.current!.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
  };

  const clearDrawedPoint = () => {
    revisionCtxRef.current!.clearRect(0, 0, 704, 687);
    // num = 0;
    Point.length = 0;
    contours.length = 0;
  };

  // 人工修订数据
  const handleRevisionList = useCallback(async () => {
    const result = await getRevisionList({
      imgId: fkImgId,
      taskId,
    });
    if (result?.data?.length > 0) {
      result?.data.forEach((item: any) => {
        const copyItem = item;
        copyItem.contours = JSON.parse(item.contours);
        if (copyItem.contours) {
          const boundaryObj = calcBoundaryCoord(copyItem.contours);
          copyItem.minX = boundaryObj.minX;
          copyItem.maxY = boundaryObj.maxY;
          copyItem.width = boundaryObj.maxX - boundaryObj.minX;
          copyItem.height = boundaryObj.maxY - boundaryObj.minY;
        }
        copyItem.check = true; // 添加默认是否画出区域标志
      });
    }
    setRevisionList(result?.data);
    clearDrawedPoint();
  }, [fkImgId, taskId]);

  useEffect(() => {
    if (numFlag) {
      handleRevisionList();
    }
  }, [handleRevisionList, newNum]);

  useEffect(() => {
    ctxRef.current = canvasRef.current?.getContext('2d');
    highLightCtxRef.current = highLightCanvasRef.current?.getContext('2d');
    toolCtxRef.current = toolCanvasRef.current?.getContext('2d');
    revisionCtxRef.current = revisionCanvasRef.current?.getContext('2d');
  }, [newNum]);
  const getBhInfo = async () => {
    const res = await queryImgInfo(taskId, fkImgId);
    if (res.status === 0) {
      res.data?.ls.map((item: any) => {
        const copyItem = item;
        copyItem.cbox = JSON.parse(item.bbox);
        copyItem.contours = null;
        if (copyItem.cbox) {
          const boundaryObj = calcBoundaryCoord(copyItem.cbox);
          copyItem.minX = boundaryObj.minX;
          copyItem.maxY = boundaryObj.maxY;
          copyItem.width = boundaryObj.maxX - boundaryObj.minX;
          copyItem.height = boundaryObj.maxY - boundaryObj.minY;
        }

        copyItem.check = true; // 添加默认是否画出区域标志
        return copyItem;
      });
    }
    setData(res?.data);
  };
  /**
   * 画布上绘制字体
   */
  const drawText = (
    item: any,
    ctx: CanvasRenderingContext2D,
    index: number,
    imgflag: boolean = false,
  ) => {
    let minY = item.minY - 40;
    if (item.minY <= 50) {
      minY = item.minY + 20;
    }
    ctx.beginPath();
    ctx.moveTo(item.minX, minY);
    ctx.fillStyle = 'yellow'; // 设置填充颜色为黄色

    if (!imgflag) {
      ctx.font = '46px "微软雅黑"'; // 设置字体
    } else {
      ctx.font = '18px "微软雅黑"'; // 设置字体
    }

    ctx.textBaseline = 'top'; // 设置字体底线对齐绘制基线
    ctx.textAlign = 'left'; // 设置字体对齐的方式

    const text = `${index + 1} ${item.diseaseNameZh}`;
    if (ctx.measureText(text).width + item.minX >= naturalWidth - 10) {
      ctx.fillText(text, naturalWidth - ctx.measureText(text).width, minY);
    } else if (imgflag) {
      ctx.fillText(text, item.minX * (704 / naturalWidth) - 2, minY * (687 / naturalHeight) - 4); // 填充文字
    } else {
      ctx.fillText(text, item.minX, minY); // 填充文字
    }
  };
  /**
   * // 图片成功后，画出人工修订和AI识别出的区域
   * @param pointData
   * @param isManual  是否为人工修订
   */

  const drawPoint = (pointData: any, isManual = false) => {
    if (pointData?.length > 0) {
      pointData.forEach((item: any, index: any) => {
        const copyItem = item;
        if (copyItem.contours) {
          copyItem.contours.forEach((contour: any) => {
            if (copyItem.check) {
              drawContour(contour.Points, ctxRef.current!, naturalWidth, naturalHeight);
              drawContour(contour.Points, toolCtxRef.current!, naturalWidth, naturalHeight, true);

              if (isManual) {
                ctxRef.current.fillStyle = 'rgba(255, 0, 0, 0.3)';
              } else if (copyItem.diseaseName === 'horizontal_crack') {
                ctxRef.current!.fillStyle = fillColors.horizontal_crack;
              } else if (copyItem.diseaseName === 'vertical_crack') {
                ctxRef.current!.fillStyle = fillColors.vertical_crack;
              } else if (copyItem.diseaseName === 'strip_patch') {
                ctxRef.current!.fillStyle = fillColors.strip_patch;
              } else if (copyItem.diseaseName === 'cracks') {
                ctxRef.current!.fillStyle = fillColors.cracks;
              } else if (copyItem.diseaseName === 'lumpy_patch') {
                ctxRef.current!.fillStyle = fillColors.lumpy_patch;
              } else {
                ctxRef.current.fillStyle = fillColors.other;
              }
              ctxRef.current!.fill();
              toolCtxRef.current.fillStyle = 'rgba(255, 0, 0, 0.3)';
              toolCtxRef.current!.fill();
            }
          });
        }
        if (item?.bbox) {
          if (typeof item.bbox === 'string') {
            copyItem.cbox = JSON.parse(item.bbox);
          }
          const boundaryObj = calcBoundaryCoord(copyItem.cbox);
          copyItem.minX = boundaryObj.minX;
          copyItem.maxY = boundaryObj.maxY;
          copyItem.minY = boundaryObj.minY;
          copyItem.maxX = boundaryObj.maxX;
          if (typeof item.bbox === 'string') {
            copyItem.bbox = JSON.parse(item.bbox);
          }
          drawContour(copyItem.bbox, toolCtxRef.current!, naturalWidth, naturalHeight, true);
          toolCtxRef.current.lineWidth = '2';
          toolCtxRef.current.strokeStyle = 'rgba(255, 255, 0, 1)';
          toolCtxRef.current.stroke();
          drawText(copyItem, toolCtxRef.current, index);
        }
        setFlags(true);
      });
    }
    // 预览大图时用
    // const dataURL = toolCanvasRef.current!.toDataURL('image/jpeg', 0.5);
    // setCanvasDataUrl(dataURL);
  };
  const highLightDefect = (item: any, index: any) => {
    // highLightCtxRef.current.clearRect(0, 0, 704, 687);
    if (!item.bbox) return;
    if (!item.check) return; // 用户未勾选，就不会画
    const copyItem = item;
    if (typeof item.bbox === 'string') {
      copyItem.bbox = JSON.parse(item.bbox);
    }
    drawContour(copyItem.bbox, highLightCtxRef.current);
    highLightCtxRef.current.strokeStyle = 'rgba(255, 255, 0, 1)';
    highLightCtxRef.current.stroke();
    if (typeof item.bbox === 'string') {
      copyItem.cbox = JSON.parse(item.bbox);
    }
    const boundaryObj = calcBoundaryCoord(copyItem.cbox);
    copyItem.minX = boundaryObj.minX;
    copyItem.maxY = boundaryObj.maxY;
    copyItem.minY = boundaryObj.minY;
    copyItem.maxX = boundaryObj.maxX;
    drawText(copyItem, highLightCtxRef.current, index, true);
  };
  useEffect(() => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'Anonymous');
    img.onload = () => {
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      // 两次performPresetImg, 为兼容丢包的图片无法显示的问题
      performPresetImg(img);
      // drawPoint(data.ls);
      setTimeout(() => {
        performPresetImg(img);
        drawPoint(revisionList, true);
        data.ls.forEach((item: any, index: any) => {
          const copyItem = item;
          if (item.bbox && typeof item.bbox === 'string') {
            copyItem.bbox = JSON.parse(item.bbox);
          }

          if (copyItem.diseaseType * 1 === 5 || copyItem.diseaseType * 1 === 6) {
            drawMosaic(copyItem, ctxRef, img.naturalWidth, img.naturalHeight); // 打马赛克
          } else {
            drawPoint(data.ls); // 画原始的所有点
            highLightDefect(item, index); // 画选中的条目的点，给加亮线
          }
        });
      }, 10);
    };
    img.src = data?.url;
  }, [data, revisionList, flags, newNum]);

  const endManualDrawPoing = (event?: any) => {
    event?.preventDefault();
    // num = 0;
    revisionCtxRef.current.closePath();
    if (Point.length) {
      if (Point.length <= 2) {
        message.info({
          content: '每个区域请至少添加三个坐标点',
          key: '每个区域请至少添加三个坐标点',
        });
        return;
      }
      contours.push({ Points: Point.slice() });
      Point.length = 0;
    }
  };

  // const manualRevision = () => {
  //   setIsEdit(!isEdit);
  //   endManualDrawPoing();
  //   // 结束修订
  //   if (isEdit) {
  //     setCalcModalVisible(true);
  //   }
  // };

  // const manualDrawPoint = (event: any) => {

  // };

  const handleOk = async () => {
    const values = await revisionForm.validateFields();
    const paramData = {
      ...values,
      fkImgId,
      fkTaskId: taskId,
      diseaseNameZh,
      contours: JSON.stringify(contours),
    };

    const res = await addRevision(paramData);
    if (res.status === 0) {
      handleRevisionList();
      setCalcModalVisible(false);
      revisionForm.resetFields();
    }
  };

  const handleCancel = () => {
    setCalcModalVisible(false);
    revisionForm.resetFields();
  };

  const onDistressTypeChange = (value: any, option: any) => {
    setDiseaseNameZh(option.children);
    if (value === 'horizontal_crack' || value === 'vertical_crack') {
      revisionForm.setFieldsValue({
        length: calcLength(contours),
      });
    } else {
      revisionForm.setFieldsValue({
        area: calcArea(contours),
      });
    }
  };

  // const deleteRevision = async (id: string) => {
  //   const res = await delRevision(id);
  //   if (res.status === 0) {
  //     message.success('删除成功！');
  //     handleRevisionList();
  //     if (revisionList.length === 1) {
  //       const img = new Image();
  //       img.setAttribute('crossOrigin', 'Anonymous');
  //       img.onload = () => {
  //         performPresetImg(img);
  //         drawPoint(data.ls);
  //         drawPoint([{ check: false }], true);
  //       };
  //       img.src = data.url;
  //     }
  //   }
  // };

  const aiCheckOnChange = (index: number) => {
    data.ls[index].check = !data.ls[index].check;
    setData({
      ...data,
      ls: data.ls,
    });
  };

  // const manualCheckOnChange = (index: number) => {
  //   revisionList[index].check = !revisionList[index].check;
  //   setRevisionList([...revisionList]);
  // };

  const sendDetail = async () => {
    const list: any = [];
    let listRes: any;
    setPreflag(false);
    setNextflag(false);
    // 第一次进来
    if (diseaList.length === 0) {
      listRes = await queryDetailList({
        id: taskId,
        current: listPage,
        pageSize: listPageSize,
        types: props.types,
        code: props.code,
      });
      list.push(...listRes.data);
      const indexNum: number = listRes.data.findIndex((i: any) => i.fkImgId === fkImgId);
      setNewNum(indexNum);
      setImgNames(listRes.data[indexNum].fkImgName);
      if (listPage !== 1 && listRes.data.length < listPageSize) {
        setNextflag(true);
      }
      setDiseaList(list);
      if (listRes.data.length && listRes.data.length < listPageSize) {
        setDataLength(listRes.data.length);
      }
    }
    // 如果获取的list数组翻下一页达到pagesize附近，需要判断是否翻页，获得的数据为当前页的最后一张
    if (
      (list.length && list.findIndex((i: any) => i.fkImgId === fkImgId) === list.length - 1) ||
      (diseaList.length &&
        diseaList.findIndex((i: any) => i.fkImgId === fkImgId) ===
          (diseaList.length - 1 < listPageSize ? diseaList.length - 1 : listPageSize - 1))
    ) {
      const lists = await queryDetailList({
        id: taskId,
        current: listPage * 1 + 1,
        pageSize: listPageSize,
        types: props.types,
        code: props.code,
      });
      if (lists.data.length && lists.data.length < listPageSize) {
        setDataLength(lists.data.length);
      }
      if (lists.data.length === 0) {
        setNextflag(true);
      }
      list.push(...lists.data);

      setDiseaList([...diseaList, ...list]);
    }
    // 获得的数据为当前页的第一张
    if (
      (list.length && list.findIndex((i: any) => i.fkImgId === fkImgId) === 0) ||
      (diseaList.length && diseaList.findIndex((i: any) => i.fkImgId === fkImgId) === 0)
    ) {
      if (listPage - 1 <= 0) {
        setPreflag(true); // 翻上一张按钮置灰
      } else {
        const lists = await queryDetailList({
          id: taskId,
          current: listPage - 1,
          pageSize: listPageSize,
          types: props.types,
          code: props.code,
        });
        list.unshift(...lists.data); // 从数组头部插入
        if (lists.data.length && lists.data.length < listPageSize) {
          setDataLength(lists.data.length);
        }
      }

      setDiseaList([...list, ...diseaList]);
    }
    setFlag(false);

    return true;
  };

  const preDisea = () => {
    setFlag(true);
    setNumFlag(true);
    if (newNum === 0) {
      // 为当前页的第一张图片，当点击上一张的时候，需要判断翻页
      setListPage(listPage * 1 - 1);
      setNewNum(listPageSize - 1);
      const list: any = [];
      list.push(...[...diseaList].slice(0, listPageSize));
      setFkImgId(list[listPageSize - 1]?.fkImgId);
      setImgNames(list[listPageSize - 1].fkImgName);
      setDiseaList(list);
    } else {
      const list: any = [];

      if (newNum === listPageSize - 1) {
        list.push(...[...diseaList].slice(0, listPageSize));
        setDataLength(listPageSize);
      } else {
        list.push(...[...diseaList]);
      }

      setDiseaList(list);
      setFkImgId(list[newNum - 1]?.fkImgId);
      setImgNames(list[newNum - 1].fkImgName);
      setNewNum(newNum - 1);
    }
  };

  const nextDisea = () => {
    setFlag(true);
    setNumFlag(true);
    if (newNum === listPageSize - 1) {
      setListPage(listPage + 1);
      const list = [...diseaList].slice(newNum + 1);

      setFkImgId(list[0].fkImgId);
      setImgNames(list[0].fkImgName);
      setDiseaList(list);
      setNewNum(0);
    } else {
      const list: any = [];
      if (newNum === 0 && listPage !== 1) {
        list.push(...[...diseaList].slice(dataLength < listPageSize ? dataLength : listPageSize));
      } else {
        list.push(...[...diseaList]);
      }

      setDiseaList(list);

      setFkImgId(list[newNum + 1].fkImgId);
      setImgNames(list[newNum + 1].fkImgName);
      setNewNum(newNum + 1);
    }
  };

  useEffect(() => {
    if (numFlag) {
      sendDetail();
      getBhInfo();
      setNumFlag(false);
    }
  }, [newNum]);
  const drawBigImg = () => {
    const obj = {
      preflag,
      preDisea,
      nextflag,
      nextDisea,
    };
    props.onBigImg(obj, visible);
  };
  useEffect(() => {
    drawBigImg();
  }, [visible, newNum, preflag, nextflag, diseaList]);
  const previewBigImg = (url: string) => {
    setImgUrl(url);
  };
  return (
    <>
      {/* <Button onClick={() => manualRevision()}>{!isEdit ? '人工修订' : '结束修订'}</Button>
      <Button onClick={clearDrawedPoint} style={{ marginLeft: 10, marginBottom: 10 }}>
        清除
      </Button> */}
      <Button
        // onClick={previewImg}
        className={styles.previewImg}
        // onClick={drawBigImg}
        style={{
          // marginLeft: 10,
          marginBottom: 10,
          overflow: 'hidden',
        }}
      >
        查看大图
        <PreviewImg url={imgUrl} setVisible={setVisible} visible={visible} />
        <DistressCanvas setImgUrl={previewBigImg} data={data} revisionList={revisionList} />
      </Button>
      <Space size={12} className={styles.distressDetail}>
        <Spin spinning={flag}>
          <div>
            <LeftImg
              className={`${styles.topBoxText} ${styles.topBoxText2} ${
                preflag ? styles.disables : ''
              }`}
              onClick={preflag ? undefined : preDisea}
            />
            <RightImg
              style={{ display: 'flex' }}
              onClick={nextflag ? undefined : nextDisea}
              className={` ${styles.topBoxText3} ${nextflag ? styles.disables : ''}`}
            />
            <canvas ref={canvasRef} width={704} height={687} />
            <canvas
              className={styles.highLightCanvas}
              ref={highLightCanvasRef}
              width={704}
              height={687}
            />
            <canvas
              className={styles.highLightCanvas}
              ref={revisionCanvasRef}
              // onClick={manualDrawPoint}
              onContextMenu={endManualDrawPoing}
              width={704}
              height={687}
              style={{ userSelect: 'none' }}
            />
            <canvas ref={toolCanvasRef} style={{ display: 'none' }} />
          </div>
        </Spin>
        {/* AI结果展示 */}
        <div className={styles.resultBox}>
          <Card style={{ width: 440 }} type="inner" title="基本信息" className={styles.aiResult1}>
            <div style={{ color: '#333' }}>
              <div style={{ height: 32 }}>
                <span style={{ color: '#666' }}>图片序号</span> :{' '}
                {`0${listPageSize * (listPage - 1) + newNum + 1}`}{' '}
              </div>
              <div style={{ height: 32 }} className={styles.rowLineClass}>
                <span style={{ color: '#666' }}>图片名称</span> :{' '}
                <Tooltip title={imgNames} className={styles.nameBox}>
                  {imgNames}
                </Tooltip>{' '}
              </div>
            </div>
          </Card>
          <Card
            style={{
              width: 440,
            }}
            type="inner"
            title="检测结果"
            className={styles.aiResult}
          >
            <List
              itemLayout="horizontal"
              dataSource={data?.ls || []}
              renderItem={(item: any, index: number) => (
                <>
                  {item?.diseaseNameZh && item?.diseaseType !== 5 && item?.diseaseType !== 6 ? (
                    <List.Item>
                      <Checkbox
                        checked={item.check}
                        onChange={() => aiCheckOnChange(index)}
                        style={{ marginRight: 10 }}
                      />
                      {/* <div onClick={() => highLightDefect(item, index)} style={{ color: '#333' }}> */}
                      <div onClick={() => aiCheckOnChange(index)} style={{ color: '#333' }}>
                        <div>
                          <span style={{ color: '#666' }}>识别类别</span> : {item?.diseaseNameZh}{' '}
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>位置</span> : 距左{item?.minX || 0}，距上
                          {item?.maxY || 0}，宽度{item?.width || 0}，高度
                          {item?.height}
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>面积</span> :{' '}
                          {modelType !== 3
                            ? `${item.area && (item.area * 1).toFixed(3)}㎡` || '-'
                            : '-'}
                        </div>
                        <div>
                          <span style={{ color: '#666' }}>长度</span> :{' '}
                          {modelType !== 3
                            ? `${item.length && (item.length * 1).toFixed(3)}m` || '-'
                            : '-'}
                        </div>
                      </div>
                    </List.Item>
                  ) : (
                    (data?.ls.length === 0 ||
                      (data?.ls.every(
                        (i: any) => !i?.diseaseType || i?.diseaseType === 5 || i?.diseaseType === 6,
                      ) &&
                        data?.ls.findIndex(
                          (i: any) =>
                            !i?.diseaseType || i?.diseaseType === 5 || i?.diseaseType === 6,
                        ) === index)) &&
                    '正常'
                  )}
                </>
              )}
            />
          </Card>
          {/* <Card style={{ width: 440 }} className={styles.aiResult2} type="inner" title="人工修订">
            <List
              itemLayout="horizontal"
              dataSource={revisionList || []}
              renderItem={(item: any, index: number) => (
                <>
                  <List.Item>
                    <Checkbox
                      checked={item.check}
                      onChange={() => manualCheckOnChange(index)}
                      style={{ marginRight: 10 }}
                    />
                    <div style={{ color: '#333' }}>
                      <div style={{ width: '100%' }}>
                        <span style={{ color: '#666' }}>病害类别</span> : {item?.diseaseNameZh}{' '}
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>位置</span> : 距左{item?.minX || 0}，距上
                        {item?.maxY || 0}，宽度{item?.width || 0}，高度
                        {item?.height}
                      </div>
                      <div style={{ width: '100%' }}>
                        <span style={{ color: '#666' }}>面积</span> :{' '}
                        {(item.area && (item.area * 1).toFixed(3)) || 0} ㎡
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>长度</span> :{' '}
                        {(item.length && (item.length * 1).toFixed(3)) || 0} m
                      </div>
                    </div>
                    <Popconfirm
                      title="确定要删除此修订吗？"
                      onConfirm={() => deleteRevision(item.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <a key="list-loadmore-edit">
                        <DeleteOutlined className={styles.delouticon} />
                      </a>
                    </Popconfirm>
                  </List.Item>
                </>
              )}
            />
          </Card> */}
        </div>
      </Space>
      <Modal
        title="人工修订"
        open={calcModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{ marginTop: 10 }}
        className="manfix btnzun"
      >
        <Form
          name="revisionForm"
          form={revisionForm}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
        >
          <Form.Item label="病害名称" name="distressType" rules={[{ required: true }]}>
            <Select onChange={onDistressTypeChange}>
              <Option value="horizontal_crack">横向裂缝</Option>
              <Option value="vertical_crack">纵向裂缝</Option>
              <Option value="strip_patch">条状修补</Option>
              <Option value="lumpy_patch">块状修补</Option>
              <Option value="cracks">龟裂</Option>
              <Option value="other">松散或坑槽</Option>
            </Select>
          </Form.Item>

          <Form.Item label="长度(m)" name="length">
            <Input disabled />
          </Form.Item>
          <Form.Item label="面积(㎡)" name="area">
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DistressDetail;
