/*--------------------------------------
 * $.js - jQuery like Library
 *
 * Author: ofk
 * Modify: Sun, 15 Nov 2009 12:22:37 JMT
 *------------------------------------*/

(function ($, _window, _document) {

var IS_MSIE = !!_document.documentElement.uniqueID;

/*
 * jQuery like method
 */

$.fn.hover = function (onenter, onleave) {
	return this.on("mouseenter", onenter)
	           .on("mouseleave", onleave);
};

"blur focus load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" ").forEach(function (name) {
	$.fn["on" + name] = function (fn, data) {
		return this.on(name, fn, data);
	};
});


/*
 * Class
 */

$.klass = function (methods) {
	var klass = function () {
		this.init && this.init.apply(this,arguments);
	};
	klass.fn = klass.prototype;
	for (var name in methods) {
		klass.fn[name] = methods[name];
	}
	return klass;
};


/*
 * CSS
 */

$.sheet = {
	add: function (rule, index) {
		var fn = $.sheet, sheet  = fn.sheet,
		    pos, rv = -1;
		if (!sheet) {
			if (IS_MSIE) {
				sheet = _document.createStyleSheet();
			}
			else {
				sheet = _document.createElement("style");
				sheet.appendChild(_document.createTextNode(""));
				_document.documentElement.appendChild(sheet);
				sheet = sheet.sheet;
			}
			fn.sheet = sheet;
		}
		if (!IS_MSIE) {
			return sheet.insertRule(rule, index || sheet.cssRules.length);
		}
		if ((pos = rule.indexOf("{")) !== -1) {
			rule = rule.replace(/[\{\}]/g,"");
			sheet.addRule(
				rule.slice(0, pos).trim(),
				rule.slice(pos).trim(),
				rv = index || sheet.rules.length
			);
		}
		return rv;
	},
	remove: function (index) {
		var sheet = $.sheet.sheet;
		sheet && sheet[IS_MSIE ? "removeRule" : "deleteRule"](index);
	}
};


/*
 * Cookie
 */

$.cookie = function (name, value, option) {
	if (typeof name === "object") {
		for (var i in name) {
			$.cookie(i, name[i], value);
		}
		return;
	}
	if (value === void 0) {
		option = (";" + _document.cookie + ";").match(new RegExp(";\\s*" + name + "=(.*?)\\s*;"));
		return option ? decodeURIComponent(option[1]):null;
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
	_document.cookie = [
		name, "=", encodeURIComponent(value),
		expires,
		(tmp = option.path)   ? ";path=" + tmp : "",
		(tmp = option.domain) ? ";domain=" + tmp : "",
		option.secure ? ";secure" : ""
	].join("");
};


/*
 * URL
 */

$.url = {
	search: function (key) {
		var fn = $.url.search,
		    search = fn.search;
		if (!search) {
			search = {};
			var queries = (location.search || "").replace(/^\?/, "").split("&");
			for (var i = 0, iz = queries.length; i < j; ++i) {
				var tmp = queries.split("="),
				    key = tmp.unshift(),
				    value = tmp.join("=");
				search[key] = value; //< TODO: 連想配列に対応する
			}
			fn.search = search;
		}
		return key == null ? search : search[key];
	},
	hash: function (val, skip) {
		var fn = $.url.hash, _location = location;
		switch (typeof val) {
			// getter
			case "undefined":
				var rv = _location.hash;
				if (!rv) {
					return null;
				}
				rv = rv.replace(/^#/, "");
				return _window.Components ? rv : decodeURIComponent(rv);
			// callback
			case "function":
				if (!fn.tid) {
					fn.hash = _location.hash;
					(function rec() {
						if (!fn.skip && fn.hash !== _location.hash) {
							fn.hash = _location.hash;
							$(_window).on("changeAnchor", fn());
						}
						fn.tid = setTimeout(rec, 300);
					})();
				}
				return $(_window).on("changeAnchor", val);
			// setter
			default:
				if (skip) {
					fn.skip = true;
					_location.hash = encodeURIComponent(val);
					fn.hash = _location.hash;
					fn.skip = false;
				}
				else {
					_location.hash = encodeURIComponent(val);
				}
				return;
		}
	}
};


})($, this, document);
