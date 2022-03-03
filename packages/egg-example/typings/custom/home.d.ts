declare module example {
  /**
   * 自定义form
   */
  interface ITestForm {
    /**
     * 测试id
     */
    id?: number;
    /**
     * 测试title
     */
    title: string;
    /**
     * 测试数组
     */
    arr: string[];
  }

  /**
   * 自定义返回值
   */
  interface ICusteomDTO {
    /**
     * 姓名
     */
    userName: string;
    /**
     * 年龄
     */
    age?: number;
  }
}
