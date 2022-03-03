/**
 * 获取类顶部tag
 * @param {*} classIterator
 * @returns
 */
function getTag(classIterator: any) {
  const jsDocs = classIterator.jsDoc;
  if (jsDocs && jsDocs.length > 0) {
    const jsDoc = jsDocs[0];
    if (jsDoc && jsDoc.comment) {
      return [getTagName(jsDoc.comment)];
    } else {
      const jsTags = jsDoc.tags;
      if (jsTags && jsTags.length > 0) {
        return [getTagName(jsTags[0].comment)];
      }
    }
  }

  return [];
}

function getTagName(str: string) {
  if (!str) {
    return "";
  }
  const tagArr = str.split("\n");
  if (tagArr && tagArr.length > 0) {
    return tagArr[0];
  }
}
export { getTag };
