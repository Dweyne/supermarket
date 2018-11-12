var express = require('express');
var router = express.Router();
// 引入md5加密模块
var md5 = require('crypto');

// 配置数据库
var connection = require('./mysqlCon');


/* GET users listing. */
// 添加用户
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

// 查询所有账号
router.get('/find', (req, res) => {
  // 查询语句
  let sqlStr = "select * from usersTable order by u_id desc";
  // 查询
  connection.query(sqlStr, (error, results) => {
    if (error) throw error;
    if (results) {
      res.send(results);
    }
  })
});

// 按照id查找用户
router.get('/getUserById', (req, res) => {
  let u_id = req.query.u_id;
  // 查询语句
  let sqlStr = "select * from usersTable where u_id=?";
  // 查询
  connection.query(sqlStr, [u_id], (error, results) => {
    if (error) throw error;
    if (results) {
      res.send(results);
    }
  })
})

// 编辑保存用户
router.post('/saveUser', (req, res) => {
  let { u_id, username, pass, usergroup } = req.body;
  // 对密码进行加密
  pass = md5.createHash('md5').update(pass).digest('hex');
  // 查询语句
  let sqlStr = "update usersTable set userName=?,userPwd=?,userGroup=? where u_id=?";
  let paramsArr = [username,pass,usergroup,u_id];
  // 执行更新
  connection.query(sqlStr, paramsArr,(error, results) => {
    if (error) throw error;
    if (results.affectedRows>0) {
      res.send({code:200, message:"保存成功"});
    }else{
      res.send({code:0, message:"保存失败"});
    }
  })

})

// 检测登录
router.post('/checkUser', (req, res) => {
  // 获取前台传来的数据
  let { userName, checkPass } = req.body;
  // 对密码进行加密
  checkPass = md5.createHash('md5').update(checkPass).digest('hex');
  // 查询字符串
  let sqlStr = "select u_id from usersTable where userName=? and userPwd=?";
  let paramsArr = [userName, checkPass];
  // 执行查询语句
  connection.query(sqlStr, paramsArr, (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      // 写入cookie
      res.cookie("userName", userName);
      res.cookie("u_id", results[0].u_id);
      res.send({ code: 200, message: "登录成功" });
    } else {
      res.send({ code: 0, message: "登录失败，请确认用户名和密码！" });
    }

  })

});

// 删除用户
router.get('/delUser', (req, res) => {
  let u_id = req.query.u_id;
  // 删除sql语句字符串
  let sqlStr = "delete from usersTable where u_id=?";
  // 执行操作
  connection.query(sqlStr, [u_id], (err, results) => {
    if (err) throw err;
    if (results.affectedRows > 0) {
      res.send({ code: 200, message: "删除成功" })
    } else {
      res.send({ code: 0, message: "删除失败" })
    }
  })
})


// 登出
router.get('/logout', (req, res) => {
  // 清除cookie
  res.clearCookie("userName");
  res.clearCookie("u_id");

  // 重定向回登录页面
  res.redirect('/login.html');
})

router.get('/forbid', (req,res) => {
  if(!req.cookies.userName){
    res.send("alert('非正常访问，请登录访问！');location.href='./login.html'")
  }else{
    res.send('');
  }
})

module.exports = router;
