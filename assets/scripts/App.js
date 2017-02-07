!function e(n,t,r){function o(u,s){if(!t[u]){if(!n[u]){var a="function"==typeof require&&require;if(!s&&a)return a(u,!0);if(i)return i(u,!0);var c=new Error("Cannot find module '"+u+"'");throw c.code="MODULE_NOT_FOUND",c}var l=t[u]={exports:{}};n[u][0].call(l.exports,function(e){var t=n[u][1][e];return o(t?t:e)},l,l.exports,e,n,t,r)}return t[u].exports}for(var i="function"==typeof require&&require,u=0;u<r.length;u++)o(r[u]);return o}({1:[function(e,n,t){"use strict";function r(e){if(e&&e.__esModule)return e;var n={};if(null!=e)for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&(n[t]=e[t]);return n.default=e,n}function o(e){if(Array.isArray(e)){for(var n=0,t=Array(e.length);n<e.length;n++)t[n]=e[n];return t}return Array.from(e)}function i(e,n){var t={id:"points"+(n?"-highlight":""),type:"circle",source:"dataset",paint:{"circle-color":n?"rgba(0,0,0,0)":"hsl(220,80%,50%)","circle-opacity":.95,"circle-stroke-color":n?"white":"rgba(50,50,50,0.5)","circle-stroke-width":1,"circle-radius":{stops:n?[[10,4],[17,10]]:[[10,2],[17,5]]}}};return e&&(t.filter=e),t}function u(e,n){var t={id:"polygons"+(n?"-highlight":""),type:"fill-extrusion",source:"dataset","source-layer":"Blocks_for_Census_of_Land_Use-7yj9vh",paint:{"fill-extrusion-opacity":.9,"fill-extrusion-height":0,"fill-extrusion-color":"#003"}};return t}function s(e){b.setPaintProperty("points","circle-color",i().paint["circle-color"]),document.querySelector("#legend-enum").innerHTML=""}function a(e){if(w=e,console.log("Data column: "+w),q.numericColumns.indexOf(w)>=0)if("point"===q.shape){var n={property:w,stops:[[{zoom:10,value:q.mins[w]},1],[{zoom:10,value:q.maxs[w]},3],[{zoom:17,value:q.mins[w]},3],[{zoom:17,value:q.maxs[w]},10]]};console.log(n),b.setPaintProperty("points","circle-radius",n),v.showRadiusLegend("#legend-numeric",w,q.mins[w],q.maxs[w])}else{var t=q.filteredRows().map(function(e){return[e[q.locationColumn],e[w]/q.maxs[w]*1e3]}),r=q.filteredRows().map(function(e){return[e[q.locationColumn],"rgb(0,0,"+Math.round(40+e[w]/q.maxs[w]*200)+")"]});b.setPaintProperty("polygons","fill-extrusion-height",{property:"block_id",type:"categorical",stops:t}),b.setPaintProperty("polygons","fill-extrusion-color",{property:"block_id",type:"categorical",stops:r}),b.setFilter("polygons",["!in","block_id"].concat(o(q.filteredRows().filter(function(e){return 0===e[w]}).map(function(e){return e[q.locationColumn]})))),v.showExtrusionHeightLegend("#legend-numeric",w,q.mins[w],q.maxs[w])}else if(textColumns.indexOf(w)>=0){var i={property:w,type:"categorical",stops:sortedFrequencies[w].map(function(e,n){return[e,x[n]]})};console.log(JSON.stringify(i)),b.setPaintProperty("points","circle-color",i),v.showCategoryLegend("#legend-enum",w,i.stops,s)}}function c(e){var n={type:"FeatureCollection",features:[]};return e.forEach(function(e){try{if(e[locationColumn]){var t={type:"Feature",properties:e,geometry:{type:"Point",coordinates:e[locationColumn]}};n.features.push(t)}}catch(n){console.log("Bad location: "+e[locationColumn])}}),n}function l(e){function n(){b.addSource("dataset",t),b.addLayer(i()),b.addLayer(i(["==",locationColumn,"-"],!0)),document.querySelectorAll("#loading")[0].outerHTML="",b.on("mousemove",h)}console.log(maxs);var t={type:"geojson",data:c(e)};d(n)}function f(e){function n(){b.addSource("dataset",{type:"vector",url:"mapbox://opencouncildata.aedfmyp8"}),b.addLayer(u()),document.querySelectorAll("#loading")[0].outerHTML="",b.on("mousemove",h)}d(function(){n()})}function d(e){b.loaded()?e():b.once("load",e)}function p(e){function n(n,t){return"<table>"+Object.keys(e).filter(function(e){return void 0===n||n.indexOf(e)>=0}).map(function(n){return"<tr><td "+t+">"+n+"</td><td>"+e[n]+"</td></tr>"}).join("\n")+"</table>"}void 0===e?(e={},q.textColumns.forEach(function(n){return e[n]=""}),q.numericColumns.forEach(function(n){return e[n]=""}),q.boringColumns.forEach(function(n){return e[n]=""})):"polygon"===q.shape&&(e=q.getRowForBlock(e.block_id,e.census_yr)),document.getElementById("features").innerHTML="<h4>Click a field to visualise with colour</h4>"+n(q.textColumns,'class="enum-field"')+"<h4>Click a field to visualise with size</h4>"+n(q.numericColumns,'class="numeric-field"')+"<h4>Other fields</h4>"+n(q.boringColumns,""),document.querySelectorAll("#features td").forEach(function(e){return e.addEventListener("click",function(e){console.log(e),a(e.target.innerText)})})}function h(e){var n=b.queryRenderedFeatures(e.point,{layers:[q.shape+"s"]})[0];n&&n!==g?(b.getCanvas().style.cursor="pointer",g=n,p(n.properties),"point"===q.shape?b.setFilter("points-highlight",["==",locationColumn,n.properties[locationColumn]]):console.log(n.properties)):b.getCanvas().style.cursor=""}var m=e("./legend"),v=r(m),y=e("./sourceData");mapboxgl.accessToken="pk.eyJ1Ijoic3RldmFnZSIsImEiOiJjaXhxcGs0bzcwYnM3MnZsOWJiajVwaHJ2In0.RN7KywMOxLLNmcTFfn0cig";var g,b=new mapboxgl.Map({container:"map",style:"mapbox://styles/mapbox/dark-v9",center:[144.95,-37.813],zoom:13,pitch:45}),w=void 0,x=["#1f78b4","#fb9a99","#b2df8a","#33a02c","#e31a1c","#fdbf6f","#a6cee3","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"],C=["b36j-kiy4","234q-gg83","c3gt-hrz6"],k=void 0;window.location.hash?k=window.location.hash.replace("#",""):(k=C[Math.floor(Math.random()*C.length)],document.querySelectorAll("#caption h1")[0].innerHTML="Loading random dataset...");var q=(new y.SourceData,new y.SourceData(k));q.load().then(function(e){document.querySelector("#caption h1").innerHTML=q.name,document.querySelector("#source").setAttribute("href","https://data.melbourne.vic.gov.au/d/"+k),document.querySelector("#share").innerHTML='Share this: <a href="https://city-of-melbourne.github.io/Data3D/#'+k+'">https://city-of-melbourne.github.io/Data3D/#'+k+"</a>","point"===q.shape?l(e):f(e),p()})},{"./legend":2,"./sourceData":8}],2:[function(e,n,t){"use strict";function r(e,n,t,r,o){var i=(o?'<div class="close">Close ✖</div>':"")+("<h3>"+n+"</h3>")+('<span class="circle" style="height:6px; width: 6px; border-radius: 3px"></span><label>'+t+"</label><br/>")+('<span class="circle" style="height:20px; width: 20px; border-radius: 10px"></span><label>'+r+"</label>");document.querySelector(e).innerHTML=i,o&&document.querySelector(e+" .close").addEventListener("click",o)}function o(e,n,t,r,o){var i=(o?'<div class="close">Close ✖</div>':"")+("<h3>"+n+"</h3>")+('<span class="circle" style="height:3px; width: 12px; background: rgb(20,20,40)"></span><label>'+t+"</label><br/>")+('<span class="circle" style="height:20px; width: 12px; background: rgb(40,40,250)"></span><label>'+r+"</label>");document.querySelector(e).innerHTML=i,o&&document.querySelector(e+" .close").addEventListener("click",o)}function i(e,n,t,r){legendHtml='<div class="close">Close ✖</div>'+("<h3>"+n+"</h3>")+t.sort(function(e,n){return e[0].localeCompare(n[0])}).map(function(e){return'<span class="box" style=\'background: '+e[1]+"'></span><label>"+e[0]+"</label><br/>"}).join("\n"),document.querySelector(e).innerHTML=legendHtml,document.querySelector(e+" .close").addEventListener("click",circleHandler)}Object.defineProperty(t,"__esModule",{value:!0}),t.showRadiusLegend=r,t.showExtrusionHeightLegend=o,t.showCategoryLegend=i},{}],3:[function(e,n,t){!function(e,r){"object"==typeof t&&"undefined"!=typeof n?r(t):"function"==typeof define&&define.amd?define(["exports"],r):r(e.d3=e.d3||{})}(this,function(e){"use strict";function n(){}function t(e,t){var r=new n;if(e instanceof n)e.each(function(e,n){r.set(n,e)});else if(Array.isArray(e)){var o,i=-1,u=e.length;if(null==t)for(;++i<u;)r.set(i,e[i]);else for(;++i<u;)r.set(t(o=e[i],i,e),o)}else if(e)for(var s in e)r.set(s,e[s]);return r}function r(){return{}}function o(e,n,t){e[n]=t}function i(){return t()}function u(e,n,t){e.set(n,t)}function s(){}function a(e,n){var t=new s;if(e instanceof s)e.each(function(e){t.add(e)});else if(e){var r=-1,o=e.length;if(null==n)for(;++r<o;)t.add(e[r]);else for(;++r<o;)t.add(n(e[r],r,e))}return t}var c="$";n.prototype=t.prototype={constructor:n,has:function(e){return c+e in this},get:function(e){return this[c+e]},set:function(e,n){return this[c+e]=n,this},remove:function(e){var n=c+e;return n in this&&delete this[n]},clear:function(){for(var e in this)e[0]===c&&delete this[e]},keys:function(){var e=[];for(var n in this)n[0]===c&&e.push(n.slice(1));return e},values:function(){var e=[];for(var n in this)n[0]===c&&e.push(this[n]);return e},entries:function(){var e=[];for(var n in this)n[0]===c&&e.push({key:n.slice(1),value:this[n]});return e},size:function(){var e=0;for(var n in this)n[0]===c&&++e;return e},empty:function(){for(var e in this)if(e[0]===c)return!1;return!0},each:function(e){for(var n in this)n[0]===c&&e(this[n],n.slice(1),this)}};var l=function(){function e(n,r,o,i){if(r>=l.length)return null!=a?a(n):null!=s?n.sort(s):n;for(var u,c,f,d=-1,p=n.length,h=l[r++],m=t(),v=o();++d<p;)(f=m.get(u=h(c=n[d])+""))?f.push(c):m.set(u,[c]);return m.each(function(n,t){i(v,t,e(n,r,o,i))}),v}function n(e,t){if(++t>l.length)return e;var r,o=f[t-1];return null!=a&&t>=l.length?r=e.entries():(r=[],e.each(function(e,o){r.push({key:o,values:n(e,t)})})),null!=o?r.sort(function(e,n){return o(e.key,n.key)}):r}var s,a,c,l=[],f=[];return c={object:function(n){return e(n,0,r,o)},map:function(n){return e(n,0,i,u)},entries:function(t){return n(e(t,0,i,u),0)},key:function(e){return l.push(e),c},sortKeys:function(e){return f[l.length-1]=e,c},sortValues:function(e){return s=e,c},rollup:function(e){return a=e,c}}},f=t.prototype;s.prototype=a.prototype={constructor:s,has:f.has,add:function(e){return e+="",this[c+e]=e,this},remove:f.remove,clear:f.clear,values:f.keys,size:f.size,empty:f.empty,each:f.each};var d=function(e){var n=[];for(var t in e)n.push(t);return n},p=function(e){var n=[];for(var t in e)n.push(e[t]);return n},h=function(e){var n=[];for(var t in e)n.push({key:t,value:e[t]});return n};e.nest=l,e.set=a,e.map=t,e.keys=d,e.values=p,e.entries=h,Object.defineProperty(e,"__esModule",{value:!0})})},{}],4:[function(e,n,t){!function(e,r){"object"==typeof t&&"undefined"!=typeof n?r(t):"function"==typeof define&&define.amd?define(["exports"],r):r(e.d3=e.d3||{})}(this,function(e){"use strict";function n(){for(var e,n=0,r=arguments.length,o={};n<r;++n){if(!(e=arguments[n]+"")||e in o)throw new Error("illegal type: "+e);o[e]=[]}return new t(o)}function t(e){this._=e}function r(e,n){return e.trim().split(/^|\s+/).map(function(e){var t="",r=e.indexOf(".");if(r>=0&&(t=e.slice(r+1),e=e.slice(0,r)),e&&!n.hasOwnProperty(e))throw new Error("unknown type: "+e);return{type:e,name:t}})}function o(e,n){for(var t,r=0,o=e.length;r<o;++r)if((t=e[r]).name===n)return t.value}function i(e,n,t){for(var r=0,o=e.length;r<o;++r)if(e[r].name===n){e[r]=u,e=e.slice(0,r).concat(e.slice(r+1));break}return null!=t&&e.push({name:n,value:t}),e}var u={value:function(){}};t.prototype=n.prototype={constructor:t,on:function(e,n){var t,u=this._,s=r(e+"",u),a=-1,c=s.length;{if(!(arguments.length<2)){if(null!=n&&"function"!=typeof n)throw new Error("invalid callback: "+n);for(;++a<c;)if(t=(e=s[a]).type)u[t]=i(u[t],e.name,n);else if(null==n)for(t in u)u[t]=i(u[t],e.name,null);return this}for(;++a<c;)if((t=(e=s[a]).type)&&(t=o(u[t],e.name)))return t}},copy:function(){var e={},n=this._;for(var r in n)e[r]=n[r].slice();return new t(e)},call:function(e,n){if((t=arguments.length-2)>0)for(var t,r,o=new Array(t),i=0;i<t;++i)o[i]=arguments[i+2];if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(r=this._[e],i=0,t=r.length;i<t;++i)r[i].value.apply(n,o)},apply:function(e,n,t){if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(var r=this._[e],o=0,i=r.length;o<i;++o)r[o].value.apply(n,t)}},e.dispatch=n,Object.defineProperty(e,"__esModule",{value:!0})})},{}],5:[function(e,n,t){!function(e,r){"object"==typeof t&&"undefined"!=typeof n?r(t):"function"==typeof define&&define.amd?define(["exports"],r):r(e.d3=e.d3||{})}(this,function(e){"use strict";function n(e){return new Function("d","return {"+e.map(function(e,n){return JSON.stringify(e)+": d["+n+"]"}).join(",")+"}")}function t(e,t){var r=n(e);return function(n,o){return t(r(n),o,e)}}function r(e){var n=Object.create(null),t=[];return e.forEach(function(e){for(var r in e)r in n||t.push(n[r]=r)}),t}function o(e){function o(e,r){var o,u,s=i(e,function(e,i){return o?o(e,i-1):(u=e,void(o=r?t(e,r):n(e)))});return s.columns=u,s}function i(e,n){function t(){if(c>=a)return u;if(o)return o=!1,i;var n,t=c;if(34===e.charCodeAt(t)){for(var r=t;r++<a;)if(34===e.charCodeAt(r)){if(34!==e.charCodeAt(r+1))break;++r}return c=r+2,n=e.charCodeAt(r+1),13===n?(o=!0,10===e.charCodeAt(r+2)&&++c):10===n&&(o=!0),e.slice(t+1,r).replace(/""/g,'"')}for(;c<a;){var s=1;if(n=e.charCodeAt(c++),10===n)o=!0;else if(13===n)o=!0,10===e.charCodeAt(c)&&(++c,++s);else if(n!==f)continue;return e.slice(t,c-s)}return e.slice(t)}for(var r,o,i={},u={},s=[],a=e.length,c=0,l=0;(r=t())!==u;){for(var d=[];r!==i&&r!==u;)d.push(r),r=t();n&&null==(d=n(d,l++))||s.push(d)}return s}function u(n,t){return null==t&&(t=r(n)),[t.map(c).join(e)].concat(n.map(function(n){return t.map(function(e){return c(n[e])}).join(e)})).join("\n")}function s(e){return e.map(a).join("\n")}function a(n){return n.map(c).join(e)}function c(e){return null==e?"":l.test(e+="")?'"'+e.replace(/\"/g,'""')+'"':e}var l=new RegExp('["'+e+"\n]"),f=e.charCodeAt(0);return{parse:o,parseRows:i,format:u,formatRows:s}}var i=o(","),u=i.parse,s=i.parseRows,a=i.format,c=i.formatRows,l=o("\t"),f=l.parse,d=l.parseRows,p=l.format,h=l.formatRows;e.dsvFormat=o,e.csvParse=u,e.csvParseRows=s,e.csvFormat=a,e.csvFormatRows=c,e.tsvParse=f,e.tsvParseRows=d,e.tsvFormat=p,e.tsvFormatRows=h,Object.defineProperty(e,"__esModule",{value:!0})})},{}],6:[function(e,n,t){!function(r,o){"object"==typeof t&&"undefined"!=typeof n?o(t,e("d3-collection"),e("d3-dispatch"),e("d3-dsv")):"function"==typeof define&&define.amd?define(["exports","d3-collection","d3-dispatch","d3-dsv"],o):o(r.d3=r.d3||{},r.d3,r.d3,r.d3)}(this,function(e,n,t,r){"use strict";function o(e){return function(n,t){e(null==n?t:null)}}function i(e){var n=e.responseType;return n&&"text"!==n?e.response:e.responseText}function u(e,n){return function(t){return e(t.responseText,n)}}var s=function(e,r){function u(e){var n,t=p.status;if(!t&&i(p)||t>=200&&t<300||304===t){if(c)try{n=c.call(s,p)}catch(e){return void f.call("error",s,e)}else n=p;f.call("load",s,n)}else f.call("error",s,e)}var s,a,c,l,f=t.dispatch("beforesend","progress","load","error"),d=n.map(),p=new XMLHttpRequest,h=null,m=null,v=0;if("undefined"==typeof XDomainRequest||"withCredentials"in p||!/^(http(s)?:)?\/\//.test(e)||(p=new XDomainRequest),"onload"in p?p.onload=p.onerror=p.ontimeout=u:p.onreadystatechange=function(e){p.readyState>3&&u(e)},p.onprogress=function(e){f.call("progress",s,e)},s={header:function(e,n){return e=(e+"").toLowerCase(),arguments.length<2?d.get(e):(null==n?d.remove(e):d.set(e,n+""),s)},mimeType:function(e){return arguments.length?(a=null==e?null:e+"",s):a},responseType:function(e){return arguments.length?(l=e,s):l},timeout:function(e){return arguments.length?(v=+e,s):v},user:function(e){return arguments.length<1?h:(h=null==e?null:e+"",s)},password:function(e){return arguments.length<1?m:(m=null==e?null:e+"",s)},response:function(e){return c=e,s},get:function(e,n){return s.send("GET",e,n)},post:function(e,n){return s.send("POST",e,n)},send:function(n,t,r){return p.open(n,e,!0,h,m),null==a||d.has("accept")||d.set("accept",a+",*/*"),p.setRequestHeader&&d.each(function(e,n){p.setRequestHeader(n,e)}),null!=a&&p.overrideMimeType&&p.overrideMimeType(a),null!=l&&(p.responseType=l),v>0&&(p.timeout=v),null==r&&"function"==typeof t&&(r=t,t=null),null!=r&&1===r.length&&(r=o(r)),null!=r&&s.on("error",r).on("load",function(e){r(null,e)}),f.call("beforesend",s,p),p.send(null==t?null:t),s},abort:function(){return p.abort(),s},on:function(){var e=f.on.apply(f,arguments);return e===f?s:e}},null!=r){if("function"!=typeof r)throw new Error("invalid callback: "+r);return s.get(r)}return s},a=function(e,n){return function(t,r){var o=s(t).mimeType(e).response(n);if(null!=r){if("function"!=typeof r)throw new Error("invalid callback: "+r);return o.get(r)}return o}},c=a("text/html",function(e){return document.createRange().createContextualFragment(e.responseText)}),l=a("application/json",function(e){return JSON.parse(e.responseText)}),f=a("text/plain",function(e){return e.responseText}),d=a("application/xml",function(e){var n=e.responseXML;if(!n)throw new Error("parse error");return n}),p=function(e,n){return function(t,r,o){arguments.length<3&&(o=r,r=null);var i=s(t).mimeType(e);return i.row=function(e){return arguments.length?i.response(u(n,r=e)):r},i.row(r),o?i.get(o):i}},h=p("text/csv",r.csvParse),m=p("text/tab-separated-values",r.tsvParse);e.request=s,e.html=c,e.json=l,e.text=f,e.xml=d,e.csv=h,e.tsv=m,Object.defineProperty(e,"__esModule",{value:!0})})},{"d3-collection":3,"d3-dispatch":4,"d3-dsv":5}],7:[function(e,n,t){!function(r,o){"object"==typeof t&&"undefined"!=typeof n?n.exports=o(e("d3-request")):"function"==typeof define&&define.amd?define(["d3-request"],o):(r.d3=r.d3||{},r.d3.promise=o(r.d3))}(this,function(e){"use strict";function n(e,n){return function(){for(var t=arguments.length,r=Array(t),o=0;t>o;o++)r[o]=arguments[o];return new Promise(function(t,o){var i=function(e,n){return e?void o(Error(e)):void t(n)};n.apply(e,r.concat(i))})}}var t={};return["csv","tsv","json","xml","text","html"].forEach(function(r){t[r]=n(e,e[r])}),t})},{"d3-request":6}],8:[function(e,n,t){"use strict";function r(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function o(e,n){return void 0!==e?e:n}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,n){for(var t=0;t<n.length;t++){var r=n[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(n,t,r){return t&&e(n.prototype,t),r&&e(n,r),n}}(),u=e("d3.promise");t.SourceData=function(){function e(n,t){r(this,e),this.dataId=n,this.activeCensusYear=o(t,2015),this.locationColumn=void 0,this.locationIsPoint=void 0,this.numericColumns=[],this.textColumns=[],this.boringColumns=[],this.mins={},this.maxs={},this.frequencies={},this.sortedFrequencies={},this.shape="point",this.sourceRows=void 0,this.blockIndex={}}return i(e,[{key:"chooseColumnTypes",value:function(e){var n=this,t=e.filter(function(e){return"location"===e.dataTypeName||"point"===e.dataTypeName||"Block ID"===e.name})[0];"point"===t.dataTypeName&&(this.locationIsPoint=!0),"Block ID"===t.name&&(this.shape="polygon"),this.locationColumn=t.name,e=e.filter(function(e){return e!==t}),this.numericColumns=e.filter(function(e){return"number"===e.dataTypeName&&"Latitude"!==e.name&&"Longitude"!==e.name}).map(function(e){return e.name}),this.numericColumns.forEach(function(e){n.mins[e]=1e9,n.maxs[e]=-1e9}),this.textColumns=e.filter(function(e){return"text"===e.dataTypeName}).map(function(e){return e.name}),this.textColumns.forEach(function(e){return n.frequencies[e]={}}),this.boringColumns=e.map(function(e){return e.name}).filter(function(e){return n.numericColumns.indexOf(e)<0&&n.textColumns.indexOf(e)<0})}},{key:"filter",value:function(e){return(!e["CLUE small area"]||"City of Melbourne total"!==e["CLUE small area"])&&(!e["Census year"]||e["Census year"]===this.activeCensusYear)}},{key:"convertRow",value:function(e){function n(e){return this.locationIsPoint?e.replace("POINT (","").replace(")","").split(" ").map(function(e){return Number(e)}):"point"===this.shape?[Number(e.split(", ")[1].replace(")","")),Number(e.split(", ")[0].replace("(",""))]:e}var t=this;return this.numericColumns.forEach(function(n){e[n]=Number(e[n]),e[n]<t.mins[n]&&t.filter(e)&&(t.mins[n]=e[n]),e[n]>t.maxs[n]&&t.filter(e)&&(t.maxs[n]=e[n])}),this.textColumns.forEach(function(n){var r=e[n];t.frequencies[n][r]=(t.frequencies[n][r]||0)+1}),e[this.locationColumn]=n.call(this,e[this.locationColumn]),e}},{key:"computeSortedFrequencies",value:function(){var e=this,n=[];this.textColumns.forEach(function(t){e.sortedFrequencies[t]=Object.keys(e.frequencies[t]).sort(function(n,r){return e.frequencies[t][n]<e.frequencies[t][r]?1:-1}).slice(0,12),Object.keys(e.frequencies[t]).length<2||Object.keys(e.frequencies[t]).length>20&&e.frequencies[t][e.sortedFrequencies[t][1]]<=5?(boringColumns.push(t),console.log("Boring! "),console.log(e.frequencies[t])):n.push(t)}),this.textColumns=n,console.log(this.sortedFrequencies)}},{key:"load",value:function(){var e=this;return u.json("https://data.melbourne.vic.gov.au/api/views/"+this.dataId+".json").then(function(n){return e.name=n.name,n.newBackend&&n.childViews.length>0?(e.dataId=n.childViews[0],u.json("https://data.melbourne.vic.gov.au/api/views/"+dataId).then(function(n){return e.chooseColumnTypes(n.columns)})):(e.chooseColumnTypes(n.columns),Promise.resolve(!0))}).then(function(){return u.csv("https://data.melbourne.vic.gov.au/api/views/"+e.dataId+"/rows.csv?accessType=DOWNLOAD",e.convertRow.bind(e)).then(function(n){return e.rows=n,e.computeSortedFrequencies(),"polygon"===e.shape&&e.computeBlockIndex(),n})})}},{key:"computeBlockIndex",value:function(){var e=this;this.rows.forEach(function(n,t){void 0===e.blockIndex[n["Census year"]]&&(e.blockIndex[n["Census year"]]={}),e.blockIndex[n["Census year"]][n["Block ID"]]=t})}},{key:"getRowForBlock",value:function(e){return this.rows[this.blockIndex[this.activeCensusYear][e]]}},{key:"filteredRows",value:function(){var e=this;return this.rows.filter(function(n){return n["Census year"]===e.activeCensusYear&&"City of Melbourne total"!==n["CLUE small area"]})}}]),e}()},{"d3.promise":7}]},{},[1]);