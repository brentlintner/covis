# Usage

The CLI defaults to the server.start method.

    covis cmd [subcmd] [--flag value]

# Options

  -c/--cov-path    lcov file to parse
  -l/--lib-path    your library folder (all files under test)
  -p/--port        port that the web server runs on

# Example

    covis server -c lcov.info -l lib
