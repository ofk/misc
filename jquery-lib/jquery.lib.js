/*----------------------------------------------------------
 * jQuery Library（※）
 *--------------------------------------------------------*/

(function ($, window_, document_) {

/*----------------------------------------------------------
 * 定義
 *--------------------------------------------------------*/

var
IS_MSIE = !!document_.documentElement.uniqueID,
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
},
TYPE_DETECTOR_ = Object.prototype.toString,
TO_ARRAY = Array.prototype.slice,
sheet_;


/*----------------------------------------------------------
 * $.mix
 * オブジェクトの拡張。上書きはしない。
 *--------------------------------------------------------*/

$.mix = $_mix;

function $_mix(src) {
	for (var i = 1, iz = arguments.length; i < iz; ++i) {
		var dst = arguments[i];
		for (var j in dst) {
			j in src || (src[j] = dst[j]);
		}
	}
	return src;
}


/*----------------------------------------------------------
 * $.type
 * オブジェクトの型判定。typeof類似だが種類が豊富。
 *--------------------------------------------------------*/

$.type = $_type;

function $_type(obj) {
	var tmp;
	return TYPE_[tmp = typeof obj] || (tmp = TYPE_[TYPE_DETECTOR_.call(obj)]) ? tmp :
	       !obj            ? "null" :
	       obj.setTimeout  ? "window" :
	       obj.nodeType    ? "node" :
	       "length" in obj ? "array" : "object";
}


/*----------------------------------------------------------
 * $.dump
 * Object#toSourceライクな関数。
 *--------------------------------------------------------*/

$.dump = $_dump;

function $_dump(obj, indent) {
	indent = indent || "";

	var rv = $_type(obj),
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
					func(obj[i], next_indent).replace(/^\s*/g, next_indent)
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
}


/*----------------------------------------------------------
 * $.log
 *--------------------------------------------------------*/

$.log = $_log;
$.showLog = $_showLog;
$.clearLog = $_clearLog;

var _log = "";

function $_log() {
	var elem = document.getElementById("$_log");
	if (!elem && document.body) {
		elem = document.createElement("div");
		elem.id = "$_log";
		$(elem).css({
			padding: "20px",
			position: "fixed",
			top: "10%",
			right: "10%",
			bottom: "10%",
			left: "10%",
			zIndex: "99999",
			backgroundColor: "#ffc",
			display: "none"
		}).append($('<textarea>').css({
			width: "100%",
			height: "100%"
		}));
		document.body.appendChild(elem);
		$(document).keydown(function (evt) {
			evt.keyCode === 46 && $(elem).toggle(500);
		});
	}
	var A = Array.prototype.slice.call(arguments),
	    R = [];

	if (A.length > 0) {
		for (var i = 0, iz = A.length; i < iz; ++i) {
			var o = A[i], t = $.type(o);
			R[i] = t === "string" || t === "number" ? o : "(" + t + ") " + $.dump(o);
		}
		R = R.join("\n");
		var t, D = new Date;
		_log = ((t = D.getHours())   > 9 ? "" : "0") + t + ":"
		     + ((t = D.getMinutes()) > 9 ? "" : "0") + t + ":"
		     + ((t = D.getSeconds()) > 9 ? "" : "0") + t + ">"
		     + (R.indexOf("\n") > -1 ? "\n" : " ") + R + "\n" + _log;
	}

	elem && $("textarea", elem).val(_log);
}

function $_showLog() {
	$(document.getElementById("$_log")).show(500);
}

function $_clearLog() {
	var elem = document.getElementById("$_log");
	elem && $("textarea", elem).val("");
}


/*----------------------------------------------------------
 * $.klass
 * クラスの生成。
 *--------------------------------------------------------*/

$.klass = $_klass;

//*
function $_klass(parent, methods) {
	if (typeof parent === "object") {
		methods = parent;
		parent = null;
	}

	function klass() {
		this.klass = klass;
		if (klass.parent) {
			this.parent = makeParent(this, klass.parent);
		}
		this.init && this.init.apply(this, arguments);
	}
	klass.parent = parent;

	var kp = klass.fn = klass.prototype;

	if (parent) {
		var pp = parent.prototype;
		for (var i in pp) {
			var f = kp[i] = pp[i];
			if ($_type(f) === "function" && f.override) {
				kp[i] = (function (name) {
					return function f() {
						return this.parent(name, arguments);
					};
				})(i)
			}
		}
	}

	if (methods) for (var i in methods) {
		var t = kp[i], f = kp[i] = methods[i];
		if ($_type(f) === "function" && $_type(t) === "function") {
			f.override = true;
		}
	}

	return klass;

	function makeParent(self, parent) {
		var pp = parent.prototype, sp, tp;
		if (tp = parent.parent) sp = makeParent(self, tp);
		var fn = function (name, args) {
			var bk = self.parent;
			self.parent = sp;
			var rv = pp[name].apply(self, args || []);
			self.parent = bk;
			return rv;
		};
		fn.parent = sp;
		for (var i in pp) if ($_type(pp[i]) === "function") {
			fn[i] = (function (name) {
				return function () { return fn(name, arguments); }; // fn = self.parent
			})(i);
		}
		return fn;
	}
}

/*/
function $_klass(parent, methods) {
	if (typeof parent === "object") {
		methods = parent;
		parent = null;
	}
	function klass() {
		this.klass = klass;
		this.init && this.init.apply(this, arguments);
	}
	if (parent) {
		function tmp() {}
		tmp.prototype = parent.prototype;
		klass.prototype = new tmp;
		klass.prototype.parent = parent.prototype;
		klass.prototype.parent.constructor = parent;
		klass.prototype.constructor = klass;
	}
	methods && $.extend(klass.prototype, methods);
	return klass;
}
//*/

/*----------------------------------------------------------
 * $.fn.iff
 * 条件分岐
 *--------------------------------------------------------*/

$.fn.iff = $_fn_iff;
$.fn.els = $_fn_els;

function $_fn_iff(test) {
	this.iff_ = (!test && test !== void 0) ||
	            ($.isFunction(test) && !test.apply(this, TO_ARRAY.call(arguments, 1)));
	return this.pushStack(this.iff_ ? [] : this, "iff", test);
}

function $_fn_els(test) {
	var prev = this.end(), flag = true;
	switch (prev.iff_) {
		default:
			return this;
		case true:
			prev.iff_ = flag = (!test && test !== void 0) ||
			                   ($.isFunction(test) && !test.apply(this, TO_ARRAY.call(arguments, 1)));
		case false:
			break;
	}
	return prev.pushStack(flag ? [] : prev, "els", test);
}


/*----------------------------------------------------------
 * $.fn.addRule
 * $.fn.removeRule
 * CSSルールの追加
 *--------------------------------------------------------*/

$.fn.addRule = IS_MSIE
             ? $_fn_addRule_ie
             : $_fn_addRule;
$.fn.removeRule = function () {};

function $_fn_addRule(rules, index) {
	if (!sheet_) {
		sheet_ = document_.createElement("style");
		sheet_.appendChild(document_.createTextNode(""));
		document_.documentElement.appendChild(sheet_);
		sheet_ = sheet_.sheet;
	}

	if (typeof rules !== "object") {
		var tmp = rules;
		rules = {};
		rules[tmp] = index;
		index = null;
	}

	var str = this.selector + "{";
	for (var name in rules) {
		str += name.replace(/([A-Z])/g, "-$1").toLowerCase() + ":" + rules[name] + ";";
	}
	str += "}";

	index = sheet_.insertRule(str, index || sheet_.cssRules.length);

	this.removeRule = function () {
		sheet_.deleteRule(index);
		return this;
	};

	return this;
}

function $_fn_addRule_ie(rules, index) {
	if (!sheet_) {
		sheet_ = document_.createStyleSheet();
	}

	if (typeof rules !== "object") {
		var tmp = rules;
		rules = {};
		rules[tmp] = index;
		index = null;
	}

	var arr = [], c = -1, reg = /^\s+|\s+$/g;
	for (var name in rules) {
		arr[++c] = name.replace(/([A-Z])/g, "-$1").toLowerCase() + ":" + rules[name] + ";";
	}

	sheet_.addRule(
		this.selector.replace(reg, ""),
		arr.join("").replace(reg, ""),
		index = index || sheet_.rules.length
	);

	this.removeRule = function () {
		sheet_.removeRule(index);
		return this;
	};

	return this;
}


/*----------------------------------------------------------
 * $.fn.selection
 * テキストエリア選択
 *--------------------------------------------------------*/

$.fn.selection = document_.createElement("textarea").setSelectionRange
               ? $_fn_selection
               : $_fn_selection_ie;

function $_fn_selection(pos, end) {
	if (pos == null) {
		var elem = this[0];
		return {
			start: elem.selectionStart,
			end:   elem.selectionEnd
		};
	}
	if (typeof pos === "number") {
		pos = { start: pos, end: typeof end === "number" ? end : pos };
	}
	return this.each(function () {
		this.focus();
		this.setSelectionRange(pos.start, pos.end);
	});
}

function $_fn_selection_ie(pos, end) {
	if (pos == null) {
		var elem = this[0],
		    res = {},
		    docRange = document_.selection.createRange(),
		    textRange = document_.body.createTextRange();
		textRange.moveToElementText(elem);
		var range = textRange.duplicate();
		range.setEndPoint("EndToStart", docRange);
		res.start = range.text.length;
		range = textRange.duplicate();
		range.setEndPoint("EndToEnd", docRange);
		res.end = range.text.length;
		return res;
	}
	if (typeof pos === "number") {
		pos = { start: pos, end: typeof end === "number" ? end : pos };
	}
	return this.each(function () {
		var range = this.createTextRange();
		if (pos.start === pos.end) {
			range.moveEnd("character", pos.end);
			range.moveStart("character", pos.end);
		}
		else {
			range.moveStart("character", pos.start);
			range.moveEnd("character", pos.end - this.value.length);
		}
		range.select();
	});
}


/*----------------------------------------------------------
 * $.Event.prototype.hotkey
 * キー入力の取得
 *--------------------------------------------------------*/

$.Event.prototype.hotkey = $_Event_prototype_hotkey;

function _toCharFromKeyCode(evt, kc) {
	var _32_40 = "space pageup pagedown end home left up right down".split(" "), kt = {
		  8: "back",   9: "tab",  10: "enter",   13: "enter",  16: "shift",
		 17: "ctrl",  27: "esc",  46: "delete",  58: ":",      59: ":",
		 60: "<",     62: ">",    63: "?",      107: ";",     109: "-",
		188: ",",    190: ".",   191: "/",      192: "@",     219: "[",
		220: "\\",   221: "]",   222: "^",      226: "\\",    229: "IME"
	}, cc = String.fromCharCode;
	return (
		112 <= kc && kc <= 123 && (evt.type !== "keypress" || !evt.which) ? "f"+ (kc - 111) : // f1 - f12
		 65 <= kc && kc <= 90  ? cc(kc + 32) : // keydown  a-z
		 97 <= kc && kc <= 122 && evt.type === "keypress" ? cc(kc) : // keypress a-z
		 48 <= kc && kc <= 57  ? cc(kc) : // 0-9
		 96 <= kc && kc <= 105 ? cc(kc - 48) : // num 0-9
		 32 <= kc && kc <= 40  ? _32_40[kc - 32] :
		 kt.hasOwnProperty(kc) ? kt[kc] :
		"null"
	);
}

function $_Event_prototype_hotkey() {
	var c = _toCharFromKeyCode(this, +this.keyCode);
	if (this.shiftKey) {
		if (c === "\\") {
			c = this.keyCode === 220 ? "|" : "_";
		}
		else {
			var kt = {
				"1": "!", "2": '"', "3": "#", "4": "$", "5": "%",
				"6": "&", "7": "'", "8": "(", "9": ")", ":": "*",
				"<": "<", ">": ">", "?": "?", ";": "+", "-": "=",
				",": "<", ".": ">", "/": "?", "@": "`", "[": "{",
				"]": "}", "^": "~"
			};
			if (kt.hasOwnProperty(c)) {
				c = kt[c];
			}
			else {
				var tc = c.toUpperCase();
				c = c === tc ? "S-" + c : tc;
			}
		}
	}
	if (this.altKey || this.metaKey) {
		c = "M-" + c;
	}
	if (this.ctrlKey) {
		c = "C-" + c;
	}
	return c;
}


/*----------------------------------------------------------
 * $.event.special.resizeAll
 * リサイズイベントを滑らかに
 *--------------------------------------------------------*/

var ra_lock_ = 0, ra_size_, ra_use_, ra_elem_;

$(function () {
	ra_elem_ = document_.body.appendChild(document_.createElement("div"));
	ra_elem_.style.position = "absolute";
	ra_elem_.style.top = "-9999px";
	ra_elem_.style.left = "-9999px";
	ra_elem_.appendChild(document_.createTextNode("m"));
});

function ra_size() {
	var root = document_.document_Element,
	    body = document_.body;
	return {
		w: root && root.clientWidth  || body.clientWidth,
		h: root && root.clientHeight || body.clientHeight,
		s: ra_elem_ ? ra_elem_.offsetHeight : null
	};
}

$.event.special.resizeAll = {
	setup: function () {
		if (!this.setTimeout)
			return false;
		ra_size_ = ra_size();
		ra_use_ = true;
		(function loop() {
			if (!ra_lock_++) {
				var now = ra_size();
				if (ra_size_.s === null && ra_size_.s !== now.s) {
					ra_size_.s = now.s;
				}
				if (ra_size_.w !== now.w || ra_size_.h !== now.h || ra_size_.s !== now.s) {
					ra_size_ = now;
					var evt = $.Event("resizeAll");
					evt.target = evt.originalTarget = evt.currentTarget = window;
					$.event.handle.call(this, evt);
				}
				setTimeout(function() { ra_lock_ = 0; }, 0);
			}
			if (ra_use_) {
				setTimeout(loop, 100);
			}
		})();
	},
	teardown: function () {
		if (!this.setTimeout)
			return false;
		ra_use_ = false;
	}
};


/*----------------------------------------------------------
 * $.cookie
 * クッキーの読み書き。
 *--------------------------------------------------------*/

$.cookie = $_cookie;

function $_cookie(name, value, option) {
	if (typeof name === "object") {
		for (var i in name) {
			$_cookie(i, name[i], value);
		}
		return;
	}
	if (value === void 0) {
		option = (";" + document_.cookie + ";").match(new RegExp(";\\s*" + name + "=(.*?)\\s*;"));
		return option ? decodeURIComponent(option[1]) : null;
	}
	option = option || {};
	var expires = "",
	    lim = option.expires,
	    tmp;
	if (value === null) {
		value = "";
		lim = -1;
	}
	if (lim) {
		if (!lim.toUTCString) {
			tmp = parseInt(lim, 10);
			lim = new Date;
			lim.setTime(lim.getTime() + tmp * 86400000);
		}
		expires = ";expires=" + lim.toUTCString();
	}
	document_.cookie = [
		name, "=", encodeURIComponent(value),
		expires,
		(tmp = option.path)   ? ";path=" + tmp : "",
		(tmp = option.domain) ? ";domain=" + tmp : "",
		option.secure ? ";secure" : ""
	].join("");
}


/*----------------------------------------------------------
 * $.url.search
 * URLの検索キーのハッシュ取得。
 *--------------------------------------------------------*/

$.url = {
	search: $_url_search,
	hash: $_url_hash
};

function $_url_search(key) {
	var search = $_url_search.search_;
	if (!search) {
		search = {};
		var queries = (location.search || "").replace(/^\?/, "").split("&");
		for (var i = 0, iz = queries.length; i < j; ++i) {
			var tmp = queries.split("="),
			    key = tmp.unshift(),
			    value = tmp.join("=");
			search[key] = value; //< TODO: 連想配列に対応する
		}
		$_url_search.search_ = search;
	}
	return key == null ? search : search[key];
}


/*----------------------------------------------------------
 * $.url.hash
 * URLのアンカー取得。
 *--------------------------------------------------------*/

function $_url_hash(val, skip) {
	var location_ = location;
	switch (typeof val) {
		// getter
		case "undefined":
			var rv = location_.hash;
			if (!rv) {
				return null;
			}
			rv = rv.replace(/^#/, "");
			return window_.Components ? rv : decodeURIComponent(rv);
		// callback
		case "function":
			if (!$_url_hash.tid_) {
				$_url_hash.hash_ = location_.hash;
				(function rec() {
					if (!$_url_hash.skip_ && $_url_hash.hash_ !== location_.hash) {
						$_url_hash.hash_ = location_.hash;
						$(window_).trigger("changeAnchor", [$_url_hash()]);
					}
					$_url_hash.tid_ = setTimeout(rec, 300);
				})();
			}
			return $(window_).bind("changeAnchor", val);
		// setter
		default:
			if (skip) {
				$_url_hash.skip_ = true;
				location_.hash = encodeURIComponent(val);
				$_url_hash.hash_ = location_.hash;
				$_url_hash.skip_ = false;
			}
			else {
				location_.hash = encodeURIComponent(val);
			}
			return;
	}
}


/*----------------------------------------------------------
 * $.xml2json
 * http://app.drk7.jp/xml2json/var=?&url=を用いて、JSONPアクセスする
 *--------------------------------------------------------*/

$.xml2json = $_xml2json;

var $_xml2json_count = 0;

function $_xml2json(url, callback) {
	var name = "xml2json_" + (++$_xml2json_count);

	window_[name] = {
		onload: function (data) {
			callback(data);
			try {
				window_[name] = null;
				delete window_[name];
			} catch (e) {}
		}
	};

	$.getScript("http://app.drk7.jp/xml2json/" + $.param({
		"var": name,
		"url": url
	}));
}


/*----------------------------------------------------------
 * $.fn.template
 * $.template
 * テンプレートエンジン。適当すぎる。
 *--------------------------------------------------------*/

$.fn.template = $_fn_template;
$.template = $_template;

function $_fn_template(num) {
	var elem = this[num || 0],
	    text = /^(?:INPUT|OPTION|SELECT|TEXTAREA)$/i.test(elem.tagName) ? $(elem).val() : $(elem).html();
	return $_template(text);
}

function $_template(str) {
	// str = "A&B"
	//  [[str]] => A&amp;B
	//  [[@str#method 1#method 2]] => A&B
	return new $_template.fn.init(str);
}

$_template.methods = {};

$_template.method = function (name, func) {
	if (typeof name === "object") {
		$.extend(this.methods, name);
	}
	else {
		this.methods[name] = func;
	}
};

$_template.fn = $_template.prototype = {
	init: function (str) {
		$.extend(this.methods = {}, $_template.methods);
		str = str
			.replace(/\r\n?/g, "\n")
			.replace(/\n/g, "\\n")
			.replace(/'/g, "\\'");
		var code = "return [" + ("'" + str
			.replace(/\s*{{\/else}}\s*/g, "'].join(''),'")
			.replace(/\s*{{else}}\s*/g, "'].join(''):['")
			.replace(/\s*{{\/if}}\s*/g, "'].join(''):'','")
			.replace(/\s*{{if\s+(!?)([\w.]+)(.*?)}}\s*/g, function (x, y, z, w) {
				return "',"+ y +"param['" + z.split(".").join("']['") + "']" + w + "?['";
			})
			.replace(/\[\[((?:@?[\w.]+(?:#\w+(?:\s(?:[^\s#`\[\]]+|`(?:[^`\\]|\\.)*`))*)*\??)+)\]\]/g, function (x, y) {
				var res  = [],
				    flag,
				    reg  = /(@?)([\w.]+)((?:#\w+(?:\s(?:[^\s#`\[\]]+|`(?:[^`\\]|\\.)*`))*)*)(\??)/g,
				    rega = /#(\w+)((?:\s(?:[^\s#`\[\]]+|`(?:[^`\\]|\\.)*`))*)/g,
				    regb = /[^\s#`\[\]]+|`(?:[^`\\]|\\.)*`/g,
				    m;
				while (m = reg.exec(y)) {
					var esc = !m[1],
					    name = m[2],
					    func = m[3];
					flag = m[4];
					var val_str = "param['" + name.split(".").join("']['") + "']",
					    val_method_before = "",
					    val_method_after = "";
					while (m = rega.exec(func)) {
						var method = m[1],
						    args = m[2].match(regb) || [];
						for (var i = 0, iz = args.length; i < iz; ++i) {
							if (args[i].charAt(0) === "`") {
								args[i] = args[i].slice(1, -1).replace(/\\(.)/g, "$1");
							}
							args[i] = "'" + args[i].replace(/'/g, "\\'") + "'";
						}
						val_method_before = "methods." + method + ".call(" + val_method_before;
						val_method_after += (args.length ? "," + args.join(",") : "") + ")";
					}
					res.push(
						(flag ? val_str + "?" : "") +
						val_method_before + 
						"(''+(" + val_str + "||''))" +
						(esc ? ".replace(/&/g,'&amp;').replace(/\"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')" : "") +
						val_method_after
					);
				}
				if (flag) {
					res.push("''");
				}
				return "',(" + res.join(":") + "),'";
			}) + "'") + "].join('')";
		this.compiled = new Function(
			"param,methods",
			code
		);
	},
	build: function (param) {
		return this.compiled(param, this.methods);
	},
	method: $_template.method
};

$_template.fn.init.prototype = $_template.fn;


/*----------------------------------------------------------
 * $.ftime
 * 日時の出力。
 * cf. http://github.com/kvz/phpjs/raw/master/functions/datetime/strftime.js
 *--------------------------------------------------------*/

$.ftime = $_ftime;

function $_ftime(format, date) {
	date = date || new Date;

	var
	_aggregates = {
		c: "%a %b %e %H:%M:%S %Y", D: "%m/%d/%y", F: "%y-%m-%d", h: "%b",
		n: "\n", r: "%I:%M:%S %p", R: "%H:%M", t: "\t", T: "%H:%M:%S"
	},
	_words = [
		"Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur",
		"January", "February", "March", "April", "May", "June", "July",
		"August", "September", "October", "November", "December"
	],
	_formats = {
		// Day
		a: function () {
			return _formats.A().slice(0, 3);
		},
		A: function () {
			return _words[date.getDay()] + "day";
		},
		d: ["getDate", 2],
		e: "getDate",
		u: function () {
			return date.getDay() || 7;
		},
		w: "getDay",

		// Month
		b: function () {
			return _formats.B().slice(0, 3);
		},
		B: function () {
			return _words[7 + date.getMonth()];
		},
		m: function () {
			return _pad(date.getMonth() + 1, 2);
		},

		// Year
		C: function () {
			return _pad(Math.ceil(date.getFullYear() / 100), 2);
		},
		y: function () {
			return _pad(date.getFullYear() % 100, 2);
		},
		Y: "getFullYear",

		// Hour
		H: ["getHours", 2],
		I: function () {
			return _pad(_formats.l(), 2);
		},
		l: function () {
			return date.getHours() % 12 || 12;
		},

		// Minute
		M: ["getMinutes", 2],
		p: function () {
			return date.getHours() > 11 ? "pm" : "am";
		},
		P: function () {
			return date.getHours() > 11 ? "PM" : "AM";
		},
		S: ["getSeconds", 2],
		s: function () {
			return Math.round(new Date / 1000);
		}
	};

	function _pad(n, c) {
		return (n += "").length < c
			? new Array((++c) - n.length).join("0") + n
			: n;
	}

	return format.replace(/%([cDFhnrRtT])/g, function (x, y) {
		return _aggregates[y];
	}).replace(/%([aAbBCdeHIlmMpPsSuwyY%])/g, function (x, y) {
		var f = _formats[y];
		if (typeof f === "string")
			return date[f]();
		if (typeof f === "function")
			return f();
		if (typeof f === "object" && typeof f[0] === "string")
			return _pad(date[f[0]](), f[1]);
		return y;
	});
}

/*--------------------------------------------------------*/

})(jQuery, this, document);
