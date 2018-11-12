// 引入mysql模块
var mysql = require('mysql');

// 配置数据库
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'smms'
})

// 链接数据库
connection.connect();

// 暴露出去
module.exports = connection;