#!/usr/bin/env node
'use strict';
var meow = require('meow');
var headstone = require('./');

var cli = meow({
  help: [
    'Usage',
    '  headstone <input>',
    '',
    'Example',
    '  headstone disableUsers'
  ].join('\n')
});
headstone(cli.input, cli.flags);
