(function () {

/*
 * keychar.js
 *
 * キー入力コードを文字列に変換する。
 * - getKeyChar(event); // 'a', 'C-a', etc.
 * - evt.keyChar(); // jQueryのみ
 *
 * 手動テスト
 * - a, z, 1, 0, f7 （同時押し無し）
 * - shift + 上記キー
 * - ctrl + 上記キー
 * - その他記号キー（+fnキー含む）
 * - numlock
 * - 全角が有効な場合
 *
 * 仕様
 * all:
 * - [brk] => "C-brk"
 * - [fn]+[.] => "del"
 * fx:
 * - [numlk]+[+] => ";"
 * op:
 * - [win] => "["
 * - [@] => "2"
 * - [^] => "6"
 * - [numlk]+[-] => "ins"
 * - [numlk]+[.] => "n"
 */

var	// ブラウザ判定
	const_isie = !!document.uniqueID,
	const_isop = !!this.opera,
	// キーコード変換テーブル
	const_kt = {
		3: 'brk', //< all:ud, cr:+p
		8: 'bs', 9: 'tab', //< all:ud, fx:+p
		13: 'enter', //< all:udp
		16: 'shift', 17: 'ctrl', 18: 'alt', //< all:ud
		19: 'pus', //< all:ud, fx:+p
		20: 'caps', //< op:d
		27: 'esc', //< all:ud
		28: 'conv', 29: 'noconv', 44: 'psc', //< all:u
		45: 'ins', 46: 'del', 91: 'win', //< all:ud, fx:+p
		59: const_isop ? 'colon' : ':', //< op:u, fx:u
		93: 'context', 144: 'numlk', 145: 'scrlk', //< all:ud
		194: '\\', //< op:u （必ずshiftが押されるので_になる）
		197: 'ime', 208: 'caps', //< op:d
		226: '\\', //< all:ud
		229: 'ime', //< all:d
		240: 'kana', 242: 'caps', 243: 'zen', 244: 'han', //< all:u
		57351: 'context' //< op:udp
	},
	const_kt_32_40 = ' ,pgup,pgdn,end,home,left,up,right,down'.split(','),
	// 記号キー入力変換テーブル
	const_kt_shift = {
		'1': '!', '2': '"', '3': '#', '4': '$', '5': '%',
		'6': '&', '7': "'", '8': '(', '9': ')',
		',': '<', '.': '>', '/': '?',
		';': '+', ':': '*', '@': '`',
		'-': '=', '^': '~',
		'[': '{', ']': '}'
	};

// Operaのテンキーテーブルの追加。
if (const_isop) {
	const_kt[42] = '*';
	const_kt[43] = '+';
	const_kt[47] = '/';
}

/**
 * イベントからキー文字列（keyChar）を判定する。
 *
 * @param {Event} evt イベントオブジェクト。type、keyCode、charCode、whichを参照している。
 * @return {String} キー文字列。ｌ
 */
this.getKeyChar = getKeyChar;
function getKeyChar(evt) {
	var	// 文字コード→文字。
		fcc = String.fromCharCode,
		// Firefoxの判定。（一部テーブルが特殊なため）
		isfx = !!evt.originalTarget,
		// typeの判定。
		iskd = evt.type === 'keydown',
		iskp = evt.type === 'keypress',
		// keyCode。
		kc = evt.keyCode,
		// !evt.which。
		f_which = !const_isie && !evt.which,
		// fccにかけても構わないデータ。
		cc = evt.charCode || (iskp && 32 <= kc && kc <= 126 ? kc : 0);

	// charCodeとkeyCodeが同じものを返すときは、keyCodeが正しいと見做す。
	if (cc === kc && f_which) {
		cc = 0;
	}

	// IEのkeypressでCtrl押しながらのkeyCodeの値を修正する。
	if (const_isie && iskp && evt.ctrlKey) {
		// Ctrl+Enter
		if (kc === 10) {
			kc = 13;
		}
		// Ctrl+A..Z
		else {
			cc = kc + 64;
		}
	}

	var k = (
		// f1 - f12 (fxのみkeypressも拾える)
		112 <= kc && kc <= 123 && (!iskp || f_which) ? 'f' + (kc - 111) :
		// keypress
		cc ? fcc(cc) :
		// keydown a-z
		  65 <= kc && kc <=  90 ? fcc(kc + 32) :
		// keydown sign
		 188 <= kc && kc <= 191 ? fcc(kc - 144) :
		(186 <= kc && kc <= 192) || (219 <= kc && kc <= 222) ? fcc(kc - 128) :
		// 0-9
		  48 <= kc && kc <=  57 ? fcc(kc) :
		// numlock 0-9
		  96 <= kc && kc <= 105 ? fcc(kc - 48) :
		kc === 107 && isfx ? ';' : //< fxだけ;が入力できないのは不便。
		 106 <= kc && kc <= 111 ? fcc(kc - 64) :
		// sign
		kc === 240 && iskd ? 'caps' : //< IME無効時のCapsキーの扱い（chrome）
		kc === 240 && iskp && isfx ? 'caps' :
		// space - down
		  32 <= kc && kc <=  40 ? const_kt_32_40[kc - 32] :
		// sign table
		const_kt.hasOwnProperty(kc) ? const_kt[kc] :
		null
	);

	if (k) {
		// 空白文字は見づらいのでspaceに置換。
		if (k === ' ') {
			k = 'space';
		}

		var f_shift = evt.shiftKey && k !== 'shift', // SHIFT防止
		    f_ctrl = evt.ctrlKey && k !== 'ctrl', // C-ctrl防止
		    f_alt = evt.altKey && k !== 'alt'; // A-alt防止

		// 文字列変換じゃない場合はshiftの処理を頑張る。
		if (!cc && f_shift) {
			if (k === '\\') {
				k = kc === 220 ? '|' : '_';
			}
			else if (const_kt_shift.hasOwnProperty(k)) {
				k = const_kt_shift[k];
			}
			else {
				var kupper = k.toUpperCase();
				k = k === kupper ? 'S-' + k : kupper;
			}
		}
		// 一部の特殊キーはmetaがtrueになるため。
		if (f_alt) { // || this.metaKey
			k = 'A-' + k;
		}
		if (f_ctrl) {
			k = 'C-' + k;
		}
	}

	return k;
}

// jQueryイベントの設定。
if (this.jQuery) {

	/** @namespace */
	jQuery.Event = jQuery.Event || {};

	/**
	 * キー文字列の取得。
	 *
	 * @methodOf jQuery.Event#
	 * @name keyChar
	 * @return {String} キー文字列。
	 */
	jQuery.Event.prototype.keyChar = function $_Event$keyChar() {
		return getKeyChar(this.originalEvent);
	};
}

}());
