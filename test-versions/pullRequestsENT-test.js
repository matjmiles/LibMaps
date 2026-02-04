// Pull Requests Enterprise Integration
// TEST VERSION - Debug mode enabled
// Date: 2026-02-04

(function() {
'use strict';

console.log("==============================================");
console.log("PULL REQUESTS TEST VERSION - Debug Mode ENABLED");
console.log("==============================================");

window.pullRequestsENTLoaded = true;

var isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var debugMode = true;
var processedItems = new Set();

// Debug overlay (blue to distinguish from maps green overlay)
function createDebugOverlay() {
    var debugDiv = document.createElement('div');
    debugDiv.id = 'pullrequest-test-debug';
    debugDiv.style.cssText = 'position:fixed;bottom:10px;left:10px;background:rgba(0,0,50,0.95);color:#00bfff;padding:15px;font-family:monospace;font-size:11px;z-index:999998;border:3px solid #0066ff;max-height:250px;max-width:350px;overflow-y:auto;border-radius:8px;box-shadow:0 0 20px rgba(0,102,255,0.5);';
    debugDiv.innerHTML = '<strong style="color:#ffff00;">📦 PULL REQUESTS TEST</strong><br>';
    debugDiv.innerHTML += '<div style="color:#00ffff;">Loaded: ' + new Date().toLocaleTimeString() + '</div>';
    debugDiv.innerHTML += '<div style="color:#00ffff;">Mobile: ' + isMobileDevice + '</div>';
    
    var closeBtn = document.createElement('span');
    closeBtn.innerHTML = ' ❌';
    closeBtn.style.cssText = 'position:absolute;top:5px;right:10px;cursor:pointer;color:#fff;font-size:14px;';
    closeBtn.onclick = function() { debugDiv.style.display = 'none'; };
    debugDiv.querySelector('strong').appendChild(closeBtn);
    
    document.body.appendChild(debugDiv);
    return debugDiv;
}

function debugLog(message, data) {
    if (debugMode) {
        console.log("PULL REQUESTS DEBUG: " + message, data || "");
        
        setTimeout(function() {
            try {
                var debugDiv = document.getElementById('pullrequest-test-debug');
                if (!debugDiv && document.body) {
                    debugDiv = createDebugOverlay();
                }
                if (debugDiv) {
                    var timestamp = new Date().toLocaleTimeString();
                    var color = message.includes('✅') ? '#00ff00' :
                               message.includes('❌') || message.includes('ERROR') ? '#ff4444' :
                               message.includes('⚠️') ? '#ffff00' : '#00bfff';
                    debugDiv.innerHTML += '<div style="color:' + color + ';margin:2px 0;font-size:10px;">' + timestamp + ': ' + message + '</div>';
                    
                    if (data && typeof data === 'object') {
                        debugDiv.innerHTML += '<div style="color:#888888;margin-left:10px;font-size:9px;">' + JSON.stringify(data) + '</div>';
                    }
                    
                    debugDiv.scrollTop = debugDiv.scrollHeight;
                }
            } catch (e) {
                console.error('Debug overlay error:', e);
            }
        }, 50);
    }
}

debugLog("Pull Requests Test Version Loaded");
debugLog("Mobile: " + isMobileDevice);

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
    debugLog("🔍 Checking elements...");
    
    var authorElement = document.querySelector(".displayElementText.text-p.PERSONAL_AUTHOR a") ||
                       document.querySelector(".PERSONAL_AUTHOR a") ||
                       document.querySelector("[class*='AUTHOR'] a");
    var titleElement = document.querySelector(".displayElementText.text-p.INITIAL_TITLE_SRCH") ||
                      document.querySelector(".INITIAL_TITLE_SRCH") ||
                      document.querySelector("[class*='TITLE']");
    
    var author = authorElement ? authorElement.textContent.trim() : "";
    var title = titleElement ? titleElement.textContent.trim() : "";
    
    debugLog("Author: '" + author + "'");
    debugLog("Title: '" + (title || "").substring(0, 40) + "...'");
    
    var statusElements = document.querySelectorAll(".asyncFieldSD_ITEM_STATUS");
    debugLog("Found " + statusElements.length + " status elements");
    
    if (statusElements.length === 0) {
        debugLog("⚠️ No status elements found, trying alternative...");
        statusElements = document.querySelectorAll("[class*='STATUS']");
        debugLog("Alt search found " + statusElements.length + " elements");
    }
    
    if (statusElements.length === 0) return;
    
    statusElements.forEach(function(statusElement, index) {
        var status = statusElement.textContent.trim();
        
        debugLog("Item " + (index + 1) + " status: '" + status + "'");
        
        if (status !== "Checked In") {
            debugLog("Skipping - not 'Checked In'");
            return;
        }
        
        var callNumber = findCallNumber(statusElement);
        
        debugLog("Item " + (index + 1) + " call#: '" + callNumber + "'");
        
        if (!callNumber) {
            debugLog("❌ Skipping - no call number");
            return;
        }
        
        if (isAlreadyProcessed(callNumber, status)) {
            debugLog("⚠️ Skipping - already processed");
            return;
        }
        
        createForm(author, title, callNumber, statusElement);
        markAsProcessed(callNumber, status);
    });
}

function findCallNumber(statusElement) {
    var container = statusElement.closest(".detailItemsTableRow") ||
                   statusElement.closest("tr") ||
                   statusElement.closest("div");
    
    if (container) {
        var callEl = container.querySelector(".detailItemsTable_CALLNUMBER") ||
                    container.querySelector("[class*='CALLNUMBER']");
        if (callEl) {
            var text = callEl.textContent.trim();
            if (text && text.length > 2 && text.toLowerCase() !== 'call number' && text.toLowerCase() !== 'call#') {
                debugLog("Found call# in container: '" + text + "'");
                return text;
            }
        }
    }
    
    var callElements = document.querySelectorAll(".detailItemsTable_CALLNUMBER, [class*='CALLNUMBER']");
    for (var i = 0; i < callElements.length; i++) {
        var text = callElements[i].textContent.trim();
        if (text.toLowerCase() === 'call number' || text.toLowerCase() === 'call#' || 
            text.toLowerCase() === 'shelf number' || text.length < 3) {
            continue;
        }
        if (/[A-Za-z]/.test(text) && (text.length > 3)) {
            debugLog("Found call# document-wide: '" + text + "'");
            return text;
        }
    }
    
    return "";
}

function createForm(author, title, callNumber, statusElement) {
    debugLog("✅ Creating form for: " + callNumber);
    
    var holdLinkElement = null;
    
    var container = statusElement.closest(".detailItemsTableRow") ||
                   statusElement.closest("tr") ||
                   statusElement.closest("div") ||
                   statusElement.parentElement;
    
    if (container) {
        holdLinkElement = container.querySelector(".asyncFieldSD_ITEM_HOLD_LINK") ||
                         container.querySelector("[class*='HOLD_LINK']");
    }
    
    if (!holdLinkElement) {
        var docHoldLinks = document.querySelectorAll(".asyncFieldSD_ITEM_HOLD_LINK");
        for (var i = 0; i < docHoldLinks.length; i++) {
            if (!docHoldLinks[i].classList.contains('pullrequest-processed')) {
                holdLinkElement = docHoldLinks[i];
                break;
            }
        }
    }
    
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
        debugLog("❌ Could not find place for button");
        return;
    }
    
    holdLinkElement.classList.add('pullrequest-processed');
    
    if (!document.getElementById("request-form-style")) {
        var style = document.createElement("style");
        style.id = "request-form-style";
        style.textContent = '.blue-button { background-color: #326BA9; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; } .blue-button:hover { background-color: #285a8c; }';
        document.head.appendChild(style);
    }
    
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
    
    // DEBUG: Log when button is clicked
    button.addEventListener('click', function(e) {
        debugLog("==============================================");
        debugLog("📦 PICKUP/DELIVERY BUTTON CLICKED");
        debugLog("==============================================");
        debugLog("Author: " + author);
        debugLog("Title: " + title.substring(0, 50) + "...");
        debugLog("Call#: " + callNumber);
        debugLog("Form URL: " + form.action);
        debugLog("==============================================");
    });
    
    form.appendChild(button);
    
    holdLinkElement.innerHTML = "";
    holdLinkElement.appendChild(form);
    
    debugLog("✅ Button created for: " + callNumber);
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
    
    debugLog("Starting watcher (max " + maxAttempts + " attempts)");
    
    var watcher = setInterval(function() {
        attempts++;
        
        var targetElement = document.querySelector(".asyncFieldSD_ITEM_STATUS");
        
        if (targetElement) {
            debugLog("✅ Target found on attempt " + attempts);
            clearInterval(watcher);
            setTimeout(checkElements, isMobileDevice ? 1500 : 750);
        } else if (attempts >= maxAttempts) {
            debugLog("⚠️ Max attempts reached");
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

domReady(function() {
    debugLog("DOM ready, starting watcher");
    watchForElements();
});

})();
