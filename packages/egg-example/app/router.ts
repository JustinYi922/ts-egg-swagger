/* eslint-disable quotes */
import { Application } from "egg";

export default (app: Application) => {
  const { controller, router } = app;

  router.get("/test1/:mobile", controller.home.test1);

  router.get("/test2", controller.home.test2);

  router.get("/test3", controller.home.test3);

  router.post("/test4", controller.home.test4);

  router.post("/test5", controller.home.test5);

  router.post("/test6", controller.home.test6);
};
