// 云函数入口文件

const appid = 'xxxxx'
const appsecert = 'xxxxxxx'

const cloud = require('wx-server-sdk')

ccloud.init({
  env: 'meitianmy-fp6n2'
})

const rp = require('request-promise')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const getTokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + appsecert

  let content = (await rp({
    url: getTokenUrl,
    method: 'GET',
    body: {},
    json: true
  }))
  return content
}