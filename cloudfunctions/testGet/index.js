// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'meitianmy-fp6n2'
})
// 1. 获取数据库引用
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let personIdTempArr = [
    '5ce74bee65079d8e6157922b'
  ]
  let testIds = ['1','2','3','4','222']
  for(var i = 0; i < personIdTempArr.length ; i++){
    var temp = await db.collection('FamousPerson').doc(personIdTempArr[i])
      .field({
        Name: true,
        Id: true
      })
      .get()
      .then(res => {
        console.log("进来了")
        console.log(res)
        return res;
      });
      personNameItem.push(temp)
  }
 
  console.log("_id里面的数据是")
  console.log(personNameItem)

  return 1
}