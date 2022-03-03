import * as ts from "typescript";

const NotNeedRefType = ["string", "number", "integer", "boolean", "enum"];

/**
 * 是否相等
 * 目前仅支持string,num
 * @param {*} a
 * @param {*} b
 * @returns
 */
function equal(a: any, b: any) {
  if (isEmpty(a) && isEmpty(b)) {
    return true;
  }
  if (!isEmpty(a) && !isEmpty(b)) {
    return a === b;
  }
  return false;
}

/**
 * 判读是否为空
 * 支持string,object,Array
 * @param {*} value
 * @returns
 */
function isEmpty(value: any) {
  if (value == null || value == undefined || value == "" || value == {}) {
    return true;
  }

  if (typeof value == "object" && value instanceof Array && value.length == 0) {
    return true;
  }

  return false;
}

function cloneObj(o: any) {
  return JSON.parse(JSON.stringify(o));
}
/**
 * 路由处理
 *
 * @param {*} url
 * @returns
 */
function convertUrl(url: string) {
  let temArr = url.split("/");
  if (temArr && temArr.length > 0) {
    return (
      "/" +
      temArr
        .filter((x) => !!x)
        .map((x) => {
          if (x.startsWith(":")) {
            return "{" + x.substr(1, x.length) + "}";
          }
          return x;
        })
        .join("/")
    );
  }
  return url;
}

const options = {
  target: ts.ScriptTarget.ES2019,
  kind: ts.ScriptKind.TS,
  module: ts.ModuleKind.CommonJS,
};

export {
  isEmpty,
  equal,
  cloneObj,
  convertUrl,
  options,
  NotNeedRefType
};
