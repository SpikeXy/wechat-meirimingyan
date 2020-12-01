// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'meitianmy-fp6n2'
})
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const senstenceId = event.senstenceId
  let userItem = await db.collection("User").where({
    userId: openid
  })
  .field({
    favSenstenceList:true
  })
  .get()
  .then(res=>{
    return res.data[0]
  })
  if(userItem.favSenstenceList !=null && userItem.favSenstenceList != undefined && userItem.favSenstenceList.indexOf(senstenceId)>-1){

    return 1
  }else{
    return 0
  }


}