var sign = require('./sign.js');
var rp = require('request-promise');

require('dotenv').config();

let redis = require('redis');
let client = redis.createClient(6379, 'redis');
let Promise = require('bluebird');
Promise.promisifyAll(redis);

async function getAccessToken() {
  let access_token = await client.getAsync('accessToken');

  if (access_token) {
    return access_token;
  }

  let appid = process.env.APPID;
  let appSecret = process.env.APPSECRET;
  var options = {
    uri: 'https://api.weixin.qq.com/cgi-bin/token',
    qs: {
      grant_type: 'client_credential',
      appid: appid,
      secret: appSecret
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
  };

  let result = await rp(options);

  client.set('accessToken', result.access_token, 'EX', 7000);

  return result.access_token;
}

async function getJsApiTicket() {
  let ticket = await client.getAsync('jsapiTicket');

  if (ticket) {
    return ticket;
  }

  const token = await getAccessToken();

  var options = {
    uri: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
    qs: {
      type: 'jsapi',
      access_token: token
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
  };

  let result = await rp(options);

  client.set('jsapiTicket', result.ticket, 'EX', 7000);

  return result.ticket;
}

async function getSignPackage(url) {
  const jsapi_ticket = await getJsApiTicket();
  let _sign = sign(jsapi_ticket, url);
  return { ..._sign, appId: process.env.APPID };
}

//  获取小程序码
async function getACode() {
  const token = await getAccessToken();

  // http://blog.csdn.net/u014477038/article/details/70056171
  let postData = {
    scene: 'TODO',
    width: 430,
    auto_color: false,
    line_color: { r: '0', g: '0', b: '0' }
  };

  let options = {
    method: 'POST',
    uri: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit',
    qs: {
      access_token: token
    },
    body: JSON.stringify(postData), // important!!!
    json: true
  };

  let result = await rp(options);

  return result;

  // rp(options).then(parsedBody => {
  //   // POST successed...
  // })
  // .catch(err=> {
  //   // POST failed...
  // })
}

// 登录凭证校验。通过 wx.login() 接口获得临时登录凭证 code 后传到开发者服务器调用此接口完成登录流程。更多使用方法详见 小程序登录。
// GET https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
async function code2Session(js_code) {
  let appid = process.env.APPID;
  let appSecret = process.env.APPSECRET;
  var options = {
    uri: 'https://api.weixin.qq.com/sns/jscode2session',
    qs: {
      js_code,
      appid: appid,
      secret: appSecret,
      grant_type: 'authorization_code'
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
  };

  let result = await rp(options);

  return result;
}

// sendTemplateMessage
// POST https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=ACCESS_TOKEN
async function sendMessage(touser) {
  const token = await getAccessToken();

  const form_id = await getValidFormId(touser);

  console.log('form_id:', form_id);

  // http://blog.csdn.net/u014477038/article/details/70056171
  let postData = {
    touser, // 接收者（用户）的 openid
    template_id: 'HJ3Ci4gj_gXiNrqiVFUpvvEjEVomu8bQhRdtL68O8P8', // 所需下发的模板消息的id
    form_id,
    data: {
      keyword1: {
        value: '培训课程1'
      },
      keyword2: {
        value: '12345678911'
      },
      keyword3: {
        value: '2018年12月20日'
      },
      keyword4: {
        value: '张三11'
      }
    }
  };

  let options = {
    method: 'POST',
    uri: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send',
    qs: {
      access_token: token
    },
    body: postData,
    json: true
  };

  let result = await rp(options);

  return result;

  // rp(options).then(parsedBody => {
  //   // POST successed...
  // })
  // .catch(err=> {
  //   // POST failed...
  // })
}

function saveFormIds(openId, formIds) {
  _saveFormIds(openId, formIds);
}

module.exports = {
  getAccessToken,
  getSignPackage,
  getACode,
  code2Session,
  saveFormIds,
  sendMessage
};

/**
 *
 *
 * @param {*} openId
 * @param {*} formIds: [{formId, expire}]
 */
function _saveFormIds(openId, formIds) {
  console.log('saving formIds:', formIds);
  console.log('typeof formIds:', typeof formIds);
  const ids = JSON.stringify(formIds);
  console.log('typeof ids:', typeof ids);
  console.log('saving formIds JSON:', ids);
  client.set(openId, ids, 'EX', 60 * 60 * 24 * 7 - 60 * 60, redis.print);
}

/**
 *
 *
 * @param {*} openId
 * @returns
 */
async function getValidFormId(openId) {
  let items = await client.getAsync(openId);
  console.log('cached formIds:', items)
  // const items = client.get(openId, function(err, reply) {
  //   // reply is null when the key is missing
  //   console.log(err, reply);
  // });
  if (items) {
    const formIdsWithExpire = JSON.parse(items);

    console.log('formIdsWithExpire:', formIdsWithExpire);

    while (formIdsWithExpire.length) {
      const item = formIdsWithExpire.shift();
      console.log('item formid:', item);
      if (item.expire > Date.now()) {
        // update formIds
        _saveFormIds(openId, formIdsWithExpire);
        return item.formId;
      }
    }

    // no valid formIds, clear formIds
    client.del(openId);
  }
}
