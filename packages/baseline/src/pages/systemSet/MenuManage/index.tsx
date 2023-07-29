import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.less';
import { Input, Button, Card, Row, Select, Space, message, Modal, Tree } from 'antd';
import ProTable from '@ant-design/pro-table';
import { fetchTree, getmenuinfo, btnlist, edtnewtmenu, delmenu, delmenubtn } from './service';
import AddBtn from './conponent/addbtn';
import EdtBtn from './conponent/edtbtn';
import { useAccess } from 'umi';
import CrtMenu from './conponent/crtmenu';
import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useScrollObj } from '../../../utils/tableScrollSet';

const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

export type Member = {
  avatar: string;
  realName: string;
  nickName: string;
  email: string;
  outUserNo: string;
  phone: string;
  permission?: string[];
};

export default (): React.ReactElement => {
  const [treelist, setTreelist] = useState([]);
  const [inpshow, setInpshow] = useState(true);
  const [inpctrshow, setInpctrshow] = useState(false);
  const [menuinfo, setMenuinfo] = useState<any>({});
  const [ids, setIds] = useState<any>(null);
  const [datalist, setDatalist] = useState({});
  const [addbtnshow, setAddbtnshow] = useState(false);
  const [edtbtnshow, setEdtbtnshow] = useState(false);
  const [btninfo, setBtninfo] = useState({});
  const [keywords, setKeywords] = useState<any>();
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [dataLists, setDataLists] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [seledid, setSeledid] = useState<any>([]);
  const [edtbut, setedtbut] = useState(true);
  const [tableData, setTableData] = useState([]);
  const scrollObj = useScrollObj(tableData, { x: 1000, y: 'calc(100vh - 480px)' });
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);

  const ref = useRef<any>();
  const actionRef = useRef<any>();
  const access: any = useAccess();

  const changekey = (e: any) => {
    setKeywords(e.trim());
    setSearchPage(1);
    actionRef.current.reload();
  };

  const getmenutree = async () => {
    const res = await fetchTree();
    const dataList: any = [];
    const generateList = (data: any) => {
      for (let i = 0; i < data.length; i += 1) {
        const node = data[i];
        const titles = node.title;
        const { id } = node;
        dataList.push({ key: id, title: titles });
        if (node.children.length) {
          generateList(node.children);
        }
      }
      setDataLists(dataList);
    };
    if (res.length !== 0) {
      generateList(res);
    }
    setTreelist(res);
  };

  const updatatab = () => {
    actionRef.current.reload();
  };

  useEffect(() => {
    getmenutree();
  }, []);

  const editshow = (text: any) => {
    setEdtbtnshow(true);
    setBtninfo(text);
  };

  const delbtns = async (text: any) => {
    confirm({
      title: '将进行删除操作，是否继续?',
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
          const res = await delmenubtn(text.id);
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            updatatab();
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
      title: '序号',
      key: 'userId',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
      // `${(tabpage - 1) * tabpagesize + (index + 1)}`,
      width: 60,
    },
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      ellipsis: true,
    },
    {
      title: '资源编码',
      dataIndex: 'code',
      key: 'code',
      ellipsis: true,
      width: 200,
    },
    {
      title: '资源类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: '资源名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true,
    },
    {
      title: '资源地址',
      dataIndex: 'uri',
      key: 'uri',
      width: 200,
      ellipsis: true,
    },
    {
      title: '资源请求类型',
      dataIndex: 'method',
      key: 'method',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 140,
      render: (text: any) => (
        <Space size="middle">
          {access['menuManager/index:btn_element_edit'] ? (
            <a className="ahover" onClick={() => editshow(text)}>
              编辑
            </a>
          ) : null}
          {access['menuManager/index:btn_element_del'] ? (
            <a className="ahover" onClick={() => delbtns(text)}>
              删除
            </a>
          ) : null}
        </Space>
      ),
    },
  ];

  const getinpmenuinfo = async (val: any) => {
    const res = await getmenuinfo(val);
    setMenuinfo(res.data);
  };

  const menuclick = async (key: any) => {
    if (key.length === 0) {
      setIds(null);
      setMenuinfo({});
      setedtbut(true);
    } else {
      setIds(key);
      getinpmenuinfo(key);
      setedtbut(false);
    }
  };

  const editinp = () => {
    if (Object.keys(menuinfo).length) {
      setInpshow(false);
    }
  };

  const subupdatamune = async () => {
    const obj = menuinfo;
    if (Object.keys(datalist).length) {
      Object.keys(datalist).forEach((key: any) => {
        obj[key] = datalist[key];
      });
    }

    try {
      const res = await edtnewtmenu(ids, obj);
      if (res.status === 0) {
        message.success({
          content: '更新成功',
          key: '更新成功',
        });
        getinpmenuinfo(ids);
        const rese = await fetchTree();
        setTreelist(rese);
        setInpshow(true);
      }
      // else {
      //   message.error({
      //     content: res.message,
      //     key: res.message,
      //   });
      // }
    } catch (error) {
      message.error({
        content: '更新失败!',
        key: '更新失败!',
      });
    }
  };

  const crtmenu = () => {
    if (ids) {
      setMenuinfo({
        ...menuinfo,
        parentId: ids.toString(),
      });
    } else {
      setMenuinfo({
        ...menuinfo,
        parentId: -1,
      });
    }
    setTimeout(() => {
      setInpctrshow(true);
    }, 0);
  };

  const inputChange = (e: any, item: string) => {
    setDatalist({ ...datalist, [item]: e.target.value?.trim() });
    setMenuinfo({ ...menuinfo, [item]: e.target.value?.trim() });
  };
  // const inpchamge1 = (e: any) => {
  //   setDatalist({ ...datalist, code: e.target.value?.trim() });
  //   setMenuinfo({ ...menuinfo, code: e.target.value?.trim() });
  // };
  // const inpchamge2 = (e: any) => {
  //   setDatalist({ ...datalist, title: e.target.value?.trim() });
  //   setMenuinfo({ ...menuinfo, title: e.target.value?.trim() });
  // };
  // const inpchamge3 = (e: any) => {
  //   setDatalist({ ...datalist, parentId: e.target.value?.trim() });
  //   setMenuinfo({ ...menuinfo, parentId: e.target.value?.trim() });
  // };
  // const inpchamge4 = (e: any) => {
  //   setDatalist({ ...datalist, icon: e.target.value?.trim() });
  //   setMenuinfo({ ...menuinfo, icon: e.target.value?.trim() });
  // };
  // const inpchamge5 = (e: any) => {
  //   setDatalist({ ...datalist, href: e.target.value?.trim() });
  //   setMenuinfo({ ...menuinfo, href: e.target.value?.trim() });
  // };
  const inpchamge6 = (e: any) => {
    setDatalist({ ...datalist, type: e });
    setMenuinfo({ ...menuinfo, type: e });
  };
  // const inpchamge7 = (e: any) => {
  //   setDatalist({ ...datalist, orderNum: e.target.value?.trim() });
  //   setMenuinfo({ ...menuinfo, orderNum: e.target.value?.trim() });
  // };
  // const inpchamge8 = (e: any) => {
  //   setDatalist({ ...datalist, description: e.target.value?.trim() });
  //   setMenuinfo({ ...menuinfo, description: e.target.value?.trim() });
  // };
  // const inpchamge9 = (e: any) => {
  //   setDatalist({ ...datalist, attr1: e.target.value?.trim() });
  //   setMenuinfo({ ...menuinfo, attr1: e.target.value?.trim() });
  // };

  const delmenuclik = async () => {
    confirm({
      title: '将进行删除操作，是否继续?',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        if (!ids) {
          message.error({
            content: '请选择要删除的菜单项',
            key: '请选择要删除的菜单项',
          });
          return false;
        }
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const resw = await delmenu(ids);
          hide();
          if (resw.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            setMenuinfo({});
            getmenutree();
          }
          // else {
          //   message.error({
          //     content: resw.message,
          //     key: resw.message,
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

  // const reqErr = () => {
  //   message.error({
  //     content: '查询失败!',
  //     key: '查询失败!',
  //   });
  // };

  const getParentKey = (key: any, tree: any) => {
    let parentKey: any;
    for (let i = 0; i < tree.length; i += 1) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item: any) => item.id === key)) {
          parentKey = node.id;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  const loop = (data: any) =>
    data.map((item: any) => {
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <span className="site-tree-search-value">{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{item.title}</span>
        );
      if (item.children) {
        return { title, key: item.id, children: loop(item.children) };
      }
      return {
        title,
        key: item.id,
      };
    });

  const onChangeval = (e: any) => {
    const { value } = e.target;
    if (dataLists.length !== 0) {
      const expandedKey: any = dataLists
        .map((item: any) => {
          if (item.title.indexOf(value) > -1) {
            setSeledid([item.key]);
            return getParentKey(item.key, treelist);
          }
          return null;
        })
        .filter((item: any, i: any, self: any) => item && self.indexOf(item) === i);
      setExpandedKeys(expandedKey);
      setAutoExpandParent(true);
      setSearchValue(value);
    }
  };

  const onExpand = (exKeys: any) => {
    setExpandedKeys(exKeys);
    setAutoExpandParent(false);
  };

  const outcli = (e: any) => {
    if (e.target.contains(ref.current)) {
      setIds(null);
      setMenuinfo({});
      setedtbut(true);
      setInpshow(true);
    }
  };
  const canceledit = () => {
    setInpshow(true);
    getinpmenuinfo(ids);
  };
  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
      setTabpage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
  };
  const onLoad = (dataSource: any) => {
    if (!dataSource?.length) {
      if (searchPage > 1) {
        setSearchPage(searchPage - 1);
      } else {
        setSearchPage(1);
      }
    }
    if (tableData.length !== dataSource.length) {
      setTableData(dataSource);
    }
  };
  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  //   // setTabpagesize(pageSize);
  // };
  return (
    <div id={styles.container}>
      {/* <div className={styles.menutop}>
        <div className={styles.menutopsel}></div>
      </div> */}
      <div className={styles.menucon}>
        <Row gutter={16}>
          <div className={styles.colCss1}>
            <Card className={`menucardleft ${styles.btnwrap}`} title="菜单栏">
              <div className={styles.btnbox}>
                {access['menuManager/index:btn_del'] ? (
                  <Button
                    disabled={!ids?.length}
                    className={styles.treebtn1}
                    onClick={() => delmenuclik()}
                  >
                    -
                  </Button>
                ) : null}
                {access['menuManager/index:btn_add'] ? (
                  <Button className={styles.treebtn2} onClick={() => crtmenu()}>
                    +
                  </Button>
                ) : null}
              </div>
              <div onClick={(e) => outcli(e)} className={styles.treebox} style={{ height: '100%' }}>
                <Input
                  className={styles.inpsels}
                  placeholder="请输入关键词过滤菜单栏"
                  onChange={onChangeval}
                  suffix={<SearchOutlined className="input-search" />}
                />
                <div ref={ref}>
                  <Tree
                    blockNode={true}
                    autoExpandParent={autoExpandParent}
                    expandedKeys={expandedKeys}
                    onExpand={onExpand}
                    defaultSelectedKeys={seledid}
                    treeData={loop(treelist)}
                    onSelect={menuclick}
                    selectedKeys={ids}
                  />
                </div>
              </div>
              {inpctrshow ? (
                <CrtMenu
                  menuinfo={menuinfo.id}
                  menuId={ids}
                  inpctrshow={inpctrshow}
                  getmenutree={getmenutree}
                  onCancel={() => setInpctrshow(false)}
                />
              ) : null}
            </Card>
          </div>
          <div className={`${styles.menucardrightbox} ${styles.colCss2}`}>
            <div className={styles.menucardbox}>
              <Card className={`menucardtop`}>
                <div className={styles.menucardtoptop}>
                  <div className={styles.menucardtoptext}>菜单内容</div>
                  <div className={styles.menucardtopbtn}>
                    {!inpshow && ids?.length ? (
                      <div>
                        <Button className="head-button" onClick={canceledit}>
                          取消
                        </Button>
                        <Button className="head-btn-primary" onClick={() => subupdatamune()}>
                          提交
                        </Button>
                      </div>
                    ) : null}
                    {(inpshow || !ids?.length) && access['menuManager/index:btn_edit'] ? (
                      <Button
                        disabled={edtbut || !ids}
                        className="head-button"
                        onClick={() => editinp()}
                      >
                        编辑
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className={`${styles.menucardtopbottom}`} style={{}}>
                  <div className={styles.cardtopinpbox}>
                    <div className={styles.cardtopinptext}>路径编码</div>
                    <Input
                      onChange={(e) => inputChange(e, 'code')}
                      disabled={inpshow || !ids?.length}
                      value={menuinfo.code}
                      placeholder="请输入路径编码"
                      allowClear
                      className={styles.inpw}
                    />
                  </div>
                  <div className={styles.cardtopinpbox}>
                    <div className={styles.cardtopinptext}>标题</div>
                    <Input
                      disabled={inpshow || !ids?.length}
                      onChange={(e) => inputChange(e, 'title')}
                      value={menuinfo.title}
                      placeholder="请输入标题"
                      allowClear
                      className={styles.inpw}
                    />
                  </div>
                  <div className={styles.cardtopinpbox}>
                    <div className={styles.cardtopinptext}>父级节点</div>
                    <Input
                      disabled={inpshow || !ids?.length}
                      value={menuinfo.parentId}
                      placeholder="请输入父级节点"
                      allowClear
                      onChange={(e) => inputChange(e, 'parentId')}
                      className={styles.inpw}
                    />
                  </div>
                  <div className={styles.cardtopinpbox}>
                    <div className={styles.cardtopinptext}>图标</div>
                    <Input
                      disabled={inpshow || !ids?.length}
                      value={menuinfo.icon}
                      placeholder="请输入图标"
                      allowClear
                      onChange={(e) => inputChange(e, 'icon')}
                      className={styles.inpw}
                    />
                  </div>
                  <div className={styles.cardtopinpbox}>
                    <div className={styles.cardtopinptext}>资源路径</div>
                    <Input
                      disabled={inpshow || !ids?.length}
                      value={menuinfo.href}
                      placeholder="请输入资源路径"
                      allowClear
                      className={styles.inpw}
                      onChange={(e) => inputChange(e, 'href')}
                    />
                  </div>
                  <div className={styles.cardtopinpbox}>
                    <div className={styles.cardtopinptext}>资源请求类型</div>
                    <Select
                      disabled={inpshow || !ids?.length}
                      value={menuinfo.type}
                      placeholder="请选择资源请求类型"
                      allowClear
                      onChange={(e) => inpchamge6(e)}
                      className={styles.inpw}
                    >
                      <Option value="menu">menu</Option>
                      <Option value="dirt">dirt</Option>
                    </Select>
                  </div>
                  <div className={styles.cardtopinpbox}>
                    <div className={styles.cardtopinptext}>排序</div>
                    <Input
                      disabled={inpshow || !ids?.length}
                      value={menuinfo.orderNum}
                      placeholder="请输入排序"
                      allowClear
                      onChange={(e) => inputChange(e, 'orderNum')}
                      className={styles.inpw}
                    />
                  </div>
                  <div className={styles.cardtopinpbox}>
                    <div className={styles.cardtopinptext}>描述</div>
                    <Input
                      disabled={inpshow || !ids?.length}
                      value={menuinfo.description}
                      placeholder="请输入描述"
                      allowClear
                      onChange={(e) => inputChange(e, 'description')}
                      className={styles.inpw}
                    />
                  </div>
                  <div className={styles.cardtopinpbox}>
                    <div className={styles.cardtopinptext}>前端组件</div>
                    <Input
                      disabled={inpshow || !ids?.length}
                      value={menuinfo.attr1}
                      placeholder="请输入前端组件"
                      allowClear
                      className={styles.inpw}
                      onChange={(e) => inputChange(e, 'attr1')}
                    />
                  </div>
                </div>
              </Card>
              <Card className="menucardbottom" style={{ marginTop: 10 }}>
                <div className={styles.menucardtoptop}>
                  <div className={styles.menucardtoptext}>按钮或资源</div>
                  <div className={styles.menucardbotbtn}>
                    <Search
                      placeholder="请输入资源名称关键词过滤列表"
                      allowClear
                      maxLength={50}
                      onSearch={(e) => changekey(e)}
                      style={{
                        // float: 'right',
                        width: 346,
                        // height: 32,
                        // marginRight: 10,
                        // borderRadius: 4,
                      }}
                      enterButton
                      className="search-input"
                    />
                    {access['menuManager/index:btn_element_add'] ? (
                      <Button
                        className="head-btn-primary"
                        onClick={() => {
                          if (ids) {
                            setAddbtnshow(true);
                            return false;
                          }
                          message.warning({
                            content: '请选择左侧菜单项!',
                            key: '请选择左侧菜单项!',
                          });
                          return false;
                        }}
                      >
                        新增
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className={styles.tabhei}>
                  <ProTable<Member>
                    columns={column}
                    request={btnlist}
                    onLoad={onLoad}
                    params={{
                      id: ids,
                      name: keywords,
                      // current: searchPage,
                    }}
                    rowKey="id"
                    pagination={{
                      showQuickJumper: false,
                      defaultPageSize: 10,
                      current: searchPage,
                      // onChange: pageChange,
                    }}
                    toolBarRender={false}
                    actionRef={actionRef}
                    search={false}
                    scroll={scrollObj || { x: '100%' }}
                    // onRequestError={reqErr}
                    onChange={changetabval}
                  />
                </div>

                {addbtnshow ? (
                  <AddBtn
                    onsetkey={updatatab}
                    menuId={ids}
                    addbtnshow={addbtnshow}
                    onCancel={() => setAddbtnshow(false)}
                  />
                ) : null}
                {edtbtnshow ? (
                  <EdtBtn
                    onsetkey={updatatab}
                    menuId={ids}
                    btninfo={btninfo}
                    edtbtnshow={edtbtnshow}
                    onCancel={() => setEdtbtnshow(false)}
                  />
                ) : null}
              </Card>
            </div>
          </div>
        </Row>
      </div>
    </div>
  );
};
