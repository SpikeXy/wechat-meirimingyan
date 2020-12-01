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
  const openid = wxContext.OPENID
  let pageIndex = 1
  if (event.pageIndex != undefined) {
    pageIndex = parseInt(event.pageIndex)
  }
  const pageSize = 10
  let itemCount = pageSize * (pageIndex - 1)

  var personArray = []
  let favPersonIdArray = []


  var userItem = await db.collection('User')
    .where({
      userId: openid
    })
    .field({
      favPersonList: true,
    })
    .get()
    .then(res => {
      return res.data[0];
    });

  if (userItem != null && userItem != undefined) {
    let favPersonList = userItem.favPersonList

    if (favPersonList != undefined && favPersonList.length > 0) {
      if (favPersonList.length > itemCount) {
        //从itemCount位置开始计算20个返回
        let j = 0
        for (var i = itemCount; i < favPersonList.length; i++) {
          j++
          if (j == 20) {
            break
          } else {
            favPersonIdArray.push(favPersonList[i])
          }
        }

      }
    }
  } else {
    return ""
  }


  for (var i = 0; i < favPersonIdArray.length; i++) {
    let favPersonId = favPersonIdArray[i]
    let stempItem = await db.collection('FamousPerson')
      .doc(favPersonId)
      .get()
      .then(res => {
        return res.data;
      });
    personArray.push(stempItem)
  }

  return personArray
}