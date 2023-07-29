# 道路病害检测系统（基线项目）

基线项目存放所有项目公共模块，特有模块放在各自项目当中

## 文件引用说明

基线项目引入组件时用相对路径引入，不要用`@`符号这种方式，会造成其它项目引入基线项目组件路径找不到的问题

## Environment Prepare

Install `node_modules`:

```bash
npm install
```

or

```bash
yarn
```

## Provided Scripts

Ant Design Pro provides some useful script to help you quick start and build with web project, code style check and test.

Scripts provided in `package.json`. It's safe to modify or add additional script:

### Start project

```bash
npm start
```

### Build project

```bash
npm run build
```

### Check code style

```bash
npm run lint
```

You can also use script to auto fix some lint error:

```bash
npm run lint:fix
```

### Test code

```bash
npm test
```
