import "egg";

declare module "egg" {
  /**
   * 基本入参
   */
  interface IBaseForm {
    /**
     * 店铺编号
     */
    adminId?: string;
  }
  interface IBasePageForm extends IBaseForm {
    /**
     * 当前分页数(从0开始)
     */
    pageNo?: number;
    /**
     * 每页记录数
     */
    pageSize?: number;
  }

  interface IBaseResponseVO<T> {
    /**
     * 接口状态
     */
    status?: number;
    /**
     * 返回数据
     */
    data?: T;
    /**
     * 错误信息或者"成功"
     */
    message?: string;
    /**
     * 接口状态boolean值
     */
    success?: boolean;
  }
}
