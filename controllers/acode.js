let { getACode } = require('../signPackage');

// 获取小程序码
module.exports = async (ctx, next) => {
  try {
    const code = await getACode();
    ctx.body = code;
  } catch (err) {
    console.log("获取小程序码:", err)
    ctx.body = err; // TypeError: failed to fetch
  }
}
