function getSimpleComement(value: any[]) {
  if (value && value.length > 0) {
    return value[0].comment;
  }
  return "";
}

/**
 * 解析方法注解上的summary、request、description、response
 * @param {*} obj
 * @param {*} key
 * @param {*} result
 * @returns
 */
function getComment(obj: any, key: string, result: any) {
  if (obj.tagName && obj.tagName.escapedText === key) {
    return obj.comment;
  }
  return result;
}

function getCommentV2(obj: any, key: string) {
  let result: any = [];
  if (obj.tagName && obj.tagName.escapedText === key) {
    const comment = obj.comment;
    let temArr = comment.match(/[0-9a-zA-Z\u4e00-\u9fa5\,\;\'\"@]*/g);
    if (temArr && temArr.length > 0) {
      temArr = temArr.filter((x: any) => !!x);
      if (temArr && temArr.length >= 1) {
        result.push({
          name: temArr[0],
          in: key,
          type: temArr && temArr.length >= 2 && temArr[1],
          description: temArr && temArr.length >= 3 && temArr[2],
          required: comment.endsWith("required"),
        });
      }
    }
  }
  return result;
}

export { getSimpleComement, getComment, getCommentV2 };
