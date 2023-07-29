/*
 * @Author: wf
 * @Date: 2021-11-25 09:49:37
 * @Last Modified by: wf
 * @Last Modified time: 2022-07-25 15:40:45
 */
const regExps = {
  domainName: {
    // 域名校验
    regExp: /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
    msg: '域名格式有误',
  },
  int: {
    // 包含0的正整数校验
    regExp: /^([1-9]\d*|0{1})$/,
    msg: '该项为正整数',
  },
  price: {
    // 最多4位小数的价格校验
    regExp: /^(0{1}|[1-9]\d*)(?:\.\d{1,4})?$/,
    msg: '价格格式有误,最多保留4位小数',
  },
  email: {
    // 邮箱校验
    regExp: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
    msg: '邮箱地址格式有误',
  },
  tel: {
    // 联系电话校验
    regExp:
      /^((0\d{2,3}-\d{7,8})|((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|147)\d{8})$/,
    msg: '联系电话格式有误',
  },
  card: {
    // 身份证校验
    regExp: /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/,
    msg: '身份证格式有误',
  },
  passport: {
    // 护照
    regExp: /^[a-zA-Z0-9]{3,21}$/,
    msg: '护照格式有误',
  },
  officer: {
    // 军官证或士兵证
    regExp: /^[a-zA-Z0-9]{7,21}$/,
    msg: '军官证格式有误',
  },
  hours: {
    // 时分校验
    regExp: /^(([0,1]\d{1})|2[0,1,2,3]{1}|\d{1}):[0,1,2,3,4,5]\d{1}$/,
    msg: '时分输入格式有误',
  },
  hoursNocolon: {
    // 不带冒号时分校验
    regExp: /^(([0,1]\d{1})|2[0,1,2,3]{1}|\d{1})[0,1,2,3,4,5]\d{1}$/,
    msg: '请输入不带冒号的时分格式',
  },
  percentage: {
    // 百分数验证
    regExp: /^\d+%$/,
    msg: '请输入百分数',
  },
  legalString: {
    // 中文、英文字母、数字、下划线和中划线
    regExp: /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/,
    msg: '由中文、英文字母、数字、下划线和中划线组成',
  },
  longitude: {
    // 经度
    regExp:
      /^(-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/,
    msg: '经度整数部分为 -180.0～+180.0，小数位数最多保留6位',
  },
  latitude: {
    regExp: /^(-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/,
    msg: '纬度整数部分为 -90.0～+90.0，小数位数最多保留6位',
  },
};
export default {
  getSetting() {
    return {
      message: '该项不能为空.',
      required: true,
      trigger: 'blur',
      validator() {},
    };
  },
  getCustomSetting() {
    return {
      required: true,
      trigger: 'change',
      validator() {},
    };
  },
  // 为空校验
  null(value: any): string {
    const regExp = /^\s*$/g;
    if (regExp.test(value) || typeof value === 'undefined' || value == null) {
      return '该项不能为空';
    }
    return '';
  },
  // 域名校验
  domainName(value: any) {
    const regExp =
      /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
    return !regExp.test(value) && '域名格式有误';
  },
  // 包含0的正整数校验
  int(value: any) {
    const regExp = /^([1-9]\d*|0{1})$/;
    return !regExp.test(value) && '该项为正整数';
  },
  // 最多4位小数的价格校验
  price(value: any) {
    const regExp = /^(0{1}|[1-9]\d*)(?:\.\d{1,4})?$/;
    return !regExp.test(value) && '价格格式有误,最多保留4位小数';
  },
  phone(value: any) {
    const regExp = /^1[3|4|5|6|7|8|9][0-9]{9}$/; // 第一位是【1】开头，第二位则则有【3,4,5,6,7,8,9】，第三位则是【0-9】，第三位之后则是数字【0-9】
    return !regExp.test(value) && '手机号码格式有误';
  },
  // 联系电话校验
  tel(value: any) {
    const regExp =
      /^((0\d{2,3}-\d{7,8})|((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|147)\d{8})$/;
    return !regExp.test(value) && '联系电话格式有误';
  },
  // 身份证校验
  card(value: any) {
    const regExp = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/;
    return !regExp.test(value) && '身份证格式有误';
  },
  // 时分校验
  hours(value: any) {
    const regExp = /^(([0,1]\d{1})|2[0,1,2,3]{1}|\d{1}):[0,1,2,3,4,5]\d{1}$/;
    return !regExp.test(value) && '时分输入格式有误';
  },
  // 不带冒号时分校验
  hoursNocolon(value: any) {
    const regExp = /^(([0,1]\d{1})|2[0,1,2,3]{1}|\d{1})[0,1,2,3,4,5]\d{1}$/;
    return !regExp.test(value) && '请输入不带冒号的时分格式';
  },
  // 百分数验证
  percentage(value: any) {
    const regExp = /^\d+%$/;
    return !regExp.test(value) && '请输入百分数';
  },
  legalString(value: any) {
    const regExp = /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/;
    return !regExp.test(value) && '由中文、英文字母、数字、下划线和中划线组成';
  },
  /*
  初始化校验
  arg为需要校验项的数组集合，需要优先校验项放在最后
  */
  init(arg: any) {
    const set = this.getSetting();
    set.validator = (rule?: any, value?: any, callback?: any) => {
      let i: any = arg.length;
      let err;
      while (i > 0) {
        err = this[arg[i]](value);
        i -= 1;
        if (err) break;
      }
      if (err) {
        callback(new Error(''));
      } else {
        callback();
      }
    };
    return [{ ...set }];
  },

  /*
  为必填校验
   */
  noRequired(arg: any) {
    const set = this.getSetting();
    set.required = false;
    set.validator = (rule?: any, value?: any, callback?: any) => {
      if (value) {
        let i = arg.length;
        let err;
        while (i) {
          err = this[arg[i]](value);
          if (err) break;
          i -= 1;
        }
        if (err) {
          callback(new Error(''));
        } else {
          callback();
        }
      } else {
        callback();
      }
    };
    return [{ ...set }];
  },
  // 自定义校验
  custome(params: any) {
    return [{ ...this.getSetting(), ...params }];
  },
  /**
   * @description: 输入框校验
   * @param {String}: name： 名称：label
   * @return {Object}: Object
   */
  inputRequired(name: string = '名称') {
    return { required: true, message: `请输入${name}`, trigger: 'blur' };
  },
  inputPageRequired(name: string = '名称') {
    return { required: true, message: `请${name}`, trigger: 'blur' };
  },
  inputTimeRequired(name: string = '名称') {
    return { required: true, message: `${name}`, trigger: 'change' };
  },
  /**
   * @description: 选择框校验
   * @param {String}: name： 名称：label
   * @param {String}: msg： 自定义提示
   * @return {Object}: Object
   */
  selectReq(name: string = '名称') {
    return { required: true, message: `请选择${name}` };
  },
  selectRequired(name: string = '名称', msg: string) {
    return { required: true, message: msg || `请选择${name}`, trigger: 'change' };
  },
  // 多选框校验
  mutiSelectRequired(name: string = '名称') {
    return { required: true, message: `请选择${name}`, type: 'array' };
  },
  // 自定义多选框校验
  customMutiSelectRequired() {
    return { required: true, type: 'array' };
  },
  /**
   * @description: 正则表达式
   * @param {RegExp || String}: reg 正则表达式 | regExps里面的正则类型
   * @param {String}: msg 校验错误提示
   * @return {Object}: Object
   */
  pattern(reg: any, msg: string) {
    let pattern = /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/;
    let message = '由中文、英文字母、数字、下划线和中划线组成';
    if (reg instanceof RegExp) {
      pattern = reg;
      message = msg || '您输入格式有误，请重新输入';
    } else if (typeof reg === 'string' && regExps[reg]) {
      pattern = regExps[reg] && regExps[reg].regExp;
      message = msg || '您输入格式有误，请重新输入' || (regExps[reg] && regExps[reg].msg);
    }
    return { required: true, pattern, message, trigger: 'change' };
  },
  /**
   * @description: 选择框校验
   * @param {Number}: min: 最小长度
   * @param {Number}: max: 最大长度
   * @return {Object}: Object
   */
  lengthRange(min: number = 1, max: number = 50, required: boolean = true) {
    return { required, min, max, message: `长度在 ${min} 到 ${max} 个字符`, trigger: 'blur' };
  },

  // 浮点型数据校验
  customeFloat(params: any) {
    return [{ ...this.getCustomSetting(), ...params }];
  },
  // 小数点数据校验
  numberFloat(required: boolean = true) {
    const pattern = /^(?!0+(?:\.0+)?$)(0{1}|[1-9]{1}\d*)(\.\d{0,2})?$/;
    const message = '格式有误(最多2位小数)';
    // return !regExp.test(value) && '格式有误,最多保留2位小数';
    return { required, pattern, message, trigger: 'blur' };
  },
  // 手机号校验
  patternPhone(required = true) {
    const pattern =
      /^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|147)\d{8}$/;
    const message = '您输入的手机号有误';
    return { required, pattern, message, trigger: 'blur' };
  },

  // 1以上的正整数
  cameraChannel(required: boolean = true) {
    const pattern = /^[1-9]/;
    const message = '输入大于0的数字';
    return { required, pattern, message, trigger: 'blur' };
  },

  // 匹配版本号*.*.*
  versionRegular() {
    const pattern = /^([1-9]\d+|[1-9])(\.([1-9]\d+|\d)){2}$/;
    const message = '请输入除了0开头x.x.x的格式';
    return { pattern, message, trigger: 'blur' };
  },
  // 数字、大小写字母和下划线(50位以内)
  limitVideoNumber(required: boolean = true) {
    const pattern = /^\w{0,50}$/;
    const message = '不能超过50位';
    return { required, pattern, message, trigger: 'blur' };
  },
  // 名称校验--数字、大小写字母和下划线.(50位以内)
  limitNameLenth20(required: boolean = true) {
    const pattern = /^([a-zA-Z0-9_.@]){6,50}$/;
    const message = '数字、大小写字母和下划线以及.@组成(6-50位)';
    return { required, pattern, message, trigger: 'blur' };
  },
  // 数字、汉字、大小写字母和下划线(50位以内)
  limitNumber20(required: boolean = true) {
    const pattern = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_-]|[>]){1,50}$/;
    const message = '数字、汉字、大小写字母和下划线组成(50位以内)';
    return { required, pattern, message, trigger: 'blur' };
  },
  // 数字、汉字、大小写字母和下划线(50位以内)
  limitNumber50(required: boolean = true) {
    const pattern = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_（）-]|[>]){1,50}$/;
    const message = '数字、汉字、大小写字母、中文括号和下划线组成(50位以内)';
    return { required, pattern, message, trigger: 'blur' };
  },
  // 数字、汉字、大小写字母和下划线
  limitNumber(required: boolean = true) {
    const pattern = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_]){1,100}$/;
    const message = '数字、汉字、大小写字母和下划线组成';
    return { required, pattern, message, trigger: 'blur' };
  },
  // 限制50位以内
  limitAmount50(required: boolean = true) {
    const pattern = /^.{1,50}$/;
    const message = '不能超过50位';
    return { required, pattern, message, trigger: 'blur' };
  },
  // 首尾不能为空格的字符，限制50位以内
  limitAmount20(required: boolean = true) {
    // const pattern = /^.{1,20}$/;
    const pattern = /^\S$|(^\S.{0,48}\S$)/;
    const message = '总字数不能超过50位';
    return { required, pattern, message, trigger: 'blur' };
  },

  // 首尾不能为空格的字符，限制50位以内
  limitNoKong50(required: boolean = true, title = '') {
    const pattern = /^.{1,50}$/;
    const message = '(总字数不能超过50位)';
    return { required, pattern, message: `${title}${message}`, trigger: 'blur' };
  },
  // 检测文件路径
  pathRegular(required: boolean = true) {
    const pattern = /^(\/)[a-zA-Z0-9/{*}(\-)]{1,49}$/;
    const message = "请输入以'/'开头，大小写字母、数字、-和{*}组成(50位以内)";
    return { required, pattern, message, trigger: 'blur' };
  },
  // 检测文件权限
  permissionRegular(required: boolean = true) {
    const pattern = /^([a-zA-Z])[a-zA-Z/:_]{1,48}([a-zA-Z]$)/;
    const message = '请输入以大小写字母开头和结尾，字符间可用:/_分割(总长50位以内)';
    return { required, pattern, message, trigger: 'blur' };
  },
  // 验证经纬度
  checkLocation(required: boolean = true) {
    let err: any = null;
    return {
      required,
      trigger: 'blur',
      validator: (rule?: any, value?: any) => {
        if (!value) {
          return Promise.reject(new Error('请输入正确的经纬度'));
        }
        if (value.indexOf(',') < 0) {
          return Promise.reject(new Error('经度和纬度之间用英文逗号,隔开'));
        }
        const list = value.split(',');
        if (list.length !== 2) {
          return Promise.reject(new Error('请输入正确的经纬度'));
        }
        if (!regExps.longitude.regExp.test(list[0]) || !regExps.latitude.regExp.test(list[1])) {
          err = regExps.longitude.regExp.test(list[0])
            ? regExps.latitude.msg
            : regExps.longitude.msg;
          return Promise.reject(new Error(err));
        }
        return Promise.resolve();
      },
    };
  },
  checkInteger(required: boolean = true) {
    return {
      required,
      trigger: 'blur',
      validator: (rule?: any, value?: any) => {
        if (!/^[0-9]*[1-9][0-9]*$/.test(value)) {
          return Promise.reject(new Error('输入正整数(1-15位)'));
        }
        return Promise.resolve();
      },
    };
  },
  checkReport(required: boolean = true, arr: any) {
    return {
      required,
      trigger: 'blur',
      validator: () => {
        try {
          arr?.forEach((item: any) => {
            Object.keys(item).forEach((key: any) => {
              if (!item[key] && !item[key] && item[key] !== 0 && item[key] !== '0') {
                throw new Error('报表上传每一项不能为空！');
              }
            });
          });
        } catch (error) {
          return Promise.reject(new Error('报表上传每一项不能为空！'));
        }

        return Promise.resolve();
      },
    };
  },
  // 数字、字母(20位以内)
  limitNumberLetter20(required: boolean = true) {
    const pattern = /^([a-zA-Z0-9]){1,20}$/;
    const message = '数字、大小写字母组成(20位以内)';
    return { required, pattern, message, trigger: 'blur' };
  },
  // 汉字、数字、字母(20位以内)
  limitNumberLetterCHN20(required: boolean = true) {
    const pattern = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9]){1,20}$/;
    const message = '汉字、数字、大小写字母组成(20位以内)';
    return { required, pattern, message, trigger: 'blur' };
  },

  checkInteger10(required: boolean = true) {
    return {
      required,
      trigger: 'blur',
      validator: (rule?: any, value?: any) => {
        if (!/^([1-9]|10)$/.test(value)) {
          return Promise.reject(new Error('输入正整数(1-10)'));
        }
        return Promise.resolve();
      },
    };
  },
};
