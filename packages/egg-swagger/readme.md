
# ts-egg-swagger插件

## 目标

让 基于typescript的eggjs项目可以像 javaBFF 一样，通过约定配置，就可以生成swagger接口文档。

## 目录结构
```
.
├── lerna.json
├── package.json
├── packages
│   ├── egg-code-prompt --配套使用的vscode代码提示插件代码已经移到 [这里](https://github.com/JustinYi922/egg-code-prompt)
│   ├── egg-example-------插件使用demo
│   └── egg-swagger-------egg-swagger插件
└── readme.md


```

<a name="YGHED"></a>


<a name="9THqU"></a>

# 插件原理

1. 解析路由,可以知道有多少请求
1. 解析 controller目录下面的所有类来获取模块
1. 解析controller对应的目录typings下的custom下的相同名称的.d.ts 的声明文件（另外typings下面的index.d.ts存放公共的类型信息）
1. 生成 swagger 的 openApi 规范 json 文件
1. 保存到本地或上传 Yapi
   <a name="iTJLT"></a>

# 怎么使用

- 下单插件

```
npm install qianmi-egg-swagger --save-dev

```

- 配置插件

建议是写在 package.json 的 scripts.postpublish 里面

用swagger-ui生成在线文档
```
"ui": "./node_modules/.bin/qm-egg-doc swagger-ui"
```
发布到指定的yapi

```
"doc": "./node_modules/.bin/qm-egg-doc --yapi <这里yapi的post请求地址>"
```

<a name="WFdlH"></a>

## swagger 规范

[https://swagger.io/specification/v2/](https://swagger.io/specification/v2/)
<a name="UMtAH"></a>

# 怎么使用？

<a name="gNgKJ"></a>

## 路由

规则：http 请求+url+controller 路径+方法

```javascript
//模拟get请求 path
router.get(
  "/delivery/address/list/:phonenum",
  controller.deliveryAddress.addressList
);
//模拟get请求 query
router.get("/delivery/address/update", controller.deliveryAddress.update);
//模拟post请求
router.post("/delivery/address/add", controller.deliveryAddress.add);
//模拟all请求
router.all("/delivery/address/delete", controller.deliveryAddress.delete);
```

<a name="V63Cd"></a>

## controller

```javascript
import { Controller } from 'egg';

/**
 * 配送管理
 */
export default class DeliveryAddress extends Controller {
  /**
   * 方法名称
   * @path phonenum string 手机号
   */
  public async addressList() {

    this.ctx.response.success(null);
  }

  /**
   * 方法名称
   * @query province string 省 required
   * @query city string 市 required
   * @query area string 区
   */
  public async update() {
    this.ctx.response.success(null);
  }


  /**
   * 方法名称
   * @request IAddressAddParam
   */
  public async add() {
    this.ctx.response.success(null);
  }
  /**
   * 方法名称
   * @response AddressDTO
   */
  public async delete() {
    this.ctx.response.success(null);
  }

  /***
   * 方法名称
   * @response IBaseDTO<ICityDelivery>
   */
  public async cityDeliveryAddress() {
    this.ctx.response.success(addressList);
  }

}

```

<a name="1BhMl"></a>

## 声明文件

```javascript
declare module 'shop' {

  interface IAddressAddParam {
    /**
     * 手机号码
     */
    mobile: string;
    receiptUserMobile: string;
    receiptUserName: string;
    address: string;
    /**
     * 经度纬度
     */
    latitude: number;
    longitude: number;
    /**
     * 地址备注
     */
    addressRemark?: string;
    /**
     * 是否默认
     */
    isDefault?: boolean;
  }

  interface AddressDTO{
    /**
     * 手机号码
     *
     */
     mobile: string;
     receiptUserMobile: string;
     receiptUserName: string;
     address: string;
     /**
      * 经度纬度
      */
     latitude: number;
     longitude: number;
     /**
      * 地址备注
      */
     addressRemark?: string;
     /**
      * 是否默认
      */
     isDefault?: boolean;
  }
}

```

<a name="Ce7xy"></a>

<a name="UK8dg"></a>

# 注意

1. 生成接口文档，技术只是实现而已，最重要的是约定和完善接口信息
2. 文件名如果有多个单词，请以英文-分割
3. 代码中路径和关键词等命名请用驼峰的形式
4. 请把 typings/custom 文件下的路径和名称与 controller 下面的文件的路径保持一致
   <a name="O7OCA"></a>

# 不足

- 还有很多功能未实现;
- 暂未支持直接访问 swagger 页面
- 如有 bug 请及时告知，或者一起修改一下哈
- 返回值是基本类型处理
