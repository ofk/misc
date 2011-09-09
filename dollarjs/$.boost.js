/*--------------------------------------
 * $.boost.js - old browser support
 *
 * Author: ofk
 * Modify: Sun, 15 Nov 2009 12:22:37 JMT
 *
 * Support Browser:
 * - IE 5
 * - Safari 1.x & 2.x
 *--------------------------------------
 * TOC:
 * - Object
 * - Array.prototype
 * - String.prototype
 * - Function.prototype
 * - Math
 * - encode*, decode*
 *--------------------------------------
 * Memo:
 * evalを利用し、ソースが構築される部分が存在
 * するため、コンプレッサーは使えないと思われる
 *------------------------------------*/

(function (W, O, A, S, F, M) {

/*--------------------------------------
 * Object
 *------------------------------------*/

O.hasOwnProperty || (O.hasOwnProperty = function (k) {
	return this[k] !== this.constructor.prototype[k];
});

O.hasOwnProperty.call || (O.hasOwnProperty.call = function (o, k) {
	return o[k] !== o.constructor.prototype[k];
});


/*--------------------------------------
 * Array.prototype
 *------------------------------------*/

A.pop || (A.pop = function () {
	var q = this, l = q.length, r;
	if (l) {
		r = q[l - 1];
		delete q[l - 1]
		--q.length;
	}
	return r;
});

A.push || (A.push = function () {
	var q = this, a = arguments, l = q.length, i = 0, j = a.length;
	for (; i < j; ++i, ++l)
		q[l] = a[i];
	return (q.length = l);
},
// applyの時は特別に処理することで高速化を図る
A.push.apply = function (x, y) {
	var l = x.length || 0, i = 0, j = y.length;
	for (; i < j; ++i, ++l)
		x[l] = y[i];
	return (x.length = l);
});

A.shift || (A.shift = function () {
	var q = this, r = q[0], j = q.length;
	for(var i = 1; i < j; ++i)
		q[i - 1] = q[i];
	j && --q.length;
	return r;
});

A.unshift || (A.unshift = function () {
	var q = this, a = arguments, l = a.length, j = q.length = (q.length || 0) + l;
	for (var i = j - 1; i >= l; --i)
		q[i] = q[i - l];
	for (var i = 0; i < l; ++i)
		q[i] = a[i];
	return j;
});

A.splice || (A.splice = function (x, y) {
	var q = this, a = arguments, s = a.length - 2 - y, r = q.slice(x, x + y);
	if (s > 0) {
		for (var i = q.length - 1, j = x + y; i >= j; --i)
			q[i + s] = q[i];
	}
	else if (s < 0) {
		for (var i = x + y, j = q.length; i < j; ++i)
			q[i + s] = q[i];
		q.length += s;
	}
	for (var i = 2, j = a.length; i < j; ++i)
		q[i - 2 + x] = a[i];
	return r;
});

// sliceもcallとapplyで特殊処理をする
A.slice.call || (A.slice.call = function () {
	var a = arguments, x = a[0], y = [], j = a.length;
	if (j === 1) {
		for (var i = 0, j = x.length; i < j; ++i)
			y[i] = x[i];
		return y;
	}
	for (var i = 1; i < j; ++i)
		y[i - 1] = a[i]
	return A.slice.apply(x, y);
});
A.slice.apply || (A.slice.apply = function (x, y) {
	var r = [], i, j, q = -1;
	if (y) {
		i = y[0];
		j = y[1];
	}
	if (i === void 0) i = 0;
	if (j === void 0) j = x.length;
	for (; i < j; ++i)
		r[++q] = x[i];
	return r;
});


/*--------------------------------------
 * String.prototype
 *------------------------------------*/

// replace(RegExp, Function)対応
if ("a".replace(/./,function(x, y, z){ return x + y + z; }) !== "a0a") (function () {
	var g = S.replace;
	S.replace = function (x, y) {
		var s = this, z = y;
		// 第二引数が関数
		if (y instanceof Function) {
			// 第一引数が正規表現
			if (x instanceof RegExp) {
				// その上、グローバルマッチ
				if (x.global || /^\/.*g$/.test(x)) {
					var r = [], m, v = 0;
					while ((m = x.exec(s)) != null) {
						var i = m.index, l = m[0].length;
						r[r.length] = s.slice(0, i);
						s = s.slice(i + l);
						v += i;
						r[r.length] = y.apply(null, m.concat(v, this));
						v += l;
					}
					r[r.length] = s;
					return r.join("");
				}
				var m = x.exec(s);
				if (!m)
					return s;
				z = y.apply(null, m.concat(m.index, s));
			}
			else {
				var i = s.indexOf(x);
				if (i < 0)
					return s;
				z = y(x, i, s);
			}
		}
		return g.call(s, x, z);
	};
})();


/*--------------------------------------
 * Function.prototype
 *------------------------------------*/

F.apply || (F.apply = function (x, y) {
	x = x || window; // 循環するとなんか怖いのでWを用いない
	y = y ||[];
	x.$apply = this;
	var r, j = y.length, p;
	if (!x.$apply) {
		p = x.constructor.prototype;
		p.$apply = this;
	}
	switch (j) {
		case 0: r = x.$apply(); break;
		case 1: r = x.$apply(y[0]); break;
		case 2: r = x.$apply(y[0], y[1]); break;
		case 3: r = x.$apply(y[0], y[1], y[2]); break;
		case 4: r = x.$apply(y[0], y[1], y[2], y[3]); break;
		default:
			var a = [];
			for (var i = 0; i < j; ++i)
				a[i] = "y[" + i + "]";
			r = eval("x.$apply(" + a.join(",") + ")"); //< このため、圧縮できないことに留意
			break;
	}
	try {
		x.$apply = void 0;
		delete x.$apply;
	} catch (e) {}
	if (p)
		try {
			p.$apply = void 0;
			delete p.$apply;
		} catch (e) {}
	return r;
});

// applyに丸投げ
F.call || (F.call = function () {
	var a = arguments, x = a[0], y = [];
	for (var i = 1, j = a.length; i < j; ++i)
		y[i - 1] = a[i];
	return this.apply(x, y);
});


/*--------------------------------------
 * Math
 *------------------------------------*/

M.max(1, 2, 3) === 3 || (M.max = function () {
	var r = -1 / 0, a = arguments;
	for (var i = 0, j = a.length; i < j; ++i) {
		var n = a[i];
		if (typeof n !== "number") n = parseFloat(n);
		if (isNaN(n)) return n;
		if (r < n) r = n;
	}
	return r;
});

M.min(3, 2, 1) === 1 || (M.min = function () {
	var r = 1 / 0, a = arguments;
	for (var i = 0, j = a.length; i < j; ++i) {
		var n = a[i];
		if (typeof n !== "number") n = parseFloat(n);
		if (isNaN(n)) return n;
		if (r > n) r = n;
	}
	return r;
});


/*--------------------------------------
 * encode*, decode*
 * by http://nurucom-archives.hp.infoseek.co.jp/digital/trans-uri.html
 *------------------------------------*/

W.encodeURI || (W.encodeURI = function (x) {
	return ("" + x).replace(/[^!#$&-;=?-Z_a-z~]/g, function (s) {
		var c = s.charCodeAt(0), p = "%";
		return (
			c < 16 ? "%0" + c.toString(16) :
			c < 128 ? p + c.toString(16) :
			c < 2048 ? p + (c >> 6 | 192).toString(16) + p + (c & 63 | 128).toString(16) :
			p + (c >> 12 | 224).toString(16) + p + (c >> 6 & 63 | 128).toString(16) + p + (c & 63 | 128).toString(16)
		).toUpperCase();
	});
});

W.encodeURIComponent || (W.encodeURIComponent = function (x) {
	return ("" + x).replace(/[^!'-*.0-9A-Z_a-z~-]/g, function (s) {
		var c = s.charCodeAt(0), p = "%";
		return (
			c < 16 ? "%0" + c.toString(16) :
			c < 128 ? p + c.toString(16) :
			c < 2048 ? p + (c >> 6 | 192).toString(16) + p + (c & 63 | 128).toString(16) :
			p + (c >> 12 | 224).toString(16) + p + (c >> 6 & 63 | 128).toString(16) + p + (c & 63 | 128).toString(16)
		).toUpperCase();
	});
});

W.decodeURI || (W.decodeURI = function (x) {
	return ("" + x).replace(/%(E(0%[AB]|[1-CEF]%[89AB]|D%[89])[0-9A-F]|C[2-9A-F]|D[0-9A-F])%[89AB][0-9A-F]|%[0-7][0-9A-F]/ig, function (s) {
		var f = parseInt, c = f(s.substring(1), 16);
		return String.fromCharCode(
			c < 128 ? c :
			c < 224 ? (c & 31) << 6 | f(s.substring(4), 16) & 63 :
			((c & 15) << 6 | f(s.substring(4), 16) & 63) << 6 | f(s.substring(7), 16) & 63
		);
	});
});

// 手抜き
W.decodeURIComponent || (W.decodeURIComponent = W.decodeURI);

})(this, Object, Array.prototype, String.prototype, Function.prototype, Math);
