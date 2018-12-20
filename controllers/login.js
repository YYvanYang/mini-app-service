let { code2Session } = require('../signPackage');

// 登录授权接口
module.exports = async (ctx, next) => {
  // 登录凭证校验。通过 wx.login() 接口获得临时登录凭证 code 后传到开发者服务器调用此接口完成登录流程。更多使用方法详见 小程序登录。
  // GET https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
  try {
    const js_code = ctx.query.js_code;
    const session = await code2Session(js_code);
    ctx.body = session;
  } catch (err) {
    console.log("获取小程序session:", err)
    ctx.body = err; // TypeError: failed to fetch
  }
}
