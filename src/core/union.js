/* eslint-disable */
import curryN from 'ramda/src/curryN';

const isString = s => typeof s === 'string';
const isNumber = n => typeof n === 'number';
const isBoolean = b => typeof b === 'boolean';
const isObject = value => {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
};
const isFunction = f => typeof f === 'function';
const isArray =
  Array.isArray ||
  function(a) {
    return 'length' in a;
  };

const mapConstrToFn = (group, constr) => {
  return constr === String
    ? isString
    : constr === Number
    ? isNumber
    : constr === Boolean
    ? isBoolean
    : constr === Object
    ? isObject
    : constr === Array
    ? isArray
    : constr === Function
    ? isFunction
    : constr === undefined
    ? group
    : constr;
};

const numToStr = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
];

var validate = function(group, validators, name, args) {
  var validator, v, i;
  if (args.length > validators.length) {
    throw new TypeError(
      'too many arguments supplied to constructor ' +
        name +
        ' (expected ' +
        validators.length +
        ' but got ' +
        args.length +
        ')',
    );
  }
  for (i = 0; i < args.length; ++i) {
    v = args[i];
    validator = mapConstrToFn(group, validators[i]);
    if (
      Type.check === true &&
      (validator.prototype === undefined ||
        !validator.prototype.isPrototypeOf(v)) &&
      (typeof validator !== 'function' || !validator(v))
    ) {
      var strVal = typeof v === 'string' ? "'" + v + "'" : v; // put the value in quotes if it's a string
      throw new TypeError(
        'wrong value ' +
          strVal +
          ' passed as ' +
          numToStr[i] +
          ' argument to constructor ' +
          name,
      );
    }
  }
};

function valueToArray(value) {
  var i,
    arr = [];
  for (i = 0; i < value._keys.length; ++i) {
    arr.push(value[value._keys[i]]);
  }
  return arr;
}

function extractValues(keys, obj) {
  var arr = [],
    i;
  for (i = 0; i < keys.length; ++i) arr[i] = obj[keys[i]];
  return arr;
}

function constructor(group, name, fields) {
  var validators,
    keys = Object.keys(fields),
    i;
  if (isArray(fields)) {
    validators = fields;
  } else {
    validators = extractValues(keys, fields);
  }
  function construct() {
    var val = Object.create(group.prototype),
      i;
    val._keys = keys;
    val._name = name;
    if (Type.check === true) {
      validate(group, validators, name, arguments);
    }
    for (i = 0; i < arguments.length; ++i) {
      val[keys[i]] = arguments[i];
    }
    return val;
  }
  group[name] =
    keys.length === 0 ? construct() : curryN(keys.length, construct);

  if (keys.length !== 0) {
    group[name]['map'] = curryN(keys.length, construct);
  }

  if (keys !== undefined) {
    group[name + 'Of'] = function(obj) {
      return construct.apply(undefined, extractValues(keys, obj));
    };
  }
}

function rawCase(type, cases, value, arg) {
  var wildcard = false;
  var handler = cases[value._name];
  if (handler === undefined) {
    handler = cases['_'];
    wildcard = true;
  }
  if (Type.check === true) {
    if (!type.prototype.isPrototypeOf(value)) {
      throw new TypeError('wrong type passed to case');
    } else if (handler === undefined) {
      throw new Error('non-exhaustive patterns in a function');
    }
  }
  if (handler !== undefined) {
    var args =
      wildcard === true
        ? [arg]
        : arg !== undefined
        ? valueToArray(value).concat([arg])
        : valueToArray(value);
    return handler.apply(undefined, args);
  }
}

var typeCase = curryN(3, rawCase);
var caseOn = curryN(4, rawCase);

function createIterator() {
  return {
    idx: 0,
    val: this,
    next: function() {
      var keys = this.val._keys;
      return this.idx === keys.length
        ? { done: true }
        : { value: this.val[keys[this.idx++]] };
    },
  };
}

function Type(desc) {
  var key,
    res,
    obj = {};
  obj.case = typeCase(obj);
  obj.caseOn = caseOn(obj);

  obj.prototype = {};
  obj.prototype[Symbol ? Symbol.iterator : '@@iterator'] = createIterator;
  obj.prototype.case = function(cases) {
    return obj.case(cases, this);
  };
  obj.prototype.caseOn = function(cases) {
    return obj.caseOn(cases, this);
  };

  for (key in desc) {
    res = constructor(obj, key, desc[key]);
  }
  return obj;
}

Type.check = true;

export { Type };
