
var slice = [].slice

/**
 * Module dependencies.
 */

var Emitter = require('emitter')
var uid = require('uid')

/**
 * Exports Entity class.
 */

module.exports = Entity

/**
 * Entity class.
 *
 * @param {String} [id]
 * @param {Array} [components]
 * @api public
 */

function Entity () {
  var args = slice.call(arguments)
  if (!(this instanceof Entity)) {
    return new Entity(args)
  }
  this.id = uid()
  this.defaults = {}
  this.components = []

  args.forEach(function (arg) {
    this.use(arg)
  }, this)
}

Emitter(Entity.prototype)

/**
 * Uses a Component or mixins components
 * from another Entity.
 *
 * @param {Component|Entity|Object} c
 * @return {Entity} this
 * @api public
 */

Entity.prototype.use = function (c) {
  if (null == c) return

  var oc = c

  if (c instanceof Entity || c.components) {
    var e = c
    for (var i = 0; i < e.components.length; i++) {
      c = e.components[i]
      this.use(c)
    }
  }
  else if (Array.isArray(c)) {
    c.forEach(this.use, this)
  }

  this.add(oc)

  return this
}

/**
 * Actually adds a component to components.
 *
 * @param {Component} c
 * @api private
 */

Entity.prototype.add = function (c) {
  if (this.has(c)) {
    console.dir(c)
    console.error(this.id + ' already has component', c)
    return
//    throw new Error(this.id+': already has component "'+c)
  }
  this.components.push(c)
  this.emit('add', c)
}

/**
 * Checks whether we are already using `component`.
 *
 * @param {Component} c
 * @return {Boolean}
 * @api public
 */

Entity.prototype.has = function (c) {
  return !!~this.components.indexOf(c)
}

/**
 * Apply component data to entity.
 *
 * @param {Component} c 
 * @return {Entity} this
 */

Entity.prototype.applyComponent = function (c) {
  var e = this
  for (var p in c) {
    var val = c[p]
    if (Array.isArray(val)) {
      e[p] = val[0].apply(val, val.slice(1))
      e.defaults[p] = val
    }
    else if ('function' == typeof val) {
      if ('_' == p.substr(0,1)) {
        e[p.substr(1)] = val
      }
    }
  }
  return this
}

Entity.prototype.init = function (systems) {
  return this.runSystems('init', systems)
}

Entity.prototype.start = function (systems) {
  return this.runSystems('start', systems)
}

Entity.prototype.pause = function (systems) {
  return this.runSystems('pause', systems)
}

Entity.prototype.stop = function (systems) {
  return this.runSystems('stop', systems)
}

Entity.prototype.tear = function (systems) {
  return this.runSystems('tear', systems)
}

Entity.prototype.runSystems = function (method, systems) {
  var self = this
  systems.forEach(function (system) {
    system.each(system, function (e) {
      if (e === self) {
        if (system[method]) system[method].call(system, e)
      }
    })
  })
  return this
}


/**
 * Merge two objects.
 *
 * @param {object} t 
 * @param {object} s 
 * @return {object} merged
 * @api private
 */

function merge (t, s) {
  for (var k in s) {
    t[k] = s[k]
  }
  return t
}
