/* eslint-disable quotes */
import { Controller } from "egg";

/**
 * 测试模块
 */
export default class HomeController extends Controller {
  /**
   * 入口方法
   * @request ICusteomDTO
   * @response qianmi/d2c-common-service-api/lib/com/qianmi/d2c/common/service/api/equipment/request/EquipmentAddMainParam.d.ts
   */
  public async index() {
    const { ctx } = this;
    ctx.body = await ctx.service.test.sayHi("egg");
  }

  /**
   * 测试path
   * @path mobile string 手机号码
   */
  public test1() {
    const { ctx } = this;
    ctx.body = "测试path,路径参数=" + ctx.params.mobile;
  }

  /**
   * 测试query
   * @query tid string 订单号
   */
  public test2() {
    const { ctx } = this;
    ctx.body = "测试query,tid=" + ctx.query.tid;
  }

  /**
   * 测试自定义form
   * @request ITestForm
   */
  public test3() {
    const { ctx } = this;
    ctx.body = "测试自定义form,返回：" + JSON.stringify(ctx.request.body);
  }

  /**
   * 测试自定义返回值1
   * @response ICusteomDTO
   */
  public test4() {
    const { ctx } = this;
    ctx.body = "测试自定义返回值1";
  }

  /**
   * 测试泛型返回值
   * @response IBaseResponseVO<ICusteomDTO>
   */
  public test5() {
    const { ctx } = this;
    ctx.body = "测试泛型返回值";
  }

  /**
   * 测试中台返回值
   * @response qianmi/d2c-common-service-api/lib/com/qianmi/d2c/common/service/api/equipment/response/EquipmentResponse.d.ts
   */
  public test6() {
    const { ctx } = this;
    ctx.body = "测试泛型返回值";
  }
}
