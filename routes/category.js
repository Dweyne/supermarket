var express = require('express');
var router = express.Router();
// 链接数据库模块
var connection = require('./mysqlCon')

/* GET home page. */
// 添加分类
router.post('/add', function(req, res, next) {
    // 获取信息
    let {cg_id, cg_name, cg_isLocked} = req.body;
    
    // sql语句
    let sqlStr = "insert into categorygoods(cg_name, cg_fatherID, cg_isLocked) values(?,?,?)";
    let paramsArr = [cg_name, cg_id, cg_isLocked];

    connection.query("select cg_name from categorygoods", (error, results) => {
        if (error) throw error;
        if (results) {
          // 设置标杆
          let flag = true;
          // 遍历查询出来的用户名数据
          results.forEach(element => {
            // 如果已经存在用户名就设为false
            if (element.cg_name == cg_name) {
              flag = false;
              return;
            }
          });
          if (flag) {
              // 执行数据库操作
              connection.query(sqlStr,paramsArr, (err, results) => {
                  if(err) throw err;
                  if(results.affectedRows>0){
                      res.send({code:200, message:"保存成功，是否继续添加？"})
                  }else{
                      res.send({code:0, message:"保存失败"})
                  }
              })
          } else {
            res.send({ code: 100, message: "类名已存在！" });
          }
        }
      })

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

module.exports = router;
