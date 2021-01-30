var express = require('express');
var router = express.Router();

/* POST */
router.post('/', (req, res, next) => {

  const {rule, data} = req.body;

  const respondWithError = (message) => {
    return res.status(400).json({
      "message": message,
      "status": "error",
      "data": null
    });
  }

  const isValidObject = (obj) => {

    if (typeof obj == "object") {
      return true;
    }
    return false;

  }

  const isEmptyObject = (obj) => {
    if (typeof obj == "object" && Object.entries(obj).length == 0) {
      return true;
    }
    return false;
  }

  const allFieldsPassed = (obj) => {
    const required_fields = ['field', 'condition', 'condition_value'];
    let count = required_fields.map(field => {
      if (!obj.hasOwnProperty(field)) {
        return 1;
      }
      return 0
    })

    if (count.includes(1)) {
      return false;
    } else {
      return true;
    }

  }

  // Checks
  // If rule field is not found or empty
  if (typeof rule == "undefined" || isEmptyObject(rule) || !allFieldsPassed(rule)) {
    respondWithError("rule is required.")
  }
  
  // If data field is not found or empty
  if (typeof data == "undefined") {
    respondWithError("data is required.")
  }

  if (!isValidObject(rule)) {
    respondWithError("rule should be an object.")
  }

  let ruleValidator;

  if (rule.field.includes('.')) {
    if (!isValidObject(data)) {
      respondWithError("data is required.")
    }
    const ruleValidatorArray = rule.field.split('.');
    if (ruleValidatorArray.length !== 2) {
      respondWithError("rule should be an object.")
    }
    if (!data.hasOwnProperty(ruleValidatorArray[0])) {
      respondWithError(`field ${ruleValidatorArray[0]} is missing from data.`)
    }
    if (!data[ruleValidatorArray[0]].hasOwnProperty(ruleValidatorArray[1])) {
      respondWithError(`field ${ruleValidatorArray[1]} is missing from ${ruleValidatorArray[0]}.`)
    }
    ruleValidator = data[ruleValidatorArray[0]][ruleValidatorArray[1]] || data;
  } else {

    /*if (typeof rule.field == Number) {
      if (typeof data[rule.field] == undefined) {
         respondWithError("data is required.")
      }
      ruleValidator = data[parseInt(rule.field)] || data;
    }*/

    if (typeof rule.field == "string") {

if (!isValidObject(data)) {
      respondWithError("data is required.")
    }
    
    if (!data.hasOwnProperty(rule.field)) {
      respondWithError(`field ${rule.field} is missing from data.`)
    }

      ruleValidator = data[rule.field];
    }
    
  }
  
  const {condition, condition_value} = rule;

  // If rule validation succeeds
  class Validation {

    success = () => {
      return res.status(200).json({
        "message": `field ${rule.field} successfully validated.`,
        "status": "success",
        "data": {
          "validation": {
            "error": false,
            "field": `${rule.field}`,
            "field_value": `${ruleValidator}`,
            "condition": `${rule.condition}`,
            "condition_value": `${rule.condition_value}`
          }
        }
      })
    }
    
    // If rule validation fails
    failure = () => {
      return res.status(400).json({
        "message": `field ${rule.field} failed validation.`,
        "status": "error",
        "data": {
          "validation": {
            "error": false,
            "field": `${rule.field}`,
            "field_value": `${ruleValidator}`,
            "condition": `${rule.condition}`,
            "condition_value": `${rule.condition_value}`
          }
        }
      })
    }
  }

  const Validate = new Validation();

  switch(condition) {
    case 'eq':
      if (ruleValidator == condition_value) {
        Validate.success();
      } else {
        Validate.failure();
      }

      break;

    case 'neq':
      if (ruleValidator !== condition_value) {
        Validate.success();
      } else {
        Validate.failure();
      }

      break;

    case 'gt':
      if (ruleValidator > condition_value) {
        Validate.success();
      } else {
        Validate.failure();
      }

      break;

    case 'gte':
      if (ruleValidator >= condition_value) {
        Validate.success();
      } else {
        Validate.failure();
      }

      break;

    case 'contains':
      if (ruleValidator.toString().includes(condition_value.toString())) {
        Validate.success();
      } else {
        Validate.failure();
      }

      break;

    default:
      Validate.failure();
  }  

})
  
module.exports = router;
