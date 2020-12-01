// 云函数入口文件
const cloud = require('wx-server-sdk')
var pinyin = require("node-pinyin")

cloud.init()
// 1. 获取数据库引用
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  
var operIds = []
  var sumCount = await db.collection('FamousPersonInUse')
  .count()
  .then(res => {
    return res.total;
  });

  for(var x = 207  ;x<sumCount+1;x++){
    var idTemp = x.toString()
    var personItem = await db.collection('FamousPersonInUse')
    .where({
      Id: idTemp
    })
    .field({
      PersonId:true
    })
    .get()
    .then(res=>{
      return res.data[0]
    })
  if(personItem!=null && personItem != undefined){
    console.log(x+"项开始进行")
  var personId = personItem.PersonId
  var personContent = await db.collection('FamousPerson')
  .where({
    Id: personId
  })
  .field({
    Name:true
  })
  .get()
  .then(res=>{
    return res.data[0]
  })
  var nameTemp = personContent.Name
  var pyName = pinyin(nameTemp)
  var pyNameFirst = pyName[0].toString()
  var updateItem = await db.collection('FamousPerson')
    .where({
      Id: personId
    })
    .update({
      data:{
        NamePinYin: pyName
      }
    }); 

    var updateSubject = await db.collection('FamousPersonInUse')
    .where({
      Id: idTemp
    })
    .update({
      data:{
        NamePinYin: pyNameFirst
      }
    }); 
    console.log(x+"的执行结果"+ updateSubject)
    operIds.push(x)
  }
    //endFor
  }
}