'use strict';
var debug = require( "debug" )( "headstone" );
var _ = require( "lodash" );
var konfy = require( "konfy" );
var path = require( "path" );
var async = require( "async" );
var di = require( "asyncdi" );
var reqmod = require( "require-module" );
var chalk = require( "chalk" );

function log(){
  var args = _.toArray( arguments );
  var color = ( _.isFunction( args[ 0 ] ))
    ? args.shift()
    : chalk.gray;
  args = _.map( args, function( arg ){
    return color( arg );
  } );
  console.log.apply( null, [ chalk.blue( "[Headstone]" ) ].concat( args ) );
}

function startKeystone( opts ){
  debug( "Starting local keystone" );
  var keystone = reqmod( "keystone", process.cwd() ); // local
  keystone.init( opts.keystone );
  var mongoUri = opts.mongoUri || process.env.MONGO_URI;
  debug( "Connecting to mongoose URI:", mongoUri );
  keystone.mongoose.connect( mongoUri );
  debug( "Importing models:", path.join( opts.keystone[ "module root" ], opts.models ) );
  keystone.import( opts.models );
}

function processFiles( files,
                       opts ){
  async.eachSeries( files, function( filename,
                                     next ){
    log( "Processing file:", chalk.green( filename ) );
    var resolved = path.resolve( filename );
    debug( "Resolved path to script:", resolved );
    var parsed = path.parse( resolved );
    var config;
    try{
      config = require( path.join( parsed.dir, parsed.name + ".json" ) );
    } catch( e ) {
      config = {};
    }
    var values = _.defaults( {}, opts, config );
    var module;
    try{
      module = require( resolved );
    } catch( e ) {
      return next( new Error( "An error occurred when requiring '" + filename + "': "+ err.message ) );
    }
    di( module, null, {
      callback: [
        "next",
        "callback",
        "done"
      ]
    } ).provides( values ).call( function( err ){
      if( err ){
        return next( err );
      } else {
        log( "Finished processing file:", chalk.green( filename ) );
        next();
      }
    } );
  }, function( err ){
    if( err ){
      log( chalk.red, err );
    } else {
      log( chalk.green, "Finished processing all files" );
    }
    process.nextTick( function(){
      process.exit( 1 );
    } );
  } );
}

module.exports = function headstone( files,
                                     args ){
  debug( "files:", files );
  debug( "arguments:", args );
  if( !files || !_.isArray( files ) || files.length <= 0 ){
    return log( chalk.red, new Error( "no files provided" ) );
  }
  var opts = _.defaults( {}, args, {
    models: "./models",
    cwd: process.cwd(),
    configFile: "headstone.json",
    keystone: {
      headless: true
    }
  } );
  opts.keystone[ "module root" ] = opts.cwd;
  debug( "options:", opts );
  debug( "setting cwd:", opts.cwd );
  process.chdir( opts.cwd );
  opts = konfy.load( opts );
  opts = _.defaults( opts.config, _.omit( opts, "config" ) ); // flatten

  startKeystone( opts );
  processFiles( files, opts );
};
