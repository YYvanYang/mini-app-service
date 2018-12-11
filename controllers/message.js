

/**
 * 响应 GET 请求
 */
async function get (ctx, next) {
  // TODO
    ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'
}

async function post (ctx, next) {
    // TODO

    ctx.body = 'success'
}

module.exports = {
    post,
    get
}
