#!/usr/bin/env node
'use strict';
var meow = require( 'meow' );
var headstone = require( './' );

var cli = meow( {
  help: [
    'Usage:',
    '  headstone <file> [--cwd=<path>] [--models=<path>] [--modelsRequire] [--configFile=<file>] [--mongoUri=<uri>]',
    '',
    'Example',
    '  headstone scripts/disableUsers --models=./app/models --mongoUri=mongodb://localhost/myDb'
  ].join( '\n' )
} );
headstone( cli.input, cli.flags );
