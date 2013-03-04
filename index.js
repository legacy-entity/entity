
/*!
 *
 * Entity
 *
 */

/**
 * Module dependencies.
 */

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
  this.components = []
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
 * Uses component `c`.
 *
 * @param {Object} c
 * @return {Entity} this
 * @api public
 */

Entity.prototype.use = function (c) {
  var self = this
  if (c instanceof Entity) {
    c.components.forEach(function (_c) {
      self.add(_c)
    })
  }
  this.add(c)
  return this
}

/**
 * Apply all our components.
 *
 * @return {Entity} this
 * @api private
 */

Entity.prototype.applyComponents = function () {
  var self = this
  this.components.forEach(function (c) {
    applyComponent(self, c)
  })
  return this
}

/**
 * Actually adds a component to
 * our components.
 *
 * @param {Object} c
 * @return {Entity} this
 * @api private
 */

Entity.prototype.add = function (c) {
  if (this.has(c)) {
    console.dir(c)
    console.error(this.id+' already has component', c)
    return this
  }
  this.components.push(c)
  this.emit('add', c)
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
  return !!~this.components.indexOf(c)
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
