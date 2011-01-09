(function (Global) {

var
RADIX_BIT    = 15,
RADIX        = 1 << RADIX_BIT,
RADIX_MASK   = RADIX - 1;
DIGITS_ARRAY = [],
DIGITS_TABLE = {};
(function (DIGITS_ARRAY, DIGITS_TABLE, DIGITS_CHARS) {
	for (var i = 0, iz = DIGITS_CHARS.length; i < iz; ++i) {
		var c = DIGITS_CHARS[i];
		DIGITS_ARRAY[i] = c;
		DIGITS_TABLE[c] = i;
	}
})(DIGITS_ARRAY, DIGITS_TABLE, '0123456789abcdefghijklmnopqrstuvwxyz');

function Bigint() { this.init.apply(this, arguments); }

Bigint.prototype = {
	init: function (obj) {
		this._digits = [];
		this._used = 0;
		this._sign = false;
		if (obj != null) {
			var typeof_obj = typeof obj;
			if (typeof_obj === 'string') {
				this._setFromString(obj);
			}
			else if (typeof_obj === 'number') {
				if (-0x7fffffff <= obj && obj <= 0x7fffffff) {
					this._setFromInt(obj);
				}
				else {
					this._setFromString(String(obj));
				}
			}
			else if (typeof_obj === 'object' && obj instanceof Bigint) {
				obj.clone(this);
			}
		}
	},
	_setFromString: function (str, radix) {
		str = str.replace(/\s+/g, '').toLowerCase();
		var m;
		if (m = /^(-?[0-9]+)(?:\.([0-9]*))?e\+([0-9]+)/.exec(str)) {
			var zeros = parseInt(m[3]);
			if (m[2]) {
				str = m[1] + m[2];
				zeros -= m[2].length;
				if (zeros < 0) {
					str = str.slice(0, zeros) || '0';
				}
			}
			else {
				str = m[1];
			}
			while (zeros-- > 0) {
				str += '0';
			}
		}
		if (m = /^(-)?(0[box]?)?/.exec(str)) {
			this._sign = !!m[1];
			this._setFromStringNatural(
				str.slice(m[0].length)
				   .replace(/^\./, '0.')
				   .replace(/\.[0-9]*/, ''),
				radix || { '0b': 2, '0': 8, '0o': 8, '0x': 16 }[m[2]]
			);
		}
	},
	_setFromStringNatural: function (str, radix) {
		radix = radix || 10;
		if (radix < 2 || 36 < radix) {
			throw new RangeError('_setFromStringNatural() radix argument must be between 2 and 36');
		}
		var chs = str.split(''), digits = this._digits;
		for (var i = 0, iz = chs.length; i < iz; ++i) {
			for (var j = 0, jz = digits.length, curry = DIGITS_TABLE[chs[i]]; j < jz || curry; ++j) {
				curry += (digits[j] || 0) * radix;
				digits[j] = (curry & RADIX_MASK);
				curry >>>= RADIX_BIT;
			}
		}
		this._used = digits.length;
	},
	_setFromInt: function (num) {
		if (num < 0) {
			num = -num;
			this._sign = true;
		}
		else {
			this._sign = false;
		}
		num &= 0x7fffffff;
		var used = 0, digits = this._digits;
		if (num) {
			for (; num; ++used) {
				digits[used] = num & RADIX_MASK;
				num >>>= RADIX_BIT;
			}
		}
		this._used = used;
	},
	equals: function (other) {
		if (this._sign !== other._sign
		 || this._used !== other._used) {
			return false;
		}
		for (var i = 0, iz = this._used; i < iz; ++i) {
			if (this._digits[i] !== other._digits[i]) {
				return false;
			}
		}
		return true;
	},
	compareTo: function (other) {
		if (this._sign !== other._sign) {
			return other._sign ? 1 : -1;
		}
		return this.compareToAbsolute(other);
	},
	compareToAbsolute: function (other) {
		if (this._used !== other._used) {
			return this._used > other._used ? 1 : -1;
		}
		for (var i = this._used - 1; i >= 0; --i) {
			var this_digit = this._digits[i],
			    other_digit = other._digits[i];
			if (this_digit !== other_digit) {
				return this_digit > other_digit ? 1 : -1;
			}
		}
		return 0;
	},
	clone: function (obj) {
		obj = obj || new Bigint;
		obj._sign = this._sign;
		obj._used = this._used;
		obj._digits = this._digits.concat();
		return obj;
	},
	_normalize: function () {
		for (var i = this._used - 1, digits = this._digits; !digits[i] && i >= 0; --i, --this._used);
		if (!this._used) {
			this._sign = false;
		}
		return this;
	},
	toNumber: function () {
		var rv = 0;
		for (var i = this._used - 1; i >= 0; --i) {
			rv *= RADIX;
			rv += this._digits[i];
		}
		return this._sign ? -rv : rv;
	},
	toString: function (radix) {
		radix = radix || 10;
		if (radix < 2 || 36 < radix) {
			throw new RangeError('_setFromStringNatural() radix argument must be between 2 and 36');
		}
		if (this.isZero()) {
			return '0';
		}
		var tmp_digits = [ 0 ];
		for (var i = this._used - 1; i >= 0; --i) {
			tmp_digits[0] += this._digits[i];
			for (var j = 0, jz = tmp_digits.length, tmp_curry = 0; j < jz || tmp_curry; ++j) {
				var tmp_digit = tmp_digits[j] || 0;
				if (i) tmp_digit *= RADIX;
				tmp_digit += tmp_curry;
				tmp_curry = ~~(tmp_digit / radix);
				tmp_digits[j] = tmp_digit % radix;
			}
		}
		var rv = this._sign ? '-' : '';
		if (radix <= 10) {
			return rv + tmp_digits.reverse().join('');
		}
		for (var i = tmp_digits.length - 1; i >= 0; --i) {
			rv += DIGITS_ARRAY[tmp_digits[i]];
		}
		return rv;
	},
	isNegative: function () {
		return this._sign;
	},
	isZero: function () {
		return !this._used;
	},
	negate: function () {
		var that = this.clone();
		that._sign = !that._sign;
		return that;
	},
	_addsub: function (other, other_sign) {
		var a, b,
		    cmp_digits = this.compareToAbsolute(other),
		    cmp_sign = this._sign === other_sign;
		if (cmp_digits > 0) {
			a = this.clone();
			b = other;
		}
		else if (cmp_digits < 0 || cmp_sign) {
			a = other.clone();
			a._sign = other_sign;
			b = this;
		}
		else {
			a = this.clone();
			b = other;
		}
		var i = 0, iz = b._used,
		    a_digits = a._digits,
		    b_digits = b._digits;
		if (cmp_sign) {
			a_digits[a._used++] = 0;
			for (var curry = 0; i < iz || curry; ++i) {
				curry += b_digits[i] || 0;
				if (curry) {
					curry += a_digits[i];
					a_digits[i] = curry & RADIX_MASK;
					curry >>>= RADIX_BIT;
				}
			}
		}
		else {
			for (; i < iz; ++i) {
				a_digits[i] -= b_digits[i];
				if (a_digits[i] < 0) {
					a_digits[i] += RADIX;
					--a_digits[i + 1];
				}
			}
		}
		return a._normalize();
	},
	add: function (other) {
		return this._addsub(other, other._sign);
	},
	sub: function (other) {
		return this._addsub(other, !other._sign);
	},
	mul: function (other) {
		var m_length = this._used,
		    m_digits = this._digits,
		    n_length = other._used,
		    n_digits = other._digits;
		var q = new Bigint,
		    q_length = q._used = m_length + n_length + 1,
		    q_digits = q._digits = new Array(q_length);
		q._sign = this._sign !== other._sign;
		while (q_length--) q_digits[q_length] = 0;
		for (var i = 0; i < m_length; ++i) {
			var m = m_digits[i];
			if (m) {
				var j = 0, curry = 0;
				for (; j < n_length; ++j) {
					curry += m * n_digits[j];
					if (curry) {
						curry += q_digits[i + j];
						q_digits[i + j] = curry & RADIX_MASK;
						curry >>>= RADIX_BIT;
					}
				}
				q_digits[i + j] = curry;
			}
		}
		return q._normalize();
	},
	_divmod: function (other, mode) {
		if (other.isZero()) {
			throw new Error('_divmod() division by zero');
		}
		var cmp_digits = this.compareToAbsolute(other);
		if (cmp_digits === 0) {
			var q = this._sign === other._sign ? 1 : -1;
			switch (mode) {
				case 0: return new Bigint(q);
				case 1: return new Bigint(0);
			}
			return [new Bigint(q), new Bigint(0)];
		}
		if (cmp_digits < 0) {
			switch (mode) {
				case 0: return new Bigint(0);
				case 1: return this.clone();
			}
			return [new Bigint(0), this.clone()];
		}
		var q = new Bigint,
		    r = this.clone(),
		    r_highest = r._digits[r._used - 1],
		    n = other.clone(),
		    n_highest = n._digits[n._used - 1],
		    t = (r_highest / n_highest) & RADIX_MASK;
		q._sign = r._sign !== n._sign;
		q._used = r._used - n._used + 1;
		if (!t) {
			--q._used;
			t = ((r_highest * RADIX + r._digits[r._used - 2]) / n_highest) & RADIX_MASK;
		}
		q._digits = new Array(q._used);
		r._sign = false;
		n._sign = false;
		for (var i = q._used - 1; i >= 0; --i, t = ((r._digits[r._used - 1] * RADIX + r._digits[r._used - 2]) / n_highest) & RADIX_MASK) {
			var w;
			for (;; --t) {
				w = n.mul(new Bigint(t));
				w._used += i;
				for (var j = 0, jz = i; j < jz; ++j) w._digits.unshift(0);
				if (w.compareToAbsolute(r) <= 0) break;
			}
			q._digits[i] = t;
			r = r.sub(w);
		}
		if (mode === 0) {
			return q._normalize();
		}
		r._sign = this._sign;
		if (mode === 1) {
			return r._normalize();
		}
		return [ q._normalize(), r._normalize() ];
	},
	divmod: function (other) {
		return this._divmod(other, -1);
	},
	div: function (other) {
		return this._divmod(other, 0);
	},
	mod: function (other) {
		return this._divmod(other, 1);
	}
};

Global.Bigint = Bigint;

})(this);
