// ==UserScript==
// @name        Imageboard WebM Downloader
// @description A userscript for downloading all WebMs on an imageboard thread into a tarball.
// @homepageURL https://github.com/Zipdox/imageboard-webm-downloader
// @version     1.1
// @grant       GM.xmlHttpRequest
// @grant       GM_xmlHttpRequest
// @match       *://boards.4chan.org/*
// @match       *://boards.4channel.org/*
// @require     https://raw.githubusercontent.com/ankitrohatgi/tarballjs/master/tarball.js
// ==/UserScript==

const navLinks = document.getElementsByClassName('navLinks desktop')[0];
const downloadButton = document.createElement('button');
downloadButton.innerHTML = 'Download WebMs';
navLinks.appendChild(downloadButton);

downloadButton.onclick = async function (){
    if(downloadButton.innerHTML != 'Download WebMs') return;
    var WebMURLs = [];
    for(hyperlink of document.getElementsByTagName('a')){
        if(hyperlink.href.toLowerCase().endsWith('.webm') && !WebMURLs.includes(hyperlink.href.toLowerCase())) WebMURLs.push(hyperlink.href);
    }

    var tar = new tarball.TarWriter();
    for(i = 0; i < WebMURLs.length; i++){
        downloadButton.innerHTML = `Fetching WebM ${i+1}/${WebMURLs.length}`
        console.log('Fetching WebM', WebMURLs[i]);
        var WebMBuffer = await fetchWebm(WebMURLs[i]).catch((error)=>{
            console.error(error);
        });
        var splitUrl = WebMURLs[i].split('/');
        tar.addFileArrayBuffer(splitUrl[splitUrl.length - 1], WebMBuffer.response);
    }
    downloadButton.innerHTML = 'Generating tar file...';
    var tarName = 'webms';
    try{
        tarName = document.getElementsByClassName('postNum desktop')[0].getElementsByTagName('a')[1].textContent;
    }catch(e){
        console.error(e);
    }
    tar.download(tarName + '.tar');
    downloadButton.innerHTML = 'Download WebMs';
}

function fetchWebm(url){
    return new Promise((resolve, reject)=>{
        GM.xmlHttpRequest({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            onload: function (response) {
                resolve(response);
            },
            onerror: function(){
                reject();
            }
        });
    })
}

