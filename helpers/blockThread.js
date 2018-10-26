// Blocks the thread for a given number of milliseconds
// Use carefully and sparingly!
exports.blockThread = ms => {
  var start = Date.now(),
      now = start
  while (now - start < ms) {
    now = Date.now()
  }
}