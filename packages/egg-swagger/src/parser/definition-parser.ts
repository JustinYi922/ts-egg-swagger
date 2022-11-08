import { cloneObj, options, NotNeedRefType } from "../common/util";
import * as ts from "typescript";
import * as fs from "fs";
import { ModuleBody, ModuleDeclaration } from "typescript";
import { getSimpleComement } from "./comment-parser";

const definition = {
  type: "object",
  properties: {},
};

/**
 * 解析入参和返回参数
 * @param {*} dir
 */
function getDefinitions(basePath: string, dir: string) {
  const typingsDir = dir.replace("controller", "custom");
  const tsDir = `${basePath}/typings/${typingsDir}.d.ts`;
  return getBaseDefinitions(tsDir);
}

function getBaseDefinitions(tsDir: string) {
  const exists = fs.existsSync(tsDir);
  if (!exists) {
    return {};
  }
  const program = ts.createProgram([tsDir], options);
  const sourceFile = program.getSourceFile(tsDir);
  let definitions: any = {};
  if (sourceFile && sourceFile.text) {
    ts.forEachChild(sourceFile, (item: ModuleDeclaration | any) => {
      //自定义d.ts的文件里面解析入口
      if (ts.isModuleDeclaration(item)) {
        let body: ModuleBody | any = item.body;
        if (!body.statements) {
          return;
        }
        for (const iterator of body.statements) {
          const { name, members, heritageClauses } = iterator;
          let className = name.escapedText;
          let extendsClassName = "";
          let requiredSet = new Set();
          let xRules: any = {};
          if (heritageClauses && heritageClauses.length > 0) {
            const extendObj = heritageClauses[0].types;
            if (extendObj && extendObj.length > 0) {
              extendsClassName = extendObj[0].expression.escapedText;
            }
          }

          if (className && !definitions[className]) {
            definitions[className] = cloneObj(definition);
          }
          if (extendsClassName && extendsClassName != "PlainObject") {
            if (!definitions[extendsClassName]) {
              definitions[extendsClassName] = cloneObj(definition);
            }
            definitions[className].extendsClassName = extendsClassName;
          }

          if (members && members.length > 0) {
            const params = members.reduce((pre: any, subItem: any) => {
              //bean中的参数名
              let paramName = subItem.name && subItem.name.escapedText;

              if (paramName && subItem.type) {
                const { pos, end } = subItem.type;
                let type = sourceFile.text
                  .substring(pos, end)
                  .replace(/\s/g, "");
                let description = "";
                let example = "";
                let items = {}; //数组才用到
                let xRule: any = [];
                let $ref: string = "";
                // 数组 T[]或者Array<T>
                if (type.endsWith("[]")) {
                  type = type.replace("[]", "");
                  if (!NotNeedRefType.includes(type)) {
                    items = {
                      $ref:
                        "#/definitions/" +
                        cloneObj(type).substr(0, cloneObj(type).length - 2),
                    };
                  }
                  type = "array";
                } else if (
                  type.startsWith("Array<") ||
                  type.startsWith("array<")
                ) {
                  type = type.substring(6, type.length - 1);
                  if (!NotNeedRefType.includes(type)) {
                    items = {
                      $ref: "#/definitions/" + type,
                    };
                  }
                  type = "array";
                } else if (type == "PlainObject") {
                  type = "object";
                } else if (!NotNeedRefType.includes(type)) {
                  $ref = "#/definitions/" + type;
                  type = "object";
                }

                if (subItem.jsDoc && subItem.jsDoc.length > 0) {
                  description = subItem.jsDoc[0].comment;

                  if (
                    subItem.jsDoc[0].tags &&
                    subItem.jsDoc[0].tags.length > 0
                  ) {
                    for (const tag of subItem.jsDoc[0].tags) {
                      if (tag.tagName.escapedText === "description") {
                        description = tag.comment;
                      }
                      if (tag.tagName.escapedText === "example") {
                        example = tag.comment;
                      }

                      if (tag.tagName.escapedText === "NotNull") {
                        xRule.push({
                          message: tag.comment || "",
                          required: true,
                        });
                      }
                      if (
                        tag.tagName.escapedText === "MaxLength" &&
                        type == "string"
                      ) {
                        xRule.push({
                          message: tag.comment,
                          required: true,
                        });
                      }
                      if (
                        tag.tagName.escapedText === "min" &&
                        type == "number"
                      ) {
                        let comments = tag.comment.split(" ");
                        let min: any = null;
                        let message = "";
                        if (comments && comments.length >= 1) {
                          min = Number(comments[0]);
                        }
                        if (comments && comments.length >= 2) {
                          message = comments[1];
                        }
                        if (min != null) {
                          xRule.push({
                            message,
                            min,
                          });
                        }
                      }
                      if (
                        tag.tagName.escapedText === "max" &&
                        type == "number"
                      ) {
                        let comments = tag.comment.split(" ");
                        let max: any = null;
                        let message = "";
                        if (comments && comments.length >= 1) {
                          max = Number(comments[0]);
                        }
                        if (comments && comments.length >= 2) {
                          message = comments[1];
                        }
                        if (max != null) {
                          xRule.push({
                            message,
                            max,
                          });
                        }
                      }
                    }
                  }
                }

                if (!subItem.questionToken) {
                  requiredSet.add(paramName);
                }

                pre[paramName] = { type };
                if (description) {
                  pre[paramName].description = description;
                }
                if (example) {
                  pre[paramName].example = example;
                }
                if (items && Object.keys(items).length > 0) {
                  pre[paramName].items = items;
                }
                if ($ref) {
                  pre[paramName].$ref = $ref;
                }
                if (xRule && xRule.length > 0) {
                  xRules[paramName] = xRule;
                }
                return pre;
              }
            }, {});

            definitions[className].properties = params;
            definitions[className]["x-rules"] = xRules;
            if (requiredSet.size > 0) {
              definitions[className].required = Array.from(requiredSet);
            }
          }
        }
      }
    });
  }
  return definitions;
}

function getType(kind: ts.SyntaxKind) {
  switch (kind) {
    case ts.SyntaxKind.StringKeyword:
      return "string";
    case ts.SyntaxKind.NumberKeyword:
      return "number";
    case ts.SyntaxKind.ArrayType:
      return "array";
    default:
      return "object";
  }
}

function getThirdDefinitions(basePath: string, tsDir: string) {
  let path = `${basePath}/node_modules/@${tsDir}`;
  const exists = fs.existsSync(path);
  if (!exists) {
    return {};
  }

  const program = ts.createProgram([path], options);
  const sourceFile = program.getSourceFile(path);
  let definitions: any = {};
  definitions[tsDir] = {
    type: "object",
    properties: {},
  };
  if (sourceFile) {
    ts.forEachChild(sourceFile, (item: ModuleDeclaration | any) => {
      if (ts.isInterfaceDeclaration(item)) {
        if (item.members && item.members.length > 0) {
          item.members.forEach((element: any) => {
            let name = element.name & element.name.escapedText;
            if (name) {
              let property = {
                type: getType(element.kind),
                description: element.jsDoc
                  ? getSimpleComement(element.jsDoc)
                  : "",
              };
              definitions[tsDir].properties[name] = property;
            }
          });
        }
      }
    });
  }
  return definitions;
}

export { getDefinitions, getBaseDefinitions, getThirdDefinitions };
