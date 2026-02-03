// Pull Requests Enterprise Integration
// Clean version with IIFE wrapper to prevent variable collisions

(function() {
'use strict';

console.log("PULL REQUESTS: Initializing...");

// Local variables (won't conflict with maps.js)
var isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var processedItems = new Set();

function createItemKey(callNumber, status) {
    return (callNumber + '|' + status).toLowerCase();
}

function isAlreadyProcessed(callNumber, status) {
    return processedItems.has(createItemKey(callNumber, status));
}

function markAsProcessed(callNumber, status) {
    processedItems.add(createItemKey(callNumber, status));
}

function checkElements() {
    console.log("PULL REQUESTS: Checking elements...");
    
    // Get author and title from page
    var authorElement = document.querySelector(".displayElementText.text-p.PERSONAL_AUTHOR a") ||
                       document.querySelector(".PERSONAL_AUTHOR a") ||
                       document.querySelector("[class*='AUTHOR'] a");
    var titleElement = document.querySelector(".displayElementText.text-p.INITIAL_TITLE_SRCH") ||
                      document.querySelector(".INITIAL_TITLE_SRCH") ||
                      document.querySelector("[class*='TITLE']");
    
    var author = authorElement ? authorElement.textContent.trim() : "";
    var title = titleElement ? titleElement.textContent.trim() : "";
    
    console.log("PULL REQUESTS: Author='" + author + "', Title='" + (title || "").substring(0, 30) + "'");
    
    // Find status elements
    var statusElements = document.querySelectorAll(".asyncFieldSD_ITEM_STATUS");
    console.log("PULL REQUESTS: Found " + statusElements.length + " status elements");
    
    if (statusElements.length === 0) return;
    
    statusElements.forEach(function(statusElement, index) {
        var status = statusElement.textContent.trim();
        
        if (status !== "Checked In") {
            return; // Skip non-checked-in items
        }
        
        // Find call number - try multiple strategies
        var callNumber = findCallNumber(statusElement);
        
        console.log("PULL REQUESTS: Item " + (index + 1) + " - Status: '" + status + "', Call: '" + callNumber + "'");
        
        if (!callNumber) {
            console.log("PULL REQUESTS: Skipping - no call number found");
            return;
        }
        
        if (isAlreadyProcessed(callNumber, status)) {
            console.log("PULL REQUESTS: Skipping - already processed");
            return;
        }
        
        // Create the form/button
        createForm(author, title, callNumber, statusElement);
        markAsProcessed(callNumber, status);
    });
}

function findCallNumber(statusElement) {
    // Strategy 1: Look in the same row/container
    var container = statusElement.closest(".detailItemsTableRow") ||
                   statusElement.closest("tr") ||
                   statusElement.closest("div");
    
    if (container) {
        var callEl = container.querySelector(".detailItemsTable_CALLNUMBER") ||
                    container.querySelector("[class*='CALLNUMBER']");
        if (callEl) {
            var text = callEl.textContent.trim();
            if (text && text.length > 2 && text.toLowerCase() !== 'call number' && text.toLowerCase() !== 'call#') {
                return text;
            }
        }
    }
    
    // Strategy 2: Search document-wide for call number elements
    var callElements = document.querySelectorAll(".detailItemsTable_CALLNUMBER, [class*='CALLNUMBER']");
    for (var i = 0; i < callElements.length; i++) {
        var text = callElements[i].textContent.trim();
        // Skip labels
        if (text.toLowerCase() === 'call number' || text.toLowerCase() === 'call#' || 
            text.toLowerCase() === 'shelf number' || text.length < 3) {
            continue;
        }
        // Check if it looks like a call number (has letters and numbers, or is a name for Popular Books)
        if (/[A-Za-z]/.test(text) && (text.length > 3)) {
            return text;
        }
    }
    
    return "";
}

function createForm(author, title, callNumber, statusElement) {
    console.log("PULL REQUESTS: Creating form for: " + callNumber);
    
    // Find where to insert the button
    var holdLinkElement = null;
    
    // Try to find hold link element
    var container = statusElement.closest(".detailItemsTableRow") ||
                   statusElement.closest("tr") ||
                   statusElement.closest("div") ||
                   statusElement.parentElement;
    
    if (container) {
        holdLinkElement = container.querySelector(".asyncFieldSD_ITEM_HOLD_LINK") ||
                         container.querySelector("[class*='HOLD_LINK']");
    }
    
    // If not in container, search document
    if (!holdLinkElement) {
        var docHoldLinks = document.querySelectorAll(".asyncFieldSD_ITEM_HOLD_LINK");
        for (var i = 0; i < docHoldLinks.length; i++) {
            if (!docHoldLinks[i].classList.contains('pullrequest-processed')) {
                holdLinkElement = docHoldLinks[i];
                break;
            }
        }
    }
    
    // Fallback: create container next to status element
    if (!holdLinkElement) {
        holdLinkElement = document.createElement('span');
        holdLinkElement.className = 'pullrequest-button-container';
        holdLinkElement.style.cssText = 'display: inline-block; margin-left: 10px;';
        var insertTarget = statusElement.parentElement || statusElement;
        if (insertTarget.parentElement) {
            insertTarget.parentElement.appendChild(holdLinkElement);
        }
    }
    
    if (!holdLinkElement) {
        console.log("PULL REQUESTS: Could not find place to insert button");
        return;
    }
    
    holdLinkElement.classList.add('pullrequest-processed');
    
    // Inject styles if needed
    if (!document.getElementById("request-form-style")) {
        var style = document.createElement("style");
        style.id = "request-form-style";
        style.textContent = `
            .blue-button {
                background-color: #326BA9;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            }
            .blue-button:hover {
                background-color: #285a8c;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create form
    var form = document.createElement("form");
    form.action = "https://web.byui.edu/library/pull-request";
    form.method = "get";
    
    form.appendChild(createHiddenInput("author", author));
    form.appendChild(createHiddenInput("title", title));
    form.appendChild(createHiddenInput("call_number", callNumber));
    
    var button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Pickup/Delivery";
    button.className = "blue-button";
    
    form.appendChild(button);
    
    holdLinkElement.innerHTML = "";
    holdLinkElement.appendChild(form);
    
    console.log("PULL REQUESTS: Button created successfully");
}

function createHiddenInput(name, value) {
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    return input;
}

function watchForElements() {
    var attempts = 0;
    var maxAttempts = isMobileDevice ? 60 : 30;
    var interval = isMobileDevice ? 750 : 500;
    
    var watcher = setInterval(function() {
        attempts++;
        
        var targetElement = document.querySelector(".asyncFieldSD_ITEM_STATUS");
        
        if (targetElement) {
            console.log("PULL REQUESTS: Target found on attempt " + attempts);
            clearInterval(watcher);
            setTimeout(checkElements, isMobileDevice ? 1500 : 750);
        } else if (attempts >= maxAttempts) {
            console.log("PULL REQUESTS: Max attempts reached, running final check");
            clearInterval(watcher);
            checkElements();
        }
    }, interval);
}

function domReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

// Initialize
domReady(function() {
    console.log("PULL REQUESTS: DOM ready, starting watcher");
    watchForElements();
});

})(); // End IIFE
