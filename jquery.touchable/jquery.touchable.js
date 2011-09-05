/**
 * @fileOverview
 *   タッチ端末の場合、マウスイベントをタッチイベントに書き換えるプラグイン。
 * @author <a href="http://0fk.org/">ofk</a>
 * @version 0.1
 * @license
 *   jquery.touchable.js (c) 2011 ofk
 *   Released under the MIT License.
 */

(function (jQuery) {

// タッチイベントが存在しない。
if (!('ontouchstart' in window)) {
	return;
}

var	// イベントを付与するときに使う。
	prefix = '*touchable*',
	// タッチイベントをマウスイベント名に変換する。
	touchToMouse = {
		touchstart: 'mousedown',
		touchmove:  'mousemove',
		touchend:   'mouseup'
	};

// マウスイベントをタッチイベントに置き換える。
jQuery.each(touchToMouse, function (fix, orig) {
	// touchendのみ別の関数を用意する。
	var fn = fix === 'touchend' ? fixTouchEnd : fixTouch;
	jQuery.event.special[orig] = {
		setup: function () {
			jQuery.event.add(this, fix, fn);
		},
		teardown: function () {
			jQuery.event.remove(this, fix, fn);
		}
	};
});

/**
 * touchstartとtouchmoveをそれぞれmousedown、mousemoveのように振舞わせる。
 * @param {jQuery.Event} event
 */
function fixTouch(event) {
	// オリジナルイベントを取得する。
	var originalEvent = event.originalEvent;
	// タッチイベントである。
	if (originalEvent && originalEvent.touches) {
		var touches = originalEvent.touches;
		// 指が一本以上存在する。
		if (touches[0]) {
			// イベントを上書きする。
			arguments[0] = event = new jQuery.Event(touchToMouse[event.type], touches[0]);
			event.originalEvent = originalEvent;
			jQuery.data(this, prefix + event.type, event);
			// イベントを実行する。
			jQuery.event.handle.apply(this, arguments);
		}
	}
}

/**
 * touchendをmouseupのように振舞わせる。
 * @param {jQuery.Event} event
 */
function fixTouchEnd(event) {
	// オリジナルイベントを取得する。
	var originalEvent = event.originalEvent;
	// イベントを上書きする。
	arguments[0] = event = jQuery.data(this, prefix + 'mousemove')
	                    || jQuery.data(this, prefix + 'mousedown')
	                    || event;
	event.type = 'mouseup';
	event.originalEvent = originalEvent;
	// イベントキャッシュを削除する。
	jQuery.removeData(this, prefix + 'mousemove');
	jQuery.removeData(this, prefix + 'mousedown');
	// イベントを実行する。
	jQuery.event.handle.apply(this, arguments);
}

}(jQuery));
