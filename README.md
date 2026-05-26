## 分支

- francis/main
  新界面
- yibin
  老界面
- yibin-idriverplus-icon
  老界面&智行者LOGO

## 启动

通过指定不同的env文件来启动不同的OEM定制

- 默认环境
  npm run dev
- OEM环境
  npm run dev -- --mode development.oem

## 打包

- 默认环境
  npm run build

- OEM环境
  npm run build -- --mode production.oem

## 构建

如果宿主机有外网，则直接在对应的env文件中配置VITE_API_BASE_URL后端地址，否则将VITE_API_BASE_URL配置为/dev-api，然后启动nginx进行转发

默认直接执行sh deploy.sh即可构建默认环境
