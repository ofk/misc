/*
 * utest
 *
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
  }
});
</code>
 */

(function () {

/*
 * utest core
 */

var utest = this.utest = function (name, tests) {
	utest.init && utest.init();
	new utest.test(name, tests);
};

utest.total = 0;

utest.test = function (name, tests) {
	var div = utest.last(
		utest.nodes.utest,
		utest.$N("div", { id: "utest" + (++utest.count) })
	);
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

	for (var i in tests) {
		this.test(i, tests[i]);
	}
};

utest.test.prototype = {
	test: function (name, test) {
		++utest.total;
		++this.count_total;
		++this.count_stand;
		var span = utest.last(
			this.result,
			utest.$N("span", { className: "stand" }, name)
		);
		utest.last(this.result, utest.text(" "));
//		this.update();
		var res, self = this, err;
		try {
			res = test(function (res, err) {
				self.update(span, res, err);
			});
		} catch (e) {
			err = e.lineNumber ? e.name + " (" + e.lineNumber + "): " + e.message :
			      e.number     ? "Error (" + e.number + "): " + e.description : e;
		}
		this.update(span, res, err);
	},
	judge: function (res) {
		function text(v1, op, v2) {
			if (!op)
				return "(" + utest.type(v1) + ") " + v1;
			return [
				"(" + utest.type(v1) + ")", v1,
				op,
				"(" + utest.type(v2) + ")", v2
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
	update: function (span, res, err) {
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

utest.type = function (v) {
	var t = typeof v;
	switch (typeof v) {
		case "undefined":
		case "unknown":
		case "boolean":
		case "number":
		case "string":
			return typeof v;
	}
	if (v === null)
		return "null";
	if (v.nodeType || v.writeln || v.alert) {
		return "DOM";
	}
	if (v.constructor) {
		var m = /([^ ]+)\(/.exec(v.constructor);
		if (m)
			return m[1].toLowerCase();
	}
	return "object";
};

/*
 * init
 */

utest.op = {
	"==":  function(v1, v2) { return v1 == v2; },
	"===": function(v1, v2) {
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
	"!=":  function(v1, v2) { return v1 != v2; },
	"!==": function(v1, v2) { return !utest.op["==="](v1, v2); },
	">":   function(v1, v2) { return v1 >  v2; },
	">=":  function(v1, v2) { return v1 >= v2; },
	"<":   function(v1, v2) { return v1 <  v2; },
	"<=":  function(v1, v2) { return v1 <= v2; }
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

function dump(obj) {
	switch (typeof obj) {
		case "boolean":
		case "number":
		case "function":
			return obj.toString();
		case "string":
			return "'" + obj.replace(/'/g, "\\'") + "'";
		case "undefined":
			return "undefined";
		case "object":
			if (!obj)
				return "null";
			var str = [];
			switch (obj.constructor) {
				case Boolean:
				case Number:
				case RegExp:
					return obj.toString();
				case String:
					return "'" + obj.replace(/'/g, "\\'") + "'";
				case Array:
					for (var i = 0, iz = obj.length; i < iz; ++i)
						str[str.length] = dump(obj[i]);
					return "[" + str.join(", ") + "]";
				default:
					try {
						for (var i in obj)
							str[str.length] = dump(i) + ": " + dump(obj[i]);
						return "{" + str.join(", ") + "}";
					}
					catch (e) {
						return "[error]"
					}
			}
	}
}
