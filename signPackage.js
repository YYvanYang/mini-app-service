var sign = require('./sign.js');
var rp = require('request-promise');

require('dotenv').config()

let redis = require('redis');
let client = redis.createClient(6379, 'redis');
let Promise = require("bluebird");
Promise.promisifyAll(redis);

async function getAccessToken () {
    let access_token = await client.getAsync('accessToken')

    if (access_token) {
        return access_token
    }

    let appid = process.env.APPID
    let appSecret = process.env.APPSECRET
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

    let result = await rp(options)

    client.set('accessToken', result.access_token, 'EX', 7000);

    return result.access_token;
 }

async function getJsApiTicket () {
    let ticket = await client.getAsync('jsapiTicket')

    if (ticket) {
        return ticket
    }

    const token = await getAccessToken()

    var options = {
        uri: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
        qs: {
            type: 'jsapi',
            access_token: token,
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };

    let result = await rp(options)

    client.set('jsapiTicket', result.ticket, 'EX', 7000);

    return result.ticket;

 }

 async function getSignPackage(url) {
    const jsapi_ticket = await getJsApiTicket()
    let _sign = sign(jsapi_ticket, url)
    return { ..._sign, appId: process.env.APPID }
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
  }

  let options = {
    method: 'POST',
    uri: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit',
    qs: {
      access_token: token
    },
    body: JSON.stringify(postData) // important!!!
  };

  return request(options);
}

module.exports = {
  getAccessToken,
  getSignPackage,
  getACode
}
