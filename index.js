
/*!
 *
 * Entity
 *
 */

/**
 * Module dependencies.
 */

var Set = require('set')
var Emitter = require('emitter')
var Accessors = require('accessors')
var attr = Accessors.attr

/**
 * Exports Entity class.
 */

module.exports = Entity

/**
 * Entity class.
 *
 * @api public
 */

function Entity () {
  Accessors.call(this)
  this.components = new Set()
}

/**
 * Make Emitter.
 */

Emitter(Entity.prototype)

/**
 * Make Accessors.
 */

Accessors(Entity.prototype)

/**
 * Adds a component to
 * our components.
 *
 * @param {Object} c
 * @return {Entity} this
 * @api public
 */

Entity.prototype.add = function (c) {
  var self = this
  if (this.has(c)) {
    console.dir(c)
    console.error('already have component', c)
    return this
  }
  if (c.components) {
    c.components.each(function (_c) {
      self.add(_c)
    })
  }
  this.components.add(c)
  this.emit('add', c)
  return this
}

/**
 * Removes component `c` and
 * all of its components.
 *
 * @param {Object} c
 * @return {Entity} this
 * @api public
 */

Entity.prototype.remove = function (c) {
  var self = this
  if (!this.has(c)) {
    console.dir(c)
    console.error('does not have component', c)
    return this
  }
  if (c.components) {
    c.components.each(function (_c) {
      self.remove(_c)
    })
  }
  this.components.remove(c)
  this.emit('remove', c)
  return this
}

/**
 * Checks if it has component `c`.
 *
 * @param {Object} c
 * @return {Boolean}
 * @api public
 */

Entity.prototype.has = function (c) {
  return this.components.has(c)
}

/**
 * Apply all our components.
 *
 * @return {Entity} this
 * @api private
 */

Entity.prototype.applyComponents = function () {
  var self = this
  this.components.each(function (c) {
    applyComponent(self, c)
  })
  return this
}

/**
 * Apply a component `c` on context `ctx`.
 *
 * @param {Object} ctx
 * @param {Object} c
 * @api private
 */

function applyComponent (ctx, c) {
  for (var key in c) {
    var val = c[key]
    if (Array.isArray(val)) {
      attr(ctx, key, val[0], val.slice(1))
    }
    else if ('object' == typeof val) {
      ctx[key] = new Accessors()
      applyComponent(ctx[key], val)
    }
  }
}
