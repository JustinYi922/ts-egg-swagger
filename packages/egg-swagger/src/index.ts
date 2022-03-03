#!/usr/bin/env node

import * as fs from "fs";
import { isEmpty } from "./common/util";
import { post } from "./common/http";
import parseSwagerData from "./parser/main";
import express from "express";
import { join } from "path";

/**
 * 插件入口
 */
(() => {
  //当前目录
  const basePath = process.cwd();

  //命令行参数
  const arvs = process.argv;
  //是否保存swagger数据
  let saveSwagerData = true;

  //是否发送到YApi
  const sendToYApi = !isEmpty(arvs) && arvs.includes("--yapi");

  //发送的YApi地址
  const yApiUrl = sendToYApi ? arvs[arvs.indexOf("--yapi") + 1] : "";

  const swaggerUI = !isEmpty(arvs) && arvs.includes("swagger-ui");

  let RESULT;

  const swagerData = parseSwagerData(basePath);

  //egg项目package.json
  let _packageInfo = require(basePath + "/package.json");

  RESULT = {
    swagger: "2.0",
    schemes: ["http", "https"],
    consumes: ["application/json"],
    produces: ["application/json"],
    info: {
      title: _packageInfo.name,
      description: _packageInfo.description,
      version: _packageInfo.version || "0.0.1",
    },
    tags: swagerData.tags,
    paths: swagerData.paths,
    definitions: swagerData.definitions,
  };
  
  //swagger目录
  const swaggerpath = basePath + "/swagger";
  //存入本地swagger
  if (saveSwagerData) {
    //存入本地文件
    const swaggerDir = fs.existsSync(swaggerpath);
    if (!swaggerDir) {
      fs.mkdirSync(swaggerpath);
    }
    fs.writeFileSync(swaggerpath + "/swagger.json", JSON.stringify(RESULT));
  }
  //直接生成在线接口文档
  if (swaggerUI) {
    var app = express();
    const publicPath = join(__dirname, "..", "public");

    app.use("", express.static(publicPath));
    app.use("/static", express.static(swaggerpath));
    app.listen(9999, function () {
      console.log(`swagger-ui.html on port http://localhost:9999`);
    });
  }

  //发送给Yapi
  if (sendToYApi && yApiUrl) {
    try {
      post(yApiUrl, JSON.stringify(RESULT));
    } catch (err) {
      console.error(err);
    }
  }
})();
