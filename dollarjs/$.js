/*--------------------------------------
 * $.js - jQuery like library
 *
 * Author: ofk
 * Modify: Sun, 15 Nov 2009 12:24:57 JMT
 *
 * this script based on
 *   jQuery JavaScript Library
 *   http://jquery.com/
 *
 * Support Browser:
 * - IE 5.5+ (IE 5 with $.boost.js)
 * - Fx 1+
 * - Opera8+
 * - Safari 2.0.3+ (Safari 1.x with $.boost.js)
 * - Chrome
 *--------------------------------------
 * TOC:
 * - $ Core
 *   - Global
 *   - Const
 *   - Functions
 *   - $
 * - $.browser
 * - $.support
 * - $.data
 * - $.query
 * - $.clean
 * - $.attr
 * - $.css
 * - $.event
 * - $.ajax
 * - $.fx
 * - $.fn
 * - Initialize
 * - Functions
 * - ECMAScript-262 5th
 *   - Function
 *   - Array
 *   - String
 *   - Date
 *   - *.toJSON
 *   - JSON
 *--------------------------------------
 * MEMO:
 * - obj.alert (windowの判定)
 * - obj.writeln (documentの判定)
 *     writeだと重なりそうなので
 *------------------------------------*/

(function (_window, _document) {
//@var _window = this, _document = document;


/*--------------------------------------
 * $ Core
 *------------------------------------*/

var

/*
 * Global Cache
 */
_$                        = _window.$,
_opera                    = _window.opera,
_XMLHttpRequest           = _window.XMLHttpRequest,
_document_documentElement = _document.documentElement, //< 要開放
_document_defaultView     = _document.defaultView, //< 要開放
_Object_hasOwnProperty    = Object.hasOwnProperty,
_Function_prototype       = Function.prototype,
_Array_prototype          = Array.prototype,
_Array_prototype_push     = _Array_prototype.push,
_Array_prototype_slice    = _Array_prototype.slice,
_Array_prototype_indexOf  = _Array_prototype.indexOf,
_String                   = String,
_Date                     = Date,
_Date_prototype           = _Date.prototype,
_Math                     = Math,
_Math_max                 = _Math.max,
_Math_round               = _Math.round,

/*
 * Const
 */
HEAD        = _document.getElementsByTagName("head")[0], //< 要開放
IS_MSIE     = !!_document_documentElement.uniqueID,
IS_MSIE6    = IS_MSIE && !_XMLHttpRequest,
IS_SAFARI2  = !IS_MSIE && !navigator.taintEnabled && !IS_QUERY,
IS_QUERY    = !!_document.querySelectorAll,
REG_SPACE   = /\s+/,
REG_TRIM    = /^\s+|\s+$/g,
REG_LTRIM   = /^\s+/,
REG_RTRIM   = /\s+$/,
REG_CAMEL   = /-([a-z])/g,
REG_DECAMEL = /([A-Z])/g,
REG_CRLF    = /\r\n?/g,

/*
 * Functions
 */

// toArrayFromNodes.call(elems)
//   @brief DOMCollectionをDOMElement[]に変換する。実体はArray#slice.call。
//          IEでは動作しないため、$.supportの段階で置き換える
//   @param nodes DOMCollection
//   @return DOMElement[]
toArrayFromNodes = _Array_prototype_slice,

// getTags(tagName, parents)
//   @brief タグの取得関数。$_uidが定義されている必要がある。
//   @param tagName string - タグ名
//   @param parents DOMElement[] - 省略はできない
//   @return DOMElement[]
getTags = function (tagName, parents) {
	var iz = parents.length,
	    rv = [], q = -1, merge = {}, elem,
	    flag_all = tagName === "*",
	    flag_dirty = flag_all && $_support.commnet; //< *指定があり、コメントノードを含んでしまう場合
	if (!iz) {
		return rv;
	}
	if (!flag_dirty) {
		// タグ名が指定される、もしくは、コメントノードが混ざらない普通の実装の場合
		if (iz === 1) {
			return toArrayFromNodes.call(parents[0].getElementsByTagName(tagName));
		}
		for (var i = 0; i < iz; ++i) {
			for (var j = 0, elems = parents[i].getElementsByTagName(tagName); elem = elems[j]; ++j) {
				var uid = elem.uniqueID || (elem.uniqueID = ++$_uid);
				if (!merge[uid]) {
					merge[uid] = true;
					rv[++q] = elem;
				}
			}
		}
	}
	else {
		// flag_all = trueであることが保証される
		// IEではコメントノードが混ざるため、IE5.xではelem.allでしか拾えないため、このコードが必要
		for (var i = 0; i < iz; ++i) {
			for (var j = 0, elems = parents[i].all || parents[i].getElementsByTagName(tagName); elem = elems[j]; ++j) {
				if (elem.nodeType === 1 && elem.tagName !== "!") {
					var uid = elem.uniqueID || (elem.uniqueID = ++$_uid); //< $_uidは不要そうだが念のため
					if (!merge[uid]) {
						merge[uid] = true;
						rv[++q] = elem;
					}
				}
			}
		}
	}
	return rv;
},


/*
 * $
 */

// $(obj = document, parents = void 0)
//   @breif $オブジェクトを返す
//   @param obj anything
//   @param parents anything
//   @return $ object
$ = _window.$ = function (obj, parents) {
	// 引数が省略された場合はキャッシュ済みの$(document)を返す
	return arguments.length ? new $_fn.init(obj, parents) : $document;
},

// ブラウザ判定格納用
/*
$_browser = $.browser = {
	msie:    false,
	mozilla: false,
	opera:   false,
	chrome:  false,
	safari:  false,
	webkit:  false,
	unknown: false
},
$_version = 0,
//*/
$_support = $.support = {},

// $.isXMLDoc(context)
//   @breif XML文書かどうかを判定する cf. http://d.hatena.ne.jp/uupaa/20081010/1223630689
//   @param context DOMDocument
//   @return boolean
$_isXMLDoc = $.isXMLDoc = function (context) {
	return context !== _document && context.createElement("p").tagName !== context.createElement("P").tagName;
},

// $.isFunction(obj)
//   @breif functionであるかの判定。IE6以下はメモリーリークの対策をしている。
//   @param obj anything
//   @return boolean
$_isFunction = $.isFunction = IS_MSIE6 ? function (obj) {
	return !!obj &&          //< objが存在する
	        !obj.alert &&    //< objがwindowではない
	        !obj.nodeType && //< objがノードではない
	        !obj.writeln &&  //< objがdocumentではない（nodeTypeでは判定できないIE5用）
	         obj instanceof Function;
} : function (obj) {
	return obj instanceof Function;
},

// $.isArray(obj)
//   @breif Arrayであるかの判定。IE6以下はメモリーリークの対策をしている。
//   @param obj anything
//   @return boolean
$_isArray = $.isArray = IS_MSIE6 ? function (obj) {
	// $.isFunction参照
	return !!obj && !obj.alert && !obj.nodeType && !obj.writeln && obj instanceof Array;
} : function (obj) {
	return obj instanceof Array;
},

// $.data
$_uid = 0,
$_cache = {},
$_data,
$_data_queue,

// $.query
SELECTOR_HASH_SELECTOR   = toHashNumberFromString("> + ~ # . : scope root link"),
SELECTOR_HASH_OPERATOR   = toHashNumberFromString("= != ~= ^= $= *= |="),
SELECTOR_HASH_ATTR_GUARD = toHashNumberFromString("title id name class for href src"),
SELECTOR_REG_ARG_ENCODE  = /\\([0-9a-fA-F]{0,6})/g,
SELECTOR_REG_QUICK       = /^\s*(\*|\w*)(#([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*))?\s*$/i,
SELECTOR_REG_ESCAPE      = /\\/g,
SELECTOR_REG_COMBINATOR  = /^([>+~])\s*(\*|\w*)/,
SELECTOR_REG_ELEMENT     = /^(\*|\w+)/,
SELECTOR_REG_COMMA       = /^\s*,\s*/,
SELECTOR_REG_SEQUENCE    = /^([#\.:])([a-z_\u00C0-\uFFEE\-][\w\u00C0-\uFFEE\-]*)|^\[\s*([^\s\[\]=~^$*|!]+)/i,
SELECTOR_REG_ARGS        = /^\(\s*("([^"]*)"|'([^']*)'|[^\(\)]*(\([^\(\)]*\))?)\s*\)/,
SELECTOR_REG_ATTRIBUTE   = /^\s*(([~^$*|!]?=)\s*("([^"]*)"|'([^']*)'|[^ \[\]]*)\s*)?\]/,
SELECTOR_REG_NTH         = /(-?)(\d*)n([-+]?\d*)/,
$_query,

// $.clean
CLEAN_REG_NOT_TEXT   = /[<>&]/,
CLEAN_REG_TAG        = /^<(\w+)\s*\/?>(<\/\1>)?$/, //< $.supportで置き換えする場合がある
CLEAN_REG_CLOSE_TAG  = /(<(\w+)[^>]*)\/>/g,
CLEAN_REG_GUARD_TAG  = /^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i,
CLEAN_REG_OPEN_TAG   = /^\s*<(\w+)/,
CLEAN_HASH_TABLE_TAG = toHashNumberFromString("THEAD TBODY TFOOT COLGROUP CAPTION"),
CLEAN_REG_HAS_TBODY  = /<TBODY/i,
$_clean,

// $.attr
ATTR_SPECIAL_GUARD = toHashNumberFromString("style href src action"),
ATTR_TEXTCONTENT   = typeof _document_documentElement.innerText === "string" ? "innerText" : "textContent", //< IE以外にOpera、SafariはinnerTextの方が良い。（Operaはコメントを含むため）
ATTR_PROPS         = toHashFromString("class className accesskey accessKey accept-charset acceptCharset bgcolor bgColor cellpadding cellPadding cellspacing cellSpacing char ch charoff chOff codebase codeBase codetype codeType colspan colSpan datetime dateTime for htmlFor frameborder frameBorder http-equiv httpEquiv ismap isMap longdesc longDesc maxlength maxLength nohref noHref readonly readOnly rowspan rowSpan tabindex tabIndex usemap useMap valuetype valueType textContent " + ATTR_TEXTCONTENT + " innerText " + ATTR_TEXTCONTENT),
ATTR_HASH_FORM_TAG = toHashNumberFromString("BUTTON INPUT OBJECT SELECT TEXTAREA"),
ATTR_HASH_LINK_TAG = toHashNumberFromString("A AREA"),
$_attr,

// $.css
CSS_FLOAT              = "cssFloat", //< $.supportで置き換える場合がある
CSS_HIDE_PROP          = toHashFromString("position absolute visibility hidden display block"),
CSS_REG_CURRENT_GUARD  = /^(fontSize|backgroundPosition[XY]?)$/,
CSS_REG_CURRENT_NUMBER = /^-?\d+\w*$/,
CSS_REG_CURRENT_PIXEL  = /^-?\d+(px)?$/i,
$_css,

// $.event
EVENT_PROPS = "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
EVENT_HASH_SPECIAL_WITHIN = toHashFromString("mouseenter mouseover mouseleave mouseout"),
$_event_triggered,
$_event_used = {},
$_event_ready = false,
$_event,
$_Event,

// $.ajax
AJAX_REG_QUERY = /\?/,
AJAX_REG_JSONP = /(=)\?([\/;&]|$)|(\/)\?([\?\/;&]|$)/,
AJAX_REG_CACHE = /([\?&])_=[^&]*(&|$)/,
AJAX_REG_URL   = /^(\w+:)?\/\/([^\/?#]+)/,
$_ajax_jsonp   = 0,
$_ajax_active  = 0,
$_ajax,

// $.fx
FX_REG_COLORS      = /([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([^\s]+)\s+/,
FX_STR_COLORS      = "000000black 888888gray ccccccsilver ffffffwhite ff0000red ffff00yellow 00ff00lime 00ffffaqua 00ffffcyan 0000ffblue ff00fffuchsia ff00ffmagenta 880000maroon 888800olive 008800green 008888teal 000088navy 880088purple 696969dimgray 808080gray a9a9a9darkgray c0c0c0silver d3d3d3lightgrey dcdcdcgainsboro f5f5f5whitesmoke fffafasnow 708090slategray 778899lightslategray b0c4delightsteelblue 4682b4steelblue 5f9ea0cadetblue 4b0082indigo 483d8bdarkslateblue 6a5acdslateblue 7b68eemediumslateblue 9370dbmediumpurple f8f8ffghostwhite 00008bdarkblue 0000cdmediumblue 4169e1royalblue 1e90ffdodgerblue 6495edcornflowerblue 87cefalightskyblue add8e6lightblue f0f8ffaliceblue 191970midnightblue 00bfffdeepskyblue 87ceebskyblue b0e0e6powderblue 2f4f4fdarkslategray 00ced1darkturquoise afeeeepaleturquoise f0ffffazure 008b8bdarkcyan 20b2aalightseagreen 48d1ccmediumturquoise 40e0d0turquoise 7fffd4aquamarine e0fffflightcyan 00fa9amediumspringgreen 7cfc00lawngreen 00ff7fspringgreen 7fff00chartreuse adff2fgreenyellow 2e8b57seagreen 3cb371mediumseagreen 66cdaamediumaquamarine 98fb98palegreen f5fffamintcream 006400darkgreen 228b22forestgreen 32cd32limegreen 90ee90lightgreen f0fff0honeydew 556b2fdarkolivegreen 6b8e23olivedrab 9acd32yellowgreen 8fbc8fdarkseagreen 9400d3darkviolet 8a2be2blueviolet dda0ddplum d8bfd8thistle 8b008bdarkmagenta 9932ccdarkorchid ba55d3mediumorchid da70d6orchid ee82eeviolet e6e6falavender c71585mediumvioletred bc8f8frosybrown ff69b4hotpink ffc0cbpink ffe4e1mistyrose ff1493deeppink db7093palevioletred e9967adarksalmon ffb6c1lightpink fff0f5lavenderblush cd5c5cindianred f08080lightcoral f4a460sandybrown fff5eeseashell dc143ccrimson ff6347tomato ff7f50coral fa8072salmon ffa07alightsalmon ffdab9peachpuff ffffe0lightyellow b22222firebrick ff4500orangered ff8c00darkorange ffa500orange ffd700gold fafad2lightgoldenrodyellow 8b0000darkred a52a2abrown a0522dsienna b8860bdarkgoldenrod daa520goldenrod deb887burlywood f0e68ckhaki fffacdlemonchiffon d2691echocolate cd853fperu bdb76bdarkkhaki bdb76btan eee8aapalegoldenrod f5f5dcbeige ffdeadnavajowhite ffe4b5moccasin ffe4c4bisque ffebcdblanchedalmond ffefd5papayawhip fff8dccornsilk f5deb3wheat faebd7antiquewhite faf0e6linen fdf5e6oldlace fffaf0floralwhite fffff0ivory",
FX_REG_VALUE_END   = /^\s*([+-]=)?\s*([\d+-.]+)\s*(.*)\s*$/,
FX_REG_VALUE_START = /^\s*([\d+-.]+)\s*(.*)\s*$/,
FX_REG_COLOR       = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})|^#([\da-f])([\da-f])([\da-f])|^rgba?\(([\d\.]+)(%)?,\s*([\d\.]+)(%)?,\s*([\d\.]+)(%)?/i,
FX_COLORS          = {},
$_fx_timer_id,
$_fx_timers        = {},
$_fx_count         = 0,
$_fx,

// $.fn
$_INIT_REG_HTML      = /^\s*(<[\s\S]+>)\s*$/,
$_HASH_BODY_OR_HTML  = toHashNumberFromString("BODY HTML"),
$_fn,
FN_REG_ESCAPE_REGEXP = /([\!-\/\:-\@\[-\`\{-\~])/g,
$_OFFSET_HASH_TABLE  = toHashNumberFromString("TABLE TD TH"),
$_offset_doesNotAddBorder,
$_offset_doesAddBorderForTableAndCells,
$_offset_supportsFixedPosition,
$_offset_subtractsBorderForOverflowNotVisible,
$_offset_doesNotIncludeMarginInBodyOffset,

// cache
$document;

// バージョン情報
$.version = 1.0;

// $.reset()
//   @breif noConflictは長い
//   @return $クラス
$.reset = function () {
	_window.$ = _$;
	return $;
};

// 関数
function FUNC_CAMEL($0, $1) {
	return $1.toUpperCase();
}

function SELECTOR_FUNC_ARG_ENCODE($0, $1) {
	return String.fromCharCode(parseInt($1, 16));
}

function CLEAN_FUNC_CLOSE_TAG($0, $1, $2) {
	return CLEAN_REG_GUARD_TAG.test($2) ? $0 : $1 + "></" + $2 + ">";
}

function EVENT_FUNC_SPECIAL_WITHIN(evt) { //< IEでもevtに値が入ることが保証される
	var self = this, parent = evt.relatedTarget;

	// TODO: try - catchをやめる
	while (parent && parent != self) {
		try { parent = parent.parentNode; }
		catch (e) { parent = self; }
	}

	if (parent != self && !$_event_triggered) {
		evt.type = evt.data;
		return $_event.handle.apply(self, arguments);
	}
}

function EVENT_FUNC_SPECIAL_MOUSEWHEEL(evt) {
	if (!$_event_triggered) {
		var args = arguments;
		// IEはargs.lengthが0なので、args[0]に再代入しないとIEで動作しない
		args.length = args.length || 1;
		args[0] = evt = new $_Event(evt || _window.event);
		evt.type = "mousewheel";
		evt.currentTarget = _document;
		return $_event.handle.apply(_document, args);
	}
}

function $_CLASS_FUNC_MAKE_REG(val) {
	return new RegExp("\\b" + val.replace(FN_REG_ESCAPE_REGEXP, "\\$1") + "\\b\\s*");
}

function $_FN_TEXT_FUNC_GET(elem) {
	var rv = "";
	for (var node = elem.firstChild, nodeType; node; node = node.nextSibling) {
		nodeType = node.nodeType;
		if (nodeType !== 8 && node.tagName !== "!") {
			rv += nodeType !== 1 ? node.nodeValue : $_FN_TEXT_FUNC_GET(node);
		}
	}
	return rv;
}


/*--------------------------------------
 * $.browser
 *------------------------------------*/
/*
// IE 5+
if (IS_MSIE) {
	$_browser.msie = true;
	$_version = IS_QUERY                 ? 8   :
	            _XMLHttpRequest          ? 7   :
	            _document.compatMode     ? 6   :
	            (0).toFixed              ? 5.5 :
	            _document.getElementById ? 5   :
	                                        -1 ;
}
// Opera 8+
else if (_opera) {
	$_browser.opera = true;
	$_version = parseFloat(_opera.version()); //< opera.versionは8から実装。
}
// Chrome 3+（バージョンチェック省略）
else if (_window.execScript) {
	$_browser.chrome = true;
}
// Safari 2.0.3+
else if (!navigator.taintEnabled) {
	$_browser.safari = true;
	$_version = _window.postMessage                           ? 4   : //< 528
	            IS_QUERY                                      ? 3.1 : //< 525
	            _document.evaluate                            ? 3   : //< 420
	            _document.createElement("input").selectionEnd ? 2   : //< 417.9
	                                                             -1 ;
}
// Fx 1+
else if (_window.Components) {
	$_browser.mozilla = true;
	$_version = _window.localStorage  ? 3.5 :
	            _window.postMessage   ? 3   :
	            _window.globalStorage ? 2   :
	            Array.prototype.map   ? 1.5 :
	            _XMLHttpRequest       ? 1   :
	                                     -1 ;
}
// unk!
else {
	$_browser.unknown = true;
}

$_browser.version = $_version;
//*/


/*--------------------------------------
 * $.support
 *------------------------------------*/

(function ($_support) {

	var root      = HEAD || _document_documentElement,
	    div       = _document.createElement("div"),
	    script    = _document.createElement("script"),
	    id        = "$script" + (+new Date),
	    sliceNode = /\[native code\]/.test(_Function_prototype.call);

	div.style.display = "none";
	div.innerHTML = ' <link/><table></table><a href="/a" style="color:red;float:left"><b>a</b><!--a--></a><label for="a"></label><textarea>a</textarea>';

	var links    = div.getElementsByTagName("a"),
	    link     = links[0],
	    textarea = div.getElementsByTagName("textarea")[0],
	    label    = div.getElementsByTagName("label")[0];

	// ノード先頭にスペースが挿入される(true)
	//   IEは挿入されない
	$_support.leadingWhitespace = div.firstChild.nodeType === 3;
	// tableにtbodyは補完されない(false)
	//   IEは補完する
	$_support.tbody = !div.getElementsByTagName("tbody").length;
	// 全称タグでもcommentノードは取得しない(false)
	//   IEは取得する
	$_support.commnet = link.getElementsByTagName("*").length !== 1; //< IE5では0となるのでこれでよい
	// 不正なノードでも削除されない(true)
	//   IEはノードを削除する
	$_support.htmlSerialize = !!div.getElementsByTagName("link").length;
	// style属性の値を取得する(true)
	//   IEは取得できない
	$_support.style = /red/.test(link.getAttribute("style"));
	// href属性に書かれた値が取得できる(true)
	//   IEは取得できない
	$_support.hrefNormalized = link.getAttribute("href") === "/a";
	// getAttributeが正常に動作する(true)
	//   IEは添え字のシンタックスシュガーになっている
	$_support.attrNormalized = label.getAttribute("for") === label.htmlFor;
	// cssFloatでfloatを参照できる(true)
	//   IEは参照できない
	$_support.cssFloat = !!link.style.cssFloat;
	// textareaでvalueを参照できる(true)
	//   Safariはバグっているらしいが……
	$_support.valueTextarea = textarea.value === "a";

	// 遅延して評価される
	$_support.scriptEval = false;
	$_support.noCloneEvent = true;
	$_support.boxModel = null;

	// document.createTextNodeでscriptが実行される(true)
	//   IEは実行されない
	script.type = "text/javascript";
	try {
		script.appendChild(_document.createTextNode("window." + id + "=1;"));
	} catch (e) {}
	root.insertBefore(script, root.firstChild);
	if (_window[id]) {
		$_support.scriptEval = true;
		delete _window[id];
	}
	root.removeChild(script);

	// cloneでイベントはクローンされない(true)
	//   IEはされる
	if (div.attachEvent && div.fireEvent) {
		div.attachEvent("onclick", function attach_click() {
			$_support.noCloneEvent = false;
			div.detachEvent("onclick", attach_click);
		});
		div.cloneNode(true).fireEvent("onclick");
	}

	// ノード配列変換をArray#sliceで(true)
	//   IEはサポートせず
	if (sliceNode) {
		try {
			sliceNode = toArrayFromNodes.call(links).length === links.length;
		}
		catch (e) {
			sliceNode = false;
		}
	}
	$_support.sliceNode = sliceNode;

	// andの正規表現をサポートしない
	//$_support.andRegExp = true;
	//try {
	//	new RegExp("(?=.*a)(?=.*b)");
	//}
	//catch (e) {
	//	$_support.andRegExp = false;
	//}

	// IEのメモリーリーク対策
	root = div = script = links = link = textarea = null;
})($_support);

if (!$_support.cssFloat) {
	CSS_FLOAT = "styleFloat";
}

if (!$_support.sliceNode) {
	toArrayFromNodes = {
		call: function (elems) {
			var i = elems.length, rv = new Array(i);
			while (i) {
				rv[--i] = elems[i];
			}
			return rv;
		}
	};
}

// document.createElementにタグ文字列を代入できる
//   IEではそちらのほうが良かった気が
//   IE5でiframeが生成できない問題があった
//try {
//	if (_document.createElement("<b>").tagName === "B") {
//		CLEAN_REG_TAG = /^(<(\w+)[^>]*>)(<\/\2>)?$/;
//	}
//} catch (e) {}


/*--------------------------------------
 * $.data
 *------------------------------------*/

// $.data(obj, key = void 0, val = void 0)
//   @brief (obj)           - データのキーとなるuniqueIDを返す
//          (obj, key)      - 結び付けられている値を返す
//          (obj, key, val) - valを結びつけ、valを返す
//   @param obj anything
//   @param key string
//   @param val anything
//   @return rv
$_data = $.data = mix(function (obj, key, val) {
	if (!obj) {
		return;
	}

	var uniqueID = obj.nodeType === 1 && obj.tagName !== "!"
	             ? "uniqueID"
	             : "$uid", //< IEのdocument.uniqueIDが参照するたびにインクリメントするため
	    uid = obj == _window
	        ? -1
	        : obj[uniqueID] || (obj[uniqueID] = ++$_uid); //< window.$uidを定義したくないため。フレームの中は諦めた

	if (key == null) {
		return uid; //< obj2.$uid = $_data(obj1)で同じuidの結びつけができる
	}

	var data = $_cache[uid] || ($_cache[uid] = {});
	return val === void 0 ? data[key]          //< getter
	                      : (data[key] = val); //< setter
}, {
	// $.data.remove(obj, key = void 0)
	//   @brief (obj)      - 結びついている全てのデータを削除する
	//          (obj, key) - 結びついているキーのデータを削除する
	//   @param obj anything
	//   @param key string
	remove: function (obj, key) {
		if (!obj) {
			return;
		}

		var uniqueID = obj.nodeType === 1 && obj.tagName !== "!"
		             ? "uniqueID"
		             : "$uid",
		    uid = obj === _window
		        ? -1
		        : obj[uniqueID],
		    data = $_cache[uid];
		// 指定されたキーを削除する
		if (key && data) {
			delete data[key];
			// keyが存在しない場合、key==nullが維持される。
			key = null;
			for (key in data) break;
		}
		// キーが指定されない場合か、全てのkeyが存在しない場合は、$_cacheのデータとuniqueIDを削除する
		if (key == null) {
			// 念のため
			if (data) {
				for (key in data) {
					delete data[key];
				}
			}
			if (uid > 0) { //< window以外はオブジェクトに結びつけられたキーを削除する
				try {
					obj[uniqueID] = void 0;
					delete obj[uniqueID];
				} catch (e) {
					obj.removeAttribute && obj.removeAttribute(uniqueID);
				}
			}
			delete $_cache[uid];
		}
	},
	// $.data.queue(obj, type)
	//   @brief (obj, type)       - キュー全体を返す
	//          (obj, type, data) - キューにdataの関数を追加する、もしくはdataの関数配列と置き換える
	//   @param obj anything
	//   @param key string
	queue: ($_data_queue = function (obj, type, data) {
		if (!obj) {
			return;
		}

		type = (type || "") + "queue"; //< ~queueという名前のdataを作る

		var q = $_data(obj, type);
		if (!data) {
			return q || [];
		}

		if (!q || $_isArray(data)) {
			q = $_data(obj, type, toArray(data)); //< 配列が存在しない、もしくは配列ならデータをぶち込む
		}
		else {
			q[q.length] = data; //< #push
		}

		return q;
	}),
	// $.data.dequeue(obj, type)
	//   @breif キューの先頭の処理を取り出し実行する
	//   @param obj anything
	//   @param type string
	dequeue: function (obj, type) {
		if (!obj) {
			return;
		}

		var q = $_data_queue(obj, type),
		    fn = q[0], removed = false;
		if (fn) {
			function next() {
				!removed && q.shift();
				removed = true;
				$_data.dequeue(obj, type);
			}
			next.lock = false; //< あまり美しくはない
			fn.call(obj, next);
			if (!next.lock) {
				!removed && q.shift();
				removed = true;
			}
		}
	}
});


/*--------------------------------------
 * $.query
 *------------------------------------*/

// $.query(selector, nodes = document, flag_xml = null, rv = [], self = void 0)
//   @breif セレクタ関数
//   @param selector string - セレクター文字列
//   @param nodes DOMElement, DOMElement[] - 探索元ノード
//   @param flag_xml boolean, null - XML文書かどうか。nullなら、関数内で調べる
//   @param rv anything - 返値を入れるオブジェクト
//   @param self anything - self.$isXMLDocにflag_xmlの結果を格納する
//   @return rv
$_query = $.query = mix(function (selector, nodes, flag_xml, rv, self) {
	rv = rv || [];

	// 文字列以外は空で返す
	if (typeof selector !== "string") {
		return rv;
	}

	var _doc        = _document,
	    _push       = _Array_prototype_push,
	    _slice      = _Array_prototype_slice,
	    _getTags    = getTags,
	    result      = [], //< 結果要素
	    flag_merge,       //< 要素をマージする必要がある
	    parents,          //< 探索範囲となる要素
	    elems,            //< 一時保存用
	    merge,
	    tmp,
	    len;

	// 親要素を補完する
	// nodesが無いなら_docの省略と見なす
	if (!nodes) {
		parents = [_doc];
	}
	// DOMElement
	else if (typeof nodes.getElementsByTagName !== "undefined") {
		parents = [nodes];
	}
	// DOMCollection
	else if (!nodes.nodeType && nodes.length) {
		parents = [];
		for (var i = 0, q = -1, node; node = nodes[i]; ++i) {
			if (typeof node.getElementsByTagName !== "undefined") {
				parents[++q] = node;
			}
		}
	}
	// それ以外は空
	else {
		return rv;
	}

	// querySelectorAllに対応している場合は最速で返す
	if (IS_QUERY) {
		nodes = [];
		if ((len = parents.length) === 1) {
			try {
				_push.apply(rv, _slice.call(parents[0].querySelectorAll(selector)));
				return rv;
			} catch (e) {}
		}
		else {
			flag_merge = true;
			for (var i = 0, q = -1; i < len; ++i) {
				try {
					_push.apply(result, _slice.call(parents[i].querySelectorAll(selector)));
				}
				catch (e) {
					nodes[++q] = parents[i];
				}
			}
		}
		parents = nodes;
	}
	else {
		nodes = parents;
	}

	// nodesには親要素のコピー元、parentは移動しながら探索する親要素が入る
	// DOM操作による探索準備
	if (len = parents.length) {
		var _filter        = $_query.filter,
		    reg_ltrim      = REG_LTRIM,
		    hash_selector  = SELECTOR_HASH_SELECTOR,
		    reg_combinator = SELECTOR_REG_COMBINATOR,
		    reg_element    = SELECTOR_REG_ELEMENT,
		    reg_comma      = SELECTOR_REG_COMMA,
		    context        = parents[0],
		    last, // セレクタのパースで使う
		    match;

		context = context.ownerDocument || context.document || context; //< getDocumentは使わない

		//* Quick Phase
		if (len === 1 && (match = SELECTOR_REG_QUICK.exec(selector))) {
			// ID
			if ((tmp = match[3]) && context === _doc) {
				tmp = tmp.replace(SELECTOR_REG_ESCAPE, "");
				var node = context.getElementById(tmp);
				if (!node) {
					return rv;
				}
				if (node.id === tmp) {
					tmp = match[1]; //< タグ
					if (!tmp || tmp === "*" || tmp.toUpperCase() === node.tagName) {
						rv[0] = node;
						++rv.length;
						return rv;
					}
				}
			}
			// タグ
			else if ((tmp = match[1]) && tmp !== "*") {
				_push.apply(rv, toArrayFromNodes.call(parents[0].getElementsByTagName(tmp)));
				return rv;
			}
		}
		//*/

		selector = selector.replace(REG_RTRIM, "");
		// XMLかどうかの判定
		if (flag_xml === null) {
			flag_xml = context !== _doc && $_isXMLDoc(context);
			self && (self.$isXMLDoc = flag_xml);
		}

		//* Generic Phase
		while (selector && last !== selector) {
			// 初期化処理
			last = selector = selector.replace(reg_ltrim, "");
			elems = null;
			merge = {};

			// combinatorの処理
			if (match = reg_combinator.exec(selector)) {
				selector = selector.slice(match[0].length);
				elems = [];
				var tagName = (flag_xml ? match[2] : match[2].toUpperCase()) || "*",
				    i = 0, iz = parents.length, q = -1, flag_all = tagName === "*";
				switch (hash_selector[match[1]]) {
					// E > F
					case 1:
						for (; i < iz; ++i) {
							for (var node = parents[i].firstChild; node; node = node.nextSibling) {
								if (node.nodeType === 1 && (flag_all ? node.tagName !== "!" : node.tagName === tagName)) {
									elems[++q] = node;
								}
							}
						}
						break;
					// E + F
					case 2:
						for (; i < iz; ++i) {
							for (var node = parents[i].nextSibling; node; node = node.nextSibling) {
								if (node.nodeType === 1) {
									if (flag_all ? node.tagName !== "!" : node.tagName === tagName) {
										elems[++q] = node;
									}
									break;
								}
							}
						}
						break;
					// E ~ F
					case 3:
						for (; i < iz; ++i) {
							for (var node = parents[i].nextSibling; node; node = node.nextSibling) {
								if (node.nodeType === 1 && (flag_all ? node.tagName !== "!" : node.tagName === tagName)) {
									var uid = node.uniqueID || (node.uniqueID = ++$_uid);
									if (merge[uid]) {
										break;
									}
									else {
										merge[uid] = true;
										elems[++q] = node;
									}
								}
							}
						}
						break;
				}
			}
			// 子孫があるときのタグ名の処理
			else if (match = reg_element.exec(selector)) {
				tmp = match[0];
				selector = selector.slice(tmp.length);
				// 全称タグの場合は処理を後回しにする
				if (tmp !== "*") {
					elems = _getTags(tmp, parents);
				}
			}

			// 要素をフィルターする
			if (selector) {
				tmp = _filter(selector, elems, parents, context, flag_xml, true);
				selector = tmp[0];
				elems = tmp[1];
			}
			// フィルターなしの全称タグはここで絞り込む
			if (!elems) {
				elems = _getTags("*", parents);
			}

			// カンマ
			if (selector && (match = reg_comma.exec(selector))) {
				selector = selector.slice(match[0].length);
				flag_merge = true;
				elems.length && _push.apply(result, elems);
				parents = nodes;
			}
			// 次の階層に行く
			else {
				parents = elems;
			}
		}

		if (selector)
			throw "Invalid Selector";
		//*/
	}

	// 要素をマージする
	if (flag_merge) {
		elems && elems.length && _push.apply(result, elems);
		merge = {};
		for (var i = 0, c = 0, node; node = result[i]; ++i) {
			var uid = node.uniqueID || (node.uniqueID = ++$_uid);
			if (!merge[uid] && (node.nodeType === 1 && node.tagName !== "!")) {
				merge[uid] = true;
				rv[c++] = node;
			}
		}
		rv.length = c;
	}
	// 要素を格納する
	else if (elems && elems.length) {
		_push.apply(rv, elems);
	}

	return rv;
}, {
	// $.query.filter(selector, elems, parents, context, flag_xml, flag_skip)
	//   @breif セレクタ属性絞込み関数
	//   @param selector string - セレクター文字列
	//   @param elems DOMElement[] - 探索元ノード。予約中のときはnull
	//   @param parents DOMElement[] - elemsが予約中のときに探す
	//   @param context DOMDocument
	//   @param flag_xml boolean
	//   @param flag_skip boolean - タグ名のフィルタリングをスキップするかどうか
	//   @return [ selector, DOMElement[] ]
	filter: function (selector, elems, parents, context, flag_xml, flag_skip) {
		// if (!elems && !parents) //< 念のため
		//	return [selector, []];

		var _doc            = _document,
		    //_attr_props     = ATTR_PROPS,
		    flag_attr       = $_support.attrNormalized,
		    filters         = $_query.filters,
		    reg_escape      = SELECTOR_REG_ESCAPE,
		    hash_selector   = SELECTOR_HASH_SELECTOR,
		    hash_operator   = SELECTOR_HASH_OPERATOR,
		    hash_attr_guard = SELECTOR_HASH_ATTR_GUARD,
		    reg_arg_encode  = SELECTOR_REG_ARG_ENCODE,
		    func_arg_encode = SELECTOR_FUNC_ARG_ENCODE,
		    reg_sequence    = SELECTOR_REG_SEQUENCE,
		    reg_args        = SELECTOR_REG_ARGS,
		    reg_attribute   = SELECTOR_REG_ATTRIBUTE,
		    match;

		// タグの絞り込み
		//   flag_skip=trueは既に絞り込む必要が無い
		if (flag_skip && (match = SELECTOR_REG_ELEMENT.exec(selector))) {
			var tagName = match[0];
			selector = selector.slice(tagName.length);
			// 全称セレクタ以外なら、絞り込む
			if (tagName !== "*") {
				// IE5を考慮するとspliceは利用できない
				var tmp_arr = [];
				for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
					if (tagName === elem.tagName) {
						tmp_arr[++q] = elem;
					}
				}
				elems = tmp_arr;
			}
		}

		// フィルターする
		while (match = reg_sequence.exec(selector)) {
			selector = selector.slice(match[0].length);
			var key = match[2] && match[2].replace(reg_escape, ""),
			    filter, //< filterは絞り込みを行う関数か[属性名, 演算子, 値]
			    filter_arg,
			    flag_not = false;

			// 要素がまだ予約中の場合
			if (!elems) {
				// contextノードのみの時は別な処理をする
				if (parents.length === 1 && parents[0] === context)
					switch (hash_selector[match[1]]) {
						// #ID
						case 4: 
							if (context.getElementById) {
								var tmp = context.getElementById(key);
								if (!tmp) {
									elems = [];
									continue;
								}
								if (tmp.id == key) { //< 大文字小文字を間違っている場合の対策
									elems = [tmp];
									continue;
								}
							}
							break;
						// :pseudo-class
						case 6:
							switch (hash_selector[key]) {
								// :scope
								case 7:
									elems = [context];
									continue;
								// :root
								case 8:
									elems = [context.documentElement];
									continue;
								// :link
								case 9:
									var links = context.links;
									elems = links ? toArrayFromNodes.call(links) : [];
									continue;
							}
							break;
					}
				// タグの絞り込みができていないので絞り込みを行う
				elems = getTags("*", parents);
			}

			// 絞り込み設定
			switch (hash_selector[match[1]]) {
				// #ID
				case 4:
					filter = ["id", "=", key];
					break;
				// .class
				case 5:
					filter = ["class", "~=", key];
					break;
				// :pseudo-class
				case 6:
					var func = filters[key];
					// 引数文字列の設定
					if (match = reg_args.exec(selector)) {
						selector = selector.slice(match[0].length);
						filter_arg = match[3] || match[2];
						filter_arg = filter_arg ? filter_arg.replace(reg_arg_encode, func_arg_encode) : match[1];
					}

					if (func) {
						filter = func;
					}
					// :not
					else if (key === "not") {
						flag_not = true;
						// :not(*)というありえない構文
						if (filter_arg === "*") {
							elems = [];
						}
						else {
							if (match = reg_sequence.exec(filter_arg)) {
								key = match[2] && match[2].replace(reg_escape, "");
								switch (hash_selector[match[1]]) {
									// #ID
									case 4:
										filter = ["id", "=", key];
										break;
									// .class
									case 5:
										filter = ["class", "~=", key];
										break;
									// :pseudo-class
									case 6:
										func = filters[key];
										// 引数文字列の設定
										if (match = reg_args.exec(filter_arg.slice(match[0].length))) {
											filter_arg = match[3] || match[2];
											filter_arg = filter_arg ? filter_arg.replace(reg_arg_encode, func_arg_encode) : match[1];
										}
										if (func) {
											filter = func;
										}
										else {
											throw "Invalid Pseudo-classes";
										}
										break;
									// [attribute]
									default:
										filter = [flag_xml ? match[3] : match[3].toLowerCase()];
										if (match = reg_attribute.exec(filter_arg.slice(match[0].length))) {
											if (match[2]) {
												filter[1] = match[2];
												filter[2] = match[5] || match[4];
												filter[2] = filter[2] ? filter[2].replace(reg_arg_encode, func_arg_encode) : match[3];
											}
										}
										break;
								}
							}
							// タグ名
							else {
								var tmp = [], tagName = flag_xml ? filter_arg : filter_arg.toUpperCase();
								for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
									if (tagName !== elem.tagName) {
										tmp[++q] = elem;
									}
								}
								elems = tmp;
							}
						}
					}
					else {
						throw "Invalid Pseudo-classes";
					}
					break;
				// [attribute]
				default:
					filter = [flag_xml ? match[3] : match[3].toLowerCase()];
					if (match = reg_attribute.exec(selector)) {
						selector = selector.slice(match[0].length);
						if (match[2]) {
							filter[1] = match[2];
							filter[2] = match[5] || match[4];
							filter[2] = filter[2] ? filter[2].replace(reg_arg_encode, func_arg_encode) : match[3];
						}
					}
					break;
			}

			// 絞り込む
			// ruleがtureでnotがfalseのとき挿入
			// ruleがfalseでnotがtrueのとき挿入
			if (elems.length && filter) {
				var tmp = [];

				// filterが関数の場合
				if (typeof filter === "function") {
					for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
						if ((!!filter(elem, i, filter_arg, elems)) ^ flag_not) {
							tmp[++q] = elem;
						}
					}
				}
				// filter.mが関数の場合
				else if (typeof filter.m === "function") {
					tmp = filter.m({ not: flag_not, xml: flag_xml }, elems, filter_arg);
				}
				// 属性セレクター
				else {
					var key = filter[0], op = hash_operator[filter[1]], val = filter[2];
					// [class~="val"]
					//   クラス名の場合の高速化処理
					if (!flag_xml && key === "class" && op === 3) {
						val = " " + val + " ";
						for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
							var className = elem.className;
							if (!!(className && (" " + className + " ").indexOf(val) > -1) ^ flag_not) {
								tmp[++q] = elem;
							}
						}
					}
					// 通常
					else {
						var flag_lower = !!val && !flag_xml && !hash_attr_guard[key]; //< 小文字に変換しなければならない

						if (flag_lower) {
							val = val.toLowerCase();
						}
						// key~=val
						if (op === 3) {
							if (val.indexOf(" ") > -1) {
								return [selector, []];
							}
							val = " " + val + " ";
						}
						for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
							// flag_call = flag_xml || flag_attr || !!ATTR_SPECIAL_GUARD[key], //< getAttributeを使わないといけない。$_support.styleがfalseのブラウザはgetAttributeは添え字演算子のシンタックスシュガーに過ぎないため。
							// flag_call ? elem.getAttribute(key, 2) : elem[_attr_props[key] || key]
							var attr = $_attr(elem, key, void 0, flag_xml),
							    flag = attr != null && attr !== false && (flag_attr || attr !== "");
							if (flag && op) {
								if (flag_lower) {
									attr = attr.toLowerCase();
								}
								switch (op) {
									case 1: flag = attr === val; break;
									case 2: flag = attr !== val; break;
									case 3: flag = (" " + attr + " ").indexOf(val) !== -1; break;
									case 4: flag = attr.indexOf(val) === 0; break;
									case 5: flag = attr.lastIndexOf(val) + val.length === attr.length; break;
									case 6: flag = attr.indexOf(val) !== -1; break;
									case 7: flag = attr === val || attr.substring(0, val.length + 1) === val + "-"; break;
								}
							}
							if (!!flag ^ flag_not) {
								tmp[++q] = elem;
							}
						}
					}
				}
				elems = tmp;
			}
		}
		return [selector, elems];
	},

	// 疑似クラスの詰め合わせ
	//   pseudo: function (elem, i, filter_arg, elems)
	//   pseudo: { m: function ({ not: flag_not, xml: flag_xml }, elems, filter_arg) }
	filters: {
		root: function (elem) {
			return elem === (elem.ownerDocument || elem.document).documentElement;
		},
		target: {
			m: function (flags, elems) {
				var rv = [], hash = location.hash.slice(1), flag_not = flags.not;
				for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
					if (((elem.id || elem.name) === hash) ^ flag_not) {
						rv[++q] = elem;
					}
				}
				return rv;
			}
		},
		"first-child":      $_query_filters_make_child(-1, true),
		"last-child":       $_query_filters_make_child( 1, true),
		"only-child":       $_query_filters_make_child( 0, true),
		"first-of-type":    $_query_filters_make_child(-1),
		"last-of-type":     $_query_filters_make_child( 1),
		"only-of-type":     $_query_filters_make_child( 0),
		"nth-child":        $_query_filters_make_nth("firstChild", "nextSibling",     true),
		"nth-last-child":   $_query_filters_make_nth("lastChild",  "previousSibling", true),
		"nth-of-type":      $_query_filters_make_nth("firstChild", "nextSibling"),
		"nth-last-of-type": $_query_filters_make_nth("lastChild",  "previousSibling"),
		empty: {
			m: function (flags, elems) {
				var rv = [], flag_not = flags.not, _textContent = ATTR_TEXTCONTENT;
				for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
					var tmp = true;
					if (!elem[_textContent]) {
						for (var node = elem.firstChild; node; node = node.nextSibling) {
							if (node.nodeType === 1 && node.tagName !== "!") {
								tmp = false;
								break;
							}
						}
					}
					else {
						tmp = false;
					}
					if (tmp ^ flag_not) {
						rv[++q] = elem;
					}
				}
				return rv;
			}
		},
		link: {
			m: function (flags, elems) {
				var links = (elems[0].ownerDocument || elems[0].document).links;
				if (!links) {
					return [];
				}
				var rv = [],
				    checked = {},
				    flag_not = flags.not;
				for (var i = 0, elem; elem = links[i]; ++i) {
					checked[elem.uniqueID || (elem.uniqueID = ++$_uid)] = true;
				}
				for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
					if (checked[elem.uniqueID] ^ flag_not) {
						rv[++q] = elem;
					}
				}
				return rv;
			}
		},
		lang: {
			m: function (flags, elems, arg) {
				var rv = [], reg = new RegExp("^" + arg, "i"), flag_not = flags.not;
				for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
					var tmp = elem;
					while (tmp && !tmp.getAttribute("lang")) {
						tmp = tmp.parentNode;
					}
					tmp = !!(tmp && reg.test(tmp.getAttribute("lang")));
					if (tmp ^ flag_not) {
						rv[++q] = elem;
					}
				}
				return rv;
			}
		},
		enabled:  $_query_filters_make_prop("disabled", false),
		disabled: $_query_filters_make_prop("disabled", true),
		checked:  $_query_filters_make_prop("checked", true),
		contains: {
			m: function (flags, elems, arg) {
				var rv = [],
				    flag_not = flags.not,
				    _textContent = ATTR_TEXTCONTENT;
				for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
					if (((elem[_textContent] || "").indexOf(arg) > -1) ^ flag_not) {
						rv[++q] = elem;
					}
				}
				return rv;
			}
		}
	}
	// $.query.match(elem, selector)
	//   @breif DOMElementがセレクターで示される要素であるかどうか
	//   @param elem DOMElement
	//   @param selector string
	//   @return boolean
	//match: function (elem, selector) {
	//	if (elem.matchesSelector) {
	//		try {
	//			return elem.matchesSelector(selector);
	//		} catch (e) {}
	//	}
	//	return $_query(selector).indexOf(elem);
	//}
});


// :*-child, :*-of-type生成
function $_query_filters_make_child(num_type, flag) {
	return {
		m: function (flags, elems) {
			var rv = [],
			    type = num_type,
			    flag_all = flag,
			    flag_not = flags.not;
			for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
				var tagName = flag_all || elem.tagName, tmp = null;
				if (tmp === null && type <= 0) {
					for (var node = elem.previousSibling; node; node = node.previousSibling) {
						if (node.nodeType === 1 && (flag_all ? node.tagName !== "!" : node.tagName === tagName)) {
							tmp = false;
							break;
						}
					}
				}
				if (tmp === null && type >= 0) {
					for (var node = elem.nextSibling; node; node = node.nextSibling) {
						if (node.nodeType === 1 && (flag_all ? node.tagName !== "!" : node.tagName === tagName)) {
							tmp = false;
							break;
						}
					}
				}
				if (tmp === null) {
					tmp = true;
				}
				if (tmp ^ flag_not) {
					rv[++q] = elem;
				}
			}
			return rv;
		}
	};
}

// :nth-*-child生成
function $_query_filters_make_nth(str_pointer, str_sibling, flag) {
	return {
		m: function (flags, elems, arg) {
			var rv = [],
			    checked = {},
			    pointer = str_pointer,
			    sibling = str_sibling,
			    flag_all = flag,
			    flag_not = flags.not,
			    match = SELECTOR_REG_NTH.exec(arg === "even" ? "2n" : arg === "odd" ? "2n+1" : !/\D/.test(arg) ? "0n+" + arg : arg),
			    a = (match[1] + (match[2] || 1)) - 0,
			    b = match[3] - 0;
			for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
				var uid = elem.uniqueID || (elem.uniqueID = ++$_uid),
				    tmp = checked[uid];
				if (tmp === void 0) {
					for (var c = 0, node = elem.parentNode[pointer], tagName = flag_all || elem.tagName; node; node = node[sibling]) {
						if (node.nodeType === 1 && (flag_all ? node.tagName !== "!" : node.tagName === tagName)) {
							++c;
							checked[node.uniqueID || (node.uniqueID = ++$_uid)] = a ? (c - b) % a === 0 && (c - b) / a >= 0 : c === b;
						}
					}
					tmp = checked[uid];
				}
				if (tmp ^ flag_not) {
					rv[++q] = elem;
				}
			}
			return rv;
		}
	};
}

// プロパティ比較生成
function $_query_filters_make_prop(str_prop, flag) {
	return {
		m: function (flags, elems) {
			var rv = [],
			    prop = str_prop,
			    flag_not = flag ? flags.not : !flags.not;
			for (var i = 0, q = -1, elem; elem = elems[i]; ++i) {
				if (elem[prop] ^ flag_not) {
					rv[++q] = elem;
				}
			}
			return rv;
		}
	};
}


/*--------------------------------------
 * $.clean
 *------------------------------------*/

// $.clean(elems, context = document, rv = [])
//   @breif elemsを全てノードの配列にする
//   @param elems anything[]
//   @param context DOMDocument
//   @param rv anything - 返値を入れるオブジェクト
//   @return rv
$_clean = $.clean = function (elems, context, rv) {
	context = context || _document;
	rv = rv || [];

	var match, c = 0, div;
	for (var i = 0, iz = elems.length; i < iz; ++i) {
		var elem = elems[i];
		if (typeof elem === "number") {
			elem += "";
		}
		if (!elem) {
			continue;
		}

		if (typeof elem === "string") {
			// <>&を含まない単純なテキストのとき
			if (!CLEAN_REG_NOT_TEXT.test(elem)) {
				rv[c++] = context.createTextNode(elem);
			}
			// createElementで作れるとき
			else if (match = CLEAN_REG_TAG.exec(elem)) {
				rv[c++] = context.createElement(match[1]);
			}
			// パースが必要なとき
			else {
				if (!div || div.tagName !== "DIV") {
					div = context.createElement("div");
				}
				// XHTMLスタイルの変換
				elem = elem.replace(CLEAN_REG_CLOSE_TAG, CLEAN_FUNC_CLOSE_TAG);
				// 一番外側のタグの判定
				var
					tagName = (match = CLEAN_REG_OPEN_TAG.exec(elem)) ? match[1].toUpperCase() : 0,
					wrap = tagName && (
						(tagName === "OPTION" || tagName === "OPTGROUP") &&
							[ 1, '<select multiple="multiple">', "</select>" ] ||
						tagName === "LEGEND" &&
							[ 1, "<fieldset>", "</fieldset>" ] ||
						CLEAN_HASH_TABLE_TAG[tagName] &&
							[ 1, "<table>", "</table>" ] ||
						tagName === "TR" &&
							[ 2, "<table><tbody>", "</tbody></table>" ] ||
						(tagName === "TD" || tagName === "TH") &&
							[ 3, "<table><tbody><tr>", "</tr></tbody></table>" ] ||
						tagName === "COL" &&
							[ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ]
					) || (!$_support.htmlSerialize ? [ 1, "a<div>", "</div>" ] : [ 0, "", "" ]);
				div.innerHTML = wrap[1] + elem + wrap[2];
				while (wrap[0]--) {
					div = div.lastChild;
				}
				// 余計なtbodyの削除
				if (!$_support.tbody) {
					var hasBody = CLEAN_REG_HAS_TBODY.test(elem),
					    tbody = !hasBody && tagName === "TABLE"  ? div.firstChild && div.firstChild.childNodes :
					            !hasBody && wrap[1] == "<table>" ? div.childNodes : [];
					for (var j = tbody.length - 1; j >= 0 ; --j) {
						if (tbody[j].tagName === "TBODY" && !tbody[j].childNodes.length) {
							tbody[j].parentNode.removeChild(tbody[j]);
						}
					}
				}
				// 先頭のテキストノードの補完
				//   タグ内部の先頭テキストは補完できないことに注意するべき
				if (!$_support.leadingWhitespace && (match = REG_LTRIM.exec(elem))) {
					div.insertBefore(context.createTextNode(match[0]), div.firstChild);
				}
				while (div.firstChild) {
					rv[c++] = div.removeChild(div.firstChild);
				}
				//for (var node = parser.firstChild; node; node = node.nextSibling) {
				//	rv[c++] = node;
				//}
			}
		}
		// DOMElement
		else if (elem.nodeType) {
			rv[c++] = elem;
		}
		// 配列ならさらに再生成する
		else if (elem.length) {
			rv.length = c;
			c = _Array_prototype_push.apply(rv, $_clean(elem, context));
		}
	}
	div = null;
	rv.length = c;
	return rv;
};


/*--------------------------------------
 * $.attr
 *------------------------------------*/

// $.attr(elem, key, val, flag_xml)
//   @brief (elem, key)      - keyの属性を取得する
//          (elem, key, val) - keyの属性を設定する
//   @param elem DOMElement
//   @param key string
//   @param val string
//   @param flag_xml boolean
//   @return val
$_attr = $.attr = mix(function (elem, key, val, flag_xml) {
	if (!elem || elem.nodeType !== 1 || elem.tagName === "!") {
		return;
	}

	var flag_get = val === void 0, tmp, html_key;
	// HTML文書の場合
	if (!flag_xml) {
		// styleのみ別処理
		if (!$_support.style && key === "style") {
			var tmp = elem.style;
			return flag_get ? tmp.cssText : (tmp.cssText = "" + val);
		}
		html_key = ATTR_PROPS[key] || key; //< 属性名変換

		// browser: safariのバグ対策
		if (/*$_browser.safari && */html_key === "selected" && (tmp = elem.parentNode)) {
			tmp = tmp.selectedIndex; //< 代入しないとClosure Compilerで消される
		}

		// 要素に属性が存在する場合
		if (!ATTR_SPECIAL_GUARD[html_key] && elem[html_key] != null) {
			// getter
			if (flag_get) {
//				if ($_support.getAttributeNode) {
//					if (elem.tagName === "FORM" && (tmp = elem.getAttributeNode(html_key))) {
//						return tmp.specified ? tmp.nodeValue : "";
//					}
//				}
				if (html_key === "tabIndex") {
					var tagName = elem.tagName,
					    tabIndex = elem.getAttribute(html_key); //< Fxが存在しないものに-1を返すため
					return tabIndex                                 ? tabIndex :
					       ATTR_HASH_FORM_TAG[tagName]              ? 0 :
					       elem.href && ATTR_HASH_LINK_TAG[tagName] ? 0 : void 0;
				}

				return elem[html_key];
			}
			// setter
			return (elem[html_key] = val);
		}

		if (!$_support.attrNormalized) {
			key = html_key;
		}
	}

	// getter
	if (flag_get) {
		val = flag_xml ? elem.getAttribute(key) : elem.getAttribute(key, 2);
	}
	// setter
	else {
		elem.setAttribute(key, val = "" + val);
	}
	return val === null ? void 0 : val;
}, {
	// $.attr.remove(elem, key, flag_xml)
	//   @breif keyの属性を削除する
	//   @param elem DOMElement
	//   @param key string
	//   @param flag_xml boolean
	remove: function (elem, key, flag_xml) {
		if (elem) {
			$_attr(elem, key, "", flag_xml);
			elem.removeAttribute && elem.removeAttribute(key); //< これ本当に大丈夫？
		}
	}
});


/*--------------------------------------
 * $.css
 *------------------------------------*/

// $.css(elem, key, val)
//   @brief (elem, key)      - keyのスタイルを取得する
//          (elem, key, val) - keyのスタイルを設定する
//   @param elem DOMElement
//   @param key string
//   @param val string
//   @return val
$_css = $.css = mix(function (elem, key, val) {
	// getter
	if (val === void 0 || typeof val === "boolean") {
		// 幅、高さの取得
		if (key === "width" || key === "height") {
			if (!val && (val = elem.style[key])) {
				return val;
			}
			return $_css[key](elem) + "px";
		}
		// floatのキー変更
		if (key === "float") {
			key = CSS_FLOAT;
		}
		else {
			// camerizel
			key = key.replace(REG_CAMEL, FUNC_CAMEL);
			// 互換性修正実装
			var tmp = $_css.special[key];
			if (tmp) {
				if (typeof tmp === "function") {
					return tmp(elem, void 0, !!val);
				}
				key = tmp;
			}
		}
		return $_css_get(elem, key, val);
	}

	// setter
	var props = {};
	props[key] = val;
	$_css_set(elem, props);
	return $_css(elem, key);
}, {
	// 互換性修正
	special: (function () {
		var rv = {}, style = _document_documentElement.style;
		// opacity
		if (style.opacity === void 0) {
			rv.opacity =
				style.MozOpacity   !== void 0 ? "MozOpacity" :
				style.KhtmlOpacity !== void 0 ? "KhtmlOpacity" :
				style.filter       !== void 0 ? function (elem, val) {
					// TODO: IE5で動かない
					var style = elem.style, filter = style.filter || elem.currentStyle.filter || "", match, _parseFloat = parseFloat;
					// getter
					if (val === void 0) {
						return (match = /opacity=(\d*)/.exec(filter)) ? "" + (_parseFloat(match[1]) / 100) : "1";
					}

					// setter
					var tmp = filter.replace(/\s*(progid\:DXImageTransform\.Microsoft\.)?Alpha\([^\(\)]*\)/gi, "");
					val = _parseFloat(val) * 100;
					if (isFinite(val)) {
						val = val <= 0 ? 0 : val >= 100 ? 100 : _Math_round(val);
						val < 100 && (tmp += " alpha(opacity=" + val + ")");
					}
					if (!elem.currentStyle.hasLayout) {
						style.zoom = 1;
					}
					style.filter = tmp;
				} : void 0;
		}
		// background-position-x, background-position-y
		if (style.backgroundPositionX === void 0) {
			var backgroundPosition = function (num) {
				return function (elem, val, flag) {
					var tmp_bp = "backgroundPosition",
					    val_bp = $_css_get(elem, tmp_bp, flag).split(" ");
					// getter
					if (val === void 0) {
						return val_bp[num];
					}
					// setter
					val_bp[num] = val;
					elem.style[tmp_bp] = val_bp.join(" ");
				};
			};
			rv.backgroundPositionX = backgroundPosition(0);
			rv.backgroundPositionY = backgroundPosition(1);
		}
		return rv;
	})()
});

var
// $_css_get(elem, key, flag = false)
//   @breif keyのスタイルを取得する
//   @param elem DOMElement
//   @param key string
//   @param flag boolean - trueならcurrentCSSから取得する
//   @return string
$_css_get = _document_defaultView && _document_defaultView.getComputedStyle ? function (elem, key, flag) { //< getComputedStyle版。古いSafariではdocument.defaultView !== windowであるため
	var style = elem.style, rv;
	// browser: jQuery 1.2.6でのOperaバグ対策。新しいのでは修正か
	if (key === "display" && _opera) {
		rv = style.outline;
		style.outline = "0 solid black";
		style.outline = rv;
	}

	if (!flag && style && style[key]) {
		rv = style[key];
	}
	else {
		// キーの復旧
		key = key === CSS_FLOAT
		    ? "float"
		    : key.replace(REG_DECAMEL, "-$1").toLowerCase();

		var computedStyle = (elem.ownerDocument || _document).defaultView.getComputedStyle(elem, null);
		// browser: jQuery 1.2.6でのSafariバグ対策（新しいのでは修正か？）
		//          正直何やっているのか理解できていない
		//*
		if (/*$_browser.safari*/IS_SAFARI2 && (!computedStyle || computedStyle.getPropertyValue("color") === "")) {
			var
				swap = [],
				stack = [],
				color = function (elem) {
					var tmp = (elem.ownerDocument || _document).defaultView.getComputedStyle(elem, null);
					return !tmp || tmp.getPropertyValue("color") === "";
				};

			for (var node = elem; node && color(node); node = node.parentNode) {
				stack.unshift(node);
			}
			for (var i = 0, iz = stack.length; i < iz; ++i) {
				if (color(stack[i])) {
					rv = stack[i].style;
					swap[i] = rv.display;
					rv.display = "block";
				}
			}
			rv = key === "display" && swap[stack.length - 1] != null
			   ? "none"
			   : computedStyle && computedStyle.getPropertyValue(key) || "";
			for (var i = 0, iz = swap.length; i < iz; ++i) {
				if (swap[i] != null) {
					stack[i].style.display = swap[i];
				}
			}
		}
		else {
			rv = computedStyle && computedStyle.getPropertyValue(key) || "";
		}
		/*/
		rv = computedStyle && computedStyle.getPropertyValue(key) || "";
		//*/
	}
	return key === "opacity" && rv === "" ? "1" : rv;
} : function (elem, key, flag) { //< currentStyle版
	var style = elem.style, rv;

	if (!flag && style && style[key]) {
		rv = style[key];
	}
	else {
		var currentStyle = elem.currentStyle,
		    tmp_bp = "backgroundPosition";
		rv = currentStyle[key];
		// backgroundPositionのバグ修正
		if (!rv && key === tmp_bp) {
			rv = currentStyle[tmp_bp + "X"] + " " + currentStyle[tmp_bp + "Y"];
		}
		// jQueryでのpixel返却対策
		else if (!CSS_REG_CURRENT_GUARD.test(key)
		     &&   CSS_REG_CURRENT_NUMBER.test(rv)
		     &&  !CSS_REG_CURRENT_PIXEL.test(rv)) {
			var runtimeStyle = elem.runtimeStyle,
			    left = style.left,
			    rsLeft = runtimeStyle.left;
			runtimeStyle.left = currentStyle.left;
			style.left = rv || 0;
			rv = style.pixelLeft + "px";
			style.left = left;
			runtimeStyle.left = rsLeft;
		}
	}

	return rv;
};

// $_css_set(elem, props, cache = void 0)
//   @breif elemのスタイルを設定する
//   @param elem DOMElement
//   @param props object
//   @param cache object
function $_css_set(elem, props, cache) {
	cache = cache || { /* "font-size": "fontSize", 存在しない場合specialで関数呼び出し */ };
	var key, val, tmp, style = elem.style, special = $_css.special;
	// 変換用キャッシュが効いている場合、それに基づき変換
	if (cache.$) {
		for (var i in props) {
			if (i !== "$") {
				val = props[i];
				tmp = special[key = cache[i]];
				tmp ? tmp(elem, val) : (style[key] = val);
			}
		}
	}
	// キャッシュ生成を兼ねたstyle設定
	else {
		cache.$ = true;
		for (var i in props) {
			val = props[i];
			if (i === "float") {
				key = cache[i] = CSS_FLOAT;
			}
			else {
				tmp = special[key = i.replace(REG_CAMEL, FUNC_CAMEL)];
				if (!tmp) {
					cache[i] = key;
				}
				else if (typeof tmp !== "function") {
					cache[i] = key = tmp;
				}
				else {
					cache[i] = key;
					tmp(elem, val);
					continue;
				}
			}
			style[key] = val;
		}
	}
}


/*--------------------------------------
 * $.event
 *------------------------------------*/


$_event = $.event = {
	// $.event.add(elem, types, fn, data = void 0)
	//   @breif イベントを設定する
	//   @param elem DOMElement
	//   @param types string
	//   @param fn function
	//   @param data anything
	add: function (elem, types, fn, data) {
		if (elem.nodeType === 3 || elem.nodeType === 8 || elem.tagName === "!") {
			return;
		}

		// jQueryでのIEでのバグ対策
		if (elem.alert && elem !== _window && !elem.frameElement) {
			elem = _window;
		}

		// $uidの設定
		if (!fn.$uid) {
			fn.$uid = $_data(fn); //< $_dataのみでも良さそうだけど、なんか念のため
		}

		var
			fns = {},
			events = $_data(elem, "events") || $_data(elem, "events", {
				// onclick: { $uid: function () {} }
			}),
			handle = $_data(elem, "handle") || $_data(elem, "handle", function fn_handle() {
				if (!$_event_triggered) {
					return $_event.handle.apply((arguments.callee || fn_handle).node, arguments); //< IE6でarguments.calleeとfn_handleが同一のものを指さない
				}
			});
			handle.node = elem; // .elemより.nodeの方が好き

		for (var i = 0, type, types = types.trim().split(REG_SPACE); type = types[i]; ++i) {
			var ns = type.split(".");
			type = ns.shift();
			ns = ns.length ? "." + ns.join(".") + "." : "";

			// dateがあるときとネームスペースが着いているとき、関数をラッピングする
			var handler = fns[ns];
			if (!handler) {
				handler = fns[ns] = data !== void 0 || ns ? $_event.proxy(fn) : fn;
				handler.namespace = ns;
				handler.data = data;
			}

			var handlers = events[type],
			    special = $_event.special[type] || {};

			if (!handlers) {
				handlers = events[type] = {};
				if (!special.add || special.add(elem, handle) === false) {
					if (elem.addEventListener) {
						elem.addEventListener(type, handle, false);
					}
					else if (elem.attachEvent) {
						elem.attachEvent("on" + type, handle);
					}
				}
			}

			handlers[handler.$uid] = handler;
			$_event_used[type] = true;
		}

		elem = null; //< IEのメモリリーク対策
	},

	// $.event.remove(elem, types, handler)
	//   @breif イベントを削除する
	//   @param elem DOMElement
	//   @param types string
	//   @param handler function
	remove: function (elem, types, handler) {
		if (elem.nodeType === 3 || elem.nodeType === 8 || elem.tagName === "!") {
			return;
		}

		var events = $_data(elem, "events"), key;

		if (events) {
			types = types ? types.split(REG_SPACE) : [""];
			for (var i = 0, otype; otype = types[i]; ++i) {
				var ns = otype.split("."), type = ns.shift();

				if (!type) {
					// typeが省略されている場合、全イベントでチェックをする
					for (type in events) {
						$_event.remove(elem, type + (otype || ""));
					}
				}
				else {
					var all = !ns.length,
					    words = all ? null : andSearchInit(ns, "."),
					    //reg = andRegExp(escapeRegExp(ns.join("\t")).split("\t"), "\\."),
					    special = $_event.special[type] || {},
					    handlers = events[type];

					if (handlers) {
						// 指定された関数を削除する
						if (handler) {
							if (all || andSearch(handlers[uid].namespace, words)) {
							//if (all || reg.test(handler.namespace)) {
								delete handlers[handler.$uid];
							}
						}
						// 要素の特定イベントに結びついた関数をまとめて削除する
						else {
							for (var uid in handlers) {
								if (all || andSearch(handlers[uid].namespace, words)) {
								//if (all || reg.test(handlers[uid].namespace)) {
									delete handlers[uid];
								}
							}
						}

						// イベントに結びついた関数が無くなった
						for (key in handlers) break;
						if (!key) {
							var handle = $_data(elem, "handle");
							if (!special.remove || special.remove(elem, handle) === false) {
								if (elem.removeEventListener) {
									elem.removeEventListener(type, handle, false);
								}
								else if (elem.detachEvent) {
									elem.detachEvent("on" + type, handle);
								}
							}
							key = null;
							delete events[type];
						}
					}
				}
			}

			// 要素に結びついたイベントが無くなった
			for (key in events) break;
			if (!key) {
				var handle = $_data(elem, "handle");
				if (handle) {
					handle.node = null;
				}
				$_data.remove(elem, "events");
				$_data.remove(elem, "handle");
			}
		}
	},

	// $.event.fire(elem, evt, data = void 0, bubbling = false)
	//   @breif イベントを実行する
	//   @param elem DOMElement
	//   @param evt string OR DOMEvent OR $.Event
	//   @param data anything
	//   @param bubbling boolean
	fire: function (elem, evt, data, bubbling) {
		var type = evt.type || evt, func = $_event.fire;

		if (!bubbling) {
			if (!evt.originalEvent) {
				evt = new $_Event(evt);
			}

			// 要素が存在しないときは全ての要素のイベントを実行する
			if (!elem) {
				evt.stopPropagation();
				if ($_event_used[type]) {
					for (var i in $_cache) {
						var cache = $_cache[i],
						    handlers = cache.events;
						if (handlers && handlers[type]) {
							func(cache.handle.node, evt, data);
						}
					}
				}
			}

			if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || elem.tagName === "!") {
				return;
			}

			evt.result = void 0;
			evt.target = elem;
			data = toArray(data);
			data.unshift(evt);
		}

		evt.currentTarget = elem;

		// 結びついたイベントを実行する
		var handle = $_data(elem, "handle");
		handle && handle.apply(elem, data);

		// ネイティブに設定されているのを実行する
		//   native_handlerはMac IE対応する場合は削除するべきか？
		var native_fn,
		    native_handler,
		    native_link_click = elem.tagName === "A" && type === "click";
		try {
			native_fn = elem[type];
			native_handler = elem["on" + type];
		} catch (e) {}
		if ((!native_fn || native_link_click)
		 && native_handler
		 && native_handler.apply(elem, data) === false) {
			evt.result = false;
		}

		if (!bubbling && native_fn && !evt.isDefaultPrevented() && !native_link_click) {
			$_event_triggered = true;
			try {
				native_fn();
			} catch (e) {}
		}
		$_event_triggered = false;

		if (!evt.isPropagationStopped()) {
			var parent = elem.parentNode || elem.ownerDocument || elem.document;
			parent && func(parent, evt, data, true);
		}
	},

	// $.event.proxy(fn, proxy = void 0, me = void 0)
	//   @breif 関数をラッピングする
	//   @param fn function
	//   @param proxy fn
	//   @param me anything
	//   @return proxy
	proxy: function (fn, proxy, me) {
		proxy = proxy || function () {
		 	return fn.apply(me !== void 0 ? me : this, arguments);
		};
		proxy.$uid = fn.$uid = fn.$uid || proxy.$uid || $_data(fn);
		return proxy;
	},

	// $.event.handle(evt)
	//   @breif イベントを実行する
	//   @param evt DOMEvent
	handle: function (evt) {
		var args = arguments;
		if (!evt || !evt.originalEvent) {
			args.length = args.length || 1;
			args[0] = evt = new $_Event(evt || _window.event);
			evt.currentTarget = this;
		}
		var ns = evt.type.split("."), elem = evt.currentTarget;
		evt.type = ns.shift();

		if (!evt.type) {
			// typeが省略されている場合、全イベントでチェックをする
			var events = $_data(elem, "events") || {};
			ns = ns.join(".");
			for (var i in events) {
				evt.type = i + "." + ns;
				$_event.handle.apply(elem, args);
			}
		}
		else {
			var all = !ns.length,
			    words = all ? null : andSearchInit(ns, "."),
			    //reg = andRegExp(escapeRegExp(ns.join("\t")).split("\t"), "\\."),
			    handlers = ($_data(elem, "events") || {})[evt.type];
			for (var i in handlers) {
				var handler = handlers[i];
				//if (all || reg.test(handler.namespace)) {
				if (all || andSearch(handler.namespace, words)) {
					evt.data = handler.data;
					var rv = handler.apply(elem, args);
					if (rv !== void 0) {
						if (rv === false) {
							evt.preventDefault();
							evt.stopPropagation();
						}
					}
					if (evt.isImmediatePropagationStopped()) {
						break;
					}
				}
			}
		}
	},

	// 互換性修正
	special: {
		// DOM構築直後の実行
		ready: {
			add: function (elem) {
				if (elem !== _document) {
					return false;
				}

				function ready(evt) {
					if (!$_event_ready) {
						$_event_ready = true;
						evt = new $_Event(evt || _window.event);
						evt.type = "ready";
						evt.currentTarget = _document;
						$_event.handle.call(_document, evt);
					}
				}

				// Mozilla, Opera, Webkit
				//*
				if (_document.addEventListener) {
					_document.addEventListener("DOMContentLoaded", function fn_DOMContentLoaded(evt) {
						if (!$_event_ready) {
							// browser: Operaはスタイルシートが非同期的に読み込まれるため。新しいものでは修正か？
							if (_opera) {
								for (var styleSheets = _document.styleSheets, i = 0, iz = styleSheets.length; i < iz; ++i) {
									if (styleSheets[i].disabled) {
										setTimeout(fn_DOMContentLoaded, 0);
										return;
									}
								}
							}
							ready(evt);
							_document.removeEventListener("DOMContentLoaded", fn_DOMContentLoaded, false);
						}
					}, false);
				}
				//*/
				// IE
				//*
				else if (_document.attachEvent) {
					_document.attachEvent("onreadystatechange", function fn_onreadystatechange() {
						if (!$_event_ready && _document.readyState === "complete") {
							ready();
							_document.detachEvent("onreadystatechange", fn_onreadystatechange);
						}
					});

					// http://javascript.nwbox.com/IEContentLoaded/
					var root = _document_documentElement;
					if (root && root.doScroll && _window === _window.top) (function fn_doScroll() {
						if (!$_event_ready) {
							try {
								root.doScroll("left");
							}
							catch (e) {
								setTimeout(fn_doScroll, 0);
								return;
							}
							root = null;
							ready();
						}
					})();
				}
				//*/

				// browser: 古いsafariのロード用
				//*
				if (!_document.attachEvent && typeof _document.readyState === "string") {
					(function fn_styleSheets() {
						if (!$_event_ready) {
							var readyState = _document.readyState;
							if (
								(readyState === "loaded" || readyState === "complete") &&
								_document.styleSheets.length === $_query("style,link[rel=stylesheet]").length
							) {
								ready();
							}
							else {
								setTimeout(fn_styleSheets, 0);
							}
						}
					})();
				}
				//*/

				$_event.add(_window, "load", ready);
			},
			remove: function () {}
		},
		// マウスホイールエミュレート
		mousewheel: {
			add: function (elem) {
				if (elem.alert) {
					elem = elem.document;
				}
				if (!elem.writeln) {
					return false;
				}
				if (elem.addEventListener) {
					elem.addEventListener("DOMMouseScroll", EVENT_FUNC_SPECIAL_MOUSEWHEEL, false); //< 解放しなくてもメモリリークの不安はあまりない
				}
				elem.onmousewheel = EVENT_FUNC_SPECIAL_MOUSEWHEEL;
				var win = getWindow(elem);
				win && (win.onmousewheel = EVENT_FUNC_SPECIAL_MOUSEWHEEL);
			},
			remove: function (elem) {
				if (elem.alert) {
					elem = elem.document;
				}
				if (!elem.writeln) {
					return false;
				}
				if (elem.removeEventListener) {
					elem.removeEventListener("DOMMouseScroll", EVENT_FUNC_SPECIAL_MOUSEWHEEL, false); //< 解放しなくてもメモリリークの不安はあまりない
				}
				elem.onmousewheel = void 0;
				var win = getWindow(elem);
				win && (win.onmousewheel = void 0);
			}
		}
	}
};

// mouseenter, mouseleave対応
for (var key in EVENT_HASH_SPECIAL_WITHIN) (function (fix, orig) {
	$_event.special[fix] = {
		add: function (elem) {
			$_event.add(elem, orig, EVENT_FUNC_SPECIAL_WITHIN, fix)
		},
		remove: function (elem) {
			$_event.remove(elem, orig, EVENT_FUNC_SPECIAL_WITHIN);
		}
	};
})(key, EVENT_HASH_SPECIAL_WITHIN[key]);

// resize: cf. http://d.hatena.ne.jp/uupaa/20090720/1248097177
/*
if (IS_MSIE) (function () {
	function getSize(doc) {
		var root = doc.documentElement,
		    body = doc.body;
		return [
			root && root.clientWidth || body.clientWidth,
			root && root.clientHeight || body.clientHeight
		];
	}
	$_event.special.scroll = {
		add: function (elem, handle) {
			if (!elem.alert) {
				return false;
			}
			var doc = elem.document,
			    lock = true,
			    size = getSize(doc),
			    event_onscroll = $_data(elem, "event_onscroll") || $_data(elem, "event_onscroll", {});
			event_onscroll.lock = false;
			function loop() {
				if (!lock++) {
					var tmp = getSize(doc), evt;
					if (size[0] !== tmp[0] || size[1] !== tmp[1]) {
						size = tmp;
						evt = new $_Event("scroll");
						evt.currentTarget = _elem;
						handle(evt);
					}
					setTimeout(function() {
						lock = 0;
					}, 0);
				}
				event_onscroll.tid = setTimeout(loop, 100);
			}
			event_onscroll.tid = setTimeout(loop, 100);
		},
		remove: function (elem) {
			if (!elem.alert) {
				return false;
			}
			clearTimeout(event_onscroll.tid);
			event_onscroll.tid = null;
			event_onscroll.lock = true;
		}
	};
})();
*

/*
 * $.Event
 */

// new $.Event(evt)
//   @breif イベントを拡張する
//   @param evt DOMEvent
$_Event = $.Event = function (evt) {
	// 既に拡張済みである
	if (evt && evt.originalEvent) {
		return evt;
	}

	var self = this, tmp;
	// DOMEvent
	if (evt && evt.type) {
		self.originalEvent = evt;
		self.type = evt.type;

		for (var i = 0, prop; prop = EVENT_PROPS[i]; ++i) {
			self[prop] = evt[prop];
		}

		tmp = self.target = self.target || self.srcElement || _document;
		if (tmp.nodeType === 3) {
			tmp = self.target = tmp.parentNode;
		}

		if (!self.relatedTarget && self.fromElement) {
			self.relatedTarget = self.fromElement == tmp ? self.toElement : self.fromElement;
		}

		if (self.pageX == null && self.clientX != null) {
			var doc  = getDocument(tmp),
			    root = tmp.documentElement,
			    body = tmp.body;
			self.pageX = self.clientX
			           + (root && root.scrollLeft || body && body.scrollLeft || 0)
			           - (root && root.clientLeft || 0);
			self.pageY = self.clientY
			           + (root && root.scrollTop || body && body.scrollTop || 0)
			           - (root && root.clientTop || 0);
			doc = root = body = null;
		}

		if (!self.metaKey && self.ctrlKey) {
			self.metaKey = self.ctrlKey;
		}

		if (!self.which) {
			if (tmp = (((tmp = self.charCode) || tmp === 0) ? tmp : self.keyCode)) {
				self.which = tmp;
			}
			else if (tmp = self.button) {
				self.which = (tmp & 1) ? 1 :
				             (tmp & 2) ? 3 :
				             (tmp & 4) ? 2 : 0;
			}
		}

		if (tmp = self.wheelDelta) {
			self.detail = _Math_round(tmp / (_opera ? 40 : -40));
		}

		tmp = null;
	}
	// 文字列
	else {
		self.type = evt;
	}

	self.timeStamp = +new Date;
};

// DOMEventのエミュレート
$_Event.prototype = {
	preventDefault: function () {
		this.isDefaultPrevented = True;
		var evt = this.originalEvent;
		if (evt) {
			evt.preventDefault && evt.preventDefault();
			evt.returnValue = false;
		}
	},
	stopPropagation: function () {
		this.isPropagationStopped = True;
		var evt = this.originalEvent;
		if (evt) {
			evt.stopPropagation && evt.stopPropagation();
			evt.cancelBubble = true;
		}
	},
	stopImmediatePropagation:function () {
		this.isImmediatePropagationStopped = True;
		this.stopPropagation();
	},
	isDefaultPrevented: False,
	isPropagationStopped: False,
	isImmediatePropagationStopped: False
};


/*--------------------------------------
 * $.ajax
 *------------------------------------*/

// $.ajax(options)
//   @breif 通信処理、JSONPを行う
//   @param options object
//   @return XMLHttpRequest
$_ajax = $.ajax = mix(function (options) {
	options = options || {};
	// デフォルトオプションの書き出し
	for (var i in $_ajax.settings) {
		options[i] = options[i] || $_ajax.settings[i];
	}

	var tmp, loaded = false, xhr, status, res,
	    // オプションの正規化
	    type      = options.type.toUpperCase(),
	    url       = options.url,
	    async     = !!options.async,
	    data      = options.data,
	    dataType  = (options.dataType || "").toLowerCase(),
	    namespace = options.namespace ? "." + options.namespace : "",
	    context   = options.context || _window,
	    headers   = options.headers || {},
	    global    = !!options.global,
	    accepts   = options.accepts,
	    // 簡易化
	    is_get    = type === "GET",
	    is_onload,
	    // JSONP
	    jsonp, script,
	    // XHR
	    key;

	// data
	if (data && options.processData && typeof data === "string") {
		data = $_ajax.param(data);
	}

	// jsonp
	if (dataType === "jsonp") {
		tmp = options.jsonp || "callback";
		if (is_get) {
			if (!AJAX_REG_JSONP.test(url)) {
				url += (AJAX_REG_QUERY.test(url) ? "&" : "?") + tmp + "=?";
			}
		}
		else if (!data || !AJAX_REG_JSONP.test(data)) {
			data = (data ? data + "&" : "") + tmp + "=?";
		}
		dataType = "json";
	}

	// json(p)
	if (dataType === "json" && (data && AJAX_REG_JSONP.test(data) || AJAX_REG_JSONP.test(url))) {
		jsonp = "jsonp" + $_ajax_jsonp++;
		tmp = "$1$3" + jsonp + "$2$4";

		if (data) {
			data = ("" + data).replace(AJAX_REG_JSONP, tmp);
		}
		url = url.replace(AJAX_REG_JSONP, tmp);

		_window[jsonp] = function () {
			onsuccess(arguments);
			oncomplete(arguments);
			_window[jsonp] = void 0;
			try {
				delete _window[jsonp];
			} catch (e) {}
			script && script.parentNode && script.parentNode.removeChild(script);
		};

		dataType = "script";
	}

	// cache
	tmp = options.cache;
	if (tmp === null) {
		tmp = dataType !== "script";
	}
	if (is_get && tmp === false) {
		tmp = +new Date;
		url = AJAX_REG_CACHE.test(url)
		    ? url.replace(AJAX_REG_CACHE, "$1_=" + tmp + "$2")
		    : url + (AJAX_REG_QUERY.test(url) ? "&" : "?") + "_=" + tmp;
	}

	// GET時のURL
	if (is_get && data) {
		url += (AJAX_REG_QUERY.test(url) ? "&" : "?") + data;
	}

	// オプションの統合
	options.type  = type;
	options.url   = url;
	options.async = async;
	options.data  = data;

	// ajaxStart
	if (global && !$_ajax_active++) {
		$_event.fire(null, "ajaxStart");
	}

	// 外部ドメインのscriptのJSONP呼び出し
	if (is_get && dataType === "script") {
		var match = AJAX_REG_URL.exec(url);
		if (match && (match[1] && match[1] !== location.protocol || match[2] !== location.host)) {
			script = _document.createElement("script");
			script.src = url;
			if (tmp = options.charset) {
				script.charset = tmp;
			}

			// JSONPの関数名が定まっていない場合
			if (!jsonp) {
				script.onload = script.onreadystatechange = function () {
					var readyState = this.readyState;
					if (!loaded && (!readyState || readyState === "loaded" || readyState === "complete")) {
						loaded = true;
						onsuccess([]);
						oncomplete([]);
						script.onload = script.onreadystatechange = null;
						script.parentNode && script.parentNode.removeChild(script);
					}
				};
			}

			// Operaで非同期JSONP読み込みを行う方法
			// http://developer.cybozu.co.jp/takesako/2007/06/opera_img-jsonp.html
			if (_opera) {
				tmp = _document.createElement("img");
				tmp.onerror = function (e) {
					tmp.parentNode && tmp.parentNode.removeChild(script);
					var root = HEAD || _document_documentElement;
					root.insertBefore(script, root.firstChild);
					root = null;
				};
				img.width = 0;
				img.height = 0;
				img.src = url;
				(_document.body || _document_documentElement).appendChild(img); 
			}
			// 他のブラウザ
			else {
				var root = HEAD || _document_documentElement;
				root.insertBefore(script, root.firstChild);
				root = null;
			}
			return null;
		}
	}

	// XMLHttpRequest
	xhr = options.xhr();

	// Operaはusernameを省略しているのに引数に持つとおかしいらしい
	if (options.username) {
		xhr.open(type, url, async, options.username, options.password);
	}
	else {
		xhr.open(type, url, async);
	}

	// headers
	if (data) {
		headers[key = "Content-Type"] || (headers[key] = options.contentType);
	}
	if (options.ifModified) {
		if (tmp = $_ajax.lastModified[url]) {
			headers[key = "If-Modified-Since"] || (headers[key] = tmp);
		}
		if (tmp = $_ajax.etag[url]) {
			headers[key = "If-None-Match"] || (headers[key] = tmp);
		}
	}
	headers[key = "X-Requested-With"] || (headers[key] = "XMLHttpRequest");
	headers[key = "Accept"] || (headers[key] = dataType && (tmp = accepts[dataType]) ? tmp + ", */*" : accepts._default);

	try {
		for (var i in headers) {
			xhr.setRequestHeader(i, headers[i]);
		}
	} catch (e) {}
	options.headers = headers;

	// beforeSend
	if ((tmp = options.beforeSend) && tmp.call(context, xhr, options) === false) {
		if (global && !--$_ajax_active) {
			$_event.fire(null, "ajaxStop");
		}
		xhr.abort();
		xhr = null;
		return null;
	}

	// ajaxSend
	if (global) {
		$_ajax_fire("ajaxSend", xhr, options);
	}

	if (async) {
		// timeout
		if ((tmp = options.timeout) > 0) {
			setTimeout(function () {
				xhr && onreadystatechange("timeout");
			}, tmp);
		}

		// onreadystatechange
		is_onload = typeof xhr.onload === typeof xhr.onreadystatechange;
		if (is_onload) {
			xhr.onload = onreadystatechange; //< IEで代入失敗する
		}
		xhr.onreadystatechange = onreadystatechange;
	}

	// send
	try {
		xhr.send(type === "POST" || type === "PUT" ? data : null);
	}
	catch (e) {
		onerror(e);
	}

	if (!async) {
		onreadystatechange();
	}

	return xhr;

	// ajaxで通信状態が変わったとき呼び出される
	function onreadystatechange(message) {
		var is_timeout = message === "timeout";
		if (!loaded && xhr && (xhr.readyState === 4 || is_timeout)) {
			loaded = true;
			status = is_timeout ? "timeout" :
			         !$_ajax_is_success(xhr) ? "error" :
			         options.ifModified && $_ajax_is_not_modified(xhr, url) ? "notmodified" : "success";

			if (status === "success") {
				try {
					var contentType = xhr.getResponseHeader("Content-Type"),
					    flag_xml = dataType === "xml" || !dataType && contentType && contentType.indexOf("xml") >= 0,
					    tmp = flag_xml ? xhr.responseXML : xhr.responseText;

					if (flag_xml && tmp.documentElement && tmp.documentElement.nodeName === "parsererror") {
						throw "parsererror";
					}

					if (options.dataFilter) {
						tmp = options.dataFilter(tmp, dataType);
					}

					if (typeof tmp === "string") {
						if (dataType === "script") {
							evalScript(tmp);
						}
						else if (dataType === "json") {
							tmp = (new Function("return " + tmp))();
							//tmp = JSON.parse(tmp); //< 正しいJSONじゃないと返さないので不便なので
						}
					}
					res = tmp;
				}
				catch (e) {
					status = "parsererror";
				}
			}

			if (status === "success" || status === "notmodified") {
				!jsonp && onsuccess([res, status]);
			}
			else {
				onerror();
			}

			oncomplete([xhr, status]);
			if (is_onload) {
				xhr.onload = function () {};
			}
			xhr.onreadystatechange = function () {};

			if (typeof xhr.abort !== "undefined") {
				xhr.abort();
			}

			xhr = null;
		}
	}

	// 取得に成功したとき
	function onsuccess(args) {
		var func = options.success;
		func && func.apply(options.context, args);
		global && $_ajax_fire("ajaxSuccess", xhr, options);
	}

	// 取得に失敗したとき
	function onerror(error) {
		var func = options.error;
		func && func.call(options.context, xhr, status, error);
		global && $_ajax_fire("ajaxError", xhr, options, error);
	}

	// 全てが終了したとき
	function oncomplete(args) {
		var func   = options.complete,
		    global = options.global;
		func && func.apply(options.context, args);
		global && $_ajax_fire("ajaxComplete", xhr, options);
		if (global && !--$_ajax_active) {
			$_event.fire(null, "ajaxStop");
		}
	}

}, {
	// デフォルト設定
	settings: {
		type: "GET",
		url: location.href,
		async: true,
		processData: true,
		jsonp: "callback",
		headers: {},
		contentType: "application/x-www-form-urlencoded",
		global: true,
		xhr: _window.ActiveXObject ? function () {
			return new ActiveXObject("Microsoft.XMLHTTP");
		} : function () {
			return new XMLHttpRequest();
		},
		accepts: {
			xml:      "application/xml, text/xml",
			html:     "text/html",
			script:   "text/javascript, application/javascript",
			json:     "application/json, text/javascript",
			text:     "text/plain",
			_default: "*/*"
		}
	},
	lastModified: {},
	etag: {},

	// $.ajax.param(obj)
	//   @breif パラメータ生成
	//   @param obj anything
	//   @return string
	param: function(obj) {
		var kv = [],
		    q = -1,
		    _encodeURIComponent = encodeURIComponent;

		function add(key, value) {
			kv[++q] = _encodeURIComponent(key) + "="
			        + _encodeURIComponent($_isFunction(value) ? value() : value);
		}

		if (obj.$ || $_isArray(obj)) {
			$_fast_each(obj, function (elem) {
				add(elem.name, elem.value);
			});
		}
		else {
			for (var name in obj) (function param(key, value) {
				if (value == null) {
					return;
				}
				if ($_isArray(value)) {
					$_fast_each(value, function (_, value) {
						param(key + "[]", value);
					});
				}
				else if (typeof value === "object") {
					for (var i in value) {
						param(key ? key + "[" + i + "]" : i, value[i]);
					}
				}
				else {
					add(key, value);
				}
			})(name, obj[name]);
		}

		return kv.join("&").replace(/%20/g, "+");
	}
});

// $_ajax_is_success(xhr)
//   @breif 通信成功かどうかの判定
//   @param xhr XMLHttpRequest
//   @return boolean
function $_ajax_is_success(xhr) {
	try {
		var status = xhr.status;
		return !status && location.protocol === "file:" ||
		       (status >= 200 && status < 300) || status === 304 || status === 1223 || status === 0;
	} catch (e) {}
	return false;
}

// $_ajax_is_not_modified(xhr, url)
//   @breif キャッシュを利用したかどうかの判定
//   @param xhr XMLHttpRequest
//   @param url string
//   @return boolean
function $_ajax_is_not_modified(xhr, url) {
	var lastModified = xhr.getResponseHeader("Last-Modified"),
	    etag         = xhr.getResponseHeader("Etag"),
	    status       = xhr.status;
	if (lastModified) {
		$_ajax.lastModified[url] = lastModified;
	}
	if (etag) {
		$_ajax.etag[url] = etag;
	}
	return status === 304 || status === 0;
}

// $_ajax_fire(type, xhr, options, error = void 0)
//   @breif イベントを発生させる
//   @param type string
//   @param xhr XMLHttpRequest
//   @param options object
//   @param error Error
function $_ajax_fire(type, xhr, options, error) {
	var namespace = options.namespace;
	$_event.fire(
		options.context,
		type + (namespace ? "." + namespace : ""),
		[xhr, options, error]
	);
}


/*--------------------------------------
 * $.fx
 *------------------------------------*/

// new $.fx(node, props, duration, easing, step = void 0, complete = void 0, next = void 0)
//   @breif アニメーションを設定する
//   @param node DOMElement
//   @param props object
//   @param duration number
//   @param easing function
//   @param step function
//   @param complete function
//   @param next function
$_fx = $.fx = mix(function (node, props, duration, easing, step, complete, next) {
	var self = this;

	self.node       = node;
	self.duration   = duration;
	self.easing     = easing;
	self.onstep     = step;
	self.oncomplete = complete;
	self.onnext     = next;

	var _parseFloat = parseFloat,
	    node_style  = node.style,
	    special     = $_css.special,
	    twprops     = self.props = { /* prop: [ start, end, delta, unit, func ] */ },
	    twfuncs     = self.funcs = { /* prop: function () {} */ };

	for (var i in props) {
		// キーの割り出し
		var key = null, method = null, func = null;
		if (i === "float") {
			key = CSS_FLOAT;
		}
		else if (i === "width" || i === "height") {
			key = method = i;
		}
		else {
			func = special[key = i.replace(REG_CAMEL, FUNC_CAMEL)];
			if (typeof func === "string") {
				key = func;
				func = null;
			}
		}

		// 終了形式から形式を割り出す
		var unit, end = props[i], mend, vend, start, mstart, vstart;
		if (mend = FX_REG_VALUE_END.exec(end)) {
			unit = mend[3];
			vend = _parseFloat(mend[2]);
			start = func   ? func(node, void 0, true) :
			        method ? $_css[method](node) :
			                 $_css_get(node, key, true);
			if (mstart = FX_REG_VALUE_START.exec(start || 0)) {
				vstart = _parseFloat(mstart[1]);
				// 単位一致
				if (unit === mstart[2] || !vstart) {
					unit = unit || "px";
				}
				// 0値による単位省略
				else if (!vend) {
					unit = mstart[2];
				}
				// px単位で一致
				else if ((unit || "px") === (mstart[2] || "px")) {
					unit = "px";
				}
				// 単位不一致
				else if (func) {
					func(node, (vend || 1) + unit);
					vstart = (vend || 1) / _parseFloat(func(node, void 0, true)) * vstart;
					func(node, vstart + unit);
				}
				else {
					node_style[key] = (vend || 1) + unit;
					vstart = (vend || 1) / _parseFloat(method ? $_css[method](node) : $_css_get(node, key, true)) * vstart;
					node_style[key] = vstart + unit;
				}
				// 増減処理
				if (mend[1]) {
					vend = ((mend[1] === "-=" ? -1 : 1) * vend) + vstart;
				}
				twprops[key] = [ vstart, vend, vend - vstart, unit, func ];
			}
		}
		else if (vend = $_fx.color(end)) {
			start = func ? func(node, void 0, true) : $_css_get(node, key, true);
			if (vstart = $_fx.color(start)) {
				twfuncs[key] = (function (self, key, start, end) {
					return function (fin, gain) {
						var num = 0, easing = self.easing, tmp;
						for (var i = 2, z = 1; i >= 0; --i, z *= 256) {
							tmp = ~~(fin ? end[i] : easing(gain, start[i], end[i] - start[i], duration)); // parseInt
							num += (tmp < 0 ? 0 : tmp > 255 ? 255 : tmp) * z;
						}
						self.node.style[key] = (0x1000000 + num).toString(16).replace(/^1/, "#");
					};
				})(self, key, vstart, vend);
			}
		}
	}

}, {
	// アニメーションの無効化
	off: false,
	// 動作速度の設定
	speed: {
		slow:     600,
 		fast:     200,
 		_default: 400
	},
	// easingの設定
	easing: {
		// t - 経過時間（ミリ秒）
		// b - 開始値
		// c - 差分 (delta)
		// d - 総実行時間（ミリ秒）
		linear: function (t, b, c, d) {
			return c * t / d + b;
		},
		swing: function (t, b, c, d) {
			return ((-Math.cos(t / d * Math.PI) / 2) + 0.5) * c + b;
		}
	},
	// $.fx.timer(obj)
	//   @breif stepというメソッドを持っているオブジェクトを登録できるタイマー
	//   @param obj
	timer: mix(function (obj) {
		if (obj) {
			$_fx_timers[++$_fx_count] = obj;
		}
		if (!$_fx_timer_id) {
			$_fx_timer_id = true;
			(function step() {
				var timers = $_fx_timers,
				    count = $_fx_count,
				    len = 0,
				    now = +new Date,
				    obj;
				for (var i in timers) {
					obj = timers[i];
					if (obj.step(now >= obj.finish, now)) {
						++len;
					}
					else {
						delete timers[i];
					}
				}
				if ($_fx_timer_id && (len || count < $_fx_count)) {
					$_fx_timer_id = setTimeout(step, 13);
				}
			})();
		}
	}, {
		// $.fx.timer.stop()
		//   @breif タイマーを停止する
		stop: function () {
			clearTimeout($_fx_timer_id);
			$_fx_timer_id = null;
		}
	}),
	// $.fx.color - 色文字列を数値配列に変換する cf. http://d.hatena.ne.jp/uupaa/20090111/1231685984
	//   @param val string
	//   @return number[]
	color: function (val) {
		var match = FX_REG_COLOR.exec(val), _parseInt = parseInt;
		if (match) {
			if (match[1]) {
				return [
					_parseInt(match[1], 16),
					_parseInt(match[2], 16),
					_parseInt(match[3], 16)
				];
			}
			if (match[4]) {
				return [
					_parseInt(match[4] + match[4], 16),
					_parseInt(match[5] + match[5], 16),
					_parseInt(match[6] + match[6], 16)
				];
			}
			return [
				match[8]  ? ((match[7]  - 0) * 255 / 100) | 0 : match[7]  - 0,
				match[10] ? ((match[9]  - 0) * 255 / 100) | 0 : match[9]  - 0,
				match[12] ? ((match[11] - 0) * 255 / 100) | 0 : match[11] - 0
			];
		}
		return FX_COLORS[("" + val).toLowerCase()] || null;
	}
});

(function (_parseInt, match) {
	while (match = FX_REG_COLORS.exec(FX_STR_COLORS)) {
		FX_COLORS[match[4]] = [
			_parseInt(match[1], 16),
			_parseInt(match[2], 16),
			_parseInt(match[3], 16)
		];
		FX_STR_COLORS = FX_STR_COLORS.slice(match[0].length);
	}
	FX_REG_COLORS = FX_STR_COLORS = null;
})(parseInt);

$_fx.prototype = {
	play: function () {
		var self = this;
		self.start  = +new Date;
		self.finish = self.start + self.duration;
		if (self.step(!self.duration, self.start)) {
			$_fx.timer(self);
		}
	},
	step: function (fin, now) {
		var self       = this,
		    node       = self.node,
		    props      = self.props,
		    funcs      = self.funcs,
		    duration   = self.duration,
		    easing     = self.easing,
		    onstep     = self.onstep,
		    onnext     = self.onnext,
		    oncomplete = self.oncomplete,
		    node_style = node.style,
		    gain       = fin ? 0 : (now || +new Date) - self.start;

		onstep && onstep.call(node, now, self);

		for (var i in props) {
			var prop = props[i],
			    func = prop[4],
			    val  = (fin ? prop[1] : easing(gain, prop[0], prop[2], duration)) + prop[3];
			if (func) {
				func(node, val);
			}
			else {
				node_style[i] = val;
			}
		}
		for (var i in funcs) {
			funcs[i](fin, gain);
		}
		if (fin) {
			onnext && onnext();
			oncomplete && oncomplete.call(node);
		}
		return !fin;
	}
};


/*--------------------------------------
 * $.fn
 *------------------------------------*/

$_fn = $.fn = $.prototype = {
	$: true,
	$isXMLDoc: null,
	length: 0,

	/*
	 * Core
	 */
	// #init(obj = document, parents = void 0)
	//   @breif $コンストラクタ
	//   @param obj anything
	//   @param parents anything
	//   @return $ object
	init: function (obj, parents) {
		var self = this;
		if (!obj) {
			return self;
		}

		// $(DOMElement)
		if (obj.nodeType) {
			self[0] = obj;
			++self.length;
			return self;
		}

		// $(String)
		var match, q;
		if (typeof obj === "string") {
			if (!parents || parents === _document) {
				self.$isXMLDoc = false;
			}
			// $(<tag>)
			if (match = $_INIT_REG_HTML.exec(obj)) {
				$_clean([match[1]], parents ? getDocument(parents.length ? parents[0] : parents) : null, self);
			}
			// $(query)
			else if (self.$isXMLDoc === false) {
				$_query(obj, _document, false, self);
			}
			// $(query, parents)
			else {
				return (parents.$ ? parents : $(parents)).find(obj);
			}
			return self;
		}

		// $(function(){})
		if ($_isFunction(obj)) {
			return $document.on("ready", obj);
		}

		if (!$_isArray(obj)) {
			// $(window), $(document) in IE5
			if (obj.length == null || obj.alert) {
				self[0] = obj;
				++self.length;
			}
			// $(DOMCollection)
			else {
				q = self.length = obj.length;
				while (q) {
					self[--q] = obj[q];
				}
			}
			return self;
		}

		_Array_prototype_push.apply(self, obj);
		return self;
	},
	// #get()
	//   @breif DOM要素配列の取得
	//   @param index void 0
	//   @return DOMCollection
	// #get(index)
	//   @breif DOM要素の取得
	//   @diff 負の値、超過する正の値でも取得する
	//   @param index number
	//   @return DOMElement
	get: function (index) {
		if (typeof index !== "number") {
			return _Array_prototype_slice.call(this);
		}
		var len = this.length;
		while (index < 0) {
			index += len;
		}
		while (len <= index) {
			index -= len;
		}
		return this[index];
	},
	// #size()
	//   @breif サイズの取得
	//   @return number
	size: function () {
		return this.length;
	},
	// #index(obj)
	//   @breif ノードの検索
	//   @param obj $, DOMElement
	//   @return number
	index: _Array_prototype_indexOf ? function (obj) {
		return _Array_prototype_indexOf.call(this, obj && obj.$ ? obj[0] : obj);
	} : function (obj) {
		for (var self = this, target = obj && obj.$ ? obj[0] : obj, i = 0, iz = self.length; i < iz; ++i) {
			if (self[i] === target) {
				return i;
			}
		}
		return -1;
	},
	// #each(fn, args = void 0)
	//   @breif ノード全てをなめる
	//   @param fn function
	//   @param args void 0, anything[]
	//   @return this
	each: function (fn, args) {
		var tmp, self = this, i = 0, iz = self.length;
		if (args) {
			for (;
			     i < iz && fn.apply(self[i], args) !== false;
			     ++i);
		}
		else {
			for (tmp = self[0];
			     i < iz && fn.call(tmp, i, tmp) !== false;
			     tmp = self[++i]);
		}
		return self;
	},
	// #map(fn)
	//   @breif ノードを変化させる
	//   @param fn function
	//   @return this
	map: function (fn) {
		var self = this, rv = [];
		for (var i = 0, iz = self.length, q = -1; i < iz; ++i) {
			var tmp = self[i],
			    ret = fn.call(tmp, i, tmp);
			if (ret) {
				rv[++q] = ret;
			}
		}
		return self.advance(rv);
	},

	/*
	 * Attributes
	 */
	// #data()
	//   @breif データのキーを取得する
	//   @return anything
	// #data(key)
	//   @breif データを取得する
	//   @param key string
	//   @return anything
	// #data(key, val)
	//   @breif データを設定する
	//   @param key string
	//   @param val anything
	//   @return this
	// #data(obj)
	//   @breif データをまとめて設定する
	//   @param obj hash
	//   @return this
	data: function (key, val) {
		var self = this;
		if (typeof key === "object") {
			for (var i in key) {
				$_fast_each(self, $_data, i, key[i]);
			}
			return self;
		}
		if (val !== void 0) {
			return $_fast_each(self, $_data, key, val);
		}
		return $_data(self[0], key);
	},
	// #removeData()
	//   @breif データを全て削除する
	//   @return this
	// #removeData(key)
	//   @breif 指定されたキーのデータを削除する
	//   @param key string
	//   @return this
	removeData: function (key) {
		return $_fast_each(this, $_data.remove, key);
	},
	// #queue()
	//   @breif queueの関数配列を返す
	//   @return function[]
	// #queue(function)
	//   @breif queueにデータを追加する
	//   @return this
	// #queue(function[])
	//   @breif queueのデータを置き換える
	//   @return this
	queue: function(type, data) {
		if (typeof type !== "string") {
			data = type;
			type = "fx";
		}
		if (data === void 0) {
			return $_data_queue(this[0], type);
		}
		return $_fast_each(this, $_data_queue, type, data);
	},
	// #dequeue()
	//   @breif queueの関数配列から先頭を取り出し実行する
	//   @return this
	dequeue: function (type) {
		return $_fast_each(this, $_data.dequeue, type || "fx");
	},
	// #clearQueue()
	//   @breif キューを空にします
	//   @return this
	clearQueue: function (type) {
		return $_fast_each(this, $_data_queue, type || "fx", []);
	},
	// #attr(key)
	//   @breif 属性を取得する
	//   @param key string
	//   @return anything
	// #attr(key, val)
	//   @breif 属性を設定する
	//   @param key string
	//   @param val anything
	//   @return this
	// #attr(obj)
	//   @breif 属性をまとめて設定する
	//   @param obj hash
	//   @return this
	attr: function (key, val) {
		var self = this, self_0 = self[0], flag_xml = self.$isXMLDoc;
		if (flag_xml === null && self_0) {
			flag_xml = self.$isXMLDoc = $_isXMLDoc(getDocument(self_0));
		}
		if (typeof key === "object") {
			for (var i in key) {
				$_fast_each(self, $_attr, i, key[i], flag_xml);
			}
			return self;
		}
		if (val !== void 0) {
			return $_fast_each(self, $_attr, key, val, flag_xml);
		}
		return $_attr(self_0, key, val, flag_xml);
	},
	// #removeAttr(key)
	//   @breif 指定された属性を削除する
	//   @param key string
	//   @return this
	removeAttr: function (key) {
		var self = this, self_0 = self[0], flag_xml = self.$isXMLDoc;
		if (flag_xml === null && self_0) {
			flag_xml = self.$isXMLDoc = $_isXMLDoc(getDocument(self_0));
		}
		return $_fast_each(self, $_attr.remove, key, flag_xml);
	},
	// #hasClass(vals)
	//   @breif そのクラスを持つ要素が存在するかどうかを判定する
	//   @param vals string
	//   @return boolean
	hasClass: function (vals) {
		var rv = false;
		$_fast_each(this, function (elem, words) {
			if (andSearch(" " + elem.className + " ", words)) {
				rv = true;
				return false;
			}
		}, andSearchInit(vals.trim(), " ", /\s+/g));
		//$_fast_each(this, function (elem, reg) {
		//	if (reg.test(elem.className)) {
		//		rv = true;
		//		return false;
		//	}
		//}, andRegExp(escapeRegExp(vals.trim()).split(REG_SPACE), "\\b"));
		return rv;
	},
	// #html()
	//   @breif HTML文字列を取得する
	//   @return string
	// #html(val)
	//   @breif HTML文字列を設定する
	//   @param vals string
	//   @return this
	html: function (val) {
		var self = this;
		if (val !== void 0) {
			return self.length ? $_fast_each(self.empty(), function (elem, val) {
				elem.innerHTML = val;
			}, val) : self;
		}
		return self[0] ? self[0].innerHTML.replace(REG_CRLF, "\n") : void 0;
	},
	// #text()
	//   @breif 文字列を取得する
	//   @return string
	// #text(val)
	//   @breif 文字列を設定する
	//   @param vals string
	//   @return this
	text: function (val) {
		var self = this;
		if (val !== void 0) {
			return self.length ? $_fast_each(self.empty(), function (elem, val) {
				elem[ATTR_TEXTCONTENT] = val; //< XMLに代入しない
			}, val) : self;
		}

		return $_FN_TEXT_FUNC_GET(this[0]);
		//return self[0] ? self[0][ATTR_TEXTCONTENT].replace(REG_CRLF, "\n") : void 0;
	},
	// #val()
	//   @breif 値を取得する
	//   @return string
	// #val(val)
	//   @breif 値を設定する
	//   @param vals string
	//   @return this
	val: function (val) {
		// getter
		if (val === void 0) {
			var elem = this[0], rv;
			if (elem) {
				var tagName = elem.tagName;
				if (tagName === "OPTION") {
					// specifiedはIEのため？
					rv = (elem.attributes.value || {}).specified ? elem.value : elem.text;
				}
				else if (tagName === "SELECT") {
					var selectedIndex = elem.selectedIndex,
					    selectOne = elem.type === "select-one",
					    options = elem.options,
					    vals = [];

					if (selectedIndex < 0) {
						return;
					}

					for (var i = selectOne ? selectedIndex : 0, iz = selectOne ? selectedIndex + 1 : options.length, q = -1; i < iz; ++i) {
						var option = options[i];
						if (option.selected) {
							val = $(option).val();
							if (selectOne) {
								return val;
							}
							vals[++q] = val;
						}
					}

					return vals;
				}
				// 古いsafariはinnerTextじゃないと拾えないとか
				else if (!$_support.valueTextarea && tagName === "TEXTAREA") {
					rv = elem.innerText;
				}
				else {
					rv = elem.value;
				}
			}
			return rv ? rv.replace(REG_CRLF, "\n") : ""; // 改行コードの統一
		}

		return $_fast_each(this, function (elem, val) {
			if (elem.nodeType === 1 && elem.tagName !== "!") {
				if ($_isArray(val) && (elem.type === "radio" || elem.type === "checkbox")) {
					elem.checked = val.indexOf(elem.value) >= 0 || val.indexOf(elem.name) >= 0;
				}
				else if (elem.tagName === "SELECT") {
					val = toArray(val);
					if (val.length) {
						for (var i = 0, option, options = elem.options; option = options[i]; ++i) {
							option.selected = val.indexOf(option.value) >= 0 || val.indexOf(option.name) >= 0;
						}
					}
					else {
						elem.selectedIndex = -1;
					}
				}
				else {
					elem.value = val;
				}
			}
		}, "" + val);
	},

	/*
	 * CSS
	 */
	// #css(key)
	//   @breif 属性を取得する
	//   @param key string
	//   @return anything
	// #css(key, val)
	//   @breif 属性を設定する
	//   @param key string
	//   @param val anything
	//   @return this
	// #css(obj)
	//   @breif 属性をまとめて設定する
	//   @param obj hash
	//   @return this
	css: function (key, val) {
		var prop;
		if (typeof key !== "object") {
			if (val === void 0 || typeof val === "boolean") {
				return $_css(this[0], key, val);
			}
			prop = {};
			prop[key] = val;
		}
		else {
			prop = key;
		}
		return $_fast_each(this, $_css_set, prop, {});
	},
	// #position()
	position: function () {
		var elem = this[0];
		if (!elem)
			return null;

		var _parseFloat   = parseFloat,
		    $elem         = $(elem),
		    $offsetParent = $elem.offsetParent(),
		    offsetParent  = $offsetParent[0],
		    offset        = $elem.offset(),
		    parentOffset  = $_HASH_BODY_OR_HTML[offsetParent.tagName]
		                  ? { top: 0, left: 0 }
		                  : $offsetParent.offset();

		offset.top        -= _parseFloat($_css_get(elem,         "marginTop",       true)) || 0;
		offset.left       -= _parseFloat($_css_get(elem,         "marginLeft",      true)) || 0;
		parentOffset.top  += _parseFloat($_css_get(offsetParent, "borderTopWidth",  true)) || 0;
		parentOffset.left += _parseFloat($_css_get(offsetParent, "borderLeftWidth", true)) || 0;

		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},
	// #offsetParent()
	offsetParent: function () {
		return this.map(function () {
			var node = this,
			    offsetParent = node.offsetParent || getDocument(node).body || _document.body;
			while (
				offsetParent &&
				!$_HASH_BODY_OR_HTML[offsetParent.tagName] &&
				$_css_get(offsetParent, "position") === "static"
			) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		});
	},

	/*
	 * Event
	 */
	// #on(types)
	//   @breif イベントを実行する
	//   @param types string
	//   @return this
	// #on(types, fn, data = void 0)
	//   @breif イベントを設定する
	//   @param types string
	//   @param fn function
	//   @param data anything
	//   @return this
	// #on(obj)
	//   @breif イベントをまとめて設定する
	//   @param obj hash
	//   @return this
	on: function (types, fn, data) {
		var self = this;
		if (typeof types === "object") {
			for (var i in types) {
				$_fast_each(self, $_event.add, i, types[i]);
			}
			return self;
		}
		if ($_isFunction(fn)) {
			return $_fast_each(self, $_event.add, types, fn, data);
		}
		return $_fast_each(self, $_event.fire, types, fn);
	},
	// #un(types, fn = void 0)
	//   @breif イベントを削除する
	//   @param key string
	//   @param val anything
	//   @return this
	un: function (types, fn) {
		return $_fast_each(this, $_event.remove, types, fn);
	},

	/*
	 * Traversing
	 */
	// #eq(expr)
	//   @breif 絞り込まれた要素を返す
	//   @param expr anything
	//   @return $
	eq: function (expr) {
		var self = this,
		    rv = expr === true            ? self.get() :
		         expr === false           ? null :
		         typeof expr === "number" ? self.get(expr) :
		                                    void 0;
		if (rv === void 0) {
			if ($_isFunction(expr)) {
				rv = [];
				for (var i = 0, iz = self.length, q = -1; i < iz; ++i) {
					if (expr.call(self[i], i)) {
						rv[++q] = self[i];
					}
				}
			}
			else {
				var self_0 = self[0], flag_xml = self.$isXMLDoc;
				if (flag_xml === null && self_0) {
					flag_xml = self.$isXMLDoc = $_isXMLDoc(getDocument(self_0));
				}
				rv = $_query.filter(expr, self, null, null, flag_xml)[1];
			}
		}
		return self.advance(rv);
	},
	// #is(expr)
	//   @breif 絞り込まれた要素が存在するかどうかを返す
	//   @param expr anything
	//   @return boolean
	is: function (expr) {
		return this.eq(expr) > 0;
	},
	// #slice(start = void 0, end = void 0)
	//   @breif 区間を区切る
	//   @param start 開始位置
	//   @param end 終了位置
	//   @return $
	slice: function () {
		return this.advance(_Array_prototype_slice.apply(this, arguments));
	},
	// #find(selector)
	//   @breif ノードを選択する
	//   @param selector string
	//   @return $
	find: function (selector) {
		var self = this, rv = self.advance();
		if (self.length) {
			$_query(selector, self.get(), self.$isXMLDoc, rv, self);
		}
		return rv;
	},
	// #add(expr)
	//   @breif 要素を追加する
	//   @param expr anything
	//   @return $
	add: function (expr) {
		var self = this;
		if (expr === void 0) {
			return self.add(self.stack);
		}
		var c = 0,
		    rv = self.advance(),
		    uid,
		    node,
		    nodes = expr.nodeType || $_isFunction(expr) ? [expr] : $(expr),
		    merge = {};
		for (var i = 0, iz = self.length; i < iz; ++i) {
			node = rv[c++] = self[i];
			merge[node.uniqueID || $_data(node)] = true;
		}
		for (var i = 0, iz = nodes.length; i < iz; ++i) {
			node = nodes[i];
			uid = node.uniqueID || $_data(node);
			if (!merge[uid]) {
				merge[uid] = true;
				rv[c++] = node;
			}
		}
		rv.length = c;
		return rv;
	},
	// #closest(expr)
	//   @breif exprに合致する一番近い親要素を取得する
	//   @param expr function OR string
	//   @return $
	closest: function (expr) {
		var $expr = $_isFunction(expr) ? null : $(expr);
		return this.map(function (i) {
			var node = this;
			while (node && node.parentNode) {
				if ($expr ? $expr.index(node) > -1 : expr.call(node, i)) {
					return node;
				}
				node = node.parentNode;
			}
		});
	},
	// #advance(obj)
	//   @breif objのスタックに今のオブジェクトを詰めて、objを返す
	//   @param obj anything
	//   @return $
	advance: function (obj) {
		var rv = $(obj);
		rv.stack = this;
		rv.$isXMLDoc = this.$isXMLDoc;
		return rv;
	},
	// #end()
	//   @breif stackを復旧する
	//   @return $
	end: function () {
		return this.stack || $(null);
	},

	/*
	 * Manipulation
	 */
	// #wrap(html)
	//   @breif 指定した要素で各要素を囲む
	//   @param html anything
	//   @return this
	wrap: function (html) {
		return $_fast_each(this, function (elem, html) {
			$(elem).wrapAll(html);
		}, html);
	},
	// #wrapAll(html)
	//   @breif 指定した要素で要素をまとめて囲む
	//   @param html anything
	//   @return this
	wrapAll: function (html) {
		var self = this, self_0 = self[0];
		if (self_0) {
			$(html, self_0).map(function () {
				var elem = this;
				while (elem.firstChild) {
					elem = elem.firstChild;
				}
				return elem.appendChild ? elem : elem.parentNode;
			}).append(self);
		}
		return self;
	},
	// #wrapInner(html)
	//   @breif 指定した要素で各要素の中身を囲む
	//   @param html anything
	//   @return this
	wrapInner: function (html) {
		return $_fast_each(this, function (elem, html) {
			$(elem).contents().wrapAll(html);
		}, html);
	},
	// #replace(args)
	//   @breif 指定した要素で各要素を置き換える
	//   @param args anything
	//   @return this
	replace: function () {
		return $_fn.after.apply(this, arguments).remove();
	},
	// #empty()
	//   @breif 指定した要素を空にする
	//   @return this
	empty: function () {
		return $_fast_each(this, function (elem, node) {
			$(elem).children().remove(); //< メモリリーク対策
			while (node = elem.firstChild) {
				elem.removeChild(node);
			}
		});
	},
	// #remove(expr = void 0)
	//   @breif 指定した要素を削除する
	//   @param expr anything
	//   @return this
	remove: function (expr) {
		return $_fast_each(expr ? this.eq(expr) : this, function (elem) {
			$("*", elem).add(elem).un().removeData();
			elem.parentNode && elem.parentNode.removeChild(elem);
		});
	},
	// #clone(flag = void 0)
	//   @breif 指定した要素のクローンを作る
	//   @param flag boolean
	//   @return $
	clone: function (flag) {
		var self = this,
		    self_0 = self[0],
		    flag_xml = self.$isXMLDoc;
		if (flag_xml === null && self_0) {
			flag_xml = self.$isXMLDoc = $_isXMLDoc(getDocument(self_0));
		}
		var rv = self.advance(), i = 0, iz = rv.length = self.length;
		for (; i < iz; ++i) {
			var node = self[i], html, root;
			if (!$_support.noCloneEvent && !flag_xml) {
				html = node.outerHTML;
				root = getDocument(node);
				if (!html) {
					var div = root.createElement("div");
					div.appendChild(node.cloneNode(true));
					html = div.innerHTML;
				}
				rv[i] = $_clean([html], getDocument(node))[0];
			}
			else {
				rv[i] = node.cloneNode(true);
			}
		}

		if (flag) {
			// イベントのコピー
			var origs = self.find("*").add(), c = 0;
			$_fast_each(rv.find("*").add(), function (elem, orig, events, handlers) {
				orig = origs[c];
				if (elem.tagName === orig.tagName) {
					events = $_data(orig, "events");
					for (var type in events) {
						handlers = events[type];
						for (var uid in handlers) {
							$_event.add(elem, type, handlers[uid], handlers[uid].data);
						}
					}
					++c;
				}
			});
		}

		return rv;
	},

	/*
	 * Effect
	 */
	// #animate()
	//   @breif アニメーションする
	//   @return this
	animate: function (props, duration, easing, complete) {
		// オプションの正規化
		var tmp, step, queue = true;

		if (typeof duration === "object") {
			step     = duration.step;
			queue    = duration.queue;
			complete = duration.complete;
			easing   = duration.easing;
			duration = duration.duration;
		}
		else if (!complete) {
			complete = easing || duration;
			easing = !$_isFunction(complete) ? easing || duration :
			         complete !== easing     ? easing :  duration;
		}

		if (step && !$_isFunction(step)) {
			step = null;
		}
		if (complete && !$_isFunction(complete)) {
			complete = null;
		}

		if (!$_isFunction(easing)) {
			easing = easing && $_isFunction(tmp = $_fx.easing[easing])
			       ? tmp
			       : $_fx.easing.linear;
		}

		if ($_fx.off) {
			duration = 0;
		}
		else if (typeof duration !== "number") {
			duration = duration && typeof (tmp = $_fx.speed[duration]) === "number"
			         ? tmp
			         : $_fx.speed._default;
		}

		// アニメーションの実行
		return $_fast_each(this, queue === false ? function (elem) {
			run.call(elem);
		} : function (elem) {
			var q = $_data_queue(elem, "fx", run);
			if (q.length === 1) {
				$_data.dequeue(elem, "fx");
			}
		});

		function run(next) {
			next.lock = true;
			new $_fx(this, props, duration, easing, step, complete, queue !== false ? next : null).play();
		}
	},
	// #stop(flag_clear = false, flag_end = false)
	//   @breif アニメーション処理を停止する
	//   @param flag_clear - trueなら全てのqueueを削除し、完全に停止する
	//   @param flag_end - このqueueを削除し、最終コマのみ実行する
	//   @return this
	stop: function (flag_clear, flag_end) {
		var timers = $_fx_timers,
		    count = $_fx_count,
		    self = this;

		if (flag_clear) {
			self.clearQueue();
		}
		else {
			var used = {};
			$_fast_each(self, function (elem) {
				used[elem.uniqueID || $_data(elem)] = true;
			});
			for (var tid in timers) {
				var obj = timers[tid], node = obj.node;
				if (tid <= count && used[node.uniqueID || $_data(node)]) {
					if (flag_end) {
						obj.step(true);
					}
					delete timers[tid];
				}
			}
			if (!flag_end) {
				self.dequeue();
			}
		}
		return self;
	}
};

$_fn.init.prototype = $_fn;


var
// class
$_class = {
	// #addClass(vals)
	//   @breif クラスを追加する
	//   @param vals string
	//   @return this
	add: function (elem, vals, cache) {
		var className = elem.className;
		if (cache.$) {
			for (var key in cache) {
				if (key !== "$" && !cache[key].test(className)) {
					className += key;
				}
			}
		}
		else {
			cache.$ = true;
			for (var i = 0, val, key; val = vals[i]; ++i) {
				if (!(cache[key = " " + val] = $_CLASS_FUNC_MAKE_REG(val)).test(className)) {
					className += key;
				}
			}
		}
		elem.className = className;
	},
	// #removeClass(vals)
	//   @breif クラスを削除する
	//   @param vals string
	//   @return this
	remove: function (elem, vals, cache) {
		var className = elem.className;
		if (cache.$) {
			for (var i = 0, val; val = cache[i]; ++i) {
				className = className.replace(val, "");
			}
		}
		else {
			cache.$ = true;
			for (var i = 0, val; val = vals[i]; ++i) {
				className = className.replace(cache[i] = $_CLASS_FUNC_MAKE_REG(val), "");
			}
		}
		elem.className = className;
	},
	// #toggleClass(vals)
	//   @breif クラスの追加・削除の切り替えを行う
	//   @param vals string
	//   @return this
	toggle: function (elem, vals, cache) {
		var className = elem.className, reg;
		if (cache.$) {
			for (var key in cache) {
				if (key !== "$") {
					if ((reg = cache[key]).test(className)) {
						className = className.replace(reg, "");
					}
					else {
						className += key;
					}
				}
			}
		}
		else {
			cache.$ = true;
			for (var i = 0, val, key; val = vals[i]; ++i) {
				if ((reg = cache[key = " " + val] = $_CLASS_FUNC_MAKE_REG(val)).test(className)) {
					className = className.replace(reg, "");
				}
				else {
					className += key;
				}
			}
		}
		elem.className = className;
	}
},
// traverse content
$_traverse_content = {
	// #children(expr)
	//   @breif 子供を取得
	//   @return $
	children: function (elem) {
		var rv = [], q = -1, node = elem.firstChild;
		for (; node; node = node.nextSibling) {
			if (node.nodeType === 1 && node.tagName !== "!") {
				rv[++q] = node;
			}
		}
		return rv;
	},
	// #contents(expr)
	//   @breif 内容を取得
	//   @return $
	contents: function (elem) {
		if (elem.tagName === "IFRAME") {
			var tmp = elem.contentDocument||elem.contentWindow.document;
			if (tmp) {
				return tmp;
			}
			if (_document.frames) {
				tmp = elem.id || elem.name;
				if (!tmp) {
					elem.id = tmp = "$iframe" + (+new Date);
				}
				if (tmp = getDocument(elem).frames[tmp]) {
					return tmp.document;
				}
			}
			return;
		}
		return toArrayFromNodes(elem.childNodes);
	},
	// #parent(expr)
	//   @breif 親を取得
	//   @return $
	parent: function (elem) {
		return elem.parentNode;
	},
	// #next(expr)
	//   @breif 次の要素を取得
	//   @return $
	next: $_traverse_one("nextSibling"),
	// #children(expr)
	//   @breif 前の要素を取得
	//   @return $
	prev: $_traverse_one("previousSibling"),
	// #children(expr)
	//   @breif 親、祖先を取得
	//   @return $
	parents: $_traverse_dir("parentNode"),
	// #children(expr)
	//   @breif 次以降にある要素を取得
	//   @return $
	nexts: $_traverse_dir("nextSibling"),
	// #children(expr)
	//   @breif 前以前にある要素を取得
	//   @return $
	prevs: $_traverse_dir("previousSibling"),
	// #siblings(expr)
	//   @breif 自分を除く兄弟を全て取得
	//   @return $
	siblings: function (elem) {
		var rv = [], q = -1, node = elem.parentNode.firstChild;
		for (; node; node = node.nextSibling) {
			if (node.nodeType === 1 && node.tagName !== "!" && node !== elem) {
				rv[++q] = node;
			}
		}
		return rv;
	}
},
// traverse selector
$_traverse_selector = toHashFromString("appendTo append prependTo prepend insertAfter after insertBefore before replaceAll replaceWith"),
// manip content
$_manip_content = {
	// #append(content1, content2, ...)
	//   @breif 要素を末尾に挿入する
	//   @return $
	append: function (elem, node) {
		elem.nodeType === 1 && elem.tagName !== "!" && elem.appendChild(node);
	},
	// #prepend(content1, content2, ...)
	//   @breif 要素を先頭に挿入する
	//   @return $
	prepend: function (elem, node) {
		elem.nodeType === 1 && elem.tagName !== "!" && elem.insertBefore(node, elem.firstChild);
	},
	// #after(content1, content2, ...)
	//   @breif 要素を自分の後ろに挿入する
	//   @return $
	after: function (elem, node) {
		elem.parentNode.insertBefore(node, elem.nextSibling);
	},
	// #before(content1, content2, ...)
	//   @breif 要素を自分の前に挿入する
	//   @return $
	before: function (elem, node) {
		elem.parentNode.insertBefore(node, elem);
	}
};

function $_traverse_one(dir) {
	return function (elem) {
		for (var node = elem[dir]; node; node = node[dir]) {
			if (node.nodeType === 1 && node.tagName !== "!") {
				return [node];
			}
		}
		return [];
	};
}

function $_traverse_dir(dir) {
	return function (elem) {
		var rv = [], q = -1, node = elem[dir];
		for (; node; node = node[dir]) {
			if (node.nodeType === 1 && node.tagName !== "!") {
				rv[++q] = node;
			}
		}
		return rv;
	};
}

// generate
for (var i in $_class) (function (name, func) {
	$_fn[name] = function (vals) {
		return $_fast_each(this, func, vals.trim().split(REG_SPACE), {});
	};
})(i + "Class", $_class[i]);

for (var i in $_traverse_content) (function (name, func) {
	$_fn[name] = function (expr) {
		var self = this, rv = self.advance([]), merge = {}, node, uid;
		for (var i = 0, iz = self.length, c = 0; i < iz; ++i) {
			var nodes = func(self[i]);
			for (var j = 0, jz = nodes.length; j < jz; ++j) {
				node = nodes[i];
				uid = node.uniqueID || $_data(node);
				if (!merge[uid]) {
					merge[uid] = true;
					rv[c++] = node;
				}
			}
		}
		rv.length = c;
		if (expr !== void 0) {
			rv = rv.eq(expr);
		}
		rv.stack = self;
		return rv;
	};
})(i, $_traverse_content[i]);

for (var i in $_traverse_selector) (function (name, action) {
	$_fn[name] = function (selector) {
		var self = this, rv = [], target = $(selector);
		for (var i = 0, iz = target.length; i < iz; ++i) {
			var nodes = (i ? self.clone(true) : self).get();
			$_fn[action].apply($(target[i]), nodes);
			_Array_prototype_push.apply(rv, nodes);
		}
		return self.advance(rv);
	};
})(i, $_traverse_selector[i]);

for (var i in $_manip_content) (function (name, func) {
	var flag = name === "append" || name === "prepend";
	$_fn[name] = function () {
		var self = this, self_0 = self[0];
		if (self_0) {
			var nodes = $_clean(arguments, getDocument(self_0)), jz = nodes.length;
			if (jz) {
				var q = -1, scripts = [], guard = {}, check_script = function (node) {
					if (
						node.tagName === "SCRIPT" &&
						(!node.type || node.type.toLowerCase() === "text/javascript")
					) {
						scripts[++q] = node;
						guard[node.uniqueID || $_data(node)] = true;
						node.parentNode && node.parentNode.removeChild(node);
						return true;
					}
				};

				for (var i = 0, iz = self.length; i < iz; ++i) {
					var flag_table = flag && self[i].tagName === "TABLE";
					for (var j = 0, elem = self[i]; j < jz; ++j) {
						var node = nodes[j];
						if (i) {
							node = node.cloneNode(true);
						}
						else if (check_script(node)) {
							continue;
						}
						else if (typeof node.getElementsByTagName !== "undefined") {
							$_fast_each(node.getElementsByTagName("script"), check_script);
						}
						guard[node.uniqueID] || func(
							flag_table && node.tagName === "TR" ? (
								elem.getElementsByTagName("tbody")[0] ||
								elem.appendChild(getDocument(elem).createElement("tbody"))
							) : elem,
							node
						);
					}
				}

				// scriptの実行
				for (var i = 0, iz = scripts.length; i < iz; ++i) {
					var script = scripts[i];
					if (script.src) {
						$_ajax({
							url: script.src,
							async: false,
							dataType: "script"
						});
					}
					else {
						evalScript(script.text || script.textContent || script.innerHTML || "");
					}
				}
			}
		}
		return self;
	};
})(i, $_manip_content[i]);

// スクロールの取得
$_fast_each(["Left", "Top"], function (Name) {
	var flag_left = Name === "Left",
	    scrollName = "scroll" + Name,
	    pageOffset = flag_left ? "pageXOffset" : "pageYOffset";

	// #scrollLeft, scrollTop(val)
	//   @breif スクロールする
	$_fn[scrollName] = function (val) {
		var elem = this[0], doc;
		if (val === void 0) {
			if (!elem) {
				return;
			}
			if (elem.writeln) {
				doc = elem;
				elem = getWindow(elem, _window);
			}
			if (elem.alert) {
				doc = doc || elem.document || _document;
				return elem[pageOffset] ||
				       (doc.documentElement || _document_documentElement)[scrollName] ||
				       (doc.body || _document.body)[scrollName];
			}
			return elem[scrollName];
		}
		return $_fast_each(this, function (elem, val, $win) {
			if (elem.writeln) {
				elem = getWindow(elem, _window);
			}
			if (elem.scrollTo) {
				$win = $(elem);
				elem.scrollTo(
					 flag_left ? val : $win.scrollLeft(),
					!flag_left ? val : $win.scrollTop()
				);
			}
			else {
				elem[scrollName] = val;
			}
		}, val);
	};

});

// 幅高さの取得
$_fast_each(["Width", "Height"], function (Name) {
	var name = Name.toLowerCase(),
	    is_width = name === "width",
	    TL = is_width ? "Left" : "Top",
	    BR = is_width ? "Right" : "Bottom";

	$_fn["inner" + Name] = function () {
		return this[0] ? $_css[name](this[0], "padding") : void 0;
	};

	$_fn["outer" + Name] = function (flag) {
		return this[0] ? $_css[name](this[0], flag ? "margin" : "border") : void 0;
	};

	$_fn[name] = function (size) {
		var elem = this[0], clientName = "client" + Name, prop = {};
		if (elem.alert) {
			var doc = elem.document || _document;
			return doc.documentElement[clientName] || doc.body[clientName] || elem["inner" + Name]; //< 怪しい
		}
		if (elem.writeln) {
			var root = elem.documentElement || _document_documentElement,
			    body = elem.body || _document.body,
			    scrollName = "scroll" + Name,
			    offsetName = "offset" + Name;
			return _Math_max(
				root[clientName], body[clientName],
				root[scrollName], body[scrollName],
				root[offsetName], body[offsetName]
			);
		}
		if (size === void 0) {
			return $_css[name](elem);
		}
		prop[name] = typeof size === "string" ? size : size + "px";
		return $_fast_each(this, $_css_set, prop, {});
	};

	$_css[name] = function (elem, extra) {
		var rv,
		    flag_hide = !elem.offsetWidth,
		    stack = {},
		    style = elem.style;

		if (flag_hide) {
			for (var i in CSS_HIDE_PROP) {
				stack[i] = style[i];
				style[i] = CSS_HIDE_PROP[i];
			}
		}

		rv = elem["offset" + Name];

		if (extra !== "border") {
			$_fast_each([TL, BR], function (Name, elem, extra, _parseFloat) {
				if (!extra) {
					rv -= _parseFloat($_css_get(elem, "padding" + Name, true)) || 0;
				}
				if (extra === "margin") {
					rv += _parseFloat($_css_get(elem, "margin" + Name, true)) || 0;
				}
				else {
					rv -= _parseFloat($_css_get(elem, "border" + Name + "Width", true)) || 0;
				}
			}, elem, extra, parseFloat);
		}

		if (flag_hide) {
			for (var i in stack) {
				style[i] = stack[i];
			}
		}

		return _Math_max(0, _Math_round(rv));
	};
});

// オフセットの取得
$_fn.offset = _document_documentElement.getBoundingClientRect ? function (vals) {
	if (vals) {
		return $_fast_each(this, $_offset_set, vals);
	}

	var elem = this[0], doc = getDocument(elem);
	if (!elem || !elem.nodeType) {
		return;
	}
	if (elem === doc.body) {
		return $_offset_body(elem);
	}

	var
		box = elem.getBoundingClientRect(),
		win = getWindow(doc, _window),
		body = doc.body,
		root = doc.documentElement,
		rv = {
			top : box.top
			    + (_window.pageYOffset || $_support.boxModel && root.scrollTop || body.scrollTop)
			    - (root.clientTop || body.clientTop || 0),
			left: box.left
			    + (_window.pageXOffset || $_support.boxModel && root.scrollLeft || body.scrollLeft)
			    - (root.clientLeft || body.clientLeft || 0)
		};

	body = root = null;

	return rv;
} : function (vals) {
	if (vals) {
		return $_fast_each(this, $_offset_set, vals);
	}

	var elem = this[0], doc = getDocument(elem);
	if (!elem || !elem.nodeType) {
		return;
	}
	if (elem === doc.body) {
		return $_offset_body(elem);
	}

	$_offset_init && $_offset_init();

	var _parseFloat = parseFloat,
	    offsetParent = elem.offsetParent,
	    prevOffsetParent = elem,
	    doc = elem.ownerDocument,
	    computedStyle,
	    root = doc.documentElement,
	    body = doc.body,
	    getComputedStyle = doc.defaultView.getComputedStyle,
	    prevComputedStyle = getComputedStyle(elem, null),
	    top = elem.offsetTop,
	    left = elem.offsetLeft,
	    hash_table = $_OFFSET_HASH_TABLE;

	while ((elem = elem.parentNode) && elem !== body && elem !== root) {
		if ($_offset_supportsFixedPosition && prevComputedStyle.position === "fixed") {
			break;
		}

		computedStyle = getComputedStyle(elem, null);
		top  -= elem.scrollTop;
		left -= elem.scrollLeft;

		if (elem === offsetParent) {
			top  += elem.offsetTop;
			left += elem.offsetLeft;

			if ($_offset_doesNotAddBorder && !($_offset_doesAddBorderForTableAndCells && hash_table[elem.tagName])) {
				top  += _parseFloat(computedStyle.borderTopWidth)  || 0;
				left += _parseFloat(computedStyle.borderLeftWidth) || 0;
			}

			prevOffsetParent = offsetParent;
			offsetParent = elem.offsetParent;
		}

		if ($_offset_subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible") {
			top  += _parseFloat(computedStyle.borderTopWidth)  || 0;
			left += _parseFloat(computedStyle.borderLeftWidth) || 0;
		}

		prevComputedStyle = computedStyle;
	}

	if (prevComputedStyle.position === "relative" || prevComputedStyle.position === "static") {
		top  += body.offsetTop;
		left += body.offsetLeft;
	}

	if ($_offset_supportsFixedPosition && prevComputedStyle.position === "fixed") {
		top  += _Math_max(root.scrollTop, body.scrollTop);
		left += _Math_max(root.scrollLeft, body.scrollLeft);
	}

	return { top: top, left: left };
};

// オフセット
function $_offset_init() {
	var
		body = _document.body,
		div = _document.createElement("div"),
		inner_div, check_div, table, td,
		div_style = div.style, 
		inner_div_style, check_div_style,
		div_style_prop = toHashFromString("position absolute top 0 left 0 margin 0 border 0 width 1px height 1px visibility hidden");
	for (var i in div_style_prop) {
		div_style[i] = div_style_prop[i];
	}
	div.innerHTML = '<div style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;"><div></div></div><table style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>';
	body.insertBefore(div, body.firstChild);

	inner_div = div.firstChild;
	check_div = inner_div.firstChild;
	inner_div_style = inner_div.style;
	check_div_style = check_div.style;
	td = inner_div.nextSibling.firstChild.firstChild;

	$_offset_doesNotAddBorder = (check_div.offsetTop !== 5);
	$_offset_doesAddBorderForTableAndCells = (td.offsetTop === 5);

	check_div_style.position = "fixed";
	check_div_style.top = "20px";
	$_offset_supportsFixedPosition = (check_div.offsetTop === 20 || check_div.offsetTop === 15);

	check_div_style.position = check_div_style.top = "";

	inner_div_style.overflow = "hidden";
	inner_div_style.position = "relative";
	$_offset_subtractsBorderForOverflowNotVisible = (check_div.offsetTop === -5);
	$_offset_doesNotIncludeMarginInBodyOffset = (body.offsetTop !== (parseFloat($_css_get(body, "marginTop", true)) || 0));

	body.removeChild(div);
	body = div = inner_div = check_div = table = td = null;
	$_offset_init = null;
}

function $_offset_body(body) {
	var top = body.offsetTop,
	    left = body.offsetLeft,
	    _parseFloat = parseFloat;

	$_offset_init && $_offset_init();

	if ($_offset_doesNotIncludeMarginInBodyOffset) {
		top  += _parseFloat($_css_get(body, "marginTop",  true) ) || 0;
		left += _parseFloat($_css_get(body, "marginLeft", true) ) || 0;
	}

	return { top: top, left: left };
}

function $_offset_set(elem, vals) {
	if ($_css_get(elem, "position") === "static") {
		elem.style.position = "relative";
	}

	var _parseInt = parseInt,
	    $elem = $(elem),
	    offset = $elem.offset(),
	    props = {};

	if (typeof vals.top === "number") {
		props.top = vals.top
		          - offset.top
		          + (_parseInt($_css_get(elem, "top",  true), 10) || 0);
	}
	if (typeof vals.left === "number") {
		props.left = vals.left
		           - offset.left
		           + (_parseInt($_css_get(elem, "left",  true), 10) || 0);
	}

	$elem.css(props);
}


// $_fast_each(self, fn, arg1 = void 0, arg2 = void 0, arg3 = void 0)
//   @breif callで呼び出さないため高速なeach
//   @param self array like object
//   @param fn function
//   @param argN anything[]
//   @return self
function $_fast_each(self, fn, arg1, arg2, arg3) {
	for (var i = 0, iz = self.length;
	     i < iz && fn(self[i], arg1, arg2, arg3) !== false;
	     ++i);
	return self;
}


/*--------------------------------------
 * Functions
 *------------------------------------*/

// mix(src, dst)
//   @breif 上書きせずにsrcをdstで拡張する
//   @param src object
//   @param dst object
//   @return src
function mix(src, dst) {
	for (var i in dst) {
		src[i] || (src[i] = dst[i]); // i in src
	}
	return src;
}

// evalScript(data)
//   @breif dataのソースを実行する
//   @param data string
function evalScript(data) {
	if (data && /\S/.test(data)) {
		var root = HEAD || _document_documentElement,
		    script = _document.createElement("script");
		script.type = "text/javascript";
		if ($_support.scriptEval) {
			script.appendChild(_document.createTextNode(data));
		}
		else {
			script.text = data;
		}

		root.insertBefore(script, root.firstChild);
		root.removeChild(script);
		root = script = null;
	}
}

// escapeRegExp(str)
//   @breif 正規表現のエスケープを行う（\n等のエスケープ文字は行わない）
//   @param str string
//   @return string
//function escapeRegExp(str) {
//	return str.replace(FN_REG_ESCAPE_REGEXP, "\\$1");
//}

// andRegExp(words, sep)
//   @breif ある単語のANDマッチする正規表現を生成する
//   @param words string[]
//   @param sep string
//   @return RegExp
//function andRegExp(words, sep) {
//	return new RegExp(words.length > 1 && $_support.andRegExp ? "^(?=.*" + sep + words.join(sep + ")(?=.*" + sep) + sep + ")" : sep + words[0] + sep);
//}

// andSearch(target, words)
//   @breif ある文字列に全ての文字列が含まれているかどうか
//   @param target string
//   @param words string[]
//   @return boolean
function andSearch(target, words) {
	for (var i = 0, iz = words.length; i < iz; ++i) {
		if (target.indexOf(words[i]) === -1) {
			return false;
		}
	}
	return true;
}

// andSearchString(word, sep, fix, sep, reg)
//   @breif ある文字列をregで分割して、にprefixとsurfixを前後につけて返す
//   @param query string
//   @param fix string
//   @param sep string
//   @param reg regexp
//   @return string[]
function andSearchInit(word, fix, reg) {
	var tmp = fix + "\t" + fix;
	return (fix + (reg ? ("" + word).replace(reg, tmp) : word.join(tmp)) + fix).split("\t");
}

// getDocument(node)
//   @breif ドキュメントルートを取得する。セレクター関数などでは利用していない。
//   @param node DOMElement
//   @return DOMDocument
function getDocument(node) {
	return node.ownerDocument || node.document || _document; //< node.documentはIE5.x対応のため OR nodeがwindowの時
}

// getWindow(context)
//   @breif ドキュメントルートからwindowを取得する。
//   @param context DOMDocument
//   @return DOMWindow
function getWindow(context, default_window) {
	return context.defaultView || context.parentWindow || default_window; //< context.parentWindowはIE用
}

// toArray(obj)
//   @breif 配列を無理矢理作る
//   @param obj anything
//   @return Array
function toArray(obj) {
	var rv = [];
	if (obj != null) {
		var i = obj.length;
		if (i == null || typeof obj === "string" || obj.alert || $_isFunction(obj)) {
			rv[0] = obj;
		}
		else {
			while (i) {
				rv[--i] = obj[i];
			}
		}
	}
	return rv;
}

// toHashFromString(str)
//   @breif スペース区切り文字列の奇数番目をキー、偶数番目を値にして、ハッシュを生成する
//   @param str string
//   @return Object
function toHashFromString(str) {
	var rv = {}, v, i = 0, arr = str.split(" ");
	while (v = arr[i++]) {
		rv[v] = arr[i++];
	}
	return rv;
}

// toHashNumberFromString(str)
//   @breif スペース区切り文字列をキーにして、連番を値にした、ハッシュを生成する
//   @param str string
//   @return Object
function toHashNumberFromString(str) {
	var rv = {}, v, i = 0, arr = str.split(" ");
	while (v = arr[i++]) {
		rv[v] = i;
	}
	return rv;
}

// numberPad2(num)
//   @breif 数字を二桁にそろえる
//   @param num number >=0
//   @return string
function numberPad2(num) {
	return num < 10 ? "0" + num : num;
}

// True()
//   @breif trueを返す関数
function True() {
	return true;
}

// False()
//   @breif falseを返す関数
function False() {
	return false;
}

// Empty()
//   @breif 空の関数
function Empty() {}


/*--------------------------------------
 * ECMAScript-262 5th
 *------------------------------------*/

/*
 * Function
 */

mix(_Function_prototype, {
	bind: function () {
		var fn = this, args = _Array_prototype_slice.call(arguments), me = args.shift();
		return function () {
			return fn.apply(me, args.concat(_Array_prototype_slice.call(arguments)));
		};
	}
});


/*
 * Array
 * i in thisが削られているのはIE5対応のため
 */

mix(_Array_prototype, {
	indexOf: function (target, start) {
		var self = this, iz = self.length, i = start || 0;
		i = i < 0 ? i + iz : i;
		for (; i < iz; ++i) {
			if (self[i] === target) {
				return i;
			}
		}
		return -1;
	},
	lastIndexOf: function (target, start) {
		var self = this, iz = self.length, i = start;
		i = i < 0 ? i + iz : iz - 1;
		for (; i > -1; --i) {
			if (self[i] === target) {
				return i;
			}
		}
		return -1;
	},
	every: function (fn, me) {
		for (var self = this, i = 0, iz = self.length; i < iz; ++i) {
			if (self[i] !== void 0 && !fn.call(me, self[i], i, self)) {
				return false;
			}
		}
		return true;
	},
	some: function (fn, me) {
		for (var self = this, i = 0, iz = self.length; i < iz; ++i) {
			if (self[i] !== void 0 && fn.call(me, self[i], i, self)) {
				return true;
			}
		}
		return false;
	},
	forEach: function (fn, me) {
		for (var self = this, i = 0, iz = self.length; i < iz; ++i) {
			self[i] !== void 0 && fn.call(me, self[i], i, self);
		}
	},
	map: function (fn, me) {
		for (var self = this, iz = self.length, rv = Array(iz), i = 0; i < iz; ++i) {
			self[i] !== void 0 && (rv[i] = fn.call(me, self[i], i, self));
		}
		return rv;
	},
	filter: function (fn, me) {
		for (var self = this, rv = [], ri = -1, v, i = 0, iz = self.length; i < iz; ++i) {
			if (self[i] !== void 0) {
				v = self[i];
				fn.call(me, v, i, self) && (rv[++ri] = v);
			}
		}
		return rv;
	},
	reduce: function (fn, val) {
		var self = this, rv, i = 0, iz = self.length, found = 0;
		if (val !== void 0) {
			rv = val;
			++found;
		}
		for (; i < iz; ++i) {
			if (self[i] !== void 0) {
				rv = found ? fn(rv, self[i], i, self) : (++found, self[i]);
			}
		}
		if (!found) throw "";
		return rv;
	},
	reduceRight: function (fn, val) {
		var self = this, rv, i = 0, found = 0;
		if (val !== void 0) {
			rv = val;
			++found;
		}
		for (i = self.length - 1; i >= 0; --i) {
			if (self[i] !== void 0) {
				rv = found ? fn(rv, self[i], i, self) : (++found, self[i]);
			}
		}
		if (!found) {
			throw "";
		}
		return rv;
	}
});


/*
 * String
 */

mix(_String.prototype, {
	trim: function () {
		return this.replace(REG_TRIM, "");
	}
});


/*
 * Date
 */

mix(_Date, {
	now: function () {
		return +new Date;
	}
});

mix(_Date_prototype, {
	toISOString: function () {
		var self = this, ms = self.getUTCMilliseconds();
		return   isFinite(self.valueOf()) ?
		                  self.getUTCFullYear()     + "-" +
		       numberPad2(self.getUTCMonth() + 1)   + "-" +
		       numberPad2(self.getUTCDate())        + "T" +
		       numberPad2(self.getUTCHours())       + ":" +
		       numberPad2(self.getUTCMinutes())     + ":" +
		       numberPad2(self.getUTCSeconds())     + "." +
		       (ms < 10 ? "00" : ms < 100 ? "0" : "")     +
		                  self.getUTCMilliseconds() + "Z" : null;
	}
});


/*
 * *.toJSON
 */
/*
_Date_prototype.toJSON || (_Date_prototype.toJSON = _Date_prototype.toISOString);

$_fast_each([Boolean, Number, _String], function (f) {
	f = f.prototype;
	f.toJSON || (f.toJSON = f.valueOf);
});
//*/

/*
 * JSON
 * by http://www.json.org/json2.js
 */
/*
if (!_window.JSON) {
	var _JSON_REG_QUOTE      = /["\b\f\n\r\t\\]/g,
	    // Opera 9.xでバグるため
	    //_JSON_REG_QUOTE      = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	    //_JSON_REG_PARSE_CX   = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	    _JSON_REG_PARSE_CH   = /\\(["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	    _JSON_REG_PARSE_LI   = /"[^"\\\n\r]*"|true|false|null|-?\d+(\.\d*)?([eE][+\-]?\d+)?/g,
	    _JSON_REG_PARSE_MK   = /(^|:|,)(\s*\[)+/g,
	    _JSON_REG_PARSE_TEST = /^[\],:{}\s]*$/,
	    _JSON_HASH_QUOTE     = toHashFromString('" \\" \b \\b \f \\f \n \\n \r \\r \t \\t \\ \\\\');

	function _JSON_FUNC_QUOTE($0) {
		//var ch = _JSON_HASH_QUOTE[$0];
		//return ch ? ch : "\\u" + ("0000" + $0.charCodeAt(0).toString(16)).slice(-4);
		return _JSON_HASH_QUOTE[$0];
	}

	//function _JSON_FUNC_PARSE_CX($0) {
	//	return "\\u" + ("0000" + $0.charCodeAt(0).toString(16)).slice(-4);
	//}

	function _JSON_quote(str) {
		return '"' + str.replace(_JSON_REG_QUOTE, _JSON_FUNC_QUOTE) + '"';
	}

	function _JSON_toString(key, obj, gap, rep, indent) {
		var val = obj[key], gap_origin = gap;
		if (typeof val === "object" && typeof val.toJSON === "function") {
			val = val.toJSON(key);
		}
		if (typeof rep === "function") {
			val = rep.call(obj, key, val);
		}

		switch (typeof val) {
			case "string":
				return _JSON_quote(val);
			case "number":
				return isFinite(val) ? String(val) : "null";
			case "boolean":
			case "null":
				return String(val);
			default:
				if (!val) {
					return "null";
				}
				gap += indent;
				if ($_isArray(val)) {
					var i = 0, iz = val.length, rv = Array(iz);
					for (; i < iz; ++i) {
						rv[i] = _JSON_toString(i, val, gap, rep, indent) || "null";
					}
					return !rv.length ? "[]" :
					       gap        ? "[\n" + gap + rv.join(",\n" + gap) + "\n" + gap_origin + "]" :
					                    "[" + rv.join(",") + "]";
				}
				var q = -1, rv = [], k, v, sep = gap ? ": " : ":";
				if (rep && typeof rep === "object") {
					for (var i = 0, iz = rep.length; i < iz; ++i) {
						k = rep[i];
						if (typeof k === "string") {
							v = _JSON_toString(k, val, gap, rep, indent);
							if (v) {
								rv[++q] = _JSON_quote(k) + sep + v;
							}
						}
					}
				}
				else {
					for (k in val) {
						if (_Object_hasOwnProperty.call(val, k)) {
							v = _JSON_toString(k, val, gap, rep, indent);
							if (v) {
								rv[++q] = _JSON_quote(k) + sep + v;
							}
						}
					}
				}
				return !rv.length ? "{}" :
				       gap        ? "{\n" + gap + rv.join(",\n" + gap) + "\n" + gap_origin + "}" :
				                    "{" + rv.join(",") + "}";
		}
	}

	function _JSON_walk(key, obj, rev) {
		var k, v, val = obj[key];
		if (val && typeof val === "object") {
			for (k in val) {
				if (_Object_hasOwnProperty.call(val, k)) {
					v = _JSON_walk(k, val, rev);
					if (v !== void 0) {
						val[k] = v;
					}
					else {
						delete val[k];
					}
				}
			}
		}
		return rev.call(obj, key, val);
	}

	_window.JSON = {
		stringify: function (val, rep, space) { // rep = void 0, space = void 0
			var indent = "", typeof_space = typeof space;
			if (typeof_space === "number") {
				for (var i = 0; i < space; ++i) {
					indent += " ";
				}
			}
			else if (typeof_space === "string") {
				indent = space;
			}
			return _JSON_toString("", { "": val }, "", rep, indent);
		},
		parse: function (str, rev) { // rev = void 0
			//str = str.replace(_JSON_REG_PARSE_CX, _JSON_FUNC_PARSE_CX);
			if (_JSON_REG_PARSE_TEST.test(
				str.replace(_JSON_REG_PARSE_CH, "@")
				   .replace(_JSON_REG_PARSE_LI, "]")
				   .replace(_JSON_REG_PARSE_MK, "")
			)) {
				//var rv = eval("(" + str + ")");
				var rv = (new Function("return " + str))();
				return $_isFunction(rev) ? _JSON_walk("", { "": rv }, rev) : rv;
			}
			throw new SyntaxError("JSON.parse");
		}
	};
}
//*/

/*--------------------------------------
 * Initialize
 *------------------------------------*/

$document = $(_document);
$document.$isXMLDoc = false;

// $.support
$(function(){
	var div = _document.createElement("div"),
	    body = _document.body;
	div.style.width = div.style.paddingLeft = "1px";
	body.appendChild(div);
	$_support.boxModel = div.offsetWidth === 2;
	body.removeChild(div).style.display = "none";
	body = div = null;
});

// メモリー解放
$(_window).on("unload", function () {
	HEAD = _document_documentElement = _document_defaultView = null;
	var handle;
	for (var uid in $_cache) {
		if (uid != -1 && (handle = $_cache[uid].handle)) {
			$_event.remove(handle.node);
		}
	}
});

//@
})(this, document);


/*--------------------------------------
 * Debug
 *------------------------------------* /

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

Array.prototype.forEach || (Array.prototype.forEach = function(fn,me){
	for(var i=0,sz=this.length;i<sz;++i){fn.call(me,this[i],i,this);}
});
var CSSSelector = function (selector) {
	return $(selector).get();
};

//*/