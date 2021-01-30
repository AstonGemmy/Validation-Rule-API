var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).json({
    "message": "My Rule-Validation API",
    "status": "success",
    "data": {
      "name": "Uwakmfon Sunday Akpan",
      "github": "@astongemmy",
      "email": "astongemmy@gmail.com",
      "mobile": "08103561805",
      "twitter": "@astongemmy"
    }
  });
});

module.exports = router;
