var
  parse = require('lcov-parse'),
  fs = require('fs'),
  path = require('path'),
  logger = require('./logger')

// TODO: this may not be exactly the same as lcov line.found?
function count_loc(file) {
  var
    non_loc = /^\s*(\/\/.*)?$/,
    loc = 0

  fs.readFileSync(file, "utf-8")
    .replace(/\n$/, '')
    .split("\n")
    .forEach(function (line) {
      if (line && !line.match(non_loc)) loc++
    })

  return loc
}

function collect_files(p, matches) {
  var files = []
  if (fs.statSync(p).isDirectory()) {
    fs.readdirSync(p).forEach(function (item) {
      files = files.concat(collect_files(path.join(p, item), matches))
    })
  } else if (!matches || matches(p)) {
    files.push(p)
  }
  
  return files
}

// TODO: this could be a lot more robust
function node_size(loc) {
  return loc < 5 ? 5 : (loc > 299 ? 300 : loc)
}

function lcov_to_d3_json(opts, callback) {
  var log = logger.create('parser')

  parse(opts['cov-path'], function(err, lcov_data) {
    if (err) return log.error(err), callback(err)

    var
      flare_data = {name: "tests", children: []},
      lib_files = collect_files(opts['lib-path'],
                          function (p) { return p.match(/\.js$/) }),
      uncovered_files = lib_files.filter(function (file) {
        return !lcov_data.some(function (item) {
          return path.resolve(file) == path.resolve(item.file)
        })
      })

    lcov_data.forEach(function (item) {
      var percent = (item.lines.hit / item.lines.found) * 100

      flare_data.children.push({
        name: item.file.match(/[^\/]*$/, '')[0],
        coverage: percent,
        loc: item.lines.found,
        size: node_size(item.lines.found)
      })
    })

    uncovered_files.forEach(function (file) {
      var loc = count_loc(file)
      flare_data.children.push({
        name: file.match(/[^\/]*$/, '')[0],
        coverage: 0,
        loc: loc,
        size: node_size(loc)
      })
    })

    callback(null, flare_data)
  })
}
module.exports = {
  lcov_to_d3_json: lcov_to_d3_json
}
