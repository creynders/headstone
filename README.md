# Headstone
  
[![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url]

> Run scripts connecting to a headless keystone instance

`headstone` is a command-line tool which allows you to run scripts connecting to a _truly_ headless [`keystone`](http://www.keystonejs.com) instance, i.e. without routing, sessions, ...

This tool is meant for facilitating the creation of batch scripts, which manipulate mongoose documents through keystone lists.

## Installation

```sh
$ npm install --global headstone
```

## Basic usage example

`cd` to one of your keystone projects which has a `models/User.js` list.

Create a javascript file:

```js
// file: outputUsers.js
var keystone = require("keystone");
var User = keystone.list("User");

module.exports = function(done){
  User.model.find().exec(function(err, users){
    console.log(users);
    done();
  });
}
```

Now run `headstone` passing the javascript file as a command line argument:

```sh
# outputs a list of your users 
$ headstone outputUsers.js
```

## Passing parameters to your script file

```js
// file: outputUser.js
var keystone = require("keystone");
var User = keystone.list("User");

module.exports = function(userId, done){
  console.log("user id", userId);
  User.model.findById(userId).exec(function(err, user){
    console.log(user);
    done();
  });
}
```

```sh
# outputs user details for user with id 55113f1742ff1a0877242a39
$ headstone outputUser.js --userId=55113f1742ff1a0877242a39
```

**The command line argument name _must_ be exactly the same as the corresponding parameter name of the exported module.**

## Declaring default parameters

```js
// file: outputUsers.js
var keystone = require("keystone");
var User = keystone.list("User");

module.exports = function(filter, done){
  User.model.find(filter).exec(function(err, users){
    console.log(users);
    done();
  });
}
```

By default `headstone` searches for a `json` file with the same file name as your javascript file.

```js
// file: outputUsers.json 
{
  "filter": {
    "isAdmin": true
  }
}
```

```sh
# outputs all administrative users
$ headstone outputUsers.js
```

## `headstone` settings

There's a number of settings you can pass to `headstone`:

* `cwd`: the directory you want to use as a current working directory.
* `models`: the directory where your models are located, by default this is `./models` relative to your keystone project root.
* `configFile`: these settings can be stored in a file, called `headstone.json` by default, but if you wish to choose another file name you can supply it here.
* `mongoUri`: the URI of your mongo database
* `mongoose`: a relative path to a mongoose module directory
* `keystone`: (_config file only_) settings you want to pass to the keystone instance. 

  ```js
  //default
  {
    keystone:{
      headless:true
    }
  }
  ```

These settings can be passed as command-line arguments, like this:

```sh
$ headstone outputUsers.js --models=./data
```

Or declared in `headstone.json`:

```js
// file: headstone.json
{
  "models": "./data"
}
```

Command line arguments _always_ trump configuration file values.

## using a different mongoose version

By default `headstone` uses the mongoose version as declared by the `keystone` module. However, if you need to use a different version you can set the mongoose option:

```js
// file: headstone.json
{
  "mongoose": "./node_modules/mongoose"
}
```

Uses the locally installed `mongoose` version instead of the one `keystone` installs by default.

## environment variables

`headstone` automatically reads the environment declaration you've already created for your keystone project in a `.env` file.
It uses the `MONGO_URI` variable to connect to your mongoose database (unless overridden by a corresponding command line argument or `headstone` file setting)

## processing multiple files

You can pass multiple files to `headstone` they will be processed sequentially, in order.

```sh
# first outputs all users
# then outputs all posts
$ headstone outputUsers.js outputPosts.js
```

## License

MIT © [Camille Reynders](http://www.creynders.be)


[npm-image]: https://badge.fury.io/js/headstone.svg
[npm-url]: https://npmjs.org/package/headstone
[daviddm-image]: https://david-dm.org/creynders/headstone.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/creynders/headstone
