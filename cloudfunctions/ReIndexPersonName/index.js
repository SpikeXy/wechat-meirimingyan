// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'meitianmy-fp6n2',
  timeout:150000
})
// 1. 获取数据库引用
const db = cloud.database();
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  //删除一些不需要的名人名字的时候用这个
  // let data = await db.collection('FamousPerson')
  //   .aggregate()
  //   .limit(20000)
  //   .group({
  //     _id: '$FirstNameWord',
  //     Name: $.push('$Name'),
  //     pastId:$.push( '$_id' )
  //   })
  //   .end()
  //   let entity = data.list[7]
  //   for(var i = 0 ; i < entity.pastId.length;i++){
  //     console.log(entity.pastId[i].toString())
  //   }

  let groupPinYinList = (await db.collection('FamousPerson')
    .aggregate()
    .limit(20000)
    .group({
      _id: '$FirstNameWord',
      docId: $.push('$_id')
    })
    .end()).list

  console.log("开始进入查询字符串的过程")
  //先删除集合 PersonIndexes
  // let test = db.collection("PersonIndexes").remove()
  //再创建集合 PersonIndexes
  // db.collection("PersonIndexes").add()
  //如何清空集合的数据？

  for (var i = 0; i < groupPinYinList.length; i++) {
    let entity = groupPinYinList[i]
    let indexName = entity._id
    let indexArray = []
    let docArray = entity.docId
    for (var j = 0; j < docArray.length; j++) {

      let tempDocId = docArray[j].toString()
      // console.log(tempDocId)
      //查询相对应的实体
      await db.collection('FamousPerson')
        .doc(tempDocId).get().then(res => {
          let personEntity = res.data
          if (personEntity != null && personEntity != undefined) {
            let avatar = ""
            if(personEntity.Avatar!=undefined && personEntity.Avatar!=null && personEntity.Avatar!=NaN){
              avatar = personEntity.Avatar
            }
            indexArray.push({
              _id: tempDocId,
              Name: personEntity.Name,
              Avatar: avatar
            })
          }
          groupPinYinList[i].indexArray = indexArray
          console.log("完成"+personEntity.Name)
        })

    }

  }

  for (var i = 0; i < groupPinYinList.length; i++) {
    let entity = groupPinYinList[i]
    let indexName = entity._id
    let indexArray = entity.indexArray
    await db.collection("PersonIndexes").add({
      data:{
        key:indexName,
        dict:indexArray
      }
    })
  console.log(indexName+"完成")
  }






  console.log("全部完成")
  return groupPinYinList
}