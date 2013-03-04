require('stagas-watch-js')
var assert = require('component-assert')
var Accessors = require('stagas-accessors')
var attr = Accessors.attr
var Entity = require('entity')

describe("Entity()", function () {
  describe("when called with new", function () {

    it("should return an Entity instance", function () {
      var e = new Entity()
      assert(e instanceof Entity)
    })

    it("should have mixin Accessors", function () {
      var e = new Entity()
      assert(!!e.set)
      assert(!!e.get)
    })
  })

  describe("calling attr(e)", function () {
    it("should create attribute", function () {
      var e = new Entity()
      attr(e, 'foo', String, 'bar')
      assert('function' == typeof e.foo)
    })

    it("foo() should have default value", function () {
      var e = new Entity()
      attr(e, 'foo', String, 'bar')
      assert('bar'===e.foo())
    })

    it("foo() should be a getter", function () {
      var e = new Entity()
      attr(e, 'foo', String, 'bar')
      assert('bar'===e.foo())
    })

    it("foo(val) should be a setter", function () {
      var e = new Entity()
      attr(e, 'foo', String, 'bar')
      assert(e===e.foo('lol'))
      assert('lol'===e.foo())
    })
  })

  describe("when inherited", function () {
    it("should be an instanceof Entity", function () {
      var Foo = function () {}
      Foo.prototype = new Entity
      var foo = new Foo()
      assert(foo instanceof Entity)
    })

    it("can have attributes on its prototype", function () {
      var Foo = function () {}
      Foo.prototype = new Entity
      attr(Foo.prototype, 'bar', Number, 10)
      assert('function' == typeof Foo.prototype.bar)
      var foo = new Foo()
      assert('function' == typeof foo.bar)
    })
  })

  describe(".use(component)", function () {
    it("should add component", function () {
      var e = new Entity()
      var c = { foo: [String, 'bar'] }
      e.use(c)
      assert(c===e.components[0])
    })

    it("should create accessors when .applyComponents() is called", function () {
      var e = new Entity()
      var c = { foo: [String, 'bar'] }
      e.use(c)
      e.applyComponents()
      assert('function'==typeof e.foo)
    })

    it("should have default value", function () {
      var e = new Entity()
      var c = { foo: [String, 'bar'] }
      e.use(c)
      e.applyComponents()
      assert('bar'===e.foo())
    })

    it("should handle nested values", function () {
      var e = new Entity()
      var c = { foo: { bar: [String, 'bar'] } }
      e.use(c)
      e.applyComponents()
      assert('bar'===e.foo.bar())
    })

    it("should handle even more deeply nested values", function () {
      var e = new Entity()
      var c = {
        foo: {
          bar: {
            lol: [Number, 101]
          }
        }
      }
      e.use(c)
      e.applyComponents()
      assert(101===e.foo.bar.lol())
    })

    it("should handle complex nestings", function () {
      var e = new Entity()
      var c = {
        foo: {
          bar: {
            lol: [Number, 101]
          }
        }
      , bar: {
          foo: [String, 'foobar']
        }
      , lol: [Number, 202]
      }
      e.use(c)
      e.applyComponents()
      assert(101===e.foo.bar.lol())
      assert('foobar'===e.bar.foo())
      assert(202===e.lol())
    })
  })

  describe(".add(component)", function () {
    it("should add component", function () {
      var e = new Entity()
      var c = { foo: [String, 'bar'] }
      e.add(c)
      assert(c===e.components[0])
    })

    it("should emit `add` event", function (done) {
      var e = new Entity()
      var c = { foo: [String, 'bar'] }
      e.once('add', function (_c) {
        assert(_c===c)
        done()
      })
      e.add(c)
    })
  })

  describe(".has(component)", function () {
    it("should detect component", function () {
      var e = new Entity()
      var c = { foo: [String, 'bar'] }
      assert(false===e.has(c))
      e.add(c)
      assert(true===e.has(c))
    })
  })
})
