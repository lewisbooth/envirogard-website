"use strict";var form=document.forms.subcategory,titleInput=form.querySelector('input[name="title"]'),categoryInput=form.querySelector('select[name="category"]'),addProductInput=form.querySelector('[name="productDropdown"]'),autocompleteContainer=form.querySelector(".edit-linked__listings--autocomplete"),autocompleteResults=form.querySelector(".edit-linked__listings--autocomplete ul"),productContainer=form.querySelector(".edit-linked__listings--container"),deleteConfirmation=document.querySelector("#delete-item__lightbox");addProductInput.addEventListener("keyup",openDropdown),addProductInput.addEventListener("focusin",openDropdown);var products=[],SEARCH_API="/api/products/search";function openDropdown(){renderDropdown([],"Searching for products..."),axios.post(SEARCH_API,{search:addProductInput.value}).then(function(t){renderDropdown(t.data)})}function renderDropdown(t,e){var o=t.filter(function(t){var e=!1;return products.forEach(function(o){o.id===t.id&&(e=!0)}),!e});o.length>0?autocompleteResults.innerHTML=o.map(function(t){return'<li data-id="'+t.id+'" \n        data-edit="'+t.editURL+'" \n        onmousedown="addProduct(event)">\n          '+t.title+"\n      </li>"}).join(""):autocompleteResults.innerHTML=e?"<li>"+e+"</li>":"<li>No products found</li>",autocompleteContainer.removeAttribute("hidden")}function updateProductsFromDOM(){var t=productContainer.querySelectorAll("div[data-id]")||[];products=[],t.forEach(function(t){var e=t.dataset.id,o=t.querySelector(".button").getAttribute("href"),r=t.querySelector("span").innerText;products.push({id:e,editURL:o,title:r})})}function addProduct(t){products.push({id:t.target.dataset.id,title:t.target.innerText,editURL:t.target.dataset.edit}),sortProductList(),renderProductList(),addProductInput.value=""}function removeProduct(t){var e=t.target.parentElement.parentElement.dataset.id,o=0;products.forEach(function(t,r){t.id===e&&(o=r)}),products.splice(o,1),renderProductList()}function sortProductList(){products=products.sort(function(t,e){return t.title>e.title})}function renderProductList(){productContainer.innerHTML=products.map(function(t){return'\n    <div data-id="'+t.id+'">\n      <span>'+t.title+"</span>\n      <div>\n        <a href="+t.editURL+' class="button" target="_blank">Edit Product</a>\n        <span onclick="removeProduct(event)">Remove</span>\n      </div>\n    </div>\n  '}).join("")}function submitForm(t){t.preventDefault(),errors.clear(),axios.post(window.location.pathname,{title:titleInput.value,category:categoryInput.value,products:JSON.stringify(products.map(function(t){return t.id}))}).then(function(){return window.location="/dashboard/subcategories"}).catch(function(t){var e=t.response.data||{title:"Error uploading subcategory",text:"Please try again. If the problem persists, please contact AMP."};errors.flash(e.title,e.text)})}function toggleDeleteConfirmation(){deleteConfirmation.classList.toggle("active")}updateProductsFromDOM();