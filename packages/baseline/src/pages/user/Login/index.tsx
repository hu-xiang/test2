import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { message, Card, Form, Row, Col, Image, Input } from 'antd';
import React, { useState, useEffect } from 'react';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { useIntl, history, useModel } from 'umi';
import { login } from '../../../services/ant-design-pro/api';
import logo from '../../../assets/img/loginIcon/logo.svg';
import { aesEcode } from '../../../utils/crypto';
import styles from './index.less';
import { getTokenName } from '../../../utils/commonMethod';
// import { useKeepAlive } from '../../../components/ReactKeepAlive'

/** 此方法会跳转到 redirect 参数所在的位置 */
const goto = () => {
  if (!history) return;
  setTimeout(() => {
    const { query } = history.location;
    const { redirect } = query as { redirect: string };
    if (redirect === '/user/login') history.push('/');
    else history.push(redirect || '/');
  }, 10);
};

interface Iprops {
  logo?: any;
  styles?: any;
}

const Login: React.FC<Iprops> = (props: Iprops) => {
  // useKeepAlive()
  const [submitting, setSubmitting] = useState(false);
  const { initialState, setInitialState } = useModel<any>('@@initialState');
  // const { menurouteinfo, setMenurouteinfo } = useModel<any>('menurouteinfo');
  const [uuid, setUuid] = useState(Date.now());
  const [captureUrl, setCaptureUrl] = useState('');
  const intl = useIntl();
  const [pwdflag, setPwdFlag] = useState(false);
  const [flag, setFlag] = useState(false);
  const [flag1, setFlag1] = useState(false);
  const propStyles = props?.styles;

  const changeCapture = () => {
    setUuid(Date.now());
  };

  useEffect(() => {
    setCaptureUrl(`${BASE_API}/api/auth/jwt/captcha.jpg?uuid=${uuid}`);
  }, [uuid]);

  const fetchUserInfo = async () => {
    const routeinfo = await initialState?.fetchmenuInfo?.();
    const userInfo = await initialState?.fetchUserInfo?.();
    let addtionalObj: any = {};
    if (userInfo) {
      addtionalObj = {
        currentUser: userInfo,
        menuinfo: routeinfo,
      };
      if (!userInfo?.menus || !userInfo?.menus?.length) {
        const defaultloginFailMessage = intl.formatMessage({
          id: 'pages.login.noMenuPermission',
          defaultMessage: '请配置菜单权限！',
        });
        message.error({
          content: defaultloginFailMessage,
          key: defaultloginFailMessage,
        });
      }
    }
    setInitialState({
      ...initialState,
      ...addtionalObj,
      // isChangePwd: data?.isChangePw,
      // isTenant: data?.isTenant,
    });
  };
  const rules: any = {
    newPassword: [
      // {
      //   required: true,
      //   pattern: /^.{6,50}$/,
      //   message: '密码长度超出或少于6位',
      // },
      {
        required: true,
        message: '请输入密码!',
      },
    ],
    username: [
      {
        required: true,
        pattern: /^([a-zA-Z0-9_]){1,50}$/,
        message: '数字、大小写字母、下划线(1-50位组成)',
      },
    ],
  };
  const handleSubmit = async (values: API.LoginParams) => {
    setSubmitting(true);
    try {
      // 登录
      const password = aesEcode(values.password || '');
      const res: any = await login({ ...values, uuid, password });
      if (res.status === 0) {
        const defaultloginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success({
          content: defaultloginSuccessMessage,
          key: defaultloginSuccessMessage,
        });
        const tokenName = getTokenName();
        localStorage.setItem(tokenName, res.data?.accessToken || '');
        sessionStorage.setItem('changePwd', res.data?.isChangePw);
        localStorage.setItem('isTenant', res?.data?.isTenant.toString());
        localStorage.setItem('current-tenantId', res?.data?.info?.tenantId);
        let mapCenter: any = [114.058141, 22.543544];
        if (res?.data?.info?.city) {
          AMap.plugin('AMap.Geocoder', () => {
            const geocoder: any = new AMap.Geocoder();
            geocoder.getLocation(res?.data?.info?.city, (status: string, result: any) => {
              if (status === 'complete' && result.geocodes.length) {
                mapCenter = [result.geocodes[0]?.location?.lng, result.geocodes[0]?.location?.lat];
                localStorage.setItem('map-center', JSON.stringify(mapCenter));
              }
            });
          });
        } else {
          localStorage.setItem('map-center', JSON.stringify(mapCenter));
        }
        localStorage.setItem('use-province', res?.data?.info?.province);
        localStorage.setItem('use-city', res?.data?.info?.city);
        // console.log('denglu',res.data)
        await fetchUserInfo();
        // fetchmenuInfo()
        goto();
        return;
      }
      // 如果失败去设置用户错误信息
      changeCapture();
      message.error({
        content: res.message,
        key: res.message,
      });
      // setUserLoginState(msg);
    } catch (error) {
      const defaultloginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      changeCapture();
      message.error({
        content: defaultloginFailureMessage,
        key: defaultloginFailureMessage,
      });
    }
    setSubmitting(false);
  };
  useEffect(() => {
    const reInp = () => {
      if (!document.querySelector('.topSelect')?.clientWidth) return;
      // if (
      //   document.querySelector('.topSelect')!.clientWidth > 1050 &&
      //   document.querySelector('.topSelect')!.clientWidth < 1950
      // ) {
      //   setFlag1(false);
      //   setFlag(false);
      // } else
      if (document.querySelector('.topSelect')!.clientWidth > 1950) {
        setFlag(true);
        setFlag1(false);
      } else {
        setFlag(false);
        setFlag1(false);
      }
    };
    reInp();
    window.addEventListener('resize', reInp);
    return () => {
      window.removeEventListener('resize', reInp);
    };
  }, []);

  const οnCοntextMenu = (event: any) => {
    // 屏蔽默认右键事件
    event.preventDefault();
    return false;
  };

  return (
    <div className={styles.container}>
      <video
        width="100%"
        src="./loginbg.mp4"
        muted
        autoPlay
        className={styles.video}
        loop
        disablePictureInPicture={true}
        onContextMenu={οnCοntextMenu}
      ></video>
      <div className={`${styles.main} topSelect`}>
        <Card
          title=""
          bordered={false}
          className={`${propStyles?.loginCard || styles?.loginCard} ${
            flag ? propStyles?.loginCard1 || styles?.loginCard1 : ''
          } ${flag1 ? propStyles?.loginCard2 || styles?.loginCard2 : ''}`}
        >
          <div className={propStyles?.logo || styles?.logo}>
            <img
              src={props?.logo || logo}
              className={propStyles?.imgLogo || styles?.imgLogo}
              alt="logo"
            />
            {/* {status} {loginType === 'account'} {!submitting} */}
          </div>
          <ProForm
            initialValues={{
              autoLogin: true,
            }}
            className={propStyles?.formLogin || styles?.formLogin}
            isKeyPressSubmit
            submitter={{
              searchConfig: {
                submitText: intl.formatMessage({
                  id: 'pages.login.submit',
                  defaultMessage: '登录',
                }),
              },
              render: (_, dom) => dom.pop(),
              submitButtonProps: {
                loading: submitting,
                size: 'large',
                style: {
                  width: '100%',
                },
              },
            }}
            onFinish={async (values) => {
              handleSubmit(values as API.LoginParams);
            }}
          >
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名',
                })}
                rules={[
                  {
                    required: true,
                    message: '请输入用户名!',
                  },
                  // ...rules.username
                ]}
              />
              <Form.Item name="password" rules={rules.newPassword}>
                <Input.Password
                  prefix={<LockOutlined className={styles.prefixIcon} />}
                  placeholder="密码"
                  allowClear
                  visibilityToggle={pwdflag}
                  style={{ height: 40 }}
                  onFocus={() => setPwdFlag(true)}
                  onBlur={() => setPwdFlag(false)}
                />
              </Form.Item>
              <Form.Item>
                <Row gutter={8}>
                  <Col span={16}>
                    <Form.Item
                      name="captcha"
                      noStyle
                      rules={[{ required: true, message: '请输入验证码!' }]}
                    >
                      <Input
                        prefix={<MailOutlined className={styles.prefixIcon} />}
                        size="large"
                        placeholder="验证码"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Image
                      preview={false}
                      width={'100%'}
                      height={40}
                      className={'img-height'}
                      src={captureUrl}
                      onClick={changeCapture}
                      fallback="data:image/png;base64,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"
                    />
                  </Col>
                </Row>
              </Form.Item>
            </>
            {/* )} */}
          </ProForm>
        </Card>
        {/* <div className={styles.imgs}/> */}
        {/* <div className={styles.copy}>
          © 2021 思谋科技 隐私政策 京ICP证080268号 京ICP备10005211号
          联系电话：0755-88888888
        </div> */}
      </div>
    </div>
  );
};

export default Login;
