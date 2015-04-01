'use strict';
var debug = require( "debug" )( "headstone" );
var _ = require( "lodash" );
var konfy = require( "konfy" );
var path = require( "path" );
var async = require( "async" );
var di = require( "asyncdi" );

function log(){
  console.log.apply( null, [ "[Headstone]" ].concat( _.toArray( arguments ) ) );
}

function startKeystone( opts ){
  var localModules = path.join( process.cwd(), "node_modules" );
  var keystonePath = path.join( localModules, "keystone" );
  debug( "Starting local keystone:", keystonePath );
  var keystone = require( keystonePath ); // local
  keystone.init( opts.keystone );
  keystone.mongoose = require( path.join( localModules, "mongoose" ) ); // local
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
    log( "Processing file:", filename );
    var resolved = path.resolve( filename );
    var parsed = path.parse( resolved );
    var config;
    try{
      config = require( path.join( parsed.dir, parsed.name + ".json" ) );
    } catch( e ) {
      config = {};
    }
    var values = _.defaults( {}, opts, config );
    var module = require( resolved );
    di( module, null, {
      callback : [
        "next",
        "callback",
        "done"
      ]
    } ).provides( values ).call( function( err ){
      if( err ){
        return next( err );
      } else {
        log( "Finished processing file:", filename );
        next();
      }
    } );
  }, function( err ){
    if( err ){
      log( "Error:", err );
    } else {
      log( "Finished processing all files" );
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
    return log( "Error: no files provided" );
  }
  var opts = _.defaults( {}, args, {
    models     : "./models",
    cwd        : process.cwd(),
    configFile : "headstone.json",
    keystone   : {
      headless      : true,
      "module root" : process.cwd()
    }
  } );
  opts.keystone[ "module root" ] = opts.cwd;
  debug( "options:", opts );
  debug( "setting cwd:", opts.cwd );
  process.chdir( opts.cwd );
  opts = konfy.load( opts );
  opts = _.defaults( opts.config, _.omit( opts, "config" ) ); // flatten

  startKeystone( opts );
  processFiles( files );
};
