"use strict";var form=document.forms.faq,editorElement=document.getElementById("pell"),editorContent=document.getElementById("pell-data").value,editor=pell.init({element:editorElement,actions:["bold","italic","heading2","paragraph","link","olist","ulist"],onChange:function(t){}});function submitForm(t){t.preventDefault(),errors.clear(),axios.post(window.location.pathname,{pageContent:editor.content.innerHTML}).then(function(){return window.location="/dashboard/faq"}).catch(function(t){console.log("test");var e=t.response.data||{title:"Error saving page data",text:"Please try again. If the problem persists, please contact AMP."};errors.flash(e.title,e.text)})}editor.content.innerHTML=editorContent,editor.addEventListener("paste",function(t){t.preventDefault();var e=(t.originalEvent||t).clipboardData.getData("text/plain");document.execCommand("insertHTML",!1,e)});