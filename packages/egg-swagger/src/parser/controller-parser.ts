import * as ts from "typescript";
import * as fs from "fs";
import { getTag } from "./tag-parser";
import { getComment, getCommentV2 } from "./comment-parser";
import { options } from "../common/util";
import { SourceFile } from "typescript";

/**
 * 解析controller
 * @param {*} dir
 * @param {*} params
 * @returns
 */
export default function parseController(
  basePath: string,
  dir: string,
  params: any = {}
) {
  let path = `${basePath}/app/${dir}.ts`;
  const exists = fs.existsSync(path);
  if (!exists) {
    return null;
  }

  let tags: any[] = [];

  const program = ts.createProgram([path], options);
  const sourceFile = program.getSourceFile(path) as SourceFile;
  for (const iterator of sourceFile.getChildren()) {
    for (const classIterator of iterator.getChildren()) {
      if (ts.isClassDeclaration(classIterator)) {
        //类的注释
        tags = getTag(classIterator);

        //开始解析方法注释
        ts.forEachChild(classIterator, (methodNode: any) => {
          if (ts.isMethodDeclaration(methodNode)) {
            const { name } = methodNode as any;
            let methodName = name.escapedText;
            if (params[methodName]) {
              let item = {
                tags,
                operationId: methodName,
                parameters: [],
                responses: {
                  200: {
                    description: "successful operation",
                  },
                },
              };

              const methodItem = getPathContent(methodNode);
              item = { ...item, ...methodItem };
              if (params[methodName].get) {
                params[methodName].get = item;
              }
              if (params[methodName].post) {
                params[methodName].post = item;
              }
            }
          }
        });
      }
    }
  }

  return {
    tags,
    params,
  };
}

/**
 * 解析方法上的注释获取path内容
 * @param {*} methodNode
 * @returns
 */
function getPathContent(methodNode: any) {
  const jsDocs = methodNode.jsDoc;
  let item: any = {
    parameters: [],
    third: "",
  };
  if (jsDocs && jsDocs.length > 0) {
    const jsDoc = jsDocs[0];
    if (jsDoc.comment) {
      const temArr = jsDoc.comment.split("\n");
      if (temArr && temArr.length > 0) {
        item.summary = temArr[0];
      }
    }
    if (jsDoc && jsDoc.tags && jsDoc.tags.length > 0) {
      for (const iterator of jsDoc.tags) {
        if (iterator && iterator.tagName.escapedText == "deprecated") {
          item.deprecated = true;
        }
        item.summary = getComment(iterator, "summary", item.summary);
        const request = getComment(iterator, "request", item.request);
        if (request) {
          let itemParameter: any = {
            in: "body",
            name: "body",
            required: true,
            schema: {
              $ref: `#/definitions/${request}`,
            },
          };
          if (request.endsWith("[]")) {
            itemParameter.schema = {
              type: "array",
              items: {
                $ref: `#/definitions/${request.replace("[]", "")}`,
              },
            };
          }
          item.parameters = [itemParameter];
        }

        item.description = getComment(
          iterator,
          "description",
          item.description
        );
        const response = getComment(iterator, "response", item.response);
        if (response) {
          let targetVO = response;
          if (response.includes("<") && response.endsWith(">")) {
            item.generic = response;
            targetVO = response.replace(/\<|\>/g, "");
          }
          item.responses = {
            200: {
              description: "successful operation",
              schema: {
                $ref: `#/definitions/${targetVO}`,
              },
            },
          };
          if (response.endsWith(".d.ts")) {
            item.third = response;
          }
        }
        item.parameters = [
          ...item.parameters,
          ...getCommentV2(iterator, "path"),
        ];
        item.parameters = [
          ...item.parameters,
          ...getCommentV2(iterator, "query"),
        ];
      }
    }
  }

  return item;
}
