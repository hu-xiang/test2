import React, { useEffect, useRef, useState } from 'react';
import { message, Spin } from 'antd';
import type { ModalFuncProps } from 'antd';
import { Modal } from 'antd';
import HeadForm from './HeadForm';
import type { HeadFormType } from './HeadForm';
import DiseaseList from './DiseaseList';
import WorkOrderDiseaseList from './WorkOrderDiseaseList';
import { addDisease, addOrder, editOrder, getWorkOrderId } from '@/services/ant-design-pro';
import './styles.less';

interface IProps {
  listItem?: HeadFormType;
  onOk?: ModalFuncProps['onOk'];
  onCancel?: ModalFuncProps['onCancel'];
}

const WorkOrderAddOrEdit: React.FC<IProps> = ({ listItem, onOk, onCancel }) => {
  const isEdit = !!listItem;
  const [orderId, setOrderId] = useState<string>(listItem?.id || '');
  const [addDiseaseVisible, setAddDiseaseVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [addDiseaseList, setAddDiseaseList] = useState<DiseaseListItem[]>([]);
  const diseaseRef = useRef<React.ElementRef<typeof DiseaseList>>(null);
  const workerOrderDiseaseRef = useRef<React.ElementRef<typeof WorkOrderDiseaseList>>(null);
  const headFormRef = useRef<React.ElementRef<typeof HeadForm>>(null);

  useEffect(() => {
    const init = async () => {
      if (isEdit) return;
      setLoading(true);
      const res = await getWorkOrderId();
      setLoading(false);
      setOrderId(res?.data || '');
    };
    init();
  }, [isEdit]);

  return (
    <Modal
      title={isEdit ? '编辑工单' : '新增工单'}
      maskClosable={false}
      open={true}
      onOk={async () => {
        const params = await headFormRef.current?.getParams();
        if (params) {
          params.id = orderId;
          const tableLength = workerOrderDiseaseRef.current?.getTableLength();
          if (!tableLength) {
            message.error({
              content: '请先添加病害列表',
              key: '请先添加病害列表',
            });
            return;
          }
          const res = isEdit ? await editOrder(params) : await addOrder(params);
          if (res.status === 0) {
            onOk?.();
          }
        }
      }}
      onCancel={onCancel}
      okText="提交"
      cancelText="取消"
      cancelButtonProps={{ size: 'large' }}
      okButtonProps={{ size: 'large' }}
      width={1010}
      wrapClassName="modalWrap"
    >
      <Spin spinning={loading} style={{ minHeight: '500px' }}>
        {!!orderId && (
          <>
            <HeadForm {...(listItem ? { listItem } : {})} ref={headFormRef} />

            <WorkOrderDiseaseList
              setAddDiseaseVisible={setAddDiseaseVisible}
              orderId={orderId}
              ref={workerOrderDiseaseRef}
            />
          </>
        )}
      </Spin>

      {addDiseaseVisible && (
        <Modal
          width={1010}
          title="添加病害"
          className="ant-modal-image-common"
          maskClosable={false}
          open={addDiseaseVisible}
          okText="提交"
          cancelText="取消"
          cancelButtonProps={{ size: 'large' }}
          okButtonProps={{ size: 'large' }}
          onCancel={() => {
            setAddDiseaseVisible(false);
          }}
          onOk={async () => {
            const keys = diseaseRef.current?.getSelects() as string[];

            const res = await addDisease({
              ids: keys,
              orderId,
            });

            if (res.status === 0) {
              setAddDiseaseVisible(false);
              workerOrderDiseaseRef.current?.reloadAndRestTable();
            }
          }}
          wrapClassName="modalWrap"
        >
          <DiseaseList ref={diseaseRef} />
        </Modal>
      )}
    </Modal>
  );
};

export default WorkOrderAddOrEdit;
