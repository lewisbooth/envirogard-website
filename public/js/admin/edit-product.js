"use strict";var newImageInput=document.querySelector('input[name="newImage"]');newImageInput.addEventListener("change",addNewImage);var imagesContainer=document.querySelector(".edit-product__images"),newImageBlock=imagesContainer.querySelector(".edit-product__images--new"),newImageBlockTemplate=newImageBlock.innerHTML,newImageInputTemplate=newImageInput.cloneNode(),newImageText=document.querySelector(".edit-product__images--new--text");function addNewImage(e){var n=e.target;if(n.files&&n.files[0]){var t=new FileReader;t.onload=function(e){var n=imagesContainer.querySelectorAll(".edit-product__images--entry").length,t=elementFromHTML('\n        <div class="edit-product__images--entry" data-key="'+n+'">\n          <img src="#"/>\n          <div class="edit-product__images--entry--delete">×<div> \n        </div>\n      ');t.querySelector("img").setAttribute("src",e.target.result),newImageInput.setAttribute("name","image-"+n),t.appendChild(newImageInput),imagesContainer.insertBefore(t,newImageBlock),newImageBlock.innerHTML=newImageBlockTemplate,(newImageInput=newImageBlock.querySelector('input[name="newImage"]')).addEventListener("change",addNewImage)},t.readAsDataURL(n.files[0])}}function elementFromHTML(e){var n=document.createElement("div");return n.innerHTML=e.trim(),n.firstChild}