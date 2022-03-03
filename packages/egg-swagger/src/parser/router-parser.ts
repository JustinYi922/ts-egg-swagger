import { convertUrl, options } from "../common/util";
import * as ts from "typescript";
import { SourceFile } from "typescript";

//允许解析的http方法
const httpArray = ["get", "post", "all"];

/**
 * 分析路由
 * @returns
 */
export default function parseRouter(basePath: string) {
  //路由文件
  const file = basePath + "/app/router.ts";
  const fileNames = [file];
  const program = ts.createProgram(fileNames, options);
  const sourceFile: SourceFile | any = program.getSourceFile(file);
  let paths: any = {};
  // Loop through the root AST nodes of the file
  ts.forEachChild(sourceFile, (node: any) => {
    if (ts.isExportAssignment(node)) {
      ts.forEachChild(node, (n1: any) => {
        if (ts.isArrowFunction(n1)) {
          ts.forEachChild(n1, (n2: any) => {
            if (ts.isBlock(n2)) {
              ts.forEachChild(n2, (n3: any) => {
                if (ts.isExpressionStatement(n3)) {
                  ts.forEachChild(n3, (n4: any) => {
                    if (ts.isCallExpression(n4)) {
                      let httpMethod: any = "";
                      let url = "";
                      let controllerPath = "";
                      let methodName = "";
                      ts.forEachChild(n4, (n5: any) => {
                        //获取http方法
                        if (ts.isPropertyAccessExpression(n5)) {
                          ts.forEachChild(n5, (n6: ts.Node | any) => {
                            if (
                              ts.isIdentifier(n6) &&
                              httpArray.includes(n6.escapedText as string)
                            ) {
                              httpMethod = n6.escapedText;
                            }
                          });
                          const pathAndMethod = sourceFile.text
                            .substring(n5.pos, n5.end)
                            .replace(/\s*/gm, "");

                          if (pathAndMethod.startsWith("controller.")) {
                            controllerPath = pathAndMethod
                              .substring(0, pathAndMethod.lastIndexOf("."))
                              .replace(/\./g, "/")
                              .replace(/[A-Z]{1}/gm, function ($1: string) {
                                return "-" + $1.toLocaleLowerCase();
                              });
                            methodName = pathAndMethod.substring(
                              pathAndMethod.lastIndexOf(".") + 1,
                              pathAndMethod.length
                            );
                          }
                        }
                        if (ts.isStringLiteral(n5)) {
                          url = convertUrl(n5.text);
                        }
                        if (httpMethod && controllerPath && methodName && url) {
                          let item: any = {
                            url,
                          };

                          if (httpMethod == "all") {
                            item.get = {};
                            item.post = {};
                          } else {
                            item[httpMethod] = {};
                          }

                          if (!paths[controllerPath]) {
                            paths[controllerPath] = {};
                          }
                          paths[controllerPath][methodName] = item;
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });

  return paths;
}
