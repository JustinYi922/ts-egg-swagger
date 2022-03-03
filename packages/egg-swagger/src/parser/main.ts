import { NotNeedRefType } from "../common/util";
import parseController from "./controller-parser";
import {
  getBaseDefinitions,
  getDefinitions,
  getThirdDefinitions,
} from "./definition-parser";
import parseRouter from "./router-parser";
/**
 * 根据eggjs项目的根目录开始解析成swagger数据
 * @param basePath
 * @returns
 */
export default function parseSwagerData(basePath: string) {
  let result: any = {
    definitions: [],
    tags: [],
  };
  let paths: any = {};
  //读取所有路由信息
  const routerObj = parseRouter(basePath);
  if (Object.keys(routerObj).length == 0) {
    return result;
  }
  for (const iterator in routerObj) {
    //解析每个controller
    const controller = parseController(basePath, iterator, routerObj[iterator]);
    if (!controller) {
      continue;
    }
    let params = controller.params;
    let tags = controller.tags;
    //解析typings下自定义的声明
    const definitions = getDefinitions(basePath, iterator);
    result.definitions = { ...result.definitions, ...definitions };
    if (params && Object.keys(params).length > 0) {
      for (const methodName in params) {
        const param = params[methodName];
        let url = param.url;
        delete param.url;
        paths[url] = param;

        if (param.get && param.get.third) {
          const definitions = getThirdDefinitions(basePath, param.get.third);
          result.definitions = { ...result.definitions, ...definitions };
          delete param.get.third;
        }
        if (param.post && param.post.third) {
          const definitions = getThirdDefinitions(basePath, param.post.third);
          result.definitions = { ...result.definitions, ...definitions };
          delete param.post.third;
        }
      }
    }
    if (tags && tags.length > 0) {
      result.tags = [...result.tags, ...tags];
    }
  }
  const baseDTsUrl = `${basePath}/typings/common.d.ts`;
  const baseDefinitions = getBaseDefinitions(baseDTsUrl);

  result.definitions = { ...result.definitions, ...baseDefinitions };
  result.paths = paths;

  //泛型处理
  for (const key in paths) {
    if (Object.hasOwnProperty.call(paths, key)) {
      const element = paths[key];
      if (element) {
        for (const subKey in element) {
          if (Object.hasOwnProperty.call(element, subKey)) {
            const method = element[subKey];
            if (!method.generic) {
              continue;
            }
            const VOs = method.generic.split("<");
            const baseVO = VOs[0];
            const targetVO = VOs[1].substring(0, VOs[1].length - 1);
            const IBaseResponseVO = JSON.parse(
              JSON.stringify(result.definitions[baseVO])
            );
            if (IBaseResponseVO) {
              if (!NotNeedRefType.includes(targetVO)) {
                const data = {
                  type: "array",
                  items: {
                    $ref: `#/definitions/${targetVO}`,
                  },
                };

                IBaseResponseVO.properties.data = data;
              } else {
                const data = {
                  type: targetVO,
                };

                IBaseResponseVO.properties.data = data;
              }
              //这里***<***> 这种方式没法作为key,所以key要去掉"<"和">"
              result.definitions[baseVO + targetVO] = IBaseResponseVO;
              delete method.generic;
            }
          }
        }
      }
    }
  }

  if (result.tags && result.tags.length > 0) {
    result.tags = result.tags.map((x: any) => {
      return {
        name: x,
      };
    });
  }

  return result;
}
