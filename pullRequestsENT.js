// Pull Requests Enterprise Integration
// Mobile-compatible version with improved DOM detection
// IIFE wrapper to prevent global variable collisions with maps.js

(function() {
'use strict';

// Set a global flag so maps.js knows this script has loaded
// This is the ONLY global variable we expose
window.pullRequestsENTLoaded = true;

console.log("PULL REQUESTS: Initializing Pull Requests integration...");

// Mobile detection (local to this IIFE - won't overwrite maps.js)
var isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var debugMode = true; // ENABLED for mobile debugging

// IMMEDIATE DEBUG OVERLAY - Create as soon as possible (MOBILE ONLY)
(function() {
    // Wait for body to exist, then create overlay immediately (only on mobile)
    function tryCreateOverlay() {
        if (!isMobileDevice) return; // Skip overlay for non-mobile
        if (document.body) {
            var debugDiv = document.createElement('div');
            debugDiv.id = 'pullrequest-debug';
            debugDiv.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;background:rgba(0,0,0,0.95);color:#00ff00;padding:15px;font-family:monospace;font-size:11px;z-index:999999;border:3px solid #ff0000;max-height:300px;overflow-y:auto;border-radius:8px;box-shadow:0 0 20px rgba(255,0,0,0.5);';
            debugDiv.innerHTML = '<strong style="color:#ffff00;">🔧 PULL REQUEST DEBUG</strong><br>';
            debugDiv.innerHTML += '<div style="color:#00ffff;">Script loaded at: ' + new Date().toLocaleTimeString() + '</div>';
            debugDiv.innerHTML += '<div style="color:#00ffff;">Mobile: ' + isMobileDevice + '</div>';
            debugDiv.innerHTML += '<div style="color:#00ffff;">UA: ' + navigator.userAgent.substring(0, 50) + '...</div>';
            
            // Close button
            var closeBtn = document.createElement('span');
            closeBtn.innerHTML = ' ❌';
            closeBtn.style.cssText = 'position:absolute;top:5px;right:10px;cursor:pointer;color:#fff;font-size:14px;';
            closeBtn.onclick = function() { debugDiv.style.display = 'none'; };
            debugDiv.querySelector('strong').appendChild(closeBtn);
            
            // Copy button
            var copyBtn = document.createElement('span');
            copyBtn.innerHTML = ' 📋COPY';
            copyBtn.style.cssText = 'position:absolute;top:5px;right:40px;cursor:pointer;color:#0af;font-size:12px;';
            copyBtn.onclick = function() { 
                var text = debugDiv.innerText;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(function() {
                        alert('Copied!');
                    });
                } else {
                    prompt('Copy this:', text);
                }
            };
            debugDiv.querySelector('strong').appendChild(copyBtn);
            
            document.body.appendChild(debugDiv);
            console.log("PULL REQUESTS: Debug overlay created");
            
            // Add initial status message directly to overlay
            debugDiv.innerHTML += '<div style="color:#ffff00;">✅ Overlay created, waiting for DOM...</div>';
        } else {
            // Body not ready, try again
            setTimeout(tryCreateOverlay, 100);
        }
    }
    tryCreateOverlay();
})();

// Wrap everything in try-catch to surface errors
try {

// Wait for overlay to exist before continuing
function waitForOverlayThenRun() {
    var debugEl = document.getElementById('pullrequest-debug');
    if (debugEl) {
        debugEl.innerHTML += '<div style="color:#ffff00;">✅ Main code starting...</div>';
        runMainCode();
    } else {
        setTimeout(waitForOverlayThenRun, 100);
    }
}

// Delay start to let overlay be created first
setTimeout(waitForOverlayThenRun, 200);

function runMainCode() {

// Immediate trace
var dbg = document.getElementById('pullrequest-debug');
if (dbg) dbg.innerHTML += '<div style="color:#ffff00;">✅ Inside runMainCode...</div>';

// Mobile debug overlay - update function
function createMobileDebugOverlay() {
    var existing = document.getElementById('pullrequest-debug');
    if (existing) return existing;
    
    var debugDiv = document.createElement('div');
    debugDiv.id = 'pullrequest-debug';
    debugDiv.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;background:rgba(0,0,0,0.95);color:#00ff00;padding:15px;font-family:monospace;font-size:11px;z-index:999999;border:3px solid #ff0000;max-height:300px;overflow-y:auto;border-radius:8px;box-shadow:0 0 20px rgba(255,0,0,0.5);';
    debugDiv.innerHTML = '<strong style="color:#ffff00;">🔧 PULL REQUEST MOBILE DEBUG</strong><br>';
    
    // Add close button
    var closeBtn = document.createElement('div');
    closeBtn.innerHTML = '❌ CLOSE';
    closeBtn.style.cssText = 'position:absolute;top:5px;right:10px;cursor:pointer;color:#fff;font-size:12px;background:#ff0000;padding:2px 8px;border-radius:4px;';
    closeBtn.onclick = function() { debugDiv.style.display = 'none'; };
    debugDiv.appendChild(closeBtn);
    
    // Add copy button
    var copyBtn = document.createElement('div');
    copyBtn.innerHTML = '📋 COPY LOG';
    copyBtn.style.cssText = 'position:absolute;top:5px;right:80px;cursor:pointer;color:#fff;font-size:12px;background:#0066ff;padding:2px 8px;border-radius:4px;';
    copyBtn.onclick = function() { 
        var logContent = debugDiv.innerText;
        navigator.clipboard.writeText(logContent).then(function() {
            alert('Debug log copied to clipboard!');
        }).catch(function() {
            alert('Copy failed - please manually select and copy');
        });
    };
    debugDiv.appendChild(copyBtn);
    
    document.body.appendChild(debugDiv);
    return debugDiv;
}

function debugLog(message, data) {
    if (debugMode) {
        console.log("PULL REQUESTS DEBUG: " + message, data || "");
        
        // Show on mobile debug overlay
        if (isMobileDevice) {
            setTimeout(function() {
                try {
                    var debugDiv = document.getElementById('pullrequest-debug');
                    if (!debugDiv && document.body) {
                        debugDiv = createMobileDebugOverlay();
                    }
                    if (debugDiv) {
                        var timestamp = new Date().toLocaleTimeString();
                        var color = message.includes('✅') ? '#00ff00' :
                                   message.includes('❌') || message.includes('ERROR') ? '#ff4444' :
                                   message.includes('MOBILE') ? '#00ffff' : '#ffffff';
                        debugDiv.innerHTML += '<div style="color:' + color + ';margin:2px 0;">' + timestamp + ': ' + message + '</div>';
                        
                        // Show data if provided
                        if (data && typeof data === 'object') {
                            debugDiv.innerHTML += '<div style="color:#888888;margin-left:20px;font-size:10px;">' + JSON.stringify(data) + '</div>';
                        }
                        
                        // Auto-scroll to bottom
                        debugDiv.scrollTop = debugDiv.scrollHeight;
                    }
                } catch (e) {
                    console.error('Mobile debug overlay error:', e);
                }
            }, 50);
        }
    }
}

// Trace before debugLog calls
var dbg2 = document.getElementById('pullrequest-debug');
if (dbg2) dbg2.innerHTML += '<div style="color:#ffff00;">✅ debugLog function defined, calling it...</div>';

debugLog("Mobile device detected: " + isMobileDevice);
debugLog("User agent: " + navigator.userAgent);

// Trace after debugLog calls
var dbg3 = document.getElementById('pullrequest-debug');
if (dbg3) dbg3.innerHTML += '<div style="color:#ffff00;">✅ debugLog calls completed...</div>';

// Track processed items to prevent duplicate buttons
var processedItems = new Set();

function createItemKey(callNumber, status) {
    return (callNumber + '|' + status).toLowerCase();
}

function isAlreadyProcessed(callNumber, status) {
    var key = createItemKey(callNumber, status);
    return processedItems.has(key);
}

function markAsProcessed(callNumber, status) {
    var key = createItemKey(callNumber, status);
    processedItems.add(key);
    debugLog("Marked as processed: " + key);
}

// MOBILE FIX: Find "Checked In" status elements directly
function findCheckedInElements() {
    debugLog("🔍 MOBILE: Using alternative status detection...");
    var checkedInElements = [];
    
    // Find any element containing "Checked In" text
    var allElements = document.querySelectorAll('*');
    for (var i = 0; i < allElements.length; i++) {
        var el = allElements[i];
        var text = el.textContent.trim();
        
        // Must be exact match or close to avoid false positives
        if (text === 'Checked In' || text === 'CheckedIn') {
            // Verify it's not already collected (avoid duplicates from parent elements)
            var isDuplicate = false;
            for (var j = 0; j < checkedInElements.length; j++) {
                if (checkedInElements[j].contains(el) || el.contains(checkedInElements[j])) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate && el.children.length === 0) { // Only leaf nodes
                checkedInElements.push(el);
                debugLog("   ✅ Found 'Checked In' element: " + el.tagName + "." + el.className);
            }
        }
    }
    
    debugLog("🔍 MOBILE: Found " + checkedInElements.length + " 'Checked In' elements");
    return checkedInElements;
}

function checkElements() {
    // Direct DOM diagnostic for mobile
    var dbgCheck = document.getElementById('pullrequest-debug');
    if (dbgCheck) {
        dbgCheck.innerHTML += '<div style="color:#00ffff;">📊 DOM ANALYSIS:</div>';
        dbgCheck.innerHTML += '<div style="color:#fff;">Total elements: ' + document.querySelectorAll('*').length + '</div>';
        dbgCheck.innerHTML += '<div style="color:#fff;">Body children: ' + (document.body ? document.body.children.length : 'NO BODY') + '</div>';
        
        // Check for key elements
        var checks = [
            '.detailItemsTableRow',
            '.detailItemsTable',
            '.asyncFieldSD_ITEM_STATUS',
            '[class*="ITEM_STATUS"]',
            '[class*="STATUS"]',
            '[class*="Checked"]',
            '.s-lg-page-section',
            '#content',
            'table',
            'tr'
        ];
        checks.forEach(function(sel) {
            var count = document.querySelectorAll(sel).length;
            if (count > 0) {
                dbgCheck.innerHTML += '<div style="color:#00ff00;">' + sel + ': ' + count + '</div>';
            }
        });
        
        // Look for "Checked In" text anywhere
        var checkedInCount = 0;
        document.querySelectorAll('*').forEach(function(el) {
            if (el.textContent && el.textContent.trim() === 'Checked In') checkedInCount++;
        });
        dbgCheck.innerHTML += '<div style="color:#ffff00;">"Checked In" text found: ' + checkedInCount + ' elements</div>';
        
        // Show some class names from body
        if (document.body) {
            var firstClasses = [];
            var allEls = document.body.querySelectorAll('*');
            for (var i = 0; i < Math.min(20, allEls.length); i++) {
                if (allEls[i].className && typeof allEls[i].className === 'string' && allEls[i].className.length > 0) {
                    firstClasses.push(allEls[i].className.split(' ')[0]);
                }
            }
            dbgCheck.innerHTML += '<div style="color:#aaa;font-size:9px;">Classes: ' + firstClasses.join(', ') + '</div>';
        }
        
        // MOBILE DEBUG: Search for call number pattern in page text
        var pageText = document.body ? document.body.innerText : '';
        // LC call number pattern: 1-3 letters IMMEDIATELY followed by numbers (no space)
        // Examples: PS3618.O567, BF575.G7, QA76.9.D3
        // Excludes: "OS 18" (has space), "E148" (from user agent)
        var lcPattern = /\b([A-Z]{1,3}[0-9]{2,}(?:\.[A-Z]?[0-9]+)*(?:\s+\.[A-Z][0-9]+)?(?:\s+[0-9]{4})?)\b/g;
        var lcMatches = pageText.match(lcPattern);
        // Filter out false positives
        if (lcMatches) {
            lcMatches = lcMatches.filter(function(m) {
                // Must be at least 4 chars total
                if (m.length < 4) return false;
                // Exclude common false positives from user agent, etc.
                if (/^(OS|IE|UK|US|CA|ID)[0-9]/i.test(m)) return false;
                return true;
            });
        }
        if (lcMatches && lcMatches.length > 0) {
            dbgCheck.innerHTML += '<div style="color:#0ff;">📚 Possible call numbers in text: ' + lcMatches.slice(0, 5).join(', ') + '</div>';
        } else {
            dbgCheck.innerHTML += '<div style="color:#f44;">📚 No call number patterns found in page text!</div>';
        }
        
        // IMMEDIATE TRACE: Check primary selector right away
        var primaryStatus = document.querySelectorAll(".detailItemsTable_SD_ITEM_STATUS .asyncFieldSD_ITEM_STATUS");
        dbgCheck.innerHTML += '<div style="color:#ff0;">🎯 Primary selector: ' + primaryStatus.length + '</div>';
        
        var asyncStatus = document.querySelectorAll(".asyncFieldSD_ITEM_STATUS");
        dbgCheck.innerHTML += '<div style="color:#ff0;">🎯 .asyncFieldSD_ITEM_STATUS: ' + asyncStatus.length + '</div>';
        
        // Show what text each one has
        if (asyncStatus.length > 0) {
            for (var si = 0; si < Math.min(3, asyncStatus.length); si++) {
                dbgCheck.innerHTML += '<div style="color:#0f0;font-size:10px;">   [' + si + '] "' + asyncStatus[si].textContent.trim() + '"</div>';
            }
        }
    }
    
    debugLog("📋 Starting element check");
    debugLog("📱 MOBILE: isMobileDevice = " + isMobileDevice);
    debugLog("📏 Viewport: " + window.innerWidth + "x" + window.innerHeight);
    debugLog("🔗 URL: " + window.location.href);
    
    // DOM overview
    var totalElements = document.querySelectorAll('*').length;
    debugLog("📊 Total DOM elements: " + totalElements);
    
    // Get author and title from page
    var authorElement = document.querySelector(".displayElementText.text-p.PERSONAL_AUTHOR a");
    var titleElement = document.querySelector(".displayElementText.text-p.INITIAL_TITLE_SRCH");
    
    // Try alternative author selectors
    if (!authorElement) {
        debugLog("❌ Primary author selector failed, trying alternatives...");
        var altAuthorSelectors = [
            ".PERSONAL_AUTHOR a",
            "[class*='AUTHOR'] a",
            ".displayElementText a"
        ];
        altAuthorSelectors.forEach(function(sel) {
            var el = document.querySelector(sel);
            if (el) debugLog("   Author alt '" + sel + "': " + el.textContent.trim().substring(0, 50));
        });
    }
    
    // Try alternative title selectors
    if (!titleElement) {
        debugLog("❌ Primary title selector failed, trying alternatives...");
        var altTitleSelectors = [
            ".INITIAL_TITLE_SRCH",
            "[class*='TITLE']",
            ".displayElementText.text-p"
        ];
        altTitleSelectors.forEach(function(sel) {
            var el = document.querySelector(sel);
            if (el) debugLog("   Title alt '" + sel + "': " + el.textContent.trim().substring(0, 50));
        });
    }
    
    var author = authorElement ? authorElement.textContent.trim() : "";
    var title = titleElement ? titleElement.textContent.trim() : "";
    
    debugLog("📖 Author: '" + (author || "NOT FOUND") + "'");
    debugLog("📖 Title: '" + (title ? title.substring(0, 50) : "NOT FOUND") + "'");
    
    // Find all status elements - COMPREHENSIVE SEARCH
    debugLog("🔍 Searching for status elements...");
    
    var statusElements = document.querySelectorAll(".detailItemsTable_SD_ITEM_STATUS .asyncFieldSD_ITEM_STATUS");
    debugLog("Primary selector found " + statusElements.length + " status elements");
    
    // Try alternative selectors
    var altStatusSelectors = [
        ".asyncFieldSD_ITEM_STATUS",
        "[class*='ITEM_STATUS']",
        "[class*='item_status']",
        ".detailItemsTable_SD_ITEM_STATUS",
        "[class*='SD_ITEM_STATUS']"
    ];
    
    altStatusSelectors.forEach(function(selector) {
        var elements = document.querySelectorAll(selector);
        debugLog("   Status selector '" + selector + "': " + elements.length + " elements");
        if (elements.length > 0) {
            for (var i = 0; i < Math.min(2, elements.length); i++) {
                debugLog("      Element " + i + " text: '" + elements[i].textContent.trim() + "'");
            }
        }
    });
    
    // If no status elements, do broader DOM analysis
    if (statusElements.length === 0) {
        debugLog("❌ NO STATUS ELEMENTS FOUND - Analyzing DOM structure...");
        
        // Look for detail table rows
        var rows = document.querySelectorAll(".detailItemsTableRow");
        debugLog("📊 detailItemsTableRow elements: " + rows.length);
        
        var tables = document.querySelectorAll(".detailItemsTable");
        debugLog("📊 detailItemsTable elements: " + tables.length);
        
        // Check for "Checked In" text anywhere
        var checkedInElements = [];
        document.querySelectorAll('*').forEach(function(el) {
            if (el.textContent.trim() === 'Checked In') {
                checkedInElements.push({
                    tag: el.tagName,
                    className: el.className,
                    parent: el.parentElement ? el.parentElement.className : 'none'
                });
            }
        });
        debugLog("📋 Elements with 'Checked In' text: " + checkedInElements.length);
        checkedInElements.forEach(function(el, idx) {
            if (idx < 3) debugLog("   " + el.tag + "." + el.className + " (parent: " + el.parent + ")");
        });
        
        // Look for hold link elements
        var holdLinks = document.querySelectorAll(".asyncFieldSD_ITEM_HOLD_LINK");
        debugLog("📊 Hold link elements: " + holdLinks.length);
        
        var altHoldSelectors = ["[class*='HOLD_LINK']", "[class*='hold']"];
        altHoldSelectors.forEach(function(sel) {
            var els = document.querySelectorAll(sel);
            debugLog("   Hold alt '" + sel + "': " + els.length + " elements");
        });
        
        // Try using "Checked In" as anchor instead of status element
        debugLog("🔄 Attempting alternative approach: searching for 'Checked In' status directly...");
        statusElements = findCheckedInElements();
    }
    
    debugLog("📊 Processing " + statusElements.length + " status elements");
    
    // IMMEDIATE TRACE: How many status elements to process?
    var dbgProc = document.getElementById('pullrequest-debug');
    if (dbgProc) {
        dbgProc.innerHTML += '<div style="color:#ff0;font-weight:bold;">🔄 PROCESSING: ' + statusElements.length + ' status elements</div>';
    }
    
    var processedCount = 0;
    var skippedCount = 0;
    var errorCount = 0;
    
    statusElements.forEach(function(statusElement, index) {
        // Immediate trace for each element
        if (dbgProc) {
            dbgProc.innerHTML += '<div style="color:#0ff;font-size:10px;">➡️ Element ' + (index + 1) + ': ' + statusElement.tagName + '</div>';
        }
        
        debugLog("🔄 Processing status element " + (index + 1));
        debugLog("   Element tag: " + statusElement.tagName + ", class: " + statusElement.className);
        
        // Try to find container row - multiple strategies
        var row = statusElement.closest(".detailItemsTableRow");
        if (!row) {
            debugLog("   ❌ No .detailItemsTableRow found, trying tr...");
            row = statusElement.closest("tr");
        }
        if (!row) {
            debugLog("   ❌ No tr found, trying parent div...");
            row = statusElement.closest("div");
        }
        if (!row) {
            debugLog("   ❌ Using parent element as fallback");
            row = statusElement.parentElement;
        }
        
        if (!row) {
            debugLog("   ❌ FAILED: No container found for element " + (index + 1));
            return;
        }
        
        debugLog("   ✅ Container found: " + row.tagName + "." + row.className);
        
        // MOBILE FIX: Try multiple selectors for call number
        var callNumberElement = null;
        
        debugLog("   🔍 Searching for call number (isMobile: " + isMobileDevice + ", screenWidth: " + window.screen.width + ")");
        
        // Mobile-specific selectors - try these first for all devices
        var mobileCallSelectors = [
            ".detailChildFieldValue.fieldValue.text-p.detailItemsTable_CALLNUMBER",
            ".detailItemsTable_CALLNUMBER",
            "[class*='CALLNUMBER']",
            "[class*='callnumber']"
        ];
        
        // Try in row first
        for (var i = 0; i < mobileCallSelectors.length; i++) {
            callNumberElement = row.querySelector(mobileCallSelectors[i]);
            if (callNumberElement) {
                var callText = callNumberElement.textContent.trim();
                // Skip if it's a label
                if (callText.toLowerCase() !== 'call number' && callText.toLowerCase() !== 'shelf number' && callText.length > 2) {
                    debugLog("   ✅ Found call number in row with selector: " + mobileCallSelectors[i]);
                    debugLog("      Text: '" + callText + "'");
                    break;
                } else {
                    callNumberElement = null; // Reset if it's a label
                }
            }
        }
        
        // If still not found in row, search document-wide (MOBILE FIX)
        if (!callNumberElement) {
            debugLog("   🔍 Call number not found in row, searching document-wide...");
            
            // Try multiple selectors
            var docCallElements = document.querySelectorAll(".detailItemsTable_CALLNUMBER, [class*='CALLNUMBER'], [class*='callnumber'], .fieldValue, .detailChildFieldValue");
            debugLog("   📊 Found " + docCallElements.length + " potential call elements document-wide");
            
            // Filter to find actual call numbers (not labels)
            for (var j = 0; j < docCallElements.length; j++) {
                var el = docCallElements[j];
                var text = el.textContent.trim();
                
                debugLog("      Checking: '" + text.substring(0, 30) + "'");
                
                // Skip labels and short text
                if (text.toLowerCase() === 'call number' || 
                    text.toLowerCase() === 'call#' ||
                    text.toLowerCase() === 'shelf number' ||
                    text.length < 3 ||
                    text.length > 50) {  // Call numbers shouldn't be too long
                    continue;
                }
                
                // Check if it looks like a Library of Congress call number
                // Format: Letter(s) + Number(s) + optional decimals/letters
                // Examples: PS3618.O567 W43 2019, BF575.G7 K87, QA76.9.D3 D377
                if (/^[A-Z]{1,3}\s*[0-9]+/.test(text)) {
                    callNumberElement = el;
                    debugLog("   ✅ Found LC call number: '" + text + "'");
                    break;
                }
                
                // Also accept general pattern: has letters and numbers
                if (/[A-Za-z]/.test(text) && /[0-9]/.test(text) && !/author|title|status|unknown/i.test(text)) {
                    callNumberElement = el;
                    debugLog("   ✅ Using document-wide call number: '" + text + "'");
                    break;
                }
            }
            
            // MOBILE FALLBACK: Search ALL text nodes for call number pattern
            if (!callNumberElement) {
                debugLog("   🔍 MOBILE FALLBACK: Searching all text for call number pattern...");
                var allText = document.body.innerText;
                // Look for Library of Congress pattern: letters IMMEDIATELY followed by numbers (no space)
                // Pattern: 1-3 uppercase letters + 2+ digits + optional decimal sections
                var lcPattern = /\b([A-Z]{1,3}[0-9]{2,}(?:\.[A-Z]?[0-9]+)*(?:\s+\.[A-Z][0-9]+)?(?:\s+[0-9]{4})?)\b/g;
                var allMatches = allText.match(lcPattern);
                
                // Filter out false positives
                if (allMatches) {
                    allMatches = allMatches.filter(function(m) {
                        if (m.length < 4) return false;
                        // Exclude common false positives (OS18 from user agent, etc.)
                        if (/^(OS|IE|UK|US|CA|ID)[0-9]/i.test(m)) return false;
                        return true;
                    });
                    
                    if (allMatches.length > 0) {
                        debugLog("   ✅ Found call number in page text: '" + allMatches[0] + "'");
                        callNumberElement = { textContent: allMatches[0] };
                    } else {
                        debugLog("   ❌ All matches were false positives");
                    }
                } else {
                    debugLog("   ❌ No LC pattern matches found in page text");
                }
            }
        }
        
        var status = statusElement.textContent.trim();
        var callNumber = callNumberElement ? callNumberElement.textContent.trim() : "";
        
        // Clean up call number text
        callNumber = callNumber.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
        
        debugLog("   📋 Status: '" + status + "', Call Number: '" + callNumber + "'");
        
        // IMMEDIATE TRACE: status and call number
        if (dbgProc) {
            dbgProc.innerHTML += '<div style="color:#aaa;font-size:9px;margin-left:10px;">Status="' + status + '" Call="' + (callNumber || 'NONE').substring(0, 20) + '"</div>';
        }
        
        // Check if already processed
        if (isAlreadyProcessed(callNumber, status)) {
            debugLog("   ⚠️ Item already processed, skipping");
            skippedCount++;
            if (dbgProc) dbgProc.innerHTML += '<div style="color:#f80;font-size:9px;margin-left:10px;">⚠️ Already processed</div>';
            return;
        }
        
        // Accept status "Checked In" or if this is from findCheckedInElements (which already found "Checked In")
        if ((status === "Checked In" || status === "CheckedIn") && callNumber) {
            debugLog("   ✅ Creating form for checked-in item: " + callNumber);
            if (dbgProc) dbgProc.innerHTML += '<div style="color:#0f0;font-size:9px;margin-left:10px;">✅ CREATING FORM!</div>';
            processedCount++;
            createForm(author, title, callNumber, row, statusElement);
            markAsProcessed(callNumber, status);
        } else {
            debugLog("   ❌ Skipping - Status: '" + status + "', Has call number: " + !!callNumber);
            skippedCount++;
            if (dbgProc) dbgProc.innerHTML += '<div style="color:#f44;font-size:9px;margin-left:10px;">❌ SKIP: status="' + status + '" hasCall=' + !!callNumber + '</div>';
        }
    });
    
    // IMMEDIATE TRACE: Summary
    if (dbgProc) {
        dbgProc.innerHTML += '<div style="color:#ff0;font-weight:bold;margin-top:5px;">📊 RESULT: ' + processedCount + ' forms created, ' + skippedCount + ' skipped</div>';
    }
    
    debugLog("✅ Element check complete");
}

function createForm(author, title, callNumber, row, statusElement) {
    debugLog("📝 Creating form", { author: author, title: title, callNumber: callNumber });
    
    // IMMEDIATE TRACE for createForm
    var dbgForm = document.getElementById('pullrequest-debug');
    if (dbgForm) {
        dbgForm.innerHTML += '<div style="color:#0ff;">📝 createForm called for: ' + callNumber.substring(0, 20) + '</div>';
    }
    
    // Find the hold link element to replace
    var holdLinkElement = row.querySelector(".asyncFieldSD_ITEM_HOLD_LINK");
    
    debugLog("   🔍 Looking for hold link element...");
    
    if (!holdLinkElement) {
        debugLog("   ❌ Primary hold link selector failed, trying alternatives...");
        
        // Try alternative selectors for mobile
        var altHoldSelectors = [
            "[class*='HOLD_LINK']",
            "[class*='hold_link']",
            ".asyncFieldSD_ITEM_HOLD_LINK"
        ];
        
        for (var i = 0; i < altHoldSelectors.length; i++) {
            holdLinkElement = row.querySelector(altHoldSelectors[i]);
            if (holdLinkElement) {
                debugLog("   ✅ Found hold link in row with selector: " + altHoldSelectors[i]);
                break;
            }
        }
        
        // If still not found, try document-wide search
        if (!holdLinkElement) {
            debugLog("   🔍 Searching document-wide for hold link...");
            var docHoldLinks = document.querySelectorAll(".asyncFieldSD_ITEM_HOLD_LINK, [class*='HOLD_LINK']");
            debugLog("   📊 Found " + docHoldLinks.length + " hold links document-wide");
            
            if (docHoldLinks.length > 0) {
                // Use the first unprocessed one
                for (var j = 0; j < docHoldLinks.length; j++) {
                    if (!docHoldLinks[j].classList.contains('pullrequest-processed')) {
                        holdLinkElement = docHoldLinks[j];
                        debugLog("   ✅ Using unprocessed document-wide hold link");
                        break;
                    }
                }
            }
        }
        
        // MOBILE FALLBACK: If no hold link, try to insert button next to status element
        if (!holdLinkElement && statusElement) {
            debugLog("   🔄 MOBILE FALLBACK: Creating button container next to status element");
            holdLinkElement = document.createElement('span');
            holdLinkElement.className = 'pullrequest-button-container';
            holdLinkElement.style.cssText = 'display: inline-block; margin-left: 10px;';
            
            // Try to insert after the status element or its parent
            var insertTarget = statusElement.parentElement || statusElement;
            if (insertTarget.parentElement) {
                insertTarget.parentElement.appendChild(holdLinkElement);
                debugLog("   ✅ Created fallback button container");
            }
        }
    } else {
        debugLog("   ✅ Found hold link element: " + holdLinkElement.className);
    }
    
    if (!holdLinkElement) {
        debugLog("   ❌ FAILED: Could not find or create button location");
        return;
    }
    
    // Mark as processed
    holdLinkElement.classList.add('pullrequest-processed');
    
    // Create form
    var form = document.createElement("form");
    form.action = "https://web.byui.edu/library/pull-request";
    form.method = "get";
    form.id = "material-request-form";
    
    // Inject styles if not already present
    if (!document.getElementById("request-form-style")) {
        var styleElement = document.createElement("style");
        styleElement.id = "request-form-style";
        var css = `
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
            .blue-button:disabled {
                background-color: #cccccc;
                color: #666666;
                cursor: not-allowed;
            }
            .blue-button:disabled:hover {
                background-color: #cccccc;
            }
        `;
        styleElement.appendChild(document.createTextNode(css));
        document.head.appendChild(styleElement);
        debugLog("Styles injected");
    }
    
    // Add hidden inputs
    form.appendChild(createHiddenInput("author", author));
    form.appendChild(createHiddenInput("title", title));
    form.appendChild(createHiddenInput("call_number", callNumber));
    
    // Create submit button
    var button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Pickup/Delivery";
    button.className = "blue-button";
    
    form.appendChild(button);
    
    // Replace hold link content with form
    holdLinkElement.innerHTML = "";
    holdLinkElement.appendChild(form);
    
    // IMMEDIATE TRACE: Form created!
    if (dbgForm) {
        dbgForm.innerHTML += '<div style="color:#0f0;font-weight:bold;">🎉 BUTTON CREATED for: ' + callNumber.substring(0, 15) + '</div>';
    }
    
    debugLog("Form created and attached successfully");
}

function createHiddenInput(name, value) {
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    return input;
}

// DOM watcher with mobile-compatible timing (same pattern as maps.js)
function watchForElements() {
    debugLog("Starting DOM watcher");
    
    var attempts = 0;
    var maxAttempts = isMobileDevice ? 60 : 30; // More attempts for mobile
    var interval = isMobileDevice ? 750 : 500; // Longer intervals for mobile
    
    debugLog("Watcher config - maxAttempts: " + maxAttempts + ", interval: " + interval);
    
    var watcher = setInterval(function() {
        attempts++;
        debugLog("Watch attempt " + attempts + "/" + maxAttempts);
        
        // Try multiple selectors to find target elements
        var targetElement = document.querySelector(".asyncFieldSD_ITEM_STATUS") ||
                          document.querySelector(".detailItemsTable_SD_ITEM_STATUS") ||
                          document.querySelector("[class*='ITEM_STATUS']") ||
                          document.querySelector(".detailItemsTableRow");
        
        // Direct trace every 5 attempts
        if (attempts % 5 === 1) {
            var dbgW = document.getElementById('pullrequest-debug');
            if (dbgW) dbgW.innerHTML += '<div style="color:#aaaaaa;">Watch ' + attempts + '/' + maxAttempts + ' - found: ' + (targetElement ? 'YES' : 'NO') + '</div>';
        }
        
        if (targetElement) {
            var dbgFound = document.getElementById('pullrequest-debug');
            if (dbgFound) dbgFound.innerHTML += '<div style="color:#00ff00;">✅ TARGET FOUND! Running checkElements in 1.5s...</div>';
            
            debugLog("Target elements found, initializing check");
            clearInterval(watcher);
            
            // Longer delay for mobile to ensure rendering is complete
            var renderDelay = isMobileDevice ? 1500 : 750;
            setTimeout(function() {
                var dbgCheck = document.getElementById('pullrequest-debug');
                if (dbgCheck) dbgCheck.innerHTML += '<div style="color:#00ff00;">✅ Running checkElements NOW...</div>';
                checkElements();
            }, renderDelay);
            
        } else if (attempts >= maxAttempts) {
            var dbgTimeout = document.getElementById('pullrequest-debug');
            if (dbgTimeout) dbgTimeout.innerHTML += '<div style="color:#ff4444;">❌ TIMEOUT after ' + maxAttempts + ' attempts. Trying fallback...</div>';
            
            debugLog("Watch timeout - target elements not found after " + maxAttempts + " attempts");
            clearInterval(watcher);
            
            // Try one more time as fallback
            setTimeout(function() {
                debugLog("Attempting final check as fallback");
                checkElements();
            }, isMobileDevice ? 2000 : 1000);
        }
    }, interval);
}

// Multiple DOM ready strategies for better mobile compatibility
function domReady(callback) {
    if (document.readyState === 'loading') {
        debugLog("Document still loading, adding event listeners");
        
        var fired = false;
        
        // Strategy 1: DOMContentLoaded
        document.addEventListener('DOMContentLoaded', function() {
            if (!fired) {
                fired = true;
                debugLog("DOM ready via DOMContentLoaded");
                callback();
            }
        });
        
        // Strategy 2: readystatechange
        document.addEventListener('readystatechange', function() {
            if (!fired && (document.readyState === 'interactive' || document.readyState === 'complete')) {
                fired = true;
                debugLog("DOM ready via readystatechange: " + document.readyState);
                callback();
            }
        });
        
        // Strategy 3: window.onload as final fallback
        window.addEventListener('load', function() {
            if (!fired) {
                fired = true;
                debugLog("DOM ready via window.onload (fallback)");
                callback();
            }
        });
        
        // Strategy 4: Timeout fallback for mobile devices
        if (isMobileDevice) {
            setTimeout(function() {
                if (!fired) {
                    fired = true;
                    debugLog("DOM ready via timeout fallback (mobile)");
                    callback();
                }
            }, 3000);
        }
    } else {
        debugLog("Document already ready: " + document.readyState);
        callback();
    }
}

// Trace before domReady
var dbg4 = document.getElementById('pullrequest-debug');
if (dbg4) dbg4.innerHTML += '<div style="color:#ffff00;">✅ About to call domReady...</div>';

// Initialize when DOM is ready
domReady(function() {
    var dbg5 = document.getElementById('pullrequest-debug');
    if (dbg5) dbg5.innerHTML += '<div style="color:#00ff00;">✅ domReady callback fired!</div>';
    
    debugLog("Initializing Pull Requests integration");
    debugLog("Mobile device: " + isMobileDevice);
    debugLog("Viewport: " + window.innerWidth + "x" + window.innerHeight);
    watchForElements();
    
    var dbg6 = document.getElementById('pullrequest-debug');
    if (dbg6) dbg6.innerHTML += '<div style="color:#00ff00;">✅ watchForElements started!</div>';
});

} // end runMainCode function

} catch (globalError) {
    // Surface any errors to the debug overlay
    console.error("PULL REQUESTS GLOBAL ERROR:", globalError);
    var errDiv = document.getElementById('pullrequest-debug');
    if (errDiv) {
        errDiv.innerHTML += '<div style="color:#ff0000;font-weight:bold;">🚨 GLOBAL ERROR: ' + globalError.message + '</div>';
    }
}

})(); // End IIFE wrapper