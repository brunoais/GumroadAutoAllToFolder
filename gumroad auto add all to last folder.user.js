// ==UserScript==
// @name         gumroad auto add all to last folder
// @namespace    https://github.com/brunoais/GumroadAutoAllToFolder/
// @version      1.0
// @description  Add all files from outside the folders into the last listed folder
// @author       Brunoais
// @require      https://cdn.jsdelivr.net/gh/andywer/drag-mock/dist/drag-mock.js
// @match        https://app.gumroad.com/products/*
// @icon         https://www.google.com/s2/favicons?domain=gumroad.com
// @updateURL    https://raw.githubusercontent.com/brunoais/GumroadAutoAllToFolder/master/
// @downloadURL  https://raw.githubusercontent.com/brunoais/GumroadAutoAllToFolder/master/
// @supportURL   https://github.com/brunoais/GumroadAutoAllToFolder/issues
// @grant        unsafeWindow
// ==/UserScript==


const asleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

(function() {
    'use strict';


	function recheckFiles(){

		unsafeWindow.container = document.querySelector('.bordered-list-component.product-files.product-edit-subsection');
		unsafeWindow.unsortedFiles = unsafeWindow.container.querySelectorAll('.unsorted-files .reordering-handle');
		unsafeWindow.intoDirectory = unsafeWindow.container.querySelector('.generic-row-component.product-files__folder-row.product-files__folder-row--expanded:last-child .product-files__folder-row__files');
	}

	unsafeWindow.recheckFiles = recheckFiles;
	setTimeout(recheckFiles, 3000);

	unsafeWindow.extraX = 0;
	unsafeWindow.extraY = 8; // I don't know why this magic number works. I only know it does

	async function dragIt(src, target){

		// must be visible, otherwise, it will break
		src.scrollIntoView({behavior: "auto", block: "center", inline: "start"});

		let rect = target.getBoundingClientRect();
		let clientX = rect.x + parseInt(rect.width / 2, 10);
		let clientY = rect.y + parseInt(rect.height / 2, 10);

		src.dispatchEvent(new MouseEvent('mousedown', {
			button: 0,
			buttons: 1,
			which: 1,
			clientX,
			clientY,
			bubbles: true,
			cancelable: true
		  }))

		await asleep(100);

		dragMock.dragStart(src, { clientX, clientY })

		await asleep(100);

		rect = target.getBoundingClientRect();

		clientX = rect.x + parseInt(rect.width / 2, 10) + unsafeWindow.extraX;
		clientY = rect.bottom - Math.min(unsafeWindow.extraY, parseInt(rect.height / 20, 10)) + 9;

		await asleep(100);
		//await asleep(2000);

		console.info("mouseAt:", { clientX, clientY }, "reducing as:", parseInt(rect.height / 10, 10));

		dragMock.dragEnter(target, { clientX, clientY })
		.dragOver(target, { clientX, clientY })

		await asleep(100);

		//rect = target.getBoundingClientRect();

		//clientX = rect.x + parseInt(rect.width / 2, 10) + unsafeWindow.extraX;
		//clientY = rect.bottom + unsafeWindow.extraY;

		dragMock.drop(target, { clientX, clientY })

		await asleep(100);
		unsafeWindow.unsortedFiles = unsafeWindow.container.querySelectorAll('.unsorted-files .reordering-handle');

	}

	unsafeWindow.dragIt = dragIt;

	unsafeWindow.running = false;

	async function startDraggingFiles(){
		unsafeWindow.recheckFiles();

        if(unsafeWindow.running){
            unsafeWindow.running = false;
            console.log("stopping");
            return;
        }

		try{
			unsafeWindow.running = true;
			submitButton.textContent = 'Cancel';


		if(!unsafeWindow.intoDirectory){
			if(!unsafeWindow.container.querySelector('.generic-row-component.product-files__folder-row')){
				alert("You need to create the folder yourself before using this script");
			} else if(unsafeWindow.container.querySelector('.generic-row-component.product-files__folder-row.product-files__folder-row--expanded .product-files__folder-row__files')){
				alert("This script only works by adding to the last folder and the last folder must be opened");
			} else {
				alert("The last folder is not opened");
			}
		}

			while(unsafeWindow.running && unsafeWindow.unsortedFiles[0] && unsafeWindow.unsortedFiles[0]){
				await dragIt(unsafeWindow.unsortedFiles[0], unsafeWindow.intoDirectory);
				unsafeWindow.recheckFiles();
			}
		} finally {
			unsafeWindow.running = false;
            submitButton.textContent = 'Execute';
		}
	}


	var reenforceStyleStyle = document.createElement('style');
	reenforceStyleStyle.setAttribute('importerForm', '');
	reenforceStyleStyle.textContent = `

	.gumroadAutoIntoFolder, .gumroadAutoIntoFolder * {
		all: revert;
	}
	.gumroadAutoIntoFolder {
		position:fixed;
		top: 30%;
		right: 10px;
		display: grid;
		z-index:1000;
		background-color: white;
	}
	.gumroadAutoIntoFolder input{
		width: 45px;
	}

	`;

    var gumroadAutoIntoFolder = document.createElement('form');
    gumroadAutoIntoFolder.classList.add('gumroadAutoIntoFolder');
    gumroadAutoIntoFolder.method = 'GET';
    gumroadAutoIntoFolder.action = '';

    var submitButton = document.createElement('button');
    submitButton.textContent = 'Execute';
    submitButton.type = 'button';
    submitButton.addEventListener('click', startDraggingFiles);


    gumroadAutoIntoFolder.append('Auto into folder: ', submitButton);

	document.body.appendChild(gumroadAutoIntoFolder);

	setInterval(() =>{
		if(!gumroadAutoIntoFolder.parentNode) document.body.appendChild(gumroadAutoIntoFolder)
		if(!reenforceStyleStyle.parentNode) document.head.appendChild(reenforceStyleStyle)
	}, 1000);




})();
