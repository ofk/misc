/*
 * utest
 */
/*
<code>
utest("test", {
  right1: function () {
    return true;
  },
  right2: function () {
    return [ [true], [1, 1], [1, "==", "1"] ];
  },
  right3: function (test) {
    setTimeout(function () { test(true); }, 1000);
  },
  right4: function (test) {
    setTimeout(function () { test([ [true], [1, 1], [1, "==", "1"] ]); }, 1000);
  },
  stand: function () {
  },
  wrong: function () {
    return false;
  },
  error: function () {
    throw new Error("msg");
  }
});
</code>

<code>
utest.ui("test", [
	"selector@click,10,selector@click": function () {
		return [[$(this).text(), "tmp"]]; // this === selector
	}
]);
</code>
 */

(function () {

/*
 * utest core
 */

var utest = this.utest = function () {
	if (!utest.enable) return;
	utest.init && utest.init();
	var a = args(arguments);
	new utest.test(a[0], a[1], a[2], a[3]);
};

if (window.jQuery) utest.ui = function () {
	if (!utest.enable) return;
	var a = args(arguments),
	    tests = a[1];
	for (var i = 0, iz = tests.length; i < iz; i += 2) {
		(function (i, key, val) {
			if (key.indexOf("!")) return;
			tests[i + 1] = function (test) {
				var cmds = key.slice(1).split(","), jnodes;
				(function loop(i) {
					if (i >= cmds.length) return jnodes.each(function () {
						test(val.call(this));
						return false;
					});
					var cmd = cmds[i].split("@");
					if (/\D/.test(cmd[0])) {
						jnodes = jQuery(cmd[0]);
						if (cmd[1]) {
							jnodes = jnodes[cmd[1]]();
						}
						loop(i + 1);
					}
					else {
						setTimeout(function () {
							loop(i + 1);
						}, parseInt(cmd[0], 10));
					}
				})(0);
			};
		})(i, tests[i], tests[i + 1]);
	}
	return utest(a[0] || "UI Test " + (utest.count + 1), tests, a[2] || 10, a[3] || 1000);
};

function isFunction(obj) {
	return Object.prototype.toString.call(obj) === "[object Function]";
}

function isArray(obj) {
	return Object.prototype.toString.call(obj) === "[object Array]";
}

function args(a) {
	a = Array.prototype.slice.call(a);
	if (typeof a[0] === "object") {
		a.unshift(void 0);
	}
	if (utest.type(a[1]) !== "array") {
		var arr = [], obj = a[1], q = -1;
		for (var i in obj) {
			arr[++q] = i;
			arr[++q] = obj[i];
		}
		a[1] = arr;
	}
	return a;
}

utest.enable = true;
utest.total = 0;

utest.test = function (name, tests, interval, timeout) {
	var div = utest.last(
		utest.nodes.utest,
		utest.$N("div", { id: "utest" + (++utest.count) })
	);

	name = name || "Test " + utest.count;

	this.header = utest.last(
		div,
		utest.$N("h2", {}, name)
	);
	this.result = utest.last(
		div,
		utest.$N("p")
	);
	this.name = name;

	this.count_stand = 0;
	this.count_right = 0;
	this.count_wrong = 0;
	this.count_total = 0;

	if (interval) {
		timeout = timeout || interval * 10;
		var self = this;
		(function loop(i) {
			if (i >= tests.length) return;
			if (isArray(tests[i])) {
				tests[i] = (function (test) {
					return function () { return test };
				})(tests[i]);
			}
			if (!isFunction(tests[i])) {
				loop(i + 1);
			}
			else {
				var called = false, tid = setTimeout(function () {
					if (called) return;
					called = true;
					loop(i + 1);
				}, timeout);
				self.test(isFunction(tests[i - 1]) ? null : tests[i - 1], tests[i], function () {
					if (called) return;
					called = true;
					clearTimeout(tid);
					setTimeout(function () { loop(i + 1); }, interval);
				});
			}
		})(0);
	}
	else {
		for (var i = 0, iz = tests.length; i < iz; ++i) {
			if (isArray(tests[i])) {
				tests[i] = (function (test) {
					return function () { return test };
				})(tests[i]);
			}
			if (isFunction(tests[i])) {
				this.test(isFunction(tests[i - 1]) ? null : tests[i - 1], tests[i]);
			}
		}
	}
};

utest.test.prototype = {
	test: function (name, test, comp) {
		if (typeof test !== "function") return;

		++utest.total;
		++this.count_total;
		++this.count_stand;
		var span = utest.last(
			this.result,
			utest.$N("span", { className: "stand" }, name || "test " + this.count_total)
		);
		utest.last(this.result, utest.text(" "));

		var res, self = this, err;
		try {
			res = test(function (res, err) {
				self.update(span, res, err, comp);
			});
		} catch (e) {
			err = e.lineNumber ? e.name + " (" + e.lineNumber + "): " + e.message :
			      e.number     ? "Error (" + e.number + "): " + e.description : e;
		}
		return this.update(span, res, err, comp);
	},
	judge: function (res) {
		function text(v1, op, v2) {
			if (!op)
				return "(" + utest.type(v1) + ") " + dump(v1);
			return [
				"(" + utest.type(v1) + ")", dump(v1),
				op,
				"(" + utest.type(v2) + ")", dump(v2)
			].join(" ");
		}
		if (res === void 0) {
			return { result: null };
		}
		if (typeof res !== "object") {
			return { result: !!res, message: text(res) };
		}
		var rv = { result: !!res.length, message: "" }, message = [];
		for (var i = 0, iz = res.length; i < iz; ++i) {
			var r = res[i];
			if (r && typeof r === "object") {
				switch (r.length) {
					case 0:
						break;
					case 1:
						if (!r[0])
							rv.result = false;
						message[message.length] = text(r[0]);
						break;
					case 2:
						if (!utest.op["==="](r[0], r[1]))
							rv.result = false;
						message[message.length] = text(r[0], "===", r[1]);
						break;
					default:
						if (!utest.op[r[1]](r[0], r[2]))
							rv.result = false;
						message[message.length] = text(r[0], r[1], r[2]);
						break;
				}
			}
			else {
				if (!r)
					rv.result = false;
				message[message.length] = text(r);
			}
		}
		rv.message = message.join("\n");
		return rv;
	},
	update: function (span, res, err, comp) {
		res = err ? { result: false, message: err } : this.judge(res);
		switch (res.result) {
			case true:
				--this.count_stand;
				++this.count_right;
				span.className = "right";
				span.title = res.message;
				break;
			case false:
				--this.count_stand;
				++this.count_wrong;
				span.className = "wrong";
				span.title = res.message;
				break;
			default:
				return false;
		}
		this.header.innerHTML = [
			this.name,
			' ( ',
			'<span class="right">', this.count_right, '</span> / ',
			'<span class="wrong">', this.count_wrong, '</span> / ',
			//'<span class="stand">', this.count_stand, '</span> / ',
			'<span class="total">', this.count_total, '</span>',
			' )'
		].join("");
		comp && comp.call(this);
		return true;
	}
};

utest.init = function () {
	utest.init = null;
	utest.setStyle([
		"body, h1, h2, p { margin: 0; padding: 0; }",
		"body { padding: 10px; }",
		"h1 { background: #069; font-size: 120%; color: #fff; padding: 2px 5px; }",
		"h2 { background: #eee; font-size: 85%; padding: 2px 5px; }",
		"h2 .stand { color: yellow; }",
		"h2 .right { color: green; }",
		"h2 .wrong { color: red; }",
		"p { margin: 5px 0 10px; }",
		"p span { display: inline-block; padding: 2px; color: #fff; font-size: 85%; }",
		"p span.stand { background: yellow; color: #000; }",
		"p span.right { background: green; }",
		"p span.wrong { background: red; font-size: 100%; }"
	].join(""));
	utest.nodes.utest = utest.first(
		document.body,
		utest.$N("div", { id: "utest" })
	);
	utest.last(
		utest.nodes.utest,
		utest.$N("h1", {}, document.title)
	);
	utest.addEvent(utest.nodes.utest, "click", function (evt, elem) {
		if (elem.title) {
			alert(elem.title);
		}
	});
};


/*
 * utest libs
 */

utest.$N = function (tag, attr, text) {
	var elem = document.createElement(tag);
	if (attr)
		for (var i in attr)
			elem[i] = attr[i];
	if (text)
		elem.appendChild(utest.text(text));
	return elem;
};

utest.text = function (text) {
	return document.createTextNode(text);
};

utest.first = function (node, elem) {
	return node.insertBefore(elem, node.firstChild);
};

utest.last = function (node, elem) {
	return node.appendChild(elem);
};

utest.addEvent = function (node, type, func) {
	function proxy(evt) {
		evt = evt || window.event;
		if (func(evt, evt.target || evt.srcElement) === false) {
			evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
			evt.stopPropagation ? evt.stopPropagation() : (evt.cancelBubble = false);
		}
	};
	if (node.addEventListener) {
		node.addEventListener(type, proxy, false);
	}
	else {
		node.attachEvent("on" + type, proxy);
	}
	utest.events[utest.events.length] = [node, type, proxy];
};

utest.removeEvent = function (node, type, func) {
	if (node.addEventListener) {
		node.addEventListener(type, func, false);
	}
	else {
		node.attachEvent("on" + type, func);
	}
};

utest.setStyle = function (styles) {
	if (document.createStyleSheet)
		document.createStyleSheet("javascript:'" + styles + "'");
	else
		utest.last(
			document.documentElement.firstChild,
			utest.$N("link", { rel: "stylesheet", href: "data:text/css," + escape(styles) })
		);
};

utest.events = [];

var type_ = {
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
},
type_detector_ = Object.prototype.toString;

utest.type = function (v) {
	var t = typeof v;
	return type_[t] || (t = type_[type_detector_.call(v)]) ? t :
	       !v            ? "null" :
	       v.setTimeout  ? "window" :
	       v.nodeType    ? "node" :
	       "length" in v ? "array" : "object";
};

/*
 * init
 */

utest.op = {
	"==":  function (v1, v2) { return v1 == v2; },
	"===": function (v1, v2) {
		var i, n, t1 = utest.type(v1), t2 = utest.type(v2);
		if (t1 === t2) {
			switch (t1) {
				case "array":
					return v1.length === v2.length && v1.join(",") === v2.join(",");
				case "object":
					for (var i in v1) {
						if (!utest.op["==="](v1[i], v2[i]))
							return false;
					}
					for (var i in v2) {
						if (!utest.op["==="](v1[i], v2[i]))
							return false;
					}
					return true;
			}
		}
		return v1 === v2;
	},
	"!=":  function (v1, v2) { return v1 != v2; },
	"!==": function (v1, v2) { return !utest.op["==="](v1, v2); },
	">":   function (v1, v2) { return v1 >  v2; },
	">=":  function (v1, v2) { return v1 >= v2; },
	"<":   function (v1, v2) { return v1 <  v2; },
	"<=":  function (v1, v2) { return v1 <= v2; },
	"in":  function (v1, v2) {
		for (var i = 0, iz = v1.length; i < iz; ++i)
			if (utest.op["==="](v1[i], v2))
				return true;
		return false;
	}
};

utest.nodes = {};

utest.count = 0;

utest.addEvent(window, "unload", function () {
	for (var i = 0, iz = utest.events.length; i < iz; ++i) {
		var tmp = utest.events[i];
		utest.removeEvent(tmp[0], tmp[1], tmp[2]);
		tmp[0] = tmp[1] = tmp[2] = null;
	}
});

})();

function msg(txt, br) {
	document.body.appendChild(document.createTextNode(txt));
	br && document.body.appendChild(document.createElement("br"));
}

function dump(obj, indent) {
	indent = indent || "";

	var rv = utest.type(obj),
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
			for (var i = 0, iz = obj.length; i < iz; ++i) {
				arr.push(
					func(obj[i], next_indent).replace(/^\s*/g, next_indent)
				);
			}
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
}
