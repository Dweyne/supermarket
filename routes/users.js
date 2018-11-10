var express = require('express');
var router = express.Router();
// 引入mysql模块
var mysql = require('mysql');
// 引入md5加密模块
var md5 = require('crypto');

// 配置数据库
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'smms'
})

// 链接数据库
connection.connect();

/* GET users listing. */
router.post('/add', function (req, res, next) {
  // 接收从前台传入的数据
  let { username, pass, usergroup } = req.body;
  // 对密码进行加密
  pass = md5.createHash('md5').update(pass).digest('hex');
  // 定义sql语句
  // let sqlStr = `insert into usersTable(userName, userPwd, userGroup) values('${username}','${pass}','${usergroup}')`;
  let sqlStr = "insert into usersTable(userName, userPwd, userGroup) values(?,?,?)";
  // 执行sql语句
  connection.query("select userName from usersTable", (error, results) => {
    if (error) throw error;
    if (results) {
      // 设置标杆
      let flag = true;
      // 遍历查询出来的用户名数据
      results.forEach(element => {
        // 如果已经存在用户名就设为false
        if (element.userName == username) {
          flag = false;
          return;
        }
      });
      if (flag) {
        connection.query(sqlStr, [username, pass, usergroup], (error, results) => {
          if (error) throw error;
          if (results) {
            res.send({ code: 200, message: "增加成功！" });
          } else {
            res.send({ code: 0, message: "增加失败！" });
          }
        })
      } else {
        res.send({ code: 100, message: "用户名已存在！" });
      }
    }
  })
});

// 查询账号
router.get('/find', (req, res) => {
  // 查询语句
  let sqlStr = "select * from usersTable";
  // 查询
  connection.query(sqlStr, (error, results) => {
    if (error) throw error;
    if(results) {
      res.send(results);
    }
  })
})

module.exports = router;
