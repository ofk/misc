Array.prototype.forEach || (Array.prototype.forEach = function(fn,me){
	for(var i=0,sz=this.length;i<sz;++i){fn.call(me,this[i],i,this);}
});

var CSSSelector = function (selector) {
	return $(selector).get();
};