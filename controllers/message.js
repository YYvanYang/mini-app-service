let { sendMessage } = require('../signPackage');

/**
 * 响应 GET 请求
 */
async function get (ctx, next) {
  // TODO
    ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'
}

async function post (ctx, next) {

    try {
      const {touser} = ctx.request.body
      console.log('touser:', tosuer)
      const result = await sendMessage(touser);
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
