import React, { useRef, useState, useEffect } from 'react';
import { Card, Modal, Form, Input, Select } from 'antd';
import '../style.css';
import styles from '../styles.less';
import roadImg from '@/assets/img/road1/img1/1.jpg';
// import { getImgInfo, handleSelected, endSelected } from '../imgSelectArea';
const { Option } = Select;

const Context: React.FC = () => {
  const coverRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [areaHeight, setAreaHeight] = useState(0);
  const [areaWidth, setAreaWidth] = useState(0);
  const [areaTop, setAreaTop] = useState(0);
  const [areaLeft, setAreaLeft] = useState(0);
  const [mouseDown, setMouseDown] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [area, setArea] = useState(0);

  useEffect(() => {
    setImgWidth(((imgRef.current?.offsetHeight || 0) * 2048) / 2000);
    setImgHeight(imgRef.current?.offsetHeight || 0);
  }, []);

  const getImgInfo = (event: any) => {
    if (areaHeight > 0 && areaWidth > 0) {
      setAreaHeight(0);
      setAreaWidth(0);
    }

    const clientRect = event.target.getBoundingClientRect();
    // console.log(clientRect, event.target.parentNode.offsetWidth, imgRef.current?.offsetWidth);
    const nowOffsetX = event.clientX - clientRect.left;
    const nowOffsetY = event.clientY - clientRect.top;
    setMouseDown(true);
    setOffsetX(nowOffsetX);
    setOffsetY(nowOffsetY);
    setAreaLeft(nowOffsetX);
    setAreaTop(nowOffsetY);
  };
  const handleSelected = (event: any) => {
    if (mouseDown) {
      setAreaHeight(0);
      setAreaWidth(0);
      const clientRect = event.target.getBoundingClientRect();
      const nowOffsetX = event.clientX - clientRect.left;
      const nowOffsetY = event.clientY - clientRect.top;

      setAreaTop(Math.min(nowOffsetY, offsetY));
      setAreaLeft(Math.min(nowOffsetX, offsetX));

      setAreaHeight(Math.abs(nowOffsetY - offsetY));
      setAreaWidth(Math.abs(nowOffsetX - offsetX));
    }
  };
  const endSelected = () => {
    setMouseDown(false);
    if (areaHeight > 5 && areaWidth > 5) {
      const areaVal =
        (2 / 2048) * areaWidth * (areaHeight * (2 / 2000)) * (2000 / imgHeight) * (2048 / imgWidth);

      setArea(areaVal);
      setIsModalVisible(true);
    }
  };
  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className={`${styles.bgwhite} ${styles.border}`}>
      {/* 中间滚动图 */}
      <Card
        type="inner"
        bodyStyle={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: 0,
          paddingBottom: 10,
        }}
        title="统计分析"
      >
        <div
          className="img-hover"
          style={{ width: imgWidth, height: imgHeight }}
          onMouseDown={(event) => getImgInfo(event)}
          onMouseMove={(event) => handleSelected(event)}
          onMouseUp={() => endSelected()}
        >
          <div
            className="tempDiv"
            ref={coverRef}
            style={{ height: areaHeight, width: areaWidth, left: areaLeft, top: areaTop }}
          />
        </div>
        <img src={roadImg} height="784" ref={imgRef} />
      </Card>
      <Modal title="Basic Modal" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form name="basic" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} autoComplete="off">
          <Form.Item label="病害名称">
            <Select defaultValue="jack">
              <Option value="jack">横向裂缝</Option>
              <Option value="lucy">纵向裂缝</Option>
              <Option value="jack2">条状修补</Option>
              <Option value="lucy2">块状修补</Option>
              <Option value="lucy3">龟裂</Option>
              <Option value="lucy4">其它</Option>
            </Select>
          </Form.Item>

          <Form.Item label="长度(m)/面积(㎡)">
            <Input readOnly value={area} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default Context;
