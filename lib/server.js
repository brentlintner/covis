var
  path = require('path'),
  express = require('express'),
  stylus = require('stylus'),
  logger = require('./logger'),
  parser = require('./parser'),
  log = logger.create('server'),
  web_modules = path.join(__dirname, '..', 'web'),
  bower_modules = path.join(__dirname, '..', 'bower_modules')

function render(view) {
  return function (req, res) {
    res.render(view)
  }
}

function bind_routes(app, cov_data) {
  app.get('/', render('app/graph'))
  app.get('/app/graph/data.json', function (req, res) {
    res.set('content-type', 'application/json')
    res.end(JSON.stringify(cov_data))
  })
}

function run_server(opts, callback) {
  var
    app = express(),
    port = opts.port || 5000

  app.set('view engine', 'jade')
  app.set('views', web_modules)

  app.use(function(req, res, next){
    log.info(req.method + ' ' + req.url), next()
  })

  app.use(function (req, res, next) {
    res.set("Cache-Control", "private, max-age=0, no-cache"), next()
  })

  app.use(stylus.middleware({src: web_modules, dest: web_modules}))
  app.use(express.static(web_modules))
  app.use(express.static(bower_modules))

  parser.lcov_to_d3_json(opts, function (err, graph_json) {
    bind_routes(app, graph_json)

    app.use(function (req, res) {
      res.send(404, "Whoops. Looks like what you're looking for can't be found. :(")
    })

    log.info('launching app on:')
    log.info('  http://localhost:' + port)

    app.listen(port, callback)
  })
}

module.exports = {
  start: function (opts, callback) {
    run_server(opts, function () {
      log.info('all stations ready, captain!')
      if (callback) callback()
    })
  }
}
