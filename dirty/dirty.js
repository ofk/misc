(function (window_, document_) {

var
//	Boolean_prototype_  = Boolean.prototype,
	Number_prototype_   = Number.prototype,
	String_prototype_   = String.prototype,
	RegExp_prototype_   = RegExp.prototype,
	Array_prototype_    = Array.prototype,
	Function_prototype_ = Function.prototype,
	Date_prototype_     = Date.prototype,
	CAST_ARRAY_         = Array_prototype_.slice,
	TYPE_DETECTOR_      = Object.prototype.toString,
	TYPE_ = {
		"undefined":         1,
		"boolean":           1,
		"number":            1,
		"string":            1,
		"[object Boolean]":  "boolean",
		"[object Number]":   "number",
		"[object String]":   "string",
		"[object RegExp]":   "regexp",
		"[object Array]":    "array",
		"[object Function]": "function",
		"[object Date]":     "date"
	};

// -------------------------------------------------------------------
// function

function MIX(src, dst) {
	for (var i in dst) i in src || (src[i] = dst[i]);
}

function EXT(src, str) {
	for (var i = 0, fn, fns = str.split(" "); fn = fns[i]; ++i)
		fn in src || (function (src, fn) {
			src[fn] = function () {
				var args = CAST_ARRAY_.call(arguments),
				    self = args.shift();
				return src.prototype[fn].apply(self, args);
			};
		})(src, fn);
}


// -------------------------------------------------------------------
// window

MIX(window_, {
	istype: istype,
	h: h,
	vardump: function (obj, indent) {
		indent = indent || "";

		var rv = istype(obj),
		    arr = [],
		    func = arguments.callee,
		    next_indent = indent + (func.indent || "\t");

		switch (rv) {
			case "boolean":
			case "number":
			case "regexp":
			case "date":
				rv = obj;
				break;
			case "string":
				rv = '"' + obj.replace(/"/g, '\\"').replace(/\r/g, "\\r").replace(/\n/g, "\\n") + '"';
				break;
			case "node":
				rv = "[object " + (obj.nodeType === 9 ? "Document" : (obj.tagName || "") + " Node") + "]";
				break;
			case "function":
				return (indent + obj).replace(/\n/g, "\n" + indent);
			case "array":
				for (var i = 0, iz = obj.length; i < iz; ++i)
					arr.push(
						func(obj[i], next_indent).replace(/^\s* /g, next_indent)
					);
				return indent + "[" + ("\n" + arr.join(",\n") + "\n" + indent).replace(/^\s+$/, "") + "]";
			case "object":
				for (var i in obj) {
					arr.push(
						next_indent +
						func(i) + ": " +
						func(obj[i], next_indent).replace(/^\s+/g, "")
					);
				}
				return indent + "{" + ("\n" + arr.join(",\n") + "\n" + indent).replace(/^\s+$/, "") + "}";
		}

		return indent + rv;
	},
	pp: function (obj, flag) {
		var str = vardump(obj);
		flag !== false && alert(str);
		return str;
	},
	gid: function (id, context) {
		return (context || document).getElementById(id);
	},
	$$: function (selector, context) {
		return CAST_ARRAY_.call((context || document).querySelectorAll(selector));
	},
	$A: function (arr) {
		return CAST_ARRAY_.call(arr);
	},
	$H: function () {
		var obj = {}, arg = arguments;
		for (var i = 1, iz = arg.length; i < iz; i += 2) {
			obj[arg[i - 1]] = arg[i];
		}
		return obj;
	},
	$N: function (tagName, attributes, childNodes) {
		var elem = document.createElement(tagName), conv = {
			"class": "className"
		};
		if (attributes != null) for (var name in attributes) {
			var value = attributes[name];
			switch (name) {
				case "style":
					var elem_style = elem.style;
					if (typeof value === "object") {
						for (var i in value) elem_style[i] = value[i];
					}
					else {
						elem_style.cssText = value;
					}
					break;
				default: elem[conv[name] || name] = value; break;
			}
		}
		if (childNodes != null) for (var i = 0, iz = childNodes.length; i < iz; ++i) {
			var childNode = childNodes[i];
			childNode != null && elem.appendChild(childNode.nodeType ? childNode : document.createTextNode(childNode));
		}
		return elem;
	}
});

function istype(obj) {
	var tmp;
	return TYPE_[tmp = typeof obj] || (tmp = TYPE_[TYPE_DETECTOR_.call(obj)]) ? tmp :
	       !obj            ? "null" :
	       obj.setTimeout  ? "window" :
	       obj.nodeType    ? "node" :
	       "length" in obj ? "array" : "object";
}

function h(str) {
	return (""+ str).replace(/&/g, "&amp;")
	                .replace(/"/g, "&quot;")
	                .replace(/</g, "&lt;")
	                .replace(/>/g, "&gt;");
}


// -------------------------------------------------------------------
// Math

MIX(Math, {
	truncate: function () {
		return ~~this;
	}
});


// -------------------------------------------------------------------
// Number

MIX(Number_prototype_, {
	toFloat: function () { return this; },
	toInt: function () { return ~~this; },
	step: function (limit, step, fn, me) {
		if (!step) throw new TypeError();
		if (step < 0) {
			for (var i = this; i > limit; i -= step) if (fn.call(me, i) === false) return false;
		}
		else {
			for (var i = this; i < limit; i += step) if (fn.call(me, i) === false) return false;
		}
		return true;
	},
	times: function (fn, me) {
		for (var i = 0; i < this; ++i)
			if (fn.call(me, i) === false)
				return false;
		return true;
	}
});

EXT(Number, "step times");


// -------------------------------------------------------------------
// String

MIX(String_prototype_, {
	toFloat: function () { return parseFloat(this); },
	toInt: function () { return parseInt(this, 10); },
	// JavaScript 1.6
	trim: function () {
		return this.replace(/^\s+|\s+$/g, "");
	},
	trimLeft: function () {
		return this.replace(/^\s+/, "");
	},
	trimRight: function () {
		return this.replace(/\s+$/, "");
	},
	// Ruby
	capitalize: function () {
		return this.replace(/[a-z]+/gi, function ($0) {
			var t = $0.toLowerCase();
			return $0.slice(0, 1).toUpperCase() + $0.slice(1);
		});
	},
	caseIndexOf: function (str, pos) {
		str = ("" + str).toLowerCase();
		return this.toLowerCase().indexOf(str, pos);c
	},
	caseLastIndexOf: function (str, pos) {
		str = ("" + str).toLowerCase();
		return this.toLowerCase().lastIndexOf(str, pos);
	},
	endWith: function (str) {
		var pos = this.length - str.length;
		return this.indexOf(str, pos) === pos;
	},
	succ: function () {
		var chars = this.split(""), rep = { 57: "0", 90: "A", 122: "a" };
		for (var i = chars.length - 1, up = -1; up && i >= 0; --i) {
			var c = this.charCodeAt(i);
			if (rep[c]) {
				chars[i] = rep[c];
				up = up === 90 && up > c && up || c;
			}
			else if ((48 <= c && c < 57) || (65 <= c && c < 90) || (97 <= c && c < 122)) {
				chars[i] = String.fromCharCode(c + 1);
				up = 0;
			}
		}
		var prefix = (up === 57 ? "1" : rep[up] || ""),
		    str = chars.join("");
		if (prefix) {
			str = str.replace(/([0-9a-z])/, prefix + "$1");
		}
		return str;
	},
	ord: function () {
		return this.charCodeAt(0);
	},
	reverse: function () {
		return this.split("").reverse().join("");
	},
	startWith: function (str) {
		return this.lastIndexOf(str, 0) === 0;
	},
	toSwapCase: function () {
		return this.replace(/([a-z]+)|([A-Z]+)/g, function (_, $1, $2) {
			return $1 ? $1.toUpperCase() : $2.toLowerCase();
		});
	},
	toCamelCase: function () {
		return this.replace(/-(\w)/g, function (_, $1) { return $1.toUpperCase(); });
	},
	toSnakeCase: function () {
		return this.replace(/([A-Z])/g, "-$1").toLowerCase();
	},
	encodeURI: function () {
		return encodeURIComponent(this);
	},
	decodeURI: function () {
		return decodeURIComponent(this);
	},
	escapeHTML: function () {
		return h(this);
	},
	escapeRegExp: function () {
		return this.replace(/(\W)/g, "\\$1");
	}
});

String_prototype_.ltrim    = String_prototype_.ltrim    || String_prototype_.trimLeft;
String_prototype_.rtrim    = String_prototype_.rtrim    || String_prototype_.trimRight;
String_prototype_.index    = String_prototype_.index    || String_prototype_.indexOf;
String_prototype_.rindex   = String_prototype_.rindex   || String_prototype_.lastIndexOf;
String_prototype_.cindex   = String_prototype_.cindex   || String_prototype_.caseIndexOf;
String_prototype_.rcindex  = String_prototype_.rcindex  || String_prototype_.caseLastIndexOf;
String_prototype_.lowerize = String_prototype_.lowerize || String_prototype_.toLowerCase;
String_prototype_.upperize = String_prototype_.upperize || String_prototype_.toUpperCase;
String_prototype_.camelize = String_prototype_.camelize || String_prototype_.toCamelCase;
String_prototype_.snakize  = String_prototype_.snakize  || String_prototype_.toSnakeCase;

EXT(String, "charAt charCodeAt concat indexOf lastIndexOf localeCompare match replace search slice split substr substring toLocaleLowerCase toLocaleUpperCase toLowerCase toUpperCase trim trimLeft trimRight capitalize caseIndexOf caseLastIndexOf endWith succ ord reverse startWith toSwapCase toCamelCase toSnakeCase encodeURI decodeURI escapeHTML escapeRegExp ltrim rtrim index rindex cindex rcindex lowerize upperize camelize snakize");

// -------------------------------------------------------------------
// Array

MIX(Array_prototype_, {
	// JavaScript 1.6
	indexOf: function (key, pos) {
		var sz = this.length;
		if (pos == null) {
			pos = 0;
		}
		else {
			pos = +pos;
			if (pos < 0) pos += sz;
			if (pos < 0) pos = 0;
		}
		for (var i = pos; i < sz; ++i) {
			if (i in this && this[i] === key) return i;
		}
		return -1;
	},
	lastIndexOf: function (key, pos) {
		var sz = this.length;
		if (pos == null) {
			pos = sz - 1;
		}
		else {
			pos = +pos;
			if (pos < 0) pos += sz;
			if (pos < 0) pos = -1;
			else if (pos >= sz) pos = sz - 1;
		}
		for (var i = pos; i >= 0; --i) {
			if (i in this && this[i] === key) return i;
		}
		return -1;
	},
	filter: function (fn, me) {
		var rv = [];
		for (var i = 0, sz = this.length, c = -1; i < sz; ++i) {
			var obj = this[i];
			if (i in this && fn.call(me, obj, i, this)) {
				rv[++c] = obj;
			}
		}
		return rv;
	},
	forEach: function (fn, me) {
		for (var i = 0, sz = this.length; i < sz; ++i) {
			var obj = this[i];
			if (i in this) {
				fn.call(me, obj, i, this);
			}
		}
	},
	every: function (fn, me) {
		for (var i = 0, sz = this.length; i < sz; ++i) {
			var obj = this[i];
			if (i in this && !fn.call(me, obj, i, this)) return false;
		}
		return true;
	},
	map: function (fn, me) {
		var sz = this.length, rv = new Array(sz);
		for (var i = 0; i < sz; ++i) {
			var obj = this[i];
			if (i in this) {
				rv[i] =fn.call(me, obj, i, this);
			}
		}
		return rv;
	},
	some: function () {
		for (var i = 0, sz = this.length; i < sz; ++i) {
			var obj = this[i];
			if (i in this && fn.call(me, obj, i, this)) return true;
		}
		return false;
	},
	reduce: function (fn, rv) {
		var i = 0, sz = this.length;
		if (sz === 0 && arguments.length === 1) throw new TypeError();

		if (arguments.length < 2) {
			do {
				if (i in this) {
					rv = this[i++];
					break;
				}
				if (++i >= sz) throw new TypeError();
			} while (true);
		}

		for (; i < sz; ++i) {
			if (i in this) {
				rv = fn.call(null, rv, this[i], i, this);
			}
		}

		return rv;
	},
	reduceRight: function (fn, rv) {
		var sz = this.length, i = sz - 1;
		if (sz === 0 && arguments.length === 1) throw new TypeError();

		if (arguments.length < 2) {
			do {
				if (i in this) {
					rv = this[i--];
					break;
				}
				if (--i < 0) throw new TypeError();
			} while (true);
		}

		for (; i >= 0; --i) {
			if (i in this) {
				rv = fn.call(null, rv, this[i], i, this);
			}
		}

		return rv;
	},
	// Ruby
	at: function (pos) {
		if (pos < 0) pos += this.length;
		return this[pos];
	},
	clear: function () {
		this.splice(0, this.length);
		return this;
	},
	compact: function () {
		var rv = [];
		for (var i = 0, sz = this.length, c = -1; i < sz; ++i) {
			var obj = this[i];
			if (i in this && obj != null) rv[++c] = obj;
		}
		return rv;
	},
	remove: function (val) {
		var rv = false;
		for (var i = 0, sz = this.length, c = -1; i < sz; ++i) {
			var obj = this[i];
			if (i in this && obj === val) {
				--sz;
				this.splice(i--, 1);
				rv = true;
			}
		}
		return rv;
	},
	removeAt: function (pos) {
		var sz = this.length;
		if (pos < 0) pos += sz;
		if (0 <= pos && pos < sz && pos in this) {
			return this.splice(pos, 1);
		}
		return null;
	},
	removeIf: function (fn, me) {
		var rv = false;
		for (var i = 0, sz = this.length, c = 0; i < sz; ++i, ++c) {
			var obj = this[i];
			if (i in this && fn.call(me, obj, c, this)) {
				--sz;
				this.splice(i--, 1);
				rv = true;
			}
		}
		return rv;
	},
	fetch: function (pos, ifnone) {
		if (0 <= pos && pos < this.length && pos in this) return this[pos];
		if (arguments.length > 1) return ifnone;
		throw new Error();
	},
	fill: function (val, start, length) {
		start = +(start || 0) || 0;
		var sz = this.length;
		if (sz <= start) {
			for (var i = sz; i < start; ++i) this[i] = void 0;
		}
		if (length != null && +length) {
			sz = start + length;
		}
		for (var i = start; i < sz; ++i) {
			this[i] = val;
		}
		return this;
	},
	first: function (n) {
		if (n == null) return this[0];
		return this.slice(0, +n);
	},
	flatten: function (lv) {
		var rv = [],
		    push = Array_prototype_.push,
		    flatten = Array_prototype_.flatten;
		if (lv == null) lv = -1;
		for (var i = 0, sz = this.length; i < sz; ++i) {
			var obj = this[i];
			push.apply(rv, lv && istype(obj) === "array" ? flatten.call(obj, lv - 1) : [ obj ]);
		}
		return rv;
	},
	last: function (n) {
		if (n == null) return this[this.length - 1];
		return this.slice(this.length - n);
	},
	unique: function () {
		var rv = [],
		    unique = {},
		    uniques = [];
		for (var i = 0, sz = this.length, c = -1; i < sz; ++i) {
			var obj = this[i], type = istype(obj);
			switch (type) {
				case "undefined":
				case "boolean":
				case "number":
				case "string":
				case "null":
					var key = type + ":" + obj;
					if (!key in unique) {
						unique[key] = true;
						rv[++c] = obj;
					}
					break;
				default:
					if (uniques.indexOf(obj) === -1) {
						uniques.push(obj);
						rv[++c] = obj;
					}
					break;
			}
		}
		return rv;
	}
});

Array_prototype_.collect = Array_prototype_.collect || Array_prototype_.map;
Array_prototype_.each    = Array_prototype_.each    || Array_prototype_.forEach;
Array_prototype_.index   = Array_prototype_.index   || Array_prototype_.indexOf;
Array_prototype_.rindex  = Array_prototype_.rindex  || Array_prototype_.lastIndexOf;

Array_prototype_.clone   = Array_prototype_.clone   || Array_prototype_.concat;
Array_prototype_.reject  = Array_prototype_.reject  || Array_prototype_.removeIf;

MIX(Array, {
	isArray: function (obj) {
		return TYPE_DETECTOR_.call(obj) === "[object Array]";
	}
});

EXT(Array, "pop push reverse shift sort splice unshift concat join slice indexOf lastIndexOf filter forEach every map some reduce reduceRight at clear compact remove removeAt removeIf fetch fill first flatten last unique collect each index rindex clone reject");


// -------------------------------------------------------------------
// Function

MIX(Function_prototype_, {
	bind: function () {
		var fn = this, args = CAST_ARRAY_.call(arguments), me = args.shift();
		return function () {
			return fn.apply(me, args.concat(CAST_ARRAY_.call(arguments)));
		};
	},
	limit: function (iz, ret) {
		var fn = this, i = 0;
		return function () {
			return i < iz ? (++i, fn.apply(this, arguments)) : ret;
		};
	},
	loop: function (ms, iz) {
		var fn = this, i = 0;
		(function rec() {
			if ((iz === void 0 || i < iz) && fn(i++) !== false)
				ms ? setTimeout(rec, ms) : rec();
		})();
	}
});


// -------------------------------------------------------------------
// Object

MIX(Object, {
	keys: function (obj) {
		var rv = [], c = -1;
		for (var i in obj) rv[++c] = i;
		return rv;
	},
	values: function (obj) {
		var rv = [], c = -1;
		for (var i in obj) rv[++c] = obj[i];
		return rv;
	}
});


})(this, document);
