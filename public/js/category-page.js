"use strict";var _slicedToArray=function(){return function(e,r){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return function(e,r){var t=[],n=!0,o=!1,a=void 0;try{for(var u,i=e[Symbol.iterator]();!(n=(u=i.next()).done)&&(t.push(u.value),!r||t.length!==r);n=!0);}catch(e){o=!0,a=e}finally{try{!n&&i.return&&i.return()}finally{if(o)throw a}}return t}(e,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();function _defineProperty(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}var readMoreButton=document.querySelector(".category__description--read-more"),categoryDescription=document.querySelector(".category__description"),sortByInput=document.querySelector('select[name="sortBy"]'),searchForm=document.querySelector('form[name="search"]'),searchInput=document.querySelector('input[name="search"]'),urlParams=getUrlParams(window.location.search);function submitInput(){var e=buildQueryString(urlParams);window.location=window.location.pathname+e}function buildQueryString(e){return"?"+Object.keys(e).map(function(r){return r+"="+e[r]}).join("&")}function getUrlParams(e){return 0===e.length?{}:e.slice(e.indexOf("?")+1).split("&").reduce(function(e,r){var t=r.split("="),n=_slicedToArray(t,2),o=n[0],a=n[1];return Object.assign(e,_defineProperty({},o,decodeURIComponent(a)))},{})}sortByInput.addEventListener("change",function(){urlParams.sortBy=sortByInput.value,submitInput()}),searchForm.addEventListener("submit",function(e){e.preventDefault(),urlParams.search=searchInput.value,submitInput()}),readMoreButton.addEventListener("click",function(){return categoryDescription.classList.toggle("expanded")});