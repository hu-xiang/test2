import { Modal, Image as AntdImg } from 'antd';
import { useEffect, useState, useRef } from 'react';
import styles from './styles.less';
import { useModel } from 'umi';

import { Stage, Layer, Image as KonvaImg } from 'react-konva';
import useImage from 'use-image';

import Rectangle from './CustomRect';

type Iprops = {
  isShow?: boolean;
  onCancel: () => void;
  file: any;
  onOk: Function;
  isEdit?: boolean;
};

const MarkPic: React.FC<Iprops> = (props) => {
  const [sourceImg, setSourceImg] = useState<any>();
  const stageRef = useRef<any>();
  const layerRef = useRef<any>();

  const [rectangles, setRectangles] = useState<any[]>([]); // 矩形
  const [selectedId, setSelectedId] = useState<any>(null);
  const [graphicType, setGraphicType] = useState<string>('');
  const { fileName } = useModel<any>('file');

  const [bgImage]: any = useImage(props?.file, 'anonymous'); // url

  // 获取原始图片
  useEffect(() => {
    if (bgImage) {
      setSourceImg(bgImage);
    }
  }, [bgImage]);

  // 显示各位置图片图形信息

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target?.attrs?.height === window.innerHeight * 0.7;
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
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
  // 删除选中项图形或文字
  const handleDel = () => {
    setGraphicType('del');
    // 分别查找各图形类别下的id 删除
    const rectIndex = rectangles.findIndex((item) => item.id === selectedId);

    let resArr = [];
    if (rectIndex > -1) {
      resArr = rectangles.slice();
      resArr.splice(rectIndex, 1);
      setRectangles(resArr);
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    // 获取到base64编码
    const arr = dataurl.split(',');
    // 将base64编码转为字符串
    const bstr = window.atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n); // 创建初始化为0的，包含length个元素的无符号整型数组
    /* eslint no-plusplus: 0 */
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {
      type: 'image/jpeg',
    });
  };

  const submit = async () => {
    const url = stageRef?.current?.toDataURL();
    const res = dataURLtoFile(url, fileName);
    props.onOk(res);
  };

  return (
    <Modal
      title={props.isEdit ? `图片查看` : '图片标记'}
      open={props.isShow}
      onCancel={() => props.onCancel()}
      onOk={() => submit()}
      className={`crtedtDev ${styles.spotCheckModal}`}
      destroyOnClose
      okText={'提交'}
      width={960}
      bodyStyle={{ minWidth: '960px' }}
      footer={props.isEdit ? null : undefined}
    >
      <div className={styles.spotCheckWrapper}>
        <div className={styles.sourceImg}>
          {/* 相关canvas图层 */}
          <div className={`${styles.canvasWrapper} stageWrapper`}>
            <Stage
              ref={stageRef}
              width={960}
              height={window.innerHeight * 0.7}
              onMouseDown={checkDeselect}
              onTouchStart={checkDeselect}
              // style={props.isEdit? {paddingBottom: '20px'} : {}}
            >
              <Layer ref={layerRef}>
                {/* 背景图 */}
                <KonvaImg image={sourceImg} width={960} height={window.innerHeight * 0.7} />

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
              </Layer>
            </Stage>
          </div>
          {/* 操作图层 */}
          {!props.isEdit && (
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
                  onClick={() => handleDel()}
                  className={graphicType === 'del' ? `${styles.graphicIcon} ${styles.endIcon}` : ''}
                >
                  <AntdImg
                    src={'images/delete.svg'}
                    preview={false}
                    height={14}
                    width={14}
                  ></AntdImg>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MarkPic;
