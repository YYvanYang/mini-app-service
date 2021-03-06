let { saveFormIds } = require('../signPackage');

/**
 * 响应 GET 请求
 */
async function get (ctx, next) {
  // TODO
    ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'
}

async function post (ctx, next) {

    try {

      const {openId, formIds} = ctx.request.body
      console.log("openId, formIdsWithExpire:",openId, formIds)
      const result = await saveFormIds(openId, formIds);
      ctx.body = result;
    } catch (err) {
      console.log("sendMessage:", err)
      ctx.body = err; // TypeError: failed to fetch
    }

}

module.exports = {
    post,
    get
}