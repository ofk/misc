/*----------------------------------------------------------
 * jquery.x.js（※）
 *
 * author: ofk
 * lastmodify: 2010-12-15
 *--------------------------------------------------------*/

(function ($, window_, document_, setTimeout_) {

var PREFIX = "_jQuery_x_",
    IS_MSIE = !!document_.documentElement.uniqueID,
    IS_MSIE6 = IS_MSIE && !window_.XMLHttpRequest;

var _setTimeout_  = "setTimeout",
    _hasClass_    = "hasClass",
    _addClass_    = "addClass",
    _removeClass_ = "removeClass",
    _xresize_     = "xresize";


/*----------------------------------------------------------
 * $.xtype
 * 適当な型判定
 *--------------------------------------------------------*/

var
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
	TYPE_DETECTOR_ = Object.prototype.toString;

/*
 * 型判定
 * @params object
 * @return string
 */
function $_xtype(obj) {
	var tmp;
	return TYPE_[tmp = typeof obj] || (tmp = TYPE_[TYPE_DETECTOR_.call(obj)]) ? tmp :
	       !obj                                         ? "null" :
	       obj[_setTimeout_]                            ? "window" :
	       obj.nodeType                                 ? "node" :
	       obj.jquery                                   ? "jquery" :
	       "length" in obj && (!obj.length || 0 in obj) ? "array" : "object";
}

$.xtype = $_xtype;


/*----------------------------------------------------------
 * $.xquery
 * 複数のセレクタをマージする
 *--------------------------------------------------------*/

/*
 * 複数のセレクタをマージする
 * @params string, string, ...
 * @return jquery
 */
function $_xquery() {
	var selectors = [], arr = arguments;
	for (var i = 0, iz = arr.length, c = -1; i < iz; ++i) {
		var tmp = arr[i];
		tmp && (selectors[++c] = tmp); //< pushを使わない戦略
	}
	return selectors.length ? $(selectors.join(",")) : $([]);
}

$.xquery = $_xquery;


/*----------------------------------------------------------
 * $.fn.xToggleClass
 * $.xToggleClassGenerator
 * クラスの追加と削除
 *--------------------------------------------------------*/

/*
 * クラス切り替えと取得
 * @params string, [boolean]
 * @return jQuery OR boolean
 */
$.fn.xToggleClass = function (classNames, flag) {
	if (flag == null) return this[_hasClass_](classNames);
	return this[flag ? _addClass_ : _removeClass_](classNames);
};

/*
 * クラス切り替えと取得のクラス名束縛して関数の生成
 * @params string
 * @return function
 */
function $_xToggleClassGenerator(classNames) {
	return function (flag) {
		if (flag == null) return this[_hasClass_](classNames);
		return this[flag ? _addClass_ : _removeClass_](classNames);
	};
};

$.xToggleClassGenerator = $_xToggleClassGenerator;
$.fn.xdisable = $_xToggleClassGenerator("x-disable");
$.fn.xactive = $_xToggleClassGenerator("x-active");


/*----------------------------------------------------------
 * $.fn.xclick
 * x-disableを無視する拡張クリックイベント
 *--------------------------------------------------------*/

/*
 * 拡張クリックイベント（関数が空でも登録できるためevent.specialを利用しない）
 * @params function
 * @return jQuery
 */
$.fn.xclick = function (fn) {
	return this.click(function () {
		var disable = $(this).xdisable();
		if (fn || disable) {
			fn && (disable || fn.apply(this, arguments)); //< x-disableクラスが付与されている場合、実行されない
			this.blur && this.blur();
			return false;
		}
	});
};


/*----------------------------------------------------------
 * $.event.special.xresize
 * 改良されたリサイズイベント
 *--------------------------------------------------------*/

var xresize_name = PREFIX + "event_special_" + _xresize_;

function EventXResize(win) {
	this.win = win;
	this.doc = win.document;
	this.use = true;
}

$.extend(EventXResize.prototype, {
	// サイズの取得
	check: function () {
		var doc  = this.doc,
		    root = doc.documentElement,
		    body = doc.body;
		return {
			w: root && root.clientWidth  || body.clientWidth,
			h: root && root.clientHeight || body.clientHeight,
			s: this.elem.offsetHeight
		};
	},
	// チェック開始
	start: function () {
		var doc  = this.doc,
		    elem = doc.body.appendChild(doc.createElement("div")),
		    es = elem.style;
		    es.position = "absolute";
		    es.top = "-9999px";
		    es.left = "-9999px";
		elem.appendChild(doc.createTextNode("m"));

		this.elem = elem;
		this.size = this.check();
		this.lock = 0;

		var that = this,
		    $win = $(this.win);
		(function loop() {
			if (!that.lock++) {
				var old_size = that.size,
				    now_size = that.check();
				if (old_size.w !== now_size.w
				 || old_size.h !== now_size.h
				 || old_size.s !== now_size.s) {
					that.size = now_size;
					$win.trigger(_xresize_);
				}
				setTimeout_(function() { that.lock = 0; }, 0);
			}
			if (that.use) {
				setTimeout_(loop, 100);
			}
		})();
	},
	// 停止
	stop: function () {
		this.use = false;
	}
});

$.event.special[_xresize_] = {
	// 設定
	setup: function () {
		if (!this[_setTimeout_]) return false; //< window以外は無視する
		var xresize = $.data(this, xresize_name, new EventXResize(this));
		$().ready(function () { xresize.start(); });
	},
	// 開放
	teardown: function () {
		if (!this[_setTimeout_]) return false;
		var xresize = $.data(this, xresize_name);
		xresize && xresize.stop();
		$.removeData(this, xresize_name);
	}
};


/*----------------------------------------------------------
 * イベントの拡張
 *--------------------------------------------------------*/

$.each([ _xresize_ ], function(i, name) {
	$.fn[name] = function (data, fn) {
		if (fn == null) {
			fn = data;
			data = null;
		}
		return arguments.length > 0 ?
			this.bind(name, data, fn) :
			this.trigger(name);
	};

	if ($.attrFn) {
		$.attrFn[ name ] = true;
	}
});


/*----------------------------------------------------------
 * $.xStyleSheets.add
 * $.xStyleSheets.remove
 * $.fn.xlivecss
 * $.fn.xdiecss
 * CSSルールの追加
 *--------------------------------------------------------*/

var $_xStyleSheets = $.xStyleSheets = IS_MSIE ? new function () {
	// IE用
	var sheet = document_.createStyleSheet();

	// 追加
	this._add = function (selector, rules, index) {
		var reg_trim = /^\s+|\s+$/g;

		sheet.addRule(
			selector.replace(reg_trim, ""),
			rules.replace(reg_trim, ""),
			index = index || sheet.rules.length
		);
		return index;
	};

	// 削除
	this.remove = function (index) {
		sheet.removeRule(index);
	};

} : new function () {
	// モダンブラウザ
	var sheet = document_.createElement("style");
	sheet.appendChild(document_.createTextNode(""));
	document_.documentElement.appendChild(sheet);
	sheet = sheet.sheet;

	// 追加
	this._add = function (selector, rules, index) {
		return sheet.insertRule(selector + "{" + rules + "}", index || sheet.cssRules.length);
	};

	// 削除
	this.remove = function (index) {
		sheet.deleteRule(index);
	};

};

$_xStyleSheets.add = function (selector, rules, index) {
	if (typeof rules !== "object") {
		var tmp = rules;
		rules = {};
		rules[tmp] = index;
		index = null;
	}
	var arr = [], c = -1;
	for (var name in rules) {
		var prop = name.replace(/([A-Z])/g, "-$1").toLowerCase(),
		    value = rules[name];
		arr[++c] = prop + ":" + value + ";";
	}
	return this._add(selector, arr.join(""), index);
};


/*
 * CSSルールの追加
 * @params object, [number]
 * @return jquery
 */
$.fn.xlivecss = function (rules, index) {
	index = $_xStyleSheets.add(this.selector, rules, index);
	var old_xdiecss = this.xdiecss;
	this.xdiecss = function () {
		$_xStyleSheets.remove(index);
		$.fn.xdiecss = old_xdiecss;
		return this;
	};
	return this;
};

/*
 * （直前に追加された）CSSルールの削除
 * @return jquery
 */
$.fn.xdiecss = function () {
	return this;
};


/*----------------------------------------------------------
 * $.xcookie
 * クッキーの読み書き。
 *--------------------------------------------------------*/

function $_xcookie(name, value, option) {
	if (typeof name === "object") {
		for (var i in name) {
			$_xcookie(i, name[i], value);
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

$.xcookie = $_xcookie;


/*----------------------------------------------------------
 * $.xtime
 * 日時の出力。
 * cf. http://github.com/kvz/phpjs/raw/master/functions/datetime/strftime.js
 *--------------------------------------------------------*/

function $_xtime(format, date) {
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

		// Second
		S: ["getSeconds", 2],
		s: function () {
			return Math.round(date / 1000);
		},

		// Timezone
		Z: function () {
			var z  = date.getTimezoneOffset(), za = Math.abs(z);
			return (z < 0 ? "+" : "-") + _pad(~~(za / 60), 2) + ":" + _pad(za % 60, 2);
		}
	};

	function _pad(n, c) {
		return (n += "").length < c
			? new Array((++c) - n.length).join("0") + n
			: n;
	}

	return format.replace(/%([cDFhnrRtT])/g, function (x, y) {
		return _aggregates[y];
	}).replace(/%(.)/g, function (x, y) { // [aAbBCdeHIlmMpPsSuwyYZ%]
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

$.xtime = $_xtime;

/*--------------------------------------------------------*/

})(jQuery, this, document, setTimeout);
