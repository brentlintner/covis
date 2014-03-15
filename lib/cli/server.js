var server = require('./../server')

function elongate_option(short, long, opts) {
  if (opts.hasOwnProperty(short)) {
    opts[long] = opts[short]
    delete opts[short]
  }
}

function start(opts) {
  elongate_option('p', 'port', opts)
  elongate_option('c', 'cov-path', opts)
  elongate_option('l', 'lib-path', opts)

  server.start(opts)
}

module.exports = {
  default: start,
  start: start
}
