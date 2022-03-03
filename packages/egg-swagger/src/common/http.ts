import * as urllib from "urllib";
let httpclient = urllib.create();

/**
 *
 * @param {*} url
 * @param {*} data
 */
function post(url: string, data: any) {
  httpclient.request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data,
  });
}

export { post };
