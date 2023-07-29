import { Form, Modal, Input } from 'antd';
import React, { useRef, useEffect } from 'react';
import { useModel, useHistory } from 'umi';
import styles from '../styles.less';
import CommonTable from '../../../../../components/CommonTable';
import { ReactComponent as LeftImg } from '../../../../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightImg } from '../../../../../assets/img/leftAndRight/rightImg.svg';

type Iprops = {
  showModal: boolean;
  onCancel: Function;
  onOk: Function;
  editInfo?: any;
  isMarkPage?: boolean;
  updateMarkURL?: Function;
};

const EdtMod: React.FC<Iprops> = (props) => {
  const {
    arrowVisible,
    arrowDisabled,

    setToLeftOrRight,
  } = useModel<any>('dataReport'); // arrowVisible, arrowDisabled,setToLeftOrRight与业务相关

  const formref = useRef<any>();
  const history = useHistory();

  useEffect(() => {
    if (props?.editInfo?.cameraId) {
      formref.current?.setFieldsValue({
        cameraId: props?.editInfo?.cameraId,
      });
      localStorage.setItem('external_flag_camera_id', props?.editInfo?.cameraId);
    } else {
      formref.current?.setFieldsValue({
        cameraId: localStorage.getItem('external_flag_camera_id'),
      });
    }
  }, []);

  const columns: any = [
    { title: '编号', key: 'id', width: 71, type: 'sort' },
    {
      title: '缩略图',
      key: 'imgUrl',
      width: 100,
      type: 'previewImage',
    },
    { title: '标定图片ID', key: 'imgId', width: 175 },
    { title: '抓拍时间', key: 'collectTime', width: 184 },

    {
      title: '操作',
      key: 'option',
      width: 94,
      type: 'operate',
      operateList: [
        {
          access: [],
          more: false,
          name: '标定',
          type: 'mark',
        },
      ],
    },
  ];
  const scroll = { x: 400, y: 400 };
  const ChildRef = useRef<any>();

  const getSelectedRows = () => {};
  const rowMethods = async (row: any, type: string) => {
    switch (type) {
      case 'mark':
        props.onCancel();
        localStorage.setItem('external_flag_rowInfo', JSON.stringify(row));
        if (!props.isMarkPage) {
          localStorage.setItem('external_flag_cameraId', JSON.stringify(props?.editInfo?.cameraId));
          history.push('/DeviceWarehouse/ExternalFlag');
        }
        if (props.updateMarkURL) {
          props.updateMarkURL(row.imgUrl);
        }
        break;

      default:
        break;
    }
  };
  const handleToDirection = (value: string) => {
    setToLeftOrRight(value);
  };
  return (
    <div>
      <div>
        {/* 左右切换按钮 */}
        {arrowVisible ? (
          <>
            <LeftImg
              className={`${styles.arrLeftIcon} ${styles.toggleIcon}
          ${arrowDisabled === 'left' ? styles.arrIconDisabled : ''}
          `}
              onClick={arrowDisabled === 'left' ? undefined : () => handleToDirection('left')}
            />

            <RightImg
              onClick={arrowDisabled === 'right' ? undefined : () => handleToDirection('right')}
              className={`${styles.arrRightIcon} ${styles.toggleIcon} ${
                arrowDisabled === 'right' ? styles.arrIconDisabled : ''
              }`}
            />
          </>
        ) : (
          ''
        )}
      </div>
      <Modal
        title={'标定图片库'}
        open={props.showModal}
        className={`${styles.crtedtDev} ${styles.markOuterModal}`}
        destroyOnClose
        onCancel={() => props.onCancel()}
        width={665}
        footer={null}
      >
        <div className="box">
          <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
            <Form.Item label="设备编号" name="cameraId">
              <Input autoComplete="off" placeholder="请输入设备编号" disabled />
            </Form.Item>
          </Form>
          <div>
            <CommonTable
              scroll={scroll}
              columns={columns}
              rowMethods={rowMethods}
              onRef={ChildRef}
              searchKey={{
                cameraId:
                  props?.editInfo?.cameraId || localStorage.getItem('external_flag_camera_id'),
              }}
              url="/traffic/camera/img/page"
              getSelectedRows={getSelectedRows}
              // method={'post'}
              pageName={'marker-outer-page'}
              diseImgPreview={true}
              isScroll={true}
              rowSelection={false}
              arrowShow={false}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EdtMod;
