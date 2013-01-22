
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
 * Entity instances serve as dictionaries of Components.
 * They do not keep data or state and are used only to
 * pass references of Entity constructors.
 * 
 * They can be passed to other Entities to copy their
 * component descriptors (mixin) or to be used by Systems.
 * When used by Systems, they only pass their reference
 * to serve as a dictionary or description of an entity.
 * 
 * The actual entity and data are instantiated inside the
 * parent System and can be used by it or its children
 * Systems (the entity's private instance System siblings).
 *
 * System isolation of data is necessary to keep state
 * untouchable by foreign Systems or individual actions,
 * and to make discovery of entities and (de)serialization
 * of state efficient and reliable.
 *
 * @param {String} [id]
 * @param {Array} [components]
 * @api public
 */

function Entity (components, id) {
  if (!(this instanceof Entity)) return new Entity(components, id)
  this.id = id || uid()
  this.defaults = {}
  this.components = components && components.components || components || []
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
  c = c.component || (c.component = c || {})

  if (c instanceof Entity) {
    var e = c
    for (var i = 0; i < e.components.length; i++) {
      c = e.components[i]
      this.add(c)
    }
    return this
  }

  this.add(c)

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
    throw new Error(this.id+': already has component "'+c.id)
  }
  this.components.push(c)
  this.emit('use', c)
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
