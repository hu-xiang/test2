import React, { useState, useEffect } from 'react';
import styles from './styles.less';
import { Button, Space, message, Modal, Table, Tooltip } from 'antd';
import { fetchTree, delpart } from './service';
import CrtPart from './component/crtpart';
import { useAccess } from 'umi';
import EdtPart from './component/edtpart';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

export default (): React.ReactElement => {
  const [treedata, setTreedata] = useState([]);
  const [crtupartshow, setCrtupartshow] = useState(false);
  const [edtpartshow, setEdtpartshow] = useState(false);
  const [partedtinfo, setPartedtinfo] = useState({});
  const [loading, setLoading] = useState(true);
  const access: any = useAccess();

  const editoldpart = (text: any) => {
    setPartedtinfo(text);
    setEdtpartshow(true);
  };

  const convertData = (data: any) => {
    const datalen = data.length;
    const info = data;
    info.forEach((item: any, index: any) => {
      info[index] = { ...item, title: item.label, key: item.id };
      if (item.children) {
        convertData(item.children);
      }
    });
    if (data.length && datalen === data.length) {
      setTreedata(info);
    }
  };

  const parttree = async () => {
    const res = await fetchTree();
    convertData(res);
    setLoading(false);
  };

  const deloldpart = (text: any) => {
    confirm({
      title: '部门将删除，是否继续?',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const res = await delpart(text.id);
          parttree();
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
          }
          // else {
          //   message.error({
          //     content: res.message,
          //     key: res.message,
          //   });
          // }
          return true;
        } catch (error) {
          hide();
          message.error({
            content: '删除失败!',
            key: '删除失败!',
          });
          return false;
        }
      },
      onCancel() {},
    });
  };

  const column: any = [
    {
      title: '名称',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: '机构类型',
      dataIndex: 'deptType',
      key: 'deptType',
    },
    {
      title: '描述',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      ellipsis: true,
      render: (text: any) => {
        return (
          <Tooltip placement="topLeft" title={text}>
            <span>{text}</span>
          </Tooltip>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (text: any) => (
        <Space size="middle">
          {access['groupManager:btn_edit'] ? (
            <a className="ahover" onClick={() => editoldpart(text)}>
              编辑
            </a>
          ) : null}
          {access['groupManager:btn_del'] && !text.children?.length ? (
            <a className="ahover" onClick={() => deloldpart(text)}>
              删除
            </a>
          ) : null}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    parttree();
  }, []);

  return (
    <div id={styles.container}>
      <div className={styles.usertop}>
        <div className={styles.usertopsel}>
          {access['groupManager:btn_add'] ? (
            <Button className={'buttonClass'} type="primary" onClick={() => setCrtupartshow(true)}>
              新增部门
            </Button>
          ) : null}
        </div>
      </div>
      <div className="usertable">
        <Table
          columns={column}
          // className="table-dep"
          dataSource={treedata}
          pagination={false}
          loading={loading}
          scroll={{ y: '100vh - 100px', x: 900 }}
          expandable={{
            expandRowByClick: false,
          }}
        />
      </div>
      {crtupartshow ? (
        <CrtPart
          crtupartshow={crtupartshow}
          treedata={treedata}
          onCancel={() => setCrtupartshow(false)}
          onupd={parttree}
        />
      ) : null}
      {edtpartshow ? (
        <EdtPart
          edtpartshow={edtpartshow}
          onCancel={() => setEdtpartshow(false)}
          partedtinfo={partedtinfo}
          treedata={treedata}
          onupd={parttree}
        />
      ) : null}
    </div>
  );
};
