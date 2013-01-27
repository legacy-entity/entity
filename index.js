
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
 * @param {component} c
 * @return {entity} this
 * @api private
 */

Entity.prototype.applyComponent = function (c) {
  var e = this
  for (var p in c) {
    if ('components' == p) continue
    var val = c[p]
    if ('object' == typeof val) {
      e.defaults[p] = val
      e[p] = e.getDefault(p)
    }
    else if ('function' == typeof val) {
      e[p] = val
    }
  }
  return this
}

/**
 * Get a default value.
 *
 * @param {key} p 
 * @return {mixed} value
 * @api private
 */

Entity.prototype.getDefault = function (p) {
  var c = this.defaults[p]
  if (Array.isArray(c)) {
    var fn = c[0]
    var args = c.slice(1)
    return fn.apply(c, args)
  }
  else if ('object' == typeof c) {
    var n = each(c, function (item, k) {
      if (Array.isArray(item)) {
        var fn = item[0]
        var args = item.slice(1)
        return fn.apply(item, args)
      }
      else return item
    })
    return n
  }
  else return item
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

/**
 * Iterate an object.
 *
 * @param {object} o 
 * @param {fn} fn 
 * @param {object} ctx 
 * @api private
 */

function each (o, fn, ctx) {
  ctx = ctx || this
  var n = {}
  for (var k in o) {
    n[k] = fn.call(ctx, o[k], k)
  }
  return n
}
