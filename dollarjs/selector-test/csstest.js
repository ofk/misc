/*  Prototype JavaScript framework, version 1.5.0_rc0
 *  (c) 2005 Sam Stephenson <sam@conio.net>
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://prototype.conio.net/
 *
/*--------------------------------------------------------------------------*/
var Prototype={Version:"1.5.0_rc0",ScriptFragment:"(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)",emptyFunction:function(){},K:function(A){return A}};var Class={create:function(){return function(){this.initialize.apply(this,arguments)}}};var Abstract=new Object();Object.extend=function(A,C){for(var B in C){A[B]=C[B]}return A};Object.inspect=function(A){try{if(A==undefined){return"undefined"}if(A==null){return"null"}return A.inspect?A.inspect():A.toString()}catch(B){if(B instanceof RangeError){return"..."}throw B}};Function.prototype.bind=function(){var A=this,C=$A(arguments),B=C.shift();return function(){return A.apply(B,C.concat($A(arguments)))}};Function.prototype.bindAsEventListener=function(B){var A=this;return function(C){return A.call(B,C||window.event)}};Object.extend(Number.prototype,{toColorPart:function(){var A=this.toString(16);
if(this<16){return"0"+A}return A},succ:function(){return this+1},times:function(A){$R(0,this,true).each(A);return this}});var Try={these:function(){var C;for(var B=0;B<arguments.length;B++){var A=arguments[B];try{C=A();break}catch(D){}}return C}};var PeriodicalExecuter=Class.create();PeriodicalExecuter.prototype={initialize:function(B,A){this.callback=B;this.frequency=A;this.currentlyExecuting=false;this.registerCallback()},registerCallback:function(){setInterval(this.onTimerEvent.bind(this),this.frequency*1000)},onTimerEvent:function(){if(!this.currentlyExecuting){try{this.currentlyExecuting=true;this.callback()}finally{this.currentlyExecuting=false}}}};Object.extend(String.prototype,{gsub:function(E,C){var A="",D=this,B;C=arguments.callee.prepareReplacement(C);while(D.length>0){if(B=D.match(E)){A+=D.slice(0,B.index);
A+=(C(B)||"").toString();D=D.slice(B.index+B[0].length)}else{A+=D,D=""}}return A},sub:function(C,A,B){A=this.gsub.prepareReplacement(A);B=B===undefined?1:B;return this.gsub(C,function(D){if(--B<0){return D[0]}return A(D)})},scan:function(B,A){this.gsub(B,A);return this},truncate:function(B,A){B=B||30;A=A===undefined?"...":A;return this.length>B?this.slice(0,B-A.length)+A:this},strip:function(){return this.replace(/^\s+/,"").replace(/\s+$/,"")},stripTags:function(){return this.replace(/<\/?[^>]+>/gi,"")},stripScripts:function(){return this.replace(new RegExp(Prototype.ScriptFragment,"img"),"")},extractScripts:function(){var B=new RegExp(Prototype.ScriptFragment,"img");var A=new RegExp(Prototype.ScriptFragment,"im");return(this.match(B)||[]).map(function(C){return(C.match(A)||["",""])[1]})},evalScripts:function(){return this.extractScripts().map(function(script){return eval(script)
})},escapeHTML:function(){var B=document.createElement("div");var A=document.createTextNode(this);B.appendChild(A);return B.innerHTML},unescapeHTML:function(){var A=document.createElement("div");A.innerHTML=this.stripTags();return A.childNodes[0]?A.childNodes[0].nodeValue:""},toQueryParams:function(){var A=this.match(/^\??(.*)$/)[1].split("&");return A.inject({},function(D,B){var C=B.split("=");D[C[0]]=C[1];return D})},toArray:function(){return this.split("")},camelize:function(){var D=this.split("-");if(D.length==1){return D[0]}var B=this.indexOf("-")==0?D[0].charAt(0).toUpperCase()+D[0].substring(1):D[0];for(var C=1,A=D.length;C<A;C++){var E=D[C];B+=E.charAt(0).toUpperCase()+E.substring(1)}return B},inspect:function(){return"'"+this.replace(/\\/g,"\\\\").replace(/'/g,"\\'")+"'"}});String.prototype.gsub.prepareReplacement=function(B){if(typeof B=="function"){return B
}var A=new Template(B);return function(C){return A.evaluate(C)}};String.prototype.parseQuery=String.prototype.toQueryParams;var Template=Class.create();Template.Pattern=/(^|.|\r|\n)(#\{(.*?)\})/;Template.prototype={initialize:function(A,B){this.template=A.toString();this.pattern=B||Template.Pattern},evaluate:function(A){return this.template.gsub(this.pattern,function(B){var C=B[1];if(C=="\\"){return B[2]}return C+(A[B[3]]||"").toString()})}};var $break=new Object();var $continue=new Object();var Enumerable={each:function(B){var A=0;try{this._each(function(D){try{B(D,A++)}catch(E){if(E!=$continue){throw E}}})}catch(C){if(C!=$break){throw C}}},all:function(B){var A=true;this.each(function(D,C){A=A&&!!(B||Prototype.K)(D,C);if(!A){throw $break}});return A},any:function(B){var A=true;this.each(function(D,C){if(A=!!(B||Prototype.K)(D,C)){throw $break
}});return A},collect:function(B){var A=[];this.each(function(D,C){A.push(B(D,C))});return A},detect:function(B){var A;this.each(function(D,C){if(B(D,C)){A=D;throw $break}});return A},findAll:function(B){var A=[];this.each(function(D,C){if(B(D,C)){A.push(D)}});return A},grep:function(C,B){var A=[];this.each(function(F,E){var D=F.toString();if(D.match(C)){A.push((B||Prototype.K)(F,E))}});return A},include:function(A){var B=false;this.each(function(C){if(C==A){B=true;throw $break}});return B},inject:function(A,B){this.each(function(D,C){A=B(A,D,C)});return A},invoke:function(B){var A=$A(arguments).slice(1);return this.collect(function(C){return C[B].apply(C,A)})},max:function(B){var A;this.each(function(D,C){D=(B||Prototype.K)(D,C);if(A==undefined||D>=A){A=D}});return A},min:function(B){var A;
this.each(function(D,C){D=(B||Prototype.K)(D,C);if(A==undefined||D<A){A=D}});return A},partition:function(C){var B=[],A=[];this.each(function(E,D){((C||Prototype.K)(E,D)?B:A).push(E)});return[B,A]},pluck:function(B){var A=[];this.each(function(D,C){A.push(D[B])});return A},reject:function(B){var A=[];this.each(function(D,C){if(!B(D,C)){A.push(D)}});return A},sortBy:function(A){return this.collect(function(C,B){return{value:C,criteria:A(C,B)}}).sort(function(E,D){var C=E.criteria,B=D.criteria;return C<B?-1:C>B?1:0}).pluck("value")},toArray:function(){return this.collect(Prototype.K)},zip:function(){var B=Prototype.K,A=$A(arguments);if(typeof A.last()=="function"){B=A.pop()}var C=[this].concat(A).map($A);return this.map(function(E,D){return B(C.pluck(D))})},inspect:function(){return"#<Enumerable:"+this.toArray().inspect()+">"
}};Object.extend(Enumerable,{map:Enumerable.collect,find:Enumerable.detect,select:Enumerable.findAll,member:Enumerable.include,entries:Enumerable.toArray});var $A=Array.from=function(C){if(!C){return[]}if(C.toArray){return C.toArray()}else{var B=[];for(var A=0;A<C.length;A++){B.push(C[A])}return B}};Object.extend(Array.prototype,Enumerable);if(!Array.prototype._reverse){Array.prototype._reverse=Array.prototype.reverse}Object.extend(Array.prototype,{_each:function(B){for(var A=0;A<this.length;A++){B(this[A])}},clear:function(){this.length=0;return this},first:function(){return this[0]},last:function(){return this[this.length-1]},compact:function(){return this.select(function(A){return A!=undefined||A!=null})},flatten:function(){return this.inject([],function(B,A){return B.concat(A&&A.constructor==Array?A.flatten():[A])
})},without:function(){var A=$A(arguments);return this.select(function(B){return !A.include(B)})},indexOf:function(A){for(var B=0;B<this.length;B++){if(this[B]==A){return B}}return -1},reverse:function(A){return(A!==false?this:this.toArray())._reverse()},inspect:function(){return"["+this.map(Object.inspect).join(", ")+"]"}});var Hash={_each:function(B){for(var A in this){var C=this[A];if(typeof C=="function"){continue}var D=[A,C];D.key=A;D.value=C;B(D)}},keys:function(){return this.pluck("key")},values:function(){return this.pluck("value")},merge:function(A){return $H(A).inject($H(this),function(B,C){B[C.key]=C.value;return B})},toQueryString:function(){return this.map(function(A){return A.map(encodeURIComponent).join("=")}).join("&")},inspect:function(){return"#<Hash:{"+this.map(function(A){return A.map(Object.inspect).join(": ")
}).join(", ")+"}>"}};function $H(A){var B=Object.extend({},A||{});Object.extend(B,Enumerable);Object.extend(B,Hash);return B}ObjectRange=Class.create();Object.extend(ObjectRange.prototype,Enumerable);Object.extend(ObjectRange.prototype,{initialize:function(C,A,B){this.start=C;this.end=A;this.exclusive=B},_each:function(A){var B=this.start;do{A(B);B=B.succ()}while(this.include(B))},include:function(A){if(A<this.start){return false}if(this.exclusive){return A<this.end}return A<=this.end}});var $R=function(C,A,B){return new ObjectRange(C,A,B)};var Ajax={getTransport:function(){return Try.these(function(){return new XMLHttpRequest()},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")})||false},activeRequestCount:0};Ajax.Responders={responders:[],_each:function(A){this.responders._each(A)
},register:function(A){if(!this.include(A)){this.responders.push(A)}},unregister:function(A){this.responders=this.responders.without(A)},dispatch:function(D,B,C,A){this.each(function(E){if(E[D]&&typeof E[D]=="function"){try{E[D].apply(E,[B,C,A])}catch(F){}}})}};Object.extend(Ajax.Responders,Enumerable);Ajax.Responders.register({onCreate:function(){Ajax.activeRequestCount++},onComplete:function(){Ajax.activeRequestCount--}});Ajax.Base=function(){};Ajax.Base.prototype={setOptions:function(A){this.options={method:"post",asynchronous:true,contentType:"application/x-www-form-urlencoded",parameters:""};Object.extend(this.options,A||{})},responseIsSuccess:function(){return this.transport.status==undefined||this.transport.status==0||(this.transport.status>=200&&this.transport.status<300)},responseIsFailure:function(){return !this.responseIsSuccess()
}};Ajax.Request=Class.create();Ajax.Request.Events=["Uninitialized","Loading","Loaded","Interactive","Complete"];Ajax.Request.prototype=Object.extend(new Ajax.Base(),{initialize:function(B,A){this.transport=Ajax.getTransport();this.setOptions(A);this.request(B)},request:function(B){var C=this.options.parameters||"";if(C.length>0){C+="&_="}try{this.url=B;if(this.options.method=="get"&&C.length>0){this.url+=(this.url.match(/\?/)?"&":"?")+C}Ajax.Responders.dispatch("onCreate",this,this.transport);this.transport.open(this.options.method,this.url,this.options.asynchronous);if(this.options.asynchronous){this.transport.onreadystatechange=this.onStateChange.bind(this);setTimeout((function(){this.respondToReadyState(1)}).bind(this),10)}this.setRequestHeaders();var A=this.options.postBody?this.options.postBody:C;
this.transport.send(this.options.method=="post"?A:null)}catch(D){this.dispatchException(D)}},setRequestHeaders:function(){var B=["X-Requested-With","XMLHttpRequest","X-Prototype-Version",Prototype.Version,"Accept","text/javascript, text/html, application/xml, text/xml, */*"];if(this.options.method=="post"){B.push("Content-type",this.options.contentType);if(this.transport.overrideMimeType){B.push("Connection","close")}}if(this.options.requestHeaders){B.push.apply(B,this.options.requestHeaders)}for(var A=0;A<B.length;A+=2){this.transport.setRequestHeader(B[A],B[A+1])}},onStateChange:function(){var A=this.transport.readyState;if(A!=1){this.respondToReadyState(this.transport.readyState)}},header:function(A){try{return this.transport.getResponseHeader(A)}catch(B){}},evalJSON:function(){try{return eval("("+this.header("X-JSON")+")")
}catch(e){}},evalResponse:function(){try{return eval(this.transport.responseText)}catch(e){this.dispatchException(e)}},respondToReadyState:function(A){var C=Ajax.Request.Events[A];var E=this.transport,B=this.evalJSON();if(C=="Complete"){try{(this.options["on"+this.transport.status]||this.options["on"+(this.responseIsSuccess()?"Success":"Failure")]||Prototype.emptyFunction)(E,B)}catch(D){this.dispatchException(D)}if((this.header("Content-type")||"").match(/^text\/javascript/i)){this.evalResponse()}}try{(this.options["on"+C]||Prototype.emptyFunction)(E,B);Ajax.Responders.dispatch("on"+C,this,E,B)}catch(D){this.dispatchException(D)}if(C=="Complete"){this.transport.onreadystatechange=Prototype.emptyFunction}},dispatchException:function(A){(this.options.onException||Prototype.emptyFunction)(this,A);
Ajax.Responders.dispatch("onException",this,A)}});Ajax.Updater=Class.create();Object.extend(Object.extend(Ajax.Updater.prototype,Ajax.Request.prototype),{initialize:function(A,C,B){this.containers={success:A.success?$(A.success):$(A),failure:A.failure?$(A.failure):(A.success?null:$(A))};this.transport=Ajax.getTransport();this.setOptions(B);var D=this.options.onComplete||Prototype.emptyFunction;this.options.onComplete=(function(F,E){this.updateContent();D(F,E)}).bind(this);this.request(C)},updateContent:function(){var B=this.responseIsSuccess()?this.containers.success:this.containers.failure;var A=this.transport.responseText;if(!this.options.evalScripts){A=A.stripScripts()}if(B){if(this.options.insertion){new this.options.insertion(B,A)}else{Element.update(B,A)}}if(this.responseIsSuccess()){if(this.onComplete){setTimeout(this.onComplete.bind(this),10)
}}}});Ajax.PeriodicalUpdater=Class.create();Ajax.PeriodicalUpdater.prototype=Object.extend(new Ajax.Base(),{initialize:function(A,C,B){this.setOptions(B);this.onComplete=this.options.onComplete;this.frequency=(this.options.frequency||2);this.decay=(this.options.decay||1);this.updater={};this.container=A;this.url=C;this.start()},start:function(){this.options.onComplete=this.updateComplete.bind(this);this.onTimerEvent()},stop:function(){this.updater.onComplete=undefined;clearTimeout(this.timer);(this.onComplete||Prototype.emptyFunction).apply(this,arguments)},updateComplete:function(A){if(this.options.decay){this.decay=(A.responseText==this.lastText?this.decay*this.options.decay:1);this.lastText=A.responseText}this.timer=setTimeout(this.onTimerEvent.bind(this),this.decay*this.frequency*1000)},onTimerEvent:function(){this.updater=new Ajax.Updater(this.container,this.url,this.options)
}});function $(){var C=[],B;for(var A=0;A<arguments.length;A++){B=arguments[A];if(typeof B=="string"){B=document.getElementById(B)}C.push(Element.extend(B))}return C.length<2?C[0]:C}document.getElementsByClassName=function(C,A){var B=($(A)||document.body).getElementsByTagName("*");return $A(B).inject([],function(D,E){if(E.className.match(new RegExp("(^|\\s)"+C+"(\\s|$)"))){D.push(Element.extend(E))}return D})};if(!window.Element){var Element=new Object()}Element.extend=function(C){if(!C){return }if(_nativeExtensions){return C}if(!C._extended&&C.tagName&&C!=window){var B=Element.Methods,A=Element.extend.cache;for(property in B){var D=B[property];if(typeof D=="function"){C[property]=A.findOrStore(D)}}}C._extended=true;return C};Element.extend.cache={findOrStore:function(A){return this[A]=this[A]||function(){return A.apply(null,[this].concat($A(arguments)))
}}};Element.Methods={visible:function(A){return $(A).style.display!="none"},toggle:function(){for(var B=0;B<arguments.length;B++){var A=$(arguments[B]);Element[Element.visible(A)?"hide":"show"](A)}},hide:function(){for(var B=0;B<arguments.length;B++){var A=$(arguments[B]);A.style.display="none"}},show:function(){for(var B=0;B<arguments.length;B++){var A=$(arguments[B]);A.style.display=""}},remove:function(A){A=$(A);A.parentNode.removeChild(A)},update:function(B,A){$(B).innerHTML=A.stripScripts();setTimeout(function(){A.evalScripts()},10)},replace:function(C,B){C=$(C);if(C.outerHTML){C.outerHTML=B.stripScripts()}else{var A=C.ownerDocument.createRange();A.selectNodeContents(C);C.parentNode.replaceChild(A.createContextualFragment(B.stripScripts()),C)}setTimeout(function(){B.evalScripts()},10)},getHeight:function(A){A=$(A);
return A.offsetHeight},classNames:function(A){return new Element.ClassNames(A)},hasClassName:function(A,B){if(!(A=$(A))){return }return Element.classNames(A).include(B)},addClassName:function(A,B){if(!(A=$(A))){return }return Element.classNames(A).add(B)},removeClassName:function(A,B){if(!(A=$(A))){return }return Element.classNames(A).remove(B)},cleanWhitespace:function(B){B=$(B);for(var A=0;A<B.childNodes.length;A++){var C=B.childNodes[A];if(C.nodeType==3&&!/\S/.test(C.nodeValue)){Element.remove(C)}}},empty:function(A){return $(A).innerHTML.match(/^\s*$/)},childOf:function(B,A){B=$(B),A=$(A);while(B=B.parentNode){if(B==A){return true}}return false},scrollTo:function(B){B=$(B);var A=B.x?B.x:B.offsetLeft,C=B.y?B.y:B.offsetTop;window.scrollTo(A,C)},getStyle:function(B,C){B=$(B);var D=B.style[C.camelize()];
if(!D){if(document.defaultView&&document.defaultView.getComputedStyle){var A=document.defaultView.getComputedStyle(B,null);D=A?A.getPropertyValue(C):null}else{if(B.currentStyle){D=B.currentStyle[C.camelize()]}}}if(window.opera&&["left","top","right","bottom"].include(C)){if(Element.getStyle(B,"position")=="static"){D="auto"}}return D=="auto"?null:D},setStyle:function(B,C){B=$(B);for(var A in C){B.style[A.camelize()]=C[A]}},getDimensions:function(B){B=$(B);if(Element.getStyle(B,"display")!="none"){return{width:B.offsetWidth,height:B.offsetHeight}}var A=B.style;var E=A.visibility;var C=A.position;A.visibility="hidden";A.position="absolute";A.display="";var F=B.clientWidth;var D=B.clientHeight;A.display="none";A.position=C;A.visibility=E;return{width:F,height:D}},makePositioned:function(A){A=$(A);
var B=Element.getStyle(A,"position");if(B=="static"||!B){A._madePositioned=true;A.style.position="relative";if(window.opera){A.style.top=0;A.style.left=0}}},undoPositioned:function(A){A=$(A);if(A._madePositioned){A._madePositioned=undefined;A.style.position=A.style.top=A.style.left=A.style.bottom=A.style.right=""}},makeClipping:function(A){A=$(A);if(A._overflow){return }A._overflow=A.style.overflow;if((Element.getStyle(A,"overflow")||"visible")!="hidden"){A.style.overflow="hidden"}},undoClipping:function(A){A=$(A);if(A._overflow){return }A.style.overflow=A._overflow;A._overflow=undefined}};Object.extend(Element,Element.Methods);var _nativeExtensions=false;if(!HTMLElement&&/Konqueror|Safari|KHTML/.test(navigator.userAgent)){var HTMLElement={};HTMLElement.prototype=document.createElement("div").__proto__
}Element.addMethods=function(B){Object.extend(Element.Methods,B||{});if(typeof HTMLElement!="undefined"){var B=Element.Methods,A=Element.extend.cache;for(property in B){var C=B[property];if(typeof C=="function"){HTMLElement.prototype[property]=A.findOrStore(C)}}_nativeExtensions=true}};Element.addMethods();var Toggle=new Object();Toggle.display=Element.toggle;Abstract.Insertion=function(A){this.adjacency=A};Abstract.Insertion.prototype={initialize:function(B,C){this.element=$(B);this.content=C.stripScripts();if(this.adjacency&&this.element.insertAdjacentHTML){try{this.element.insertAdjacentHTML(this.adjacency,this.content)}catch(D){var A=this.element.tagName.toLowerCase();if(A=="tbody"||A=="tr"){this.insertContent(this.contentFromAnonymousTable())}else{throw D}}}else{this.range=this.element.ownerDocument.createRange();
if(this.initializeRange){this.initializeRange()}this.insertContent([this.range.createContextualFragment(this.content)])}setTimeout(function(){C.evalScripts()},10)},contentFromAnonymousTable:function(){var A=document.createElement("div");A.innerHTML="<table><tbody>"+this.content+"</tbody></table>";return $A(A.childNodes[0].childNodes[0].childNodes)}};var Insertion=new Object();Insertion.Before=Class.create();Insertion.Before.prototype=Object.extend(new Abstract.Insertion("beforeBegin"),{initializeRange:function(){this.range.setStartBefore(this.element)},insertContent:function(A){A.each((function(B){this.element.parentNode.insertBefore(B,this.element)}).bind(this))}});Insertion.Top=Class.create();Insertion.Top.prototype=Object.extend(new Abstract.Insertion("afterBegin"),{initializeRange:function(){this.range.selectNodeContents(this.element);
this.range.collapse(true)},insertContent:function(A){A.reverse(false).each((function(B){this.element.insertBefore(B,this.element.firstChild)}).bind(this))}});Insertion.Bottom=Class.create();Insertion.Bottom.prototype=Object.extend(new Abstract.Insertion("beforeEnd"),{initializeRange:function(){this.range.selectNodeContents(this.element);this.range.collapse(this.element)},insertContent:function(A){A.each((function(B){this.element.appendChild(B)}).bind(this))}});Insertion.After=Class.create();Insertion.After.prototype=Object.extend(new Abstract.Insertion("afterEnd"),{initializeRange:function(){this.range.setStartAfter(this.element)},insertContent:function(A){A.each((function(B){this.element.parentNode.insertBefore(B,this.element.nextSibling)}).bind(this))}});Element.ClassNames=Class.create();
Element.ClassNames.prototype={initialize:function(A){this.element=$(A)},_each:function(A){this.element.className.split(/\s+/).select(function(B){return B.length>0})._each(A)},set:function(A){this.element.className=A},add:function(A){if(this.include(A)){return }this.set(this.toArray().concat(A).join(" "))},remove:function(A){if(!this.include(A)){return }this.set(this.select(function(B){return B!=A}).join(" "))},toString:function(){return this.toArray().join(" ")}};Object.extend(Element.ClassNames.prototype,Enumerable);var Selector=Class.create();Selector.prototype={initialize:function(A){this.params={classNames:[]};this.expression=A.toString().strip();this.parseExpression();this.compileMatcher()},parseExpression:function(){function G(H){throw"Parse error in selector: "+H}if(this.expression==""){G("empty expression")
}var F=this.params,E=this.expression,B,A,D,C;while(B=E.match(/^(.*)\[([a-z0-9_:-]+?)(?:([~\|!]?=)(?:"([^"]*)"|([^\]\s]*)))?\]$/i)){F.attributes=F.attributes||[];F.attributes.push({name:B[2],operator:B[3],value:B[4]||B[5]||""});E=B[1]}if(E=="*"){return this.params.wildcard=true}while(B=E.match(/^([^a-z0-9_-])?([a-z0-9_-]+)(.*)/i)){A=B[1],D=B[2],C=B[3];switch(A){case"#":F.id=D;break;case".":F.classNames.push(D);break;case"":case undefined:F.tagName=D.toUpperCase();break;default:G(E.inspect())}E=C}if(E.length>0){G(E.inspect())}},buildMatchExpression:function(){var D=this.params,C=[],B;if(D.wildcard){C.push("true")}if(B=D.id){C.push("element.id == "+B.inspect())}if(B=D.tagName){C.push("element.tagName.toUpperCase() == "+B.inspect())}if((B=D.classNames).length>0){for(var A=0;A<B.length;A++){C.push("Element.hasClassName(element, "+B[A].inspect()+")")
}}if(B=D.attributes){B.each(function(F){var G="element.getAttribute("+F.name.inspect()+")";var E=function(H){return G+" && "+G+".split("+H.inspect()+")"};switch(F.operator){case"=":C.push(G+" == "+F.value.inspect());break;case"~=":C.push(E(" ")+".include("+F.value.inspect()+")");break;case"|=":C.push(E("-")+".first().toUpperCase() == "+F.value.toUpperCase().inspect());break;case"!=":C.push(G+" != "+F.value.inspect());break;case"":case undefined:C.push(G+" != null");break;default:throw"Unknown operator "+F.operator+" in selector"}})}return C.join(" && ")},compileMatcher:function(){this.match=new Function("element","if (!element.tagName) return false;       return "+this.buildMatchExpression())},findElements:function(D){var C;if(C=$(this.params.id)){if(this.match(C)){if(!D||Element.childOf(C,D)){return[C]
}}}D=(D||document).getElementsByTagName(this.params.tagName||"*");var B=[];for(var A=0;A<D.length;A++){if(this.match(C=D[A])){B.push(Element.extend(C))}}return B},toString:function(){return this.expression}};function $$(){return $A(arguments).map(function(A){return A.strip().split(/\s+/).inject([null],function(C,D){var B=new Selector(D);return C.map(B.findElements.bind(B)).flatten()})}).flatten()}var Field={clear:function(){for(var A=0;A<arguments.length;A++){$(arguments[A]).value=""}},focus:function(A){$(A).focus()},present:function(){for(var A=0;A<arguments.length;A++){if($(arguments[A]).value==""){return false}}return true},select:function(A){$(A).select()},activate:function(A){A=$(A);A.focus();if(A.select){A.select()}}};var Form={serialize:function(D){var E=Form.getElements($(D));var C=new Array();
for(var B=0;B<E.length;B++){var A=Form.Element.serialize(E[B]);if(A){C.push(A)}}return C.join("&")},getElements:function(C){C=$(C);var D=new Array();for(var B in Form.Element.Serializers){var E=C.getElementsByTagName(B);for(var A=0;A<E.length;A++){D.push(E[A])}}return D},getInputs:function(F,C,D){F=$(F);var A=F.getElementsByTagName("input");if(!C&&!D){return A}var G=new Array();for(var E=0;E<A.length;E++){var B=A[E];if((C&&B.type!=C)||(D&&B.name!=D)){continue}G.push(B)}return G},disable:function(C){var D=Form.getElements(C);for(var B=0;B<D.length;B++){var A=D[B];A.blur();A.disabled="true"}},enable:function(C){var D=Form.getElements(C);for(var B=0;B<D.length;B++){var A=D[B];A.disabled=""}},findFirstElement:function(A){return Form.getElements(A).find(function(B){return B.type!="hidden"&&!B.disabled&&["input","select","textarea"].include(B.tagName.toLowerCase())
})},focusFirstElement:function(A){Field.activate(Form.findFirstElement(A))},reset:function(A){$(A).reset()}};Form.Element={serialize:function(B){B=$(B);var D=B.tagName.toLowerCase();var C=Form.Element.Serializers[D](B);if(C){var A=encodeURIComponent(C[0]);if(A.length==0){return }if(C[1].constructor!=Array){C[1]=[C[1]]}return C[1].map(function(E){return A+"="+encodeURIComponent(E)}).join("&")}},getValue:function(A){A=$(A);var C=A.tagName.toLowerCase();var B=Form.Element.Serializers[C](A);if(B){return B[1]}}};Form.Element.Serializers={input:function(A){switch(A.type.toLowerCase()){case"submit":case"hidden":case"password":case"text":return Form.Element.Serializers.textarea(A);case"checkbox":case"radio":return Form.Element.Serializers.inputSelector(A)}return false},inputSelector:function(A){if(A.checked){return[A.name,A.value]
}},textarea:function(A){return[A.name,A.value]},select:function(A){return Form.Element.Serializers[A.type=="select-one"?"selectOne":"selectMany"](A)},selectOne:function(C){var D="",B,A=C.selectedIndex;if(A>=0){B=C.options[A];D=B.value||B.text}return[C.name,D]},selectMany:function(C){var D=[];for(var B=0;B<C.length;B++){var A=C.options[B];if(A.selected){D.push(A.value||A.text)}}return[C.name,D]}};var $F=Form.Element.getValue;Abstract.TimedObserver=function(){};Abstract.TimedObserver.prototype={initialize:function(A,B,C){this.frequency=B;this.element=$(A);this.callback=C;this.lastValue=this.getValue();this.registerCallback()},registerCallback:function(){setInterval(this.onTimerEvent.bind(this),this.frequency*1000)},onTimerEvent:function(){var A=this.getValue();if(this.lastValue!=A){this.callback(this.element,A);
this.lastValue=A}}};Form.Element.Observer=Class.create();Form.Element.Observer.prototype=Object.extend(new Abstract.TimedObserver(),{getValue:function(){return Form.Element.getValue(this.element)}});Form.Observer=Class.create();Form.Observer.prototype=Object.extend(new Abstract.TimedObserver(),{getValue:function(){return Form.serialize(this.element)}});Abstract.EventObserver=function(){};Abstract.EventObserver.prototype={initialize:function(A,B){this.element=$(A);this.callback=B;this.lastValue=this.getValue();if(this.element.tagName.toLowerCase()=="form"){this.registerFormCallbacks()}else{this.registerCallback(this.element)}},onElementEvent:function(){var A=this.getValue();if(this.lastValue!=A){this.callback(this.element,A);this.lastValue=A}},registerFormCallbacks:function(){var B=Form.getElements(this.element);
for(var A=0;A<B.length;A++){this.registerCallback(B[A])}},registerCallback:function(A){if(A.type){switch(A.type.toLowerCase()){case"checkbox":case"radio":Event.observe(A,"click",this.onElementEvent.bind(this));break;case"password":case"text":case"textarea":case"select-one":case"select-multiple":Event.observe(A,"change",this.onElementEvent.bind(this));break}}}};Form.Element.EventObserver=Class.create();Form.Element.EventObserver.prototype=Object.extend(new Abstract.EventObserver(),{getValue:function(){return Form.Element.getValue(this.element)}});Form.EventObserver=Class.create();Form.EventObserver.prototype=Object.extend(new Abstract.EventObserver(),{getValue:function(){return Form.serialize(this.element)}});if(!window.Event){var Event=new Object()}Object.extend(Event,{KEY_BACKSPACE:8,KEY_TAB:9,KEY_RETURN:13,KEY_ESC:27,KEY_LEFT:37,KEY_UP:38,KEY_RIGHT:39,KEY_DOWN:40,KEY_DELETE:46,element:function(A){return A.target||A.srcElement
},isLeftClick:function(A){return(((A.which)&&(A.which==1))||((A.button)&&(A.button==1)))},pointerX:function(A){return A.pageX||(A.clientX+(document.documentElement.scrollLeft||document.body.scrollLeft))},pointerY:function(A){return A.pageY||(A.clientY+(document.documentElement.scrollTop||document.body.scrollTop))},stop:function(A){if(A.preventDefault){A.preventDefault();A.stopPropagation()}else{A.returnValue=false;A.cancelBubble=true}},findElement:function(C,B){var A=Event.element(C);while(A.parentNode&&(!A.tagName||(A.tagName.toUpperCase()!=B.toUpperCase()))){A=A.parentNode}return A},observers:false,_observeAndCache:function(D,C,B,A){if(!this.observers){this.observers=[]}if(D.addEventListener){this.observers.push([D,C,B,A]);D.addEventListener(C,B,A)}else{if(D.attachEvent){this.observers.push([D,C,B,A]);
D.attachEvent("on"+C,B)}}},unloadCache:function(){if(!Event.observers){return }for(var A=0;A<Event.observers.length;A++){Event.stopObserving.apply(this,Event.observers[A]);Event.observers[A][0]=null}Event.observers=false},observe:function(D,C,B,A){var D=$(D);A=A||false;if(C=="keypress"&&(navigator.appVersion.match(/Konqueror|Safari|KHTML/)||D.attachEvent)){C="keydown"}this._observeAndCache(D,C,B,A)},stopObserving:function(D,C,B,A){var D=$(D);A=A||false;if(C=="keypress"&&(navigator.appVersion.match(/Konqueror|Safari|KHTML/)||D.detachEvent)){C="keydown"}if(D.removeEventListener){D.removeEventListener(C,B,A)}else{if(D.detachEvent){D.detachEvent("on"+C,B)}}}});if(navigator.appVersion.match(/\bMSIE\b/)){Event.observe(window,"unload",Event.unloadCache,false)}var Position={includeScrollOffsets:false,prepare:function(){this.deltaX=window.pageXOffset||document.documentElement.scrollLeft||document.body.scrollLeft||0;
this.deltaY=window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0},realOffset:function(B){var A=0,C=0;do{A+=B.scrollTop||0;C+=B.scrollLeft||0;B=B.parentNode}while(B);return[C,A]},cumulativeOffset:function(B){var A=0,C=0;do{A+=B.offsetTop||0;C+=B.offsetLeft||0;B=B.offsetParent}while(B);return[C,A]},positionedOffset:function(B){var A=0,C=0;do{A+=B.offsetTop||0;C+=B.offsetLeft||0;B=B.offsetParent;if(B){p=Element.getStyle(B,"position");if(p=="relative"||p=="absolute"){break}}}while(B);return[C,A]},offsetParent:function(A){if(A.offsetParent){return A.offsetParent}if(A==document.body){return A}while((A=A.parentNode)&&A!=document.body){if(Element.getStyle(A,"position")!="static"){return A}}return document.body},within:function(B,A,C){if(this.includeScrollOffsets){return this.withinIncludingScrolloffsets(B,A,C)
}this.xcomp=A;this.ycomp=C;this.offset=this.cumulativeOffset(B);return(C>=this.offset[1]&&C<this.offset[1]+B.offsetHeight&&A>=this.offset[0]&&A<this.offset[0]+B.offsetWidth)},withinIncludingScrolloffsets:function(B,A,D){var C=this.realOffset(B);this.xcomp=A+C[0]-this.deltaX;this.ycomp=D+C[1]-this.deltaY;this.offset=this.cumulativeOffset(B);return(this.ycomp>=this.offset[1]&&this.ycomp<this.offset[1]+B.offsetHeight&&this.xcomp>=this.offset[0]&&this.xcomp<this.offset[0]+B.offsetWidth)},overlap:function(B,A){if(!B){return 0}if(B=="vertical"){return((this.offset[1]+A.offsetHeight)-this.ycomp)/A.offsetHeight}if(B=="horizontal"){return((this.offset[0]+A.offsetWidth)-this.xcomp)/A.offsetWidth}},clone:function(B,C){B=$(B);C=$(C);C.style.position="absolute";var A=this.cumulativeOffset(B);C.style.top=A[1]+"px";
C.style.left=A[0]+"px";C.style.width=B.offsetWidth+"px";C.style.height=B.offsetHeight+"px"},page:function(D){var A=0,C=0;var B=D;do{A+=B.offsetTop||0;C+=B.offsetLeft||0;if(B.offsetParent==document.body){if(Element.getStyle(B,"position")=="absolute"){break}}}while(B=B.offsetParent);B=D;do{A-=B.scrollTop||0;C-=B.scrollLeft||0}while(B=B.parentNode);return[C,A]},clone:function(C,E){var A=Object.extend({setLeft:true,setTop:true,setWidth:true,setHeight:true,offsetTop:0,offsetLeft:0},arguments[2]||{});C=$(C);var D=Position.page(C);E=$(E);var F=[0,0];var B=null;if(Element.getStyle(E,"position")=="absolute"){B=Position.offsetParent(E);F=Position.page(B)}if(B==document.body){F[0]-=document.body.offsetLeft;F[1]-=document.body.offsetTop}if(A.setLeft){E.style.left=(D[0]-F[0]+A.offsetLeft)+"px"}if(A.setTop){E.style.top=(D[1]-F[1]+A.offsetTop)+"px"
}if(A.setWidth){E.style.width=C.offsetWidth+"px"}if(A.setHeight){E.style.height=C.offsetHeight+"px"}},absolutize:function(B){B=$(B);if(B.style.position=="absolute"){return }Position.prepare();var D=Position.positionedOffset(B);var F=D[1];var E=D[0];var C=B.clientWidth;var A=B.clientHeight;B._originalLeft=E-parseFloat(B.style.left||0);B._originalTop=F-parseFloat(B.style.top||0);B._originalWidth=B.style.width;B._originalHeight=B.style.height;B.style.position="absolute";B.style.top=F+"px";B.style.left=E+"px";B.style.width=C+"px";B.style.height=A+"px"},relativize:function(A){A=$(A);if(A.style.position=="relative"){return }Position.prepare();A.style.position="relative";var C=parseFloat(A.style.top||0)-(A._originalTop||0);var B=parseFloat(A.style.left||0)-(A._originalLeft||0);A.style.top=C+"px";A.style.left=B+"px";
A.style.height=A._originalHeight;A.style.width=A._originalWidth}};if(/Konqueror|Safari|KHTML/.test(navigator.userAgent)){Position.cumulativeOffset=function(B){var A=0,C=0;do{A+=B.offsetTop||0;C+=B.offsetLeft||0;if(B.offsetParent==document.body){if(Element.getStyle(B,"position")=="absolute"){break}}B=B.offsetParent}while(B);return[C,A]}};
// Copyright (c) 2005 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//
// See scriptaculous.js for full license.
var Builder={NODEMAP:{AREA:"map",CAPTION:"table",COL:"table",COLGROUP:"table",LEGEND:"fieldset",OPTGROUP:"select",OPTION:"select",PARAM:"object",TBODY:"table",TD:"table",TFOOT:"table",TH:"table",THEAD:"table",TR:"table"},node:function(A){A=A.toUpperCase();var F=this.NODEMAP[A]||"div";var B=document.createElement(F);try{B.innerHTML="<"+A+"></"+A+">"}catch(E){}var D=B.firstChild||null;if(D&&(D.tagName!=A)){D=D.getElementsByTagName(A)[0]}if(!D){D=document.createElement(A)}if(!D){return }if(arguments[1]){if(this._isStringOrNumber(arguments[1])||(arguments[1] instanceof Array)){this._children(D,arguments[1])}else{var C=this._attributes(arguments[1]);if(C.length){try{B.innerHTML="<"+A+" "+C+"></"+A+">"}catch(E){}D=B.firstChild||null;if(!D){D=document.createElement(A);for(attr in arguments[1]){D[attr=="class"?"className":attr]=arguments[1][attr]
}}if(D.tagName!=A){D=B.getElementsByTagName(A)[0]}}}}if(arguments[2]){this._children(D,arguments[2])}return D},_text:function(A){return document.createTextNode(A)},_attributes:function(A){var B=[];for(attribute in A){B.push((attribute=="className"?"class":attribute)+'="'+A[attribute].toString().escapeHTML()+'"')}return B.join(" ")},_children:function(B,A){if(typeof A=="object"){A.flatten().each(function(C){if(typeof C=="object"){B.appendChild(C)}else{if(Builder._isStringOrNumber(C)){B.appendChild(Builder._text(C))}}})}else{if(Builder._isStringOrNumber(A)){B.appendChild(Builder._text(A))}}},_isStringOrNumber:function(A){return(typeof A=="string"||typeof A=="number")}};

// Copyright (c) 2006 Niels Leenheer (http://rakaz.nl)
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
var CSSTestCase = Class.create();
CSSTestCase.prototype = {
	
	initialize: function (ids, options) {
		this.options = Object.extend({
			onSuccess: function() {},
			onFailure: function() {}
		}, options || {});
		
		this.ids = ids;
		this.counter = 0;
		
		this.totalSelectors = 0;
		this.passedSelectors = 0;
		this.buggySelectors = 0;
		this.failedSelectors = 0;

		this.totalTests = 0;
		this.passedTests = 0;
		
		this.next();
	},
	
	success: function(test) {
		this.totalSelectors++;
		this.totalTests += test.testsTotal;
		
		if (test.testsPassed == test.testsTotal)
			this.passedSelectors++;
		else
			this.buggySelectors++;
		
		this.passedTests += test.testsPassed;
		
		this.options.onSuccess(test, this);
		this.next();
	},
	
	failure: function(test) {
		this.totalSelectors++;
		this.failedSelectors++;
		
		this.totalTests += test.testsTotal;
		this.passedTests += test.testsPassed;

		this.options.onFailure(test, this);
		this.next();
	},
	
	next: function() {
		if (this.ids.length) {
			new CSSTest(this.ids.shift(), {
				counter:   this.counter,
				onSuccess: this.success.bind(this),
				onFailure: this.failure.bind(this)
			});	
			
			this.counter++;
		}
	}
};

var CSSTest = Class.create();
CSSTest.prototype = {

	initialize: function (id, options) {
		this.options = Object.extend({
			counter:   0,
			onSuccess: function() {},
			onFailure: function() {}
		}, options || {});
	
		this.id = id;
		this.title = id;
		this.result = true;
		
		this.testsTotal = 0;
		this.testsPassed = 0;
		this.requiredTotal = 0;
		this.requiredPassed = 0;

		/* Create the iframe and run the tests */
		this.create();
	},
	
	create: function() {
		/* Generate random number */
		var random = Math.floor(Math.random()*999999)
		
		/* Create iframe */
		this.element = Builder.node('iframe', { 
			name: 		'csstest-' + this.options.counter + '-' + this.id, 
			id: 		'csstest-' + this.options.counter + '-' + this.id, 
//			src: 		'test-' + this.id + '.html?r=' + random + '#' + this.id 
			src: 		'test-' + this.id + '.html'
		});
		
		/* Position it offscreen */
		Element.setStyle(this.element, {
			position:	'absolute',
			left:		'-500px',
			width:  	'400px',
			height:		'400px'
		});

		/* Attach onLoad event */
		this.onLoad  = this.load.bind(this);
		Event.observe(this.element, 'load', this.onLoad);
		
		/* Add it to the body element of the DOM */
		document.body.appendChild(this.element);
	},
	
	destroy: function() {
		/* Detach onLoad event and destroy the iframe */
		Event.stopObserving(this.element, 'load', this.onLoad);
		Element.remove(this.element);
	},
	
	load: function() {
		/* Make sure the CSS is properly evaluated before checking the computed styles */
//		setTimeout((function() {this.check()}).bind(this), 1);	
		setTimeout((function() {this.check()}).bind(this), 500);	
    
	},
	
	check: function () {
		this.content = window.frames['csstest-' + this.options.counter + '-' + this.id].document;
	
		if (this.content) {
			this.title = this.content.title;

			var base  = document.getElementsByClassName('base', this.content)[0];
			var basecolor = this.getStyle(base, 'background-color')
			var tests = document.getElementsByClassName('test', this.content);
			
			this.testsTotal = tests.length;

			for (var i = 0; i < tests.length; i++) {
				
				var result  = false;

				if (Element.hasClassName(tests[i], 'float'))
				{
					var f = this.getStyle(tests[i], 'float');
					
					if (Element.hasClassName(tests[i], 'default')) {
						result = f == 'none';
					} else {
						result = f == 'right';						   
					}
				}
				else if(Element.hasClassName(tests[i], 'height')) 
				{
					var h = tests[i].clientHeight;
					
					if (tests[i].nextSibling) {
						var control = tests[i].nextSibling;
						
						while (control.nextSibling && control.nodeType != 1)
							control = control.nextSibling;
						
						control = control.clientHeight;
						if (Element.hasClassName(tests[i], 'default')) {
							result = h == control;					
						} else {
							result = h > control;					
						}
					} else {
						if (Element.hasClassName(tests[i], 'default')) {
							result = h == 0;					
						} else {
							result = h > 0;					
						}
					}
				}
				else
				{
					var c = this.getStyle(tests[i], 'background-color');
					
					if (Element.hasClassName(tests[i], 'default')) {
						result = c == 'transparent' || c == 'rgba(0, 0, 0, 0)';
					} else {
						result = c == basecolor;						   
					}
				}
				
				if (Element.hasClassName(tests[i], 'required')) {
					this.requiredTotal++;
					if (result) {
						this.requiredPassed++;	
					}
				}

				if (result) {
					this.testsPassed++;
				}
				
				this.result &= result;
			}

			/* Done testing... remove the iframe */
			this.destroy();
		
			/* Callback to the CSSTestCase object */
			if (this.result || (this.requiredTotal > 0 && this.requiredTotal == this.requiredPassed)) {
				this.options.onSuccess(this);	
			} else {
				this.options.onFailure(this);	
			}
		}
	},	

  	getStyle: function(element, style) {
    	var value = element.style[style.camelize()];
    	if (!value) {
      		if (this.content.defaultView && this.content.defaultView.getComputedStyle) {
        		var css = this.content.defaultView.getComputedStyle(element, null);
        		value = css ? css.getPropertyValue(style) : null;
      		} else if (element.currentStyle) {
        		value = element.currentStyle[style.camelize()];
      		}
   		}

	    return value == 'auto' ? null : value;
	}
};



