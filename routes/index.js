/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: '/weapp'
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
// const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/code2Session', controllers.code2Session)
// // 用户信息接口（可以用来验证登录态）
// router.get('/user', validationMiddleware, controllers.user)

// POST
router.post('/collect', controllers.collect.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)

// --- 获取小程序码 --- //
router.get('/acode', controllers.acode)


module.exports = router
