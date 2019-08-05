const request = require("request");

let testUrl = "https://kith.com";

export const checkProxy = (myProxy, username, password) => {
  console.log("proxy", myProxy, username, password);
  let proxy = "http://" + myProxy;
  if (username) proxy = `http://${username}:${password}@${myProxy}`;

  return new Promise((resolve, reject) => {
    request.get(
      testUrl,
      {
        proxy,
        time: true
      },
      (err, resp) => {
        if (err) {
          resolve("bad");
        } else {
          resolve(parseInt(resp.elapsedTime - 700) + "");
        }
      }
    );
  });
};

export const setTestUrl = url => {
  testUrl = url;
};
