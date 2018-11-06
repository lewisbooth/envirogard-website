"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};!function(e,t){"function"==typeof define&&define.amd?define(["flickity/js/index","fizzy-ui-utils/utils"],t):"object"==("undefined"==typeof module?"undefined":_typeof(module))&&module.exports?module.exports=t(require("flickity"),require("fizzy-ui-utils")):e.Flickity=t(e.Flickity,e.fizzyUIUtils)}(window,function(e,t){e.createMethods.push("_createAsNavFor");var n=e.prototype;return n._createAsNavFor=function(){this.on("activate",this.activateAsNavFor),this.on("deactivate",this.deactivateAsNavFor),this.on("destroy",this.destroyAsNavFor);var e=this.options.asNavFor;if(e){var t=this;setTimeout(function(){t.setNavCompanion(e)})}},n.setNavCompanion=function(n){n=t.getQueryElement(n);var i=e.data(n);if(i&&i!=this){this.navCompanion=i;var o=this;this.onNavCompanionSelect=function(){o.navCompanionSelect()},i.on("select",this.onNavCompanionSelect),this.on("staticClick",this.onNavStaticClick),this.navCompanionSelect(!0)}},n.navCompanionSelect=function(e){if(this.navCompanion){var t,n,i,o=this.navCompanion.selectedCells[0],a=this.navCompanion.cells.indexOf(o),s=a+this.navCompanion.selectedCells.length-1,l=Math.floor((t=a,n=s,i=this.navCompanion.cellAlign,(n-t)*i+t));if(this.selectCell(l,!1,e),this.removeNavSelectedElements(),!(l>=this.cells.length)){var c=this.cells.slice(a,s+1);this.navSelectedElements=c.map(function(e){return e.element}),this.changeNavSelectedClass("add")}}},n.changeNavSelectedClass=function(e){this.navSelectedElements.forEach(function(t){t.classList[e]("is-nav-selected")})},n.activateAsNavFor=function(){this.navCompanionSelect(!0)},n.removeNavSelectedElements=function(){this.navSelectedElements&&(this.changeNavSelectedClass("remove"),delete this.navSelectedElements)},n.onNavStaticClick=function(e,t,n,i){"number"==typeof i&&this.navCompanion.selectCell(i)},n.deactivateAsNavFor=function(){this.removeNavSelectedElements()},n.destroyAsNavFor=function(){this.navCompanion&&(this.navCompanion.off("select",this.onNavCompanionSelect),this.off("staticClick",this.onNavStaticClick),delete this.navCompanion)},e});