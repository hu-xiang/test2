import React, { useState, useRef, useEffect } from 'react';
import { Modal, Form, Select, InputNumber, message, Spin } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { calcBoundaryCoord } from './calcVal';
import { getNextInfo, saveImgInfo, addErr, credisNO } from '../service';
// import { diseaseAll1, disease1, disease2, diseaseUrgency } from '../../../../utils/dataDic';
import { useCompare, getDictData } from '../../../../utils/commonMethod';

let diseaseAll1: any = [];
let disease1: any = [];
let disease2: any = [];

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
  nextItemFn: Function;
  setImgUrl: (dataUrl: string) => void;
  setFirstClick: () => void;
  // isAdd: boolean;
  // setAdd: any;
  setGetNextImageData: any;
  flags: boolean;
  selectedRowKey: any;
  colorInd: any;
  setSelectedRowKey: any;
  selObj: any;
  setColorInd: any;
};

const DistressCanvas: React.FC<Iprops> = (props) => {
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
  const [revisionForm] = Form.useForm();

  const [startX, setStartX] = useState<any>();
  const [startY, setStartY] = useState<any>();
  const [endX, setEndtX] = useState<any>();
  const [endY, setEndY] = useState<any>();
  const [isdown, setIsdown] = useState(false);
  // const [isAdd, setAdd] = useState(props.isAdd);
  const [modFlag, setModFlag] = useState(false);
  const [disKey, setDisKey] = useState<any>('');
  const [taskType, setTaskType] = useState<number>(1);
  // const [diseaseImpType] = useState(diseaseUrgency);
  const { selectedRowKey, colorInd, setColorInd, setSelectedRowKey, selObj } = props;
  const [loading, setLoading] = useState(false);
  const [delDataList, setDelDataList] = useState<any>([]);
  const conFields = ['collectTime', 'direct', 'stakeNo', 'inspectionId'];

  selectedRowKeyData = useCompare(selectedRowKey);

  const getDicts = async () => {
    const res: any = await getDictData({ type: 2, dictCodes: ['safe_event', 'cement', 'asphalt'] });
    if (res?.length) {
      // 沥青
      disease1 = res?.data
        ?.filter((item: any) => item?.parentKey === 2)
        ?.map((element: any) => {
          return element?.dictKey;
        });
      // 水泥
      disease2 = res?.data
        ?.filter((item: any) => item?.parentKey === 1)
        ?.map((element: any) => {
          return element?.dictKey;
        });

      diseaseAll1 = res?.data?.map((item: any) => {
        return {
          ...item,
          label:
            item?.parentKey === 1 || item?.parentKey === 2
              ? `${item?.parentName}-${item?.dictName}`
              : item?.dictName,
          value: item?.dictKey,
        };
      });
    }
  };

  const getNextImageData = async (selObjs?: any) => {
    imgReloadNum = 0;
    img = null;
    // setDefectInfos([]);
    setColorInd(undefined);
    const obj = {
      collectTime: selObjs?.collectTime || selObj?.collectTime,
      deviceIds: selObjs?.deviceIds || selObj?.deviceIds,
      startTime: selObjs?.startTime || selObj?.startTime || '00:00:00',
      endTime: selObjs?.endTime || selObj?.endTime || '23:59:59',
    };
    try {
      const res = await getNextInfo(obj, selObjs?.tenant_id || selObj?.tenant_id);
      props.setFirstClick();
      if (res.status !== 0) {
        setData({ ...dataItem, dataNull: false });
      } else {
        ctxRef.current!.clearRect(0, 0, naturalWidth, naturalHeight);
        setBboxClose([]);

        if (!res.data) {
          setData({ ...dataItem, dataNull: false });
          message.warning({
            content: '暂无数据，请重试！',
            key: '暂无数据，请重试！',
          });
          return false;
        }
        setData({ ...res.data, dataNull: true, flag: 0 });
        setDefectInfos(res.data.list);

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
    if (item.diseaseType * 1 === 1 || item.diseaseType * 1 === 2) {
      text = `${index + 1} ${item.diseaseNameZh} ${
        !item.length ? '' : `${(item.length * 1).toFixed(3)}m`
      }`;
    } else if (item.diseaseType * 1 === 9 || item.diseaseType * 1 === 12) {
      text = `${index + 1} ${item.diseaseNameZh}`;
    } else {
      text = `${index + 1} ${item.diseaseNameZh} ${
        !item.area ? '' : `${(item.area * 1).toFixed(3)}m²`
      }`;
    }

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
  };

  const nextItem = async (prarams: any) => {
    setLoading(true);
    ctxToolRef.current.clearRect(0, 0, naturalWidth, naturalHeight);
    defectInfos.forEach((item: any) => {
      const copyItem = item;
      if (typeof item.bbox !== 'string') {
        copyItem.bbox = JSON.stringify(item.bbox);
      }
    });
    const datas = { ...data, list: defectInfos };
    const addErrData = async (delListCopy: any) => {
      const datas2 = { ...data, list: [...delListCopy], flag: 1 };
      // delete datas2?.list[0]?.id;
      try {
        console.log('dd', datas2);
        const addErrRes = await addErr(datas2, selObj.tenant_id);
        if (addErrRes.status !== 0) {
          // message.error({
          //   content: addErrRes.message,
          //   key: addErrRes.message,
          // });
          return;
        }
        setDelDataList([]);
      } catch (error) {
        // message.error({
        //   content: '操作失败!',
        //   key: '操作失败!',
        // });
      }
    };
    try {
      const res = await saveImgInfo(datas, selObj.tenant_id);
      if (res.status !== 0) {
        setLoading(true);
      } else {
        message.success({
          content: '保存成功，处理下一张',
          key: '保存成功，处理下一张',
        });
        if (delDataList.length) {
          const delListCopy: any = [];
          delDataList.forEach((item: any, index: any) => {
            const copyItem = { ...item };
            if (typeof copyItem.bbox !== 'string') {
              copyItem.bbox = JSON.stringify(item.bbox);
            }
            delListCopy.push(copyItem);
            if (index === delDataList.length - 1) {
              addErrData(delListCopy);
            }
          });
        }
        console.log(prarams, 'params');
        getNextImageData();
        // props.setAdd(false);
        bboxVal = [];
      }
    } catch (error) {
      props.setFirstClick();
      // message.error({
      //   content: '操作失败!',
      //   key: '操作失败!',
      // });
    }
  };
  useEffect(() => {
    props.nextItemFn(nextItem);
    props.DataFn(data);
  }, [data, defectInfos, selectedRowKey]);

  useEffect(() => {
    getDicts();
    ctxRef.current = canvasRef.current?.getContext('2d');
    ctxToolRef.current = canvasToolRef.current?.getContext('2d');
    props.setGetNextImageData({
      fn: (e?: any) => {
        getNextImageData(e);
      },
    });

    const resizeCanvas = () => {
      setCanvasHeight(canvasParent?.current?.clientHeight);
    };

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    data?.list.map((item: any) => {
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
  }, [data.imgUrl]);

  useEffect(() => {
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
        defeList = defectInfos.filter((item: any) => selectedRowKey.includes(item.id));

        highLightDefect(defeList);
        const dataURL = canvasRef.current!.toDataURL('image/jpeg', 1);
        props.setImgUrl(dataURL);
      }, 10);
    };
    if (data.imgUrl) {
      img.onerror = () => {
        if (imgReloadNum <= 4) {
          imgReloadNum += 1;
          setTimeout(() => {
            img.src = data.imgUrl;
          }, 10);
        }
      };
    }
    img.src = data.imgUrl;
  }, [selectedRowKeyData, canvasHeight, colorInd]);

  const clearRect = (id: string) => {
    let delData: any;
    const newDefectInfos = defectInfos.filter((item: any) => {
      if (item.id === id) delData = item;
      return item.id !== id;
    });
    if (!delDataList.length || delDataList.findIndex((i: any) => i === delData) === -1) {
      setDelDataList([...delDataList, { ...delData, errorDescription: '病害误检', errorType: 1 }]);
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
  };

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
    revisionForm?.resetFields();
    if (endX && startX !== endX && endY && startY !== endY) {
      setModFlag(true);
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
    revisionForm
      .validateFields()
      .then(async () => {
        try {
          const { fkImgId, list } = data;
          const resNo = await credisNO({ fkImgId }, selObj.tenant_id);
          const addData = {
            area: revisionForm.getFieldValue('area') * 1 || '',
            length: revisionForm.getFieldValue('length') * 1 || '',
            bbox: [
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
            ],
            // id: null,
            diseaseNameZh: revisionForm.getFieldValue('distressType'),
            diseaseType: disKey * 1,
            diseaseImp: diseaseAll1?.filter((item: any) => item?.dictKey === disKey * 1)[0]?.level,
            // diseaseImp: diseaseImpType[disKey] === '紧急' ? 1 : 0,
            errorDescription: '病害漏检',
            errorType: 2,
            diseaseNo: resNo.data,
            sourceType: 4,
          };
          const newmapdata: any = {};
          if (list?.length > 0 && Object.keys(list[0])?.length > 0) {
            conFields.forEach((it: any) => {
              if (list[0][it]) {
                newmapdata[it] = list[0][it];
              }
            });
          }
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

          // props.setAdd(false);
          setModFlag(false);
          setStartX(undefined);
          setStartY(undefined);
          setEndtX(undefined);
          setEndY(undefined);
          ctxToolRef.current.clearRect(0, 0, naturalWidth, naturalHeight);
          revisionForm.resetFields();
        } catch (error) {
          // message.error({
          //   content: '操作失败!',
          //   key: '操作失败!',
          // });
        }
      })
      .catch(() => {});
  };
  const onChange = (e: any, obj: any) => {
    setDisKey(obj.key);
    // const liqingArr = Object.keys(disease1);
    // const shuiniArr = Object.keys(disease2);
    const liqingArr = disease1;
    const shuiniArr = disease2;
    // eslint-disable-next-line
    const type = liqingArr.includes(obj.key) ? 2 : shuiniArr.includes(obj.key) ? 1 : 0;
    if (liqingArr.includes(obj.key)) setTaskType(type);
  };
  // useEffect(() => {
  //   const setHeight = () => {
  //     // setNaturalHeight(canvasParent?.current?.clientHeight);
  //   };
  //   window.addEventListener('resize', setHeight);
  //   return () => {
  //     window.removeEventListener('resize', setHeight);
  //   };
  // }, []);

  return (
    <>
      {/* <img ref={imgRef} style={{display: 'none'}}/> */}
      <div className="manuImg" ref={canvasParent}>
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
                // zIndex: props.isAdd ? 10 : 1,
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
            {bboxClose.map((item: any) => (
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
            ))}
          </div>
        </Spin>
      </div>

      {modFlag ? (
        <Modal
          open={modFlag}
          maskClosable={false}
          okText="确定"
          cancelText="取消"
          destroyOnClose={true}
          closable={false}
          onOk={() => {
            submit();
          }}
          onCancel={() => {
            setModFlag(false);
            setStartX(undefined);
            setStartY(undefined);
            setEndtX(undefined);
            setEndY(undefined);
            // props.setAdd(false);
            ctxToolRef.current.clearRect(0, 0, naturalWidth, naturalHeight);
          }}
          className={'manualToolMod'}
        >
          <Form
            name="revisionForm"
            form={revisionForm}
            labelCol={{ span: 5 }}
            // wrapperCol={{ span: 16 }}
            autoComplete="off"
          >
            <Form.Item
              label="病害类型"
              name="distressType"
              rules={[{ required: true, message: '请选择病害类型' }]}
            >
              <Select onChange={onChange} style={{ height: 40 }}>
                {diseaseAll1
                  .filter((i: any) => i.label !== '路面跳车')
                  .map((item: any) => (
                    <Option key={item.value} value={item.label}>
                      {item.label}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item label="面积(㎡)" name="area">
              <InputNumber controls={false} />
            </Form.Item>
            <Form.Item label="长度(m)" name="length">
              <InputNumber controls={false} />
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
