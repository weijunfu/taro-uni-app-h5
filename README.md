# 在Taro中嵌入uni-app

 > 由于Taro H5环境不支持富文本编辑，这里暂时使用uni-app H5中的富文本编辑器。并将文件上传至七牛云

 ## 解决思路
  + 使用 `window.location.href` 进行 Taro 和 uni-app 的切换

## 扩展
  + 如果 富文本编辑器所在页面为TabBar页面，则 Taro 和 uni-app 的TabBar页面配置一致，再 uni-app 的 TabBar页面中的`onLoad`方法中，使用 `window.location.href` 进行跳转

## 注意
 + 使用 `window.location.href` 后，可造成 `navigationBack` 无效


