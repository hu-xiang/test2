import { Modal, Image as AntdImg, Tabs, Radio, Form, message } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
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
// import Item from 'antd/lib/list/Item';

type Iprops = {
  isShow?: boolean;
  isCreate?: boolean;
  onCancel: () => void;
  curSpotInfo?: any;
  curPosGpsInfo?: any;
  sceneTrackId?: any;
  updateSpotStatus: (isAllNormal: boolean) => void;
};
let ratioArr: any = [
  { w: 1, h: 1 },
  { w: 1, h: 1 },
  { w: 1, h: 1 },
];
let base64Info: any = {};
const EdtMod: React.FC<Iprops> = (props) => {
  const { curPosGpsInfo, sceneTrackId, updateSpotStatus } = props;
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
  const layerRef = useRef<any>();

  const [rectangles, setRectangles] = useState<any[]>([]); // 矩形
  const [circles, setCircles] = useState<any[]>([]); // 圆形
  const [triangles, setTriangles] = useState<any[]>([]); // 三角形
  const [textContentArr, setTextContentArr] = useState<any[]>([]); // 文本
  const [selectedId, setSelectedId] = useState<any>(null);

  const [btnActIndex, setBtnActIndex] = useState<number>(1);
  const [graphicType, setGraphicType] = useState<string>('');

  // tab相关
  const [tabActIndex, setTabActIndex] = useState<string>('0');
  const [tabList, setTabList] = useState<any>([]);
  const [tabResList, setTabResList] = useState<any>([]);

  // 分别是前中后  三个位置的图片信息
  const imgPosInfo: any = [
    {
      rect: [],
      circle: [],
      triangle: [],
      text: [],
    },
    {
      rect: [],
      circle: [],
      triangle: [],
      text: [],
    },
    {
      rect: [],
      circle: [],
      triangle: [],
      text: [],
    },
  ];
  const [imgPosArr, setImgPosArr] = useState<any>(imgPosInfo);

  // 获取原始图片
  const [bgImage0] = useImage(imgList[0]?.imgUrl, 'anonymous');
  const [bgImage1] = useImage(imgList[1]?.imgUrl, 'anonymous');
  const [bgImage2] = useImage(imgList[2]?.imgUrl, 'anonymous');

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

  // 重新渲染
  const handleReRenderGraphic = (index: number, isFirstLoad?: boolean, data?: any) => {
    if (isFirstLoad) {
      // 获取原始图片
      const { rect, circle, triangle, text } = data[index];

      setRectangles(rect);
      setCircles(circle);
      setTriangles(triangle);
      setTextContentArr(text);
    } else {
      const imgPosArrCopy = imgPosArr.slice();
      // 获取原始图片
      const { rect, circle, triangle, text } = imgPosArrCopy[index];

      setRectangles(rect);
      setCircles(circle);
      setTriangles(triangle);
      setTextContentArr(text);
    }
  };

  // 获取图片原始尺寸
  // const getSourceImgSize = (src: string) => {
  //   var image = new Image()
  //   image.src = src
  //   image.onload = function () {

  //   }
  // }

  // 回显图片信息  根据原图缩放比例
  const handleResetSizeInfo = (data: any) => {
    data.forEach((item: any) => {
      if (item.rect.length) {
        item.rect.forEach((val: any) => {
          if (!item?.scaleRatio?.w) return;
          val.x = Math.floor(val.x / item.scaleRatio.w);
          val.y = Math.floor(val.y / item.scaleRatio.h);
          val.width = Math.floor(val.width / item.scaleRatio.w);
          val.height = Math.floor(val.height / item.scaleRatio.h);
        });
      }
      if (item.circle.length) {
        item.circle.forEach((val: any) => {
          if (!item?.scaleRatio?.w) return;
          val.x = Math.floor(val.x / item.scaleRatio.w);
          val.y = Math.floor(val.y / item.scaleRatio.h);
          const biggerRatio = Math.max(item.scaleRatio.h, item.scaleRatio.w);
          // val.radius *= biggerRatio;
          // val.radius = Math.floor(val.radius / item.scaleRatio.w);
          val.radius = Math.floor(val.radius / biggerRatio);
        });
      }
      if (item.triangle.length) {
        item.triangle.forEach((val: any) => {
          if (!item?.scaleRatio?.w) return;
          val.x = Math.floor(val.x / item.scaleRatio.w);
          val.y = Math.floor(val.y / item.scaleRatio.h);
          val.width = Math.floor(val.width / item.scaleRatio.w);
          val.radius = Math.floor(val.radius / item.scaleRatio.w);
          val.height = Math.floor(val.height / item.scaleRatio.h);
        });
      }
      if (item.text.length) {
        item.text.forEach((val: any) => {
          if (!item?.scaleRatio?.w) return;
          val.x = Math.floor(val.x / item.scaleRatio.w);
          val.y = Math.floor(val.y / item.scaleRatio.h);
          val.width = Math.floor(val.width / item.scaleRatio.w);
          val.height = Math.floor(val.height / item.scaleRatio.h);
          val.fontSize = Math.floor(val.fontSize / item.scaleRatio.w);
        });
      }
    });
    return data;
  };
  useEffect(() => {
    if (imgList && imgList.length) {
      const imgPosArrRes: any = [];
      const emptyObj = {
        rect: [],
        circle: [],
        triangle: [],
        text: [],
      };
      imgList.forEach((item: any) => {
        imgPosArrRes.push(JSON.parse(item?.bbox || JSON.stringify(emptyObj)));
      });
      // todo 回显中间位置图形及文字信息
      const resImgList = handleResetSizeInfo(imgPosArrRes);
      setImgPosArr(resImgList);
      handleReRenderGraphic(1, true, resImgList);
    }
  }, []);

  // 添加每个图片对应原图的缩放信息
  const handleAddRatioInfo = (sourceWidth: number, sourceHeight: number, imgIndex: number) => {
    ratioArr[imgIndex] = {
      w: sourceWidth / (window.innerWidth * 0.5),
      h: sourceHeight / (window.innerHeight * 0.7),
    };
  };
  useEffect(() => {
    // 获取原始图片  默认显示中间
    if (bgImage1) {
      setSourceImg(bgImage1);
      handleAddRatioInfo(bgImage1?.naturalWidth, bgImage1?.naturalHeight, 1);
    }
    if (bgImage0) {
      handleAddRatioInfo(bgImage0?.naturalWidth, bgImage0?.naturalHeight, 0);
    }
    if (bgImage2) {
      handleAddRatioInfo(bgImage2?.naturalWidth, bgImage2?.naturalHeight, 2);
    }
  }, [bgImage0, bgImage1, bgImage2]);

  // 显示各位置图片图形信息

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target?.attrs?.height === window.innerHeight * 0.7;
    if (clickedOnEmpty) {
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
      width: 100,
      height: 100,
      fontSize: 20,
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
      id: `tri_${new Date().getTime()}`,
    });
    setTriangles(ret);
  };

  // 删除选中项图形或文字
  const handleDel = () => {
    setGraphicType('del');
    // 分别查找各图形类别下的id 删除
    const rectIndex = rectangles.findIndex((item) => item.id === selectedId);
    const textIndex = textContentArr.findIndex((item) => item.id === selectedId);
    const circleIndex = circles.findIndex((item) => item.id === selectedId);
    const triangleIndex = triangles.findIndex((item) => item.id === selectedId);

    let resArr = [];
    if (rectIndex > -1) {
      resArr = rectangles.slice();
      resArr.splice(rectIndex, 1);
      setRectangles(resArr);
    }

    if (textIndex > -1) {
      resArr = textContentArr.slice();
      resArr.splice(rectIndex, 1);
      setTextContentArr(resArr);
    }
    if (circleIndex > -1) {
      resArr = circles.slice();
      resArr.splice(circleIndex, 1);
      setCircles(resArr);
    }
    if (triangleIndex > -1) {
      resArr = triangles.slice();
      resArr.splice(triangleIndex, 1);
      setTriangles(resArr);
    }
  };

  const handleUpdateCheckStatus = () => {
    let isAllNormal = true;
    tabResList.forEach((item: any) => {
      if (item.resultKey !== 1) {
        isAllNormal = false;
      }
    });
    updateSpotStatus(isAllNormal);
  };

  const submit = async () => {
    // todo 更新 缩放比例相关后的数据
    base64Info[btnActIndex] = stageRef?.current?.toDataURL();
    const imgPosArrRes = imgPosArr.slice();
    imgPosArrRes[btnActIndex] = {
      rect: rectangles.slice(),
      circle: circles.slice(),
      triangle: triangles.slice(),
      text: textContentArr.slice(),
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
          // val.radius *= ratioArr[i].w;
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
      item.scaleRatio = ratioArr[i];
    });
    // console.log(imgPosArrRes, 'imgPosArrRes')

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
          const [res0, res] = base64Info[resIndex].split('data:image/png;base64,');
          console.log(res0);
          item.imgBase64 = res;
        }
      });
    }
    curPosGpsInfoRes.questionList = [...tabResList];

    const params = { ...curPosGpsInfoRes };
    const res = await saveCheck(params);
    if (res.status === 0) {
      // update 点位状态
      handleUpdateCheckStatus();
      message.success({
        content: '保存成功',
        key: '保存成功',
      });
      props.onCancel();
    }
  };

  const saveGraphicInfo = () => {
    // console.log(imgPosArr);
    base64Info[btnActIndex] = stageRef?.current?.toDataURL();
  };

  const handleToggleBtn = (index: number) => {
    // 保存当前位置的图形及文字
    const imgPosArrCopy = imgPosArr.slice();
    imgPosArrCopy[btnActIndex] = {
      rect: rectangles.slice(),
      circle: circles.slice(),
      triangle: triangles.slice(),
      text: textContentArr.slice(),
    };
    setImgPosArr(imgPosArrCopy);

    // todo 保存当前页面图形加图片 给后台
    saveGraphicInfo();

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
  const onTabChange = (key: string) => {
    console.log(key);
    setTabActIndex(key);
  };

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
        });
      } else {
        tabListArr.push({
          title: checkTypeMap[item.checkType],
          content: [
            {
              label: item.checkName,
              options: item.optionsList,
              value: item.optionsList[0],
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
    handleQueryAllCheck();

    return () => {
      base64Info = {};
      ratioArr = [
        { w: 1, h: 1 },
        { w: 1, h: 1 },
        { w: 1, h: 1 },
      ];
    };
  }, []);

  return (
    <Modal
      title={`隐患点位排查`}
      open={props.isShow}
      onCancel={() => props.onCancel()}
      onOk={() => submit()}
      className={`crtedtDev ${styles.spotCheckModal}`}
      destroyOnClose
      okText={'提交'}
      width={'80vw'}
    >
      <div className={styles.spotCheckWrapper}>
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
              width={window.innerWidth * 0.5}
              height={window.innerHeight * 0.7}
              onMouseDown={checkDeselect}
              onTouchStart={checkDeselect}
            >
              <Layer ref={layerRef}>
                {/* 背景图 */}
                <KonvaImg
                  image={sourceImg}
                  width={window.innerWidth * 0.5}
                  height={window.innerHeight * 0.7}
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
              </Layer>
            </Stage>
          </div>
          {/* 操作图层 */}
          <div className={styles.utilsLayer}>
            <div className={styles.graphicType}>
              <span
                onClick={() => handleAddRect()}
                className={
                  graphicType === 'rect' ? `${styles.graphicIcon} ${styles.startIcon}` : ''
                }
              >
                <AntdImg src={'images/rect.svg'} preview={false} height={14} width={14}></AntdImg>
              </span>
              <span
                onClick={() => handleAddCircle()}
                className={graphicType === 'circle' ? styles.graphicIcon : ''}
              >
                <AntdImg src={'images/circle.svg'} preview={false} height={14} width={14}></AntdImg>
              </span>
              <span
                onClick={() => handleAddTriangle()}
                className={graphicType === 'triangle' ? styles.graphicIcon : ''}
              >
                <AntdImg
                  className={styles.graphicIcon}
                  src={'images/triangle.svg'}
                  preview={false}
                  height={14}
                  width={14}
                ></AntdImg>
              </span>
              <span
                onClick={() => handleAddText()}
                className={graphicType === 'text' ? styles.graphicIcon : ''}
              >
                <AntdImg src={'images/text.svg'} preview={false} height={14} width={14}></AntdImg>
              </span>
              <span
                onClick={() => handleDel()}
                className={graphicType === 'del' ? `${styles.graphicIcon} ${styles.endIcon}` : ''}
              >
                <AntdImg src={'images/delete.svg'} preview={false} height={14} width={14}></AntdImg>
              </span>
            </div>

            {/* <div className={styles.delGraphic} onClick={() => handleDel()}>
              删除
            </div>
            <div className={styles.saveGraphic} onClick={() => handleSave()}>
              保存
            </div> */}
          </div>
        </div>
        <div className={styles.spotTypeTabs}>
          <Tabs activeKey={tabActIndex} onChange={(keyIndex: string) => onTabChange(keyIndex)}>
            {tabList.length > 0 &&
              tabList.map((item: any, index: number) => {
                return (
                  <Tabs.TabPane tab={item.title} key={index} className={styles.tabItemWrapper}>
                    <Form name={`form${index}`}>
                      {item.content.length > 0 &&
                        item.content.map((val: any, i: number) => {
                          return (
                            <Form.Item
                              label={val.label}
                              colon={false}
                              key={`${index}-${i}`}
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
                                      <Radio value={option} key={`${index}-${i}-${i2}`}>
                                        {plainOpsMap[option]}
                                      </Radio>
                                    );
                                  })}
                              </Radio.Group>
                            </Form.Item>
                          );
                        })}
                    </Form>
                  </Tabs.TabPane>
                );
              })}
          </Tabs>
        </div>
      </div>
    </Modal>
  );
};

export default EdtMod;
