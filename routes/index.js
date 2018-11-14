var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// 获取cookie
router.get('/getUserName', function(req, res, next) {
  let userName = req.cookies.userName;
  res.send({userName});
});

module.exports = router;
