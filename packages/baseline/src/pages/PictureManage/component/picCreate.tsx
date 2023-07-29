// import { UploadOutlined } from '@ant-design/icons';
import { SearchOutlined } from '@ant-design/icons';
import { Modal, Form, Input, message } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles.less';
import { addku, editku, getFacilitiesList } from '../service';
import { cloneDeep } from 'lodash';
// import type { MessageType } from 'antd/lib/message';
// import validRule from '@/utils/validate';
import DebounceSelect from '../../../components/DebounceSelect';
// import { throttle } from 'lodash';
// import { SelectProps } from 'antd/es/select';
// import debounce from 'lodash/debounce';
// import { DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;
// const { Option } = Select;
// const { Option, getMentions } = Mentions;
type Iprops = {
  libraryId: string;
  visib: boolean;
  todo: string;
  rowInfo: any;
  noCancel: Function;
  createSuccess: Function;
};

const PicCreate: React.FC<Iprops> = (props) => {
  // const [filenum, setFilenum] = useState<any>(0);
  const [form] = Form.useForm();
  // const [libraryDesc, setLibraryDesc] = useState('');
  const [roadId, setRoadId] = useState<any>(0);
  // const [roadNameList, setRoadNameList] = useState<any>([]);
  const [roadName, setRoadName] = useState<any>('');
  // const [imageUrl, setImageUrl] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [formlist, setFormlist] = useState<any>({});
  const formref = useRef<any>(null);
  // const [imgfilelist, setImgfilelist] = useState<any>([]);
  // 表单的默认值以及重置值
  const defalutform = {
    libraryName: '', //
    libraryDesc: '',
    fkFacilitiesName: undefined,
    // pileNoStart: '', //
    // pileNoEnd: '',
  };
  // const normFile = (e: any) => {
  //   return e && e.fileList;
  // };
  // const checkRoadName = async (_: any, value: string) => {
  //   const mentions = getMentions(value);
  // };
  // const throttledRoadlist = useCallback(
  //   debounce((newValue: any) => {
  //     console.log('dd:',newValue,!!newValue);
  //     setLoading(!!newValue);
  //     setRoadNameList([{label:'深南大道',value:'1'},{value:'2',label:'深南大道1'},{value:'3',label:'深南大道2'}]);
  //     setLoading(false);
  //   }, 1000),
  //   []
  // );
  const handleSearch = async (value: string) => {
    // const ss: any[] = [
    //   { label: '深南大道', value: '1' },
    //   { value: '2', label: '深南大道1' },
    //   { value: '3', label: '深南大道2' },
    // ];
    let rec: any = [];
    try {
      const { status, data = [] } = await getFacilitiesList({ name: value });
      if (status === 0) {
        data.forEach((it: any) => {
          rec.push({ label: it.facilitiesName, value: it.id });
        });
      }
    } catch (error) {
      rec = [];
    }
    return Promise.resolve(rec);
    // new Promise((resolve: any)=>{
    //    const ss: any[]=[{label:'深南大道',value:'1'},{value:'2',label:'深南大道1'},{value:'3',label:'深南大道2'}];
    //    return ss;
    // })
  };
  const rules: any = {
    libraryName: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          const regExp = /^\S$|(^\S.{0,48}\S$)/;
          if (!value) {
            callback('名称不能为空!');
          } else if (!regExp.test(value)) {
            callback('总字数不能超过50位');
          } else {
            callback();
          }
        },
      },
    ],
    roadName: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          if (!roadName) {
            callback('请选择道路名称!');
          } else {
            callback();
          }
        },
      },
    ],
    // pileNoStart: [
    //   {
    //     required: true,
    //     pattern: /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_+-]){1,20}$/,
    //     message: '中文、数字、大小写字母以及-_+组成(1-20位)',
    //   },
    // ],
    // pileNoEnd: [
    //   {
    //     required: true,
    //     pattern: /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_+-]){1,20}$/,
    //     message: '中文、数字、大小写字母以及-_+组成(1-20位)',
    //   },
    // ],
  };
  // 回填数据
  const setValue = () => {
    const objform: any = cloneDeep(defalutform);
    const excludeArr = ['libraryState'];
    if (props.rowInfo) {
      Object.keys(defalutform).forEach((item: any) => {
        if (excludeArr.includes(item)) {
          const it = props.rowInfo[item];
          objform[item] = Boolean(it);
        } else {
          objform[item] = props.rowInfo[item] || '';
        }
      });
    }
    return objform;
  };
  useEffect(() => {
    if (props.todo === 'edit') {
      // 回填数据
      const newdata = setValue();
      form.setFieldsValue({
        ...newdata,
      });
      setRoadName(newdata.fkFacilitiesName);
      setRoadId(props.rowInfo?.fkFacilitiesId);
    }
  }, []);
  // let hide: MessageType;
  // const getFacilitiesLists =async (name: string) => {
  //   const { status, data=[] }=await getFacilitiesList(name);
  //   // facilitiesLists
  //   if(status===0)
  //   {
  //     setRoadNameList(data);
  //   }
  // };

  const submit = async () => {
    form
      .validateFields()
      .then(async () => {
        try {
          const fkFacilitiesId: number = roadId;
          const formdata = form.getFieldsValue(true);
          let newFormData: any = {};
          newFormData = { ...formdata, roadName, fkFacilitiesId };

          const formData = new FormData();
          Object.keys(newFormData).forEach((it: any) => {
            formData.append(it, newFormData[it]);
          });

          let res: any;
          if (props.todo === 'edit') {
            formData.append('id', props.rowInfo?.id);
            // const newFormParam = { ...newFormData, id: props.rowInfo?.id };
            res = await editku(formData);
          } else {
            formData.append('id', props.libraryId);
            res = await addku(formData);
          }
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.noCancel();
            props.createSuccess();
          }
          // else {
          //   message.error({
          //     content: res.message,
          //     key: res.message,
          //   });
          // }
          // return true;
        } catch {
          message.error({
            content: '提交失败!',
            key: '提交失败!',
          });
        }
      })
      .catch(() => {
        // message.error({
        //   content: '校验失败!',
        //   key: '校验失败!',
        // });
      });
  };

  return (
    <Modal
      title={props.todo === 'add' ? '图片库创建' : '图片库编辑'}
      open={props.visib}
      onCancel={() => props.noCancel()}
      className="modbox2"
      okText="提交"
      onOk={() => {
        submit();
      }}
      maskClosable={false}
    >
      <Form
        name="basic"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 20 }}
        autoComplete="off"
        ref={formref}
        form={form}
        className={styles.form}
        // onValuesChange={(changedValues, allValues) => changedValue(changedValues, allValues)}
      >
        <Form.Item label="图片库名称" name="libraryName" rules={rules.libraryName}>
          <Input />
        </Form.Item>
        <Form.Item label="图片库描述" className="text-area-class" name="libraryDesc">
          <TextArea rows={4} />
        </Form.Item>
        <div>
          <Form.Item label="道路名称" name="roadName">
            <div className={styles.rowRoadClass}>
              <DebounceSelect
                // mode="multiple"
                showSearch
                showArrow={false}
                value={{ value: roadId, label: roadName }}
                // filterOption={false}
                placeholder="请输入道路名称"
                fetchOptions={handleSearch}
                onSelect={(newValue: any) => {
                  setRoadName(newValue?.label);
                  setRoadId(newValue?.value);
                  form.setFieldsValue({ roadName: { value: roadId, label: roadName } });
                }}
                style={{ width: '100%' }}
                allowClear={true}
                onClear={() => {
                  setRoadName('');
                  setRoadId(0);
                  form.setFieldsValue({ roadName: { value: '', label: '' }, fkFacilitiesName: '' });
                }}
              />
              <span className={styles.queryButton}>
                <SearchOutlined />
              </span>
            </div>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
export default PicCreate;
