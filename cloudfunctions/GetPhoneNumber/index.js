// 云函数入口文件
const cloud = require('wx-server-sdk')
let appid = "wx8f602e47037c297c"
let appsecert = "e4ac5c6115217d380925c73014d5304b"
cloud.init({
  env: 'meitianmy-fp6n2'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var phoneData = event.phoneData
  return phoneData
}