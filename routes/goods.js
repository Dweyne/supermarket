var express = require('express');
var router = express.Router();
// 链接数据库模块
var connection = require('./mysqlCon')

/* GET home page. */
// 添加商品
router.post('/add', function(req, res, next) {
    let {cg_id,barcode,goodsname,goodsprice,marketprice,saleprice,stockNum,weigth,unit,promotion,discount,goodsDetails}=req.body;

    //定义sql语句
    let sqlStr="insert into goodsTable(cg_id,barcode,goodsname,goodsprice,marketprice,saleprice,stockNum,weigth,unit,promotion,discount,goodsDetails) values(?,?,?,?,?,?,?,?,?,?,?,?)"; //占位符
    let sqlParams=[cg_id,barcode,goodsname,goodsprice,marketprice,saleprice,stockNum,weigth,unit,promotion,discount,goodsDetails]; //参数数组
    //执行sql语句
    connection.query(sqlStr,sqlParams, function (error, results) {
      if (error) throw error; //出错对象
      //4. 返回处理的结果到前端
      //"affectedRows":1, 返回受影响的行数，如果大于0就表示成功
      if(results.affectedRows>0){
        res.send({code:200, message:"保存成功，是否继续添加？"})
      }
      else{
        res.send({code:0, message:"保存失败"})
      }
    });

});

// 获取分类信息
router.get('/getCategoryList', (req, res) => {
    let sqlStr = "select t1.*,t2.cg_name AS fathername from categorygoods AS t1 LEFT JOIN categorygoods AS t2 on t1.cg_fatherID=t2.cg_id";
    // 执行语句
    connection.query(sqlStr, (err, results) => {
        if(err) throw err;
        if(results){
            res.send(results);
        }else{
            res.send('');
        }
    })
});

// 获取商品的分页+查询数据信息【分页+查询的合并】
router.get("/listPagerSearch",(req,res)=>{
    //接收页码\每页大小\关键词\分类id
    let {currentPage,pageSize,keywords,category}=req.query;
    
    //构造sql
    let sqlStr="select t1.*,t2.cg_name from goodsTable as t1 left join categorygoods as t2 on t1.cg_id=t2.cg_id where 1=1";
  
    //----------------------------------全表----------------------------------------
    //执行全表sql查询：获取总的记录条数
    connection.query(sqlStr,(err,goodsList)=>{
       if(err) throw err;
       let total=goodsList.length; //总条数
  
      //----------------------------------查询----------------------------------------
      //关键词
      if(keywords.length>0){
        sqlStr+=` and (t1.barcode like '%${keywords}%' or t1.goodsname like '%${keywords}%')`;
      }
  
      //分类
      if(category.length>0){
        sqlStr+=` and cg_id=${category}`;
      }
  
      //执行查询的sql结果
      if(keywords.length>0 || category.length>0){
        connection.query(sqlStr,(err,searchList)=>{
            if(err) throw err;
            //res.send(searchList); //查询的结果
            //修改原来的总记录为查询后的记录数
            total=searchList.length;
        });
      }
       //----------------------------------分页----------------------------------------
       //定义分页参数数组
       let sqlParams=[(currentPage - 1)*pageSize,parseInt(pageSize)];
       sqlStr+=" limit ?,?";
  
       //执行查询当前页码应该显示的分页数据
       connection.query(sqlStr,sqlParams,(err,goodsPager)=>{
          if(err) throw err;
          res.send({"total":total,"datalist":goodsPager});
       });
    });
  });

module.exports = router;
