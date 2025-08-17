// In middleware/delay.js
module.exports = function(req, res, next) {
  setTimeout(next, 500); // 500 millisecond delay
};