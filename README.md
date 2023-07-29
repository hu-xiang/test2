# 项目说明

该项目包含多个项目，采用 pnpm Workplace(https://pnpm.io/zh/workspaces)管理 baseline 基线版本 luyuan 武汉路源项目

### 根目录 tsconfig.json

@umi/fabric 插件 eslint 检测需要根据此文件判断是否为 ts, 否则不检测 ts

## Environment Prepare

Install `node_modules`:

```bash
pnpm install
```

### Start project

```bash
在package.json当中配置相应项目的启动命令
例：baseline项目
"baseline:start": "pnpm -C ./packages/baseline start"
```

### Build project

```bash
在package.json当中配置相应项目的启动命令
例：baseline项目
"baseline:build": "pnpm -C ./packages/baseline build"
```

### 关于文件或文件夹命名

```bash
  纯文件夹用小驼峰命名法
  组件或组件文件夹用大驼峰命名法
  例：├─exception
       ├─403
       ├─404
       ├─500
  都是文件夹，首字母小写
     ├─Login
       index.tsx
  Login为组件，首字母大写
```
