'use strict';

//TODO:
// Implement word-breaking capabilities.
// Syntax-highlighting
// If you use tab, make sure it gives you designated amount of spaces. 
//   \--> Disable default. Use &nbsp several times.
// Arrow keys.
// Drag sections.
// The Enter key should move everything after it.
//                should also create a new empty line write below.
// Add Search function ; Drop-down search filter
// Settings page with modal

// ========
// CODE FOR CUSTOM EDITOR
var buffer = [];

var numOfLinesList = {
  "html-editor-area" : 0,
  "css-editor-area" : 0,
  "js-editor-area" : 0
};

var currentLineList = {
  "html-editor-area" : 0,
  "css-editor-area" : 0,
  "js-editor-area" : 0
};

// EVENTS

// Run-btn onclick event
document.getElementById("run-btn").onclick = function() {
  // IFRAME DISPLAY
  var ifrm = document.getElementById('iframe-id');
  ifrm = ifrm.contentWindow || ifrm.contentDocument.document || ifrm.contentDocument;
  ifrm.document.open();
  ifrm.document.write('<!DOCTYPE html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<style>' + retrieveFromEditor("css-editor-area") +
    '</style></head><body>' + retrieveFromEditor("html-editor-area") + 
    '<script async defer>(function() {' + retrieveFromEditor("js-editor-area") +
    '})();</script></body></html>');
  ifrm.document.close();

  // Not making it completely generic, but later,
  // you can add the start and end line # just like clear lines,
  // so it gives you the option to run certain SECTION of code.
  function retrieveFromEditor(editorID) {
    let editLineElems = document.querySelectorAll("#" + editorID + " .edit-line");

    let textContent = "";

    for (let i = 0; i < editLineElems.length; i++) {
      textContent += editLineElems[i].innerHTML;
    }
    return decodeHTML(textContent);
  }

  // Reload the page with the content in the editor. 
  // document.getElementById("iframe-id").src += '';
}

// Get rid of HTML entities while preserving tags.
function decodeHTML(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;

  // Taking care of extra &nbsp 
  txt.innerHTML = txt.innerHTML.replace(/&nbsp;/g,'');

  return txt.value;
}

let clearButtons = document.querySelectorAll(".clear-btn");
clearButtons.forEach(function(clearButton) {
  clearButton.addEventListener("click", function(event) {
    let triggerButton = event.target;
    let editorID = "";
    switch(triggerButton.getAttribute("id")) {
      case "html-clear-btn":
        editorID = "html-editor-area";
        break;
      case "css-clear-btn":
        editorID = "css-editor-area";
        break;
      case "js-clear-btn":
        editorID = "js-editor-area";
        break;
    }
    clearLines(editorID, 1, numOfLinesList[editorID] + 1);
  });
});

let localStorageBtn = document.querySelector("#local-storage-btn");
localStorageBtn.addEventListener("click", function() {
  // Ensure the local storage is empty.
  localStorage.clear();

  let editorLineElems = document.querySelectorAll(".edit-line");
  editorLineElems.forEach(editorLineElem => {
    let editorID = editorLineElem.parentNode.parentNode.getAttribute("id");
    localStorage.setItem(editorID + editorLineElem.getAttribute("id"), decodeHTML(editorLineElem.innerHTML));
  });

  let alertArea = document.getElementById("alert-area");
  alertArea.innerHTML = '<div class="alert alert-success alert-dismissible fade show">' +
    '<strong>Success!</strong> Successfully saved to the local storage.' +
    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
    '<span aria-hidden="true">&times;</span></button></div>';
  window.scrollTo(0, 0);
});

function keyDownOnLine(event) {

  let editorID = event.target.parentNode.parentNode.getAttribute("id");
  // Pressed Enter key.
  if (event.key === "Enter") {
    // Prevent default Enter key behavior from adding '<br><br>'.
    event.preventDefault();
    let annoyingBRs = document.querySelectorAll("#" + editorID + " br");
    annoyingBRs.forEach(annoyingBR => { annoyingBR.parentNode.removeChild(annoyingBR); });

    if (numOfLinesList[editorID] === currentLineList[editorID]) {
      setupLines(editorID, currentLineList[editorID] + 1);
    }
    // Take care of multiple line generations; potentially a problem with copy and paste.

    let nextEditLine = document.querySelector("#" + editorID + " #edit-line-" + (currentLineList[editorID] + 1).toString());
    setTimeout(function() {
      // let line = document.getElementById("edit-line-1");
      // let lineBreak = document.querySelector('#edit-line-1 br');
      // line.removeChild(lineBreak);
      nextEditLine.focus();
      currentLineList[editorID]++;
    }, 0);
  }

  // Pressed ArrowRight or ArrowLeft
  
  // Pressed ArrowUp or ArrowDown (combine ArrowRight/ArrowLeft with focusing)

}

// Increment numOfLines before passing lineNum
function generateLine(editorID, lineNum) {
  let lineNumStr = lineNum.toString();

  let editorArea = document.getElementById(editorID);

  let newLineDiv = document.createElement("div");
  newLineDiv.classList.add("entire-line");

  let spanInLineDiv = document.createElement("span");
  spanInLineDiv.classList.add("line-num");
  spanInLineDiv.classList.add("border-right");
  spanInLineDiv.setAttribute("id", "line-" + lineNumStr);
  spanInLineDiv.textContent = lineNumStr;

  let pInLineDiv = document.createElement("p");
  pInLineDiv.classList.add("edit-line");
  pInLineDiv.setAttribute("id", "edit-line-" + lineNumStr);
  pInLineDiv.lineNum = lineNum;

  let lineContent = localStorage.getItem(editorID + pInLineDiv.getAttribute("id"));
  pInLineDiv.textContent = (lineContent) ? lineContent : "";
  pInLineDiv.contentEditable = "true";

  // Add events
  pInLineDiv.addEventListener("keydown", keyDownOnLine);
  pInLineDiv.addEventListener("click", updateCurrentLine);

  function updateCurrentLine(event) {
    let editorID = event.target.parentNode.parentNode.getAttribute("id");
    if ((event.target.lineNum) && (event.target === document.activeElement))
      currentLineList[editorID] = event.target.lineNum;
  }

  // Append.
  newLineDiv.appendChild(spanInLineDiv);
  newLineDiv.appendChild(pInLineDiv);

  editorArea.appendChild(newLineDiv);
}

function setupLines(editorID, lineAmount) {
  // numOfLines global var, so causes problem when called with different ID
  for (numOfLinesList[editorID]; numOfLinesList[editorID] < lineAmount; numOfLinesList[editorID]++) {
    generateLine(editorID, numOfLinesList[editorID] + 1);
  }
}

// [startLineNum, endLineNum)
function clearLines(editorID, startLineNum, endLineNum) {
  // Retrieve ALL .edit-line elements IN the specified EDITORID
  let editorLineElems = document.querySelectorAll("#" + editorID + " .edit-line");

  // ASSUMING SORTED and all elements have been correctly retrieved.
  for (let i = startLineNum; i < endLineNum; i++) {
    editorLineElems[i - 1].innerHTML = "";
  }
}

function setupEditors(lines) {
  // Execute all methods here.
  setupLines("html-editor-area", lines);
  setupLines("css-editor-area", lines);
  setupLines("js-editor-area", lines);
}

// =====
// =====
// Setup
setupEditors(50);

