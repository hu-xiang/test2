import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.less';
import { Upload, Button, Input, Row, message, Form } from 'antd';

import { useHistory } from 'umi';
import { getArea, outParam, exportParam, uploadFile } from '../DeviceList/camera/service';

import { exportCom } from '../../../utils/exportCom';
import { ReactComponent as ListBack } from '../../../assets/img/backDisease/back.svg';
import FlagCanvas from './components/FlagCanvas';
import MarkOuter from '../DeviceList/camera/components/MarkOuter';

export default (): React.ReactElement => {
  const history: any = useHistory();

  const ChildRef = useRef<any>();
  const formref = useRef<any>();

  const [markOuterShow, setMarkOuterShow] = useState(false);
  const [outerPosList, setOuterPosList] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [markURL, setMarkURL] = useState('');

  const PREVIEW_IMG_URL = JSON.parse(localStorage.getItem('external_flag_rowInfo') || '{}')?.imgUrl;

  useEffect(() => {
    if (PREVIEW_IMG_URL) {
      setMarkURL(PREVIEW_IMG_URL);
    }
  }, [PREVIEW_IMG_URL]);

  useEffect(() => {
    formref.current.setFieldsValue({
      cameraOrigin: 1500,
      markWidth: 1400,
      markHeight: 1000,
    });
  }, []);

  const handleOuterParams = async () => {
    const list: any = ChildRef.current.pointPosList;

    if (!list.length || (list.length > 0 && list.length % 4 !== 0)) {
      message.warning({
        content: '计算外参失败，仅支持4个或4的倍数的标点',
        key: '计算外参失败，仅支持4个或4的倍数的标点',
      });
      return;
    }
    const res = list.map((item: any) => `(${item.x}, ${item.y})`);
    setOuterPosList(res.join(','));

    const imagePoints = list.map((item: any) => {
      return { X: item.x, Y: item.y };
    });
    const rowInfo = JSON.parse(localStorage.getItem('external_flag_rowInfo') || '{}');
    const cameraId = JSON.parse(localStorage.getItem('external_flag_cameraId') || '');
    const formList = formref.current.getFieldsValue();
    const { markHeight, markWidth, cameraOrigin } = formList;
    const params = {
      boardHeight: markHeight,
      boardWidth: markWidth,
      cameraId,
      imagePoints,
      imgId: rowInfo.imgId,
      offset: cameraOrigin,
    };
    const ret = await outParam(params);
    if (ret.status === 0) {
      message.success({
        content: '计算外参成功',
        key: '计算外参成功',
      });
    }
  };

  const handleTestParams = async () => {
    const list: any = ChildRef.current.pointPosList;
    if (list.length !== 2) {
      message.warning({
        content: '测试失败，仅支持2个标点',
        key: '测试失败，仅支持2个标点',
      });
      return;
    }

    const rowInfo = JSON.parse(localStorage.getItem('external_flag_rowInfo') || '{}');
    const params = {
      // deviceId: `${rowInfo.deviceId}${rowInfo.channelId || ''}`,
      imgId: rowInfo.imgId || '',
      leftX: list[0].x > list[1].x ? list[1].x : list[0].x,
      leftY: list[0].x > list[1].x ? list[1].y : list[0].y,
      rightX: list[0].x > list[1].x ? list[0].x : list[1].x,
      rightY: list[0].x > list[1].x ? list[0].y : list[1].y,
    };
    const res = await getArea(params);
    if (res.status === 0) {
      message.success({
        content: '测试成功',
        key: '测试成功',
      });
      const formList = formref.current.getFieldsValue();
      const { markHeight, markWidth } = formList;
      ChildRef.current.handleTest(res.data.area || 0, markWidth, markHeight);
    }
  };

  const handleExport = async () => {
    const rowInfo = JSON.parse(localStorage.getItem('external_flag_rowInfo') || '{}');
    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });

    const res = await exportParam({ imgId: rowInfo.imgId, cameraId: rowInfo.cameraId });
    hide();

    exportCom(res, undefined, 'application/octet-stream');
    message.success({
      content: '导出成功',
      key: '导出成功',
    });
  };

  const beforeUploads = (fileinfos: any) => {
    const cameraId = JSON.parse(localStorage.getItem('external_flag_cameraId') || '');
    const rowInfo = JSON.parse(localStorage.getItem('external_flag_rowInfo') || '{}');
    const reader = new FileReader();
    reader.readAsDataURL(fileinfos);
    reader.onload = async () => {
      const formData = new FormData();
      formData.append('file', fileinfos);
      formData.append('cameraId', cameraId);
      formData.append('imgId', rowInfo.imgId);
      try {
        const res = await uploadFile(formData);
        if (res.status === 0) {
          message.success('导入成功');
        }
        return false;
      } catch (error) {
        return false;
      }
    };
    return false;
  };

  return (
    <div className={styles.externalFlag}>
      <div
        className={styles.backContent}
        onClick={() => {
          localStorage.setItem('back_to_camera_tab', 'true');
          history.push('/DeviceWarehouse/DeviceList');
        }}
      >
        <ListBack />
        <div className={styles.backText}>返回列表</div>
      </div>
      <div className={styles.externalHeader}>
        <Row wrap={false}>
          <Button
            type="primary"
            style={{ marginRight: '20px' }}
            onClick={() => {
              setMarkOuterShow(true);
            }}
          >
            选择图片
          </Button>
          <Button
            style={{ marginRight: '20px' }}
            onClick={() => {
              setIsFullScreen(true);
            }}
          >
            放大
          </Button>
          <Button
            style={{ marginRight: '20px' }}
            onClick={() => {
              setOuterPosList([]);
              ChildRef.current.clearCanvas();
            }}
          >
            清除
          </Button>
          <Input
            autoComplete="off"
            placeholder="标点坐标"
            defaultValue={'(905,1201),(1013,1337),(1230,1261),(1036,1211)'}
            style={{ maxWidth: '462px', marginRight: '20px' }}
            value={outerPosList}
          />
          <Button
            style={{ marginRight: '20px' }}
            onClick={() => {
              formref.current.validateFields().then(async () => {
                handleOuterParams();
              });
            }}
          >
            计算外参
          </Button>
          <Button style={{ marginRight: '20px' }} onClick={() => handleTestParams()}>
            测试
          </Button>
          <Upload showUploadList={false} beforeUpload={beforeUploads} maxCount={1}>
            <Button style={{ marginRight: '20px' }} onClick={() => {}}>
              导入
            </Button>{' '}
          </Upload>
          <Button
            style={{ marginRight: '20px' }}
            onClick={() => {
              handleExport();
            }}
          >
            导出
          </Button>
        </Row>
        <Row wrap={false} style={{ marginTop: '20px' }}>
          <Form ref={formref} colon={false} layout="inline">
            <Form.Item
              label="摄像头与GPS距离(mm)"
              name="cameraOrigin"
              rules={[
                {
                  required: true,
                  max: 32,
                  message: '请输入正整数值的摄像头与GPS距离',
                  pattern: /^[\d]+$/,
                },
              ]}
            >
              <Input defaultValue={1500} autoComplete="off" placeholder="摄像头与GPS距离(mm)" />
            </Form.Item>
            <Form.Item
              label="标定布宽(mm)"
              name="markWidth"
              rules={[
                {
                  required: true,
                  max: 32,
                  message: '请输入正整数值的标定布宽',
                  pattern: /^[\d]+$/,
                },
              ]}
            >
              <Input defaultValue={1400} autoComplete="off" placeholder="标定布宽(mm)" />
            </Form.Item>
            <Form.Item
              label="标定布高(mm)"
              name="markHeight"
              rules={[
                {
                  required: true,
                  max: 32,
                  message: '请输入正整数值的标定布高',
                  pattern: /^[\d]+$/,
                },
              ]}
            >
              <Input defaultValue={1000} autoComplete="off" placeholder="标定布高(mm)" />
            </Form.Item>
          </Form>
        </Row>
      </div>
      <div className={`scroll-class ${isFullScreen ? styles.fullScreen : styles.externalMark} `}>
        {isFullScreen && (
          <Button
            className={styles.closeBtn}
            onClick={() => {
              setIsFullScreen(false);
            }}
          >
            退出全屏
          </Button>
        )}
        <FlagCanvas
          onRef={ChildRef}
          setImgUrl={() => {
            // console.log(url);
          }}
          data={{
            imgUrl: markURL,
          }}
        />
      </div>
      {markOuterShow ? (
        <MarkOuter
          onOk={() => {}}
          showModal={markOuterShow}
          isMarkPage={true}
          updateMarkURL={(url: string) => {
            setMarkURL(url);
          }}
          onCancel={() => {
            setMarkOuterShow(false);
          }}
        />
      ) : null}
    </div>
  );
};
