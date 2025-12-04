// sirsiDynix Enterprise - Springs Lib Maps Integration - MOBILE DEBUG VERSION
// Fixed version with safe mobile debugging

alert('🚀 LibMaps Debug Script Starting!');

console.log("ENTERPRISE INTEGRATION: Initializing Springs Lib Maps...");

// Mobile detection and debugging setup
var isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var debugMode = true; // Set to false in production

// SAFE mobile debugging without document.write
function addEmergencyDebug(message) {
    if (isMobileDevice) {
        try {
            var emergencyDiv = document.createElement('div');
            emergencyDiv.innerHTML = message;
            emergencyDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:15px;font-size:18px;text-align:center;z-index:999999999;border-bottom:3px solid yellow;';
            
            // Safe method to add to page
            function addWhenReady() {
                if (document.body) {
                    document.body.appendChild(emergencyDiv);
                } else {
                    setTimeout(addWhenReady, 100);
                }
            }
            addWhenReady();
        } catch (e) {
            console.error('Emergency debug error:', e);
        }
    }
}

function debugLog(message, data, level) {
    if (debugMode) {
        var fullMessage = "LIBMAPS DEBUG: " + message;
        var timestamp = new Date().toLocaleTimeString();
        
        // Always log to console
        console.log(fullMessage, data || "");
        
        // ULTRA-VISIBLE MOBILE DEBUG SYSTEM FOR IPHONE
        if (isMobileDevice) {
            try {
                addEmergencyDebug('📱 Debug: ' + message);
                
                var debugDiv = document.getElementById('libmaps-debug');
                if (!debugDiv) {
                    debugDiv = document.createElement('div');
                    debugDiv.id = 'libmaps-debug';
                    debugDiv.style.cssText = 'position:fixed;top:60px;left:0;right:0;background:rgba(255,0,0,0.98);color:white;padding:20px;font-family:Arial,sans-serif;font-size:16px;z-index:999999999;border-bottom:5px solid yellow;box-shadow:0 0 20px rgba(255,0,0,0.8);min-height:80px;max-height:300px;overflow-y:auto;';
                    
                    if (!document.body) {
                        setTimeout(function() { debugLog(message, data, level); }, 100);
                        return;
                    }
                    
                    // Large, finger-friendly close button for iPhone
                    var closeBtn = document.createElement('button');
                    closeBtn.innerHTML = 'HIDE DEBUG';
                    closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;background:#ff4444;color:white;border:2px solid white;font-size:14px;padding:8px 12px;border-radius:8px;font-weight:bold;cursor:pointer;';
                    closeBtn.onclick = function() { 
                        debugDiv.style.display = 'none';
                        var indicator = document.createElement('div');
                        indicator.innerHTML = 'TAP TO SHOW DEBUG';
                        indicator.style.cssText = 'position:fixed;top:10px;right:10px;background:orange;color:black;padding:10px;font-size:14px;border-radius:5px;z-index:999999;cursor:pointer;';
                        indicator.onclick = function() {
                            debugDiv.style.display = 'block';
                            indicator.remove();
                        };
                        document.body.appendChild(indicator);
                    };
                    debugDiv.appendChild(closeBtn);
                    
                    // Large, prominent title
                    var title = document.createElement('div');
                    title.innerHTML = '📱 LIBMAPS IPHONE DEBUG 📱';
                    title.style.cssText = 'font-weight:bold;font-size:20px;margin-bottom:10px;color:yellow;margin-right:120px;text-shadow:2px 2px 4px rgba(0,0,0,0.8);';
                    debugDiv.appendChild(title);
                    
                    // Status indicator
                    var status = document.createElement('div');
                    status.id = 'libmaps-status';
                    status.innerHTML = '🔄 INITIALIZING...';
                    status.style.cssText = 'font-size:18px;font-weight:bold;color:yellow;margin-bottom:10px;';
                    debugDiv.appendChild(status);
                    
                    // Large, readable content area
                    var content = document.createElement('div');
                    content.id = 'libmaps-debug-content';
                    content.style.cssText = 'margin-top:10px;font-size:14px;line-height:1.4;max-height:200px;overflow-y:auto;';
                    debugDiv.appendChild(content);
                    
                    document.body.appendChild(debugDiv);
                }
                
                var content = document.getElementById('libmaps-debug-content');
                var status = document.getElementById('libmaps-status');
                
                // Update status indicator for major events
                if (level === 'success' && message.includes('BUTTONS')) {
                    status.innerHTML = '✅ SUCCESS: Buttons Created!';
                    status.style.color = '#00ff00';
                } else if (level === 'error') {
                    status.innerHTML = '❌ ERROR: ' + message;
                    status.style.color = '#ff4444';
                } else if (level === 'critical') {
                    status.innerHTML = '🚨 CRITICAL: ' + message;
                    status.style.color = '#ff0000';
                }
                
                var levelColor = level === 'error' ? '#ff9999' : level === 'warn' ? '#ffcc66' : level === 'success' ? '#99ff99' : level === 'critical' ? '#ff6666' : '#ffffff';
                var levelIcon = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : level === 'critical' ? '🚨' : 'ℹ️';
                
                var logEntry = document.createElement('div');
                logEntry.style.cssText = 'margin:5px 0;padding:8px;background:rgba(0,0,0,0.3);border-left:4px solid ' + levelColor + ';color:' + levelColor + ';word-wrap:break-word;border-radius:4px;font-size:13px;';
                logEntry.innerHTML = levelIcon + ' [' + timestamp + '] ' + message + (data ? '<br>📊 Data: ' + JSON.stringify(data) : '');
                content.appendChild(logEntry);
                
                // Auto-scroll to bottom
                content.scrollTop = content.scrollHeight;
                
                // Keep only last 50 entries to prevent memory issues
                var entries = content.children;
                while (entries.length > 50) {
                    content.removeChild(entries[0]);
                }
                
            } catch (e) {
                console.error('Debug panel error:', e);
                alert('Debug panel error: ' + e.message);
            }
        }
    }
}

// Enhanced debugging functions
function debugError(message, data) {
    debugLog(message, data, 'error');
}

function debugWarn(message, data) {
    debugLog(message, data, 'warn');
}

function debugSuccess(message, data) {
    debugLog(message, data, 'success');
}

function debugCritical(message, data) {
    debugLog(message, data, 'critical');
    // Also trigger alert for critical issues on mobile
    if (isMobileDevice) {
        setTimeout(function() {
            alert('🚨 LIBMAPS CRITICAL ERROR 🚨\n\n' + message + '\n\nCheck the RED debug panel at the top of the page for details.');
        }, 100);
    }
}

alert('📱 Mobile detected: ' + isMobileDevice);

debugLog("=== LIBMAPS MOBILE DEBUG START ===");
debugSuccess("Mobile device detected: " + isMobileDevice);
debugLog("User agent: " + navigator.userAgent);
debugLog("Document ready state: " + document.readyState);

// Test the debug panel creation
if (isMobileDevice) {
    setTimeout(function() {
        debugLog("Testing debug system...");
        debugSuccess("Debug system is working!");
        debugWarn("This is a warning message");
        debugError("This is an error message");
        
        // Create a simple test notification
        var testNotification = document.createElement('div');
        testNotification.innerHTML = '🎉 SUCCESS: Debug system is working on your iPhone!';
        testNotification.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:green;color:white;padding:20px;font-size:18px;text-align:center;border-radius:10px;z-index:1000001;border:5px solid gold;';
        document.body.appendChild(testNotification);
        
        setTimeout(function() {
            if (testNotification && testNotification.parentNode) {
                testNotification.parentNode.removeChild(testNotification);
            }
        }, 3000);
        
    }, 2000);
}

// Now add the actual LibMaps functionality
var springyILS = {
    getTitle: function(element) {
        var titleSelectors = [
            ".displayElementText.text-p.INITIAL_TITLE_SRCH",
            ".displayElementText.INITIAL_TITLE_SRCH", 
            ".detail_biblio_title",
            ".TITLE_ABNP:not(.TITLE_ABNP_label)",
            ".INITIAL_TITLE_SRCH:not(.INITIAL_TITLE_SRCH_label)"
        ];
        
        for (var i = 0; i < titleSelectors.length; i++) {
            var title = document.querySelector(titleSelectors[i]);
            if (title && title.textContent && title.textContent.trim()) {
                debugSuccess("Found title: " + title.textContent.trim().substring(0, 50));
                return title;
            }
        }
        debugWarn("No title found");
        return null;
    },

    scrapeDetailRows: function(items) {
        debugSuccess("=== STARTING DETAIL ROW SCRAPING ===");
        
        // DETECTIVE MODE: Let's understand the page structure better
        debugWarn("DETECTIVE MODE: Full page analysis");
        
        // First, find all call number elements anywhere on the page
        var allCallElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER, [class*="detailItemsTable_CALLNUMBER"], [class*="CALLNUMBER"]');
        debugLog("Found " + allCallElements.length + " call elements total on page");
        
        // Show where these elements are located
        for (var k = 0; k < Math.min(allCallElements.length, 5); k++) {
            var callEl = allCallElements[k];
            debugLog("Call element " + (k+1) + ": '" + callEl.textContent.trim().substring(0, 40) + "'");
            debugLog("  Tag: " + callEl.tagName + ", Class: " + callEl.className);
            
            var parentRow = callEl.closest('tr');
            var parentTable = callEl.closest('table');
            debugLog("  Parent row: " + (parentRow ? parentRow.className || 'no class' : 'NONE'));
            debugLog("  Parent table: " + (parentTable ? parentTable.className || 'no class' : 'NONE'));
        }
        
        // Now find potential library/location elements
        var allLibElements = document.querySelectorAll('[class*="asyncFieldLIBRARY"], [class*="LIBRARY"], [class*="library"], [class*="location"]');
        debugLog("Found " + allLibElements.length + " library/location elements total on page");
        
        for (var l = 0; l < Math.min(allLibElements.length, 5); l++) {
            var libEl = allLibElements[l];
            debugLog("Library element " + (l+1) + ": '" + libEl.textContent.trim().substring(0, 40) + "'");
            debugLog("  Tag: " + libEl.tagName + ", Class: " + libEl.className);
            
            var parentRow = libEl.closest('tr');
            debugLog("  Parent row: " + (parentRow ? parentRow.className || 'no class' : 'NONE'));
        }
        
        // Try to find rows that contain BOTH call numbers AND library info
        debugWarn("DETECTIVE: Looking for rows with both call and library info...");
        var rows = [];
        
        // Method 1: Find rows via call number elements
        for (var j = 0; j < allCallElements.length; j++) {
            var callEl = allCallElements[j];
            var parentRow = callEl.closest('tr');
            if (parentRow && !parentRow.classList.contains('libmaps-proc')) {
                debugLog("Checking row with call element...");
                
                // Look for library info in the same row
                var libInRow = parentRow.querySelector('[class*="asyncFieldLIBRARY"], [class*="LIBRARY"], [class*="library"], [class*="location"]');
                if (libInRow) {
                    debugSuccess("Found row with BOTH call and library info!");
                    debugLog("  Call: " + callEl.textContent.trim().substring(0, 30));
                    debugLog("  Library: " + libInRow.textContent.trim().substring(0, 30));
                    rows.push(parentRow);
                } else {
                    debugWarn("Row has call number but NO library info");
                }
            }
        }
        
        debugLog("Found " + rows.length + " rows with both call and library elements");
        
        // If no good rows found, the elements might be separate - try a different approach
        if (rows.length === 0) {
            debugWarn("No rows found with both elements! Trying alternative approach...");
            debugLog("This means call numbers and library info are likely in separate structures");
            
            // ALTERNATIVE APPROACH: Create virtual items from separate elements
            if (allCallElements.length > 0) {
                debugSuccess("Creating items from separate call number and library elements");
                
                var processedCallNumbers = []; // Track call numbers we've already processed
                
                for (var ce = 0; ce < allCallElements.length; ce++) {
                    var callEl = allCallElements[ce];
                    var callText = callEl.textContent.trim();
                    
                    debugLog("Checking element " + (ce+1) + " with call: '" + callText + "'");
                    
                    // Skip if already processed by class
                    if (callEl.classList.contains('libmaps-processed')) {
                        debugWarn("Skipping element " + (ce+1) + " - already marked as processed");
                        continue;
                    }
                    
                    // Skip if we've already processed this call number text
                    if (processedCallNumbers.indexOf(callText) !== -1) {
                        debugWarn("Skipping element " + (ce+1) + " - call number '" + callText + "' already processed");
                        continue;
                    }
                    
                    // Skip if this element already has a button
                    var existingButton = callEl.querySelector('.springy-button') || callEl.parentNode.querySelector('.springy-button');
                    if (existingButton) {
                        debugWarn("Skipping element " + (ce+1) + " - already has a button");
                        continue;
                    }
                    
                    debugSuccess("Processing new call element " + (ce+1) + ": '" + callText + "'");
                    
                    callEl.classList.add('libmaps-processed'); // Mark as processed
                    processedCallNumbers.push(callText); // Track this call number
                    
                    // For each call number, try to find a corresponding library element
                    // Look for library info near this call element or use a default
                    var nearbyLibrary = null;
                    
                    // Method 1: Look in the same container/parent
                    var container = callEl.closest('div, td, tr');
                    if (container) {
                        nearbyLibrary = container.querySelector('[class*="asyncFieldLIBRARY"], [class*="LIBRARY"], [class*="library"]');
                    }
                    
                    // Method 2: If no nearby library found, use the first library element we found
                    if (!nearbyLibrary && allLibElements.length > 0) {
                        nearbyLibrary = allLibElements[0];
                        debugWarn("Using first available library element as default");
                    }
                    
                    var libraryText = nearbyLibrary ? nearbyLibrary.textContent.trim() || nearbyLibrary.value || 'David O. McKay Library' : 'David O. McKay Library';
                    
                    debugLog("Creating item " + (ce+1) + ":");
                    debugLog("  Call number: '" + callText + "'");  
                    debugLog("  Raw library text: '" + libraryText + "'");
                    debugLog("  Library element class: " + (nearbyLibrary ? nearbyLibrary.className : 'none'));
                    debugLog("  Using default library: " + (!nearbyLibrary));
                    
                    // Create a virtual item
                    items.push({
                        element: callEl.closest('tr') || callEl.parentElement,
                        buttonElement: callEl,
                        location: libraryText,
                        call: callText,
                        title: "Book Details"
                    });
                }
                
                debugSuccess("Created " + items.length + " items from separate elements");
                return items;
            }
            
            // Fallback: Get some rows for analysis
            debugError("No call elements found either! Getting rows for analysis...");
            var anyRows = document.querySelectorAll('tr');
            debugLog("Found " + anyRows.length + " total rows on page");
            
            // Take first few rows that have some content for analysis
            for (var r = 0; r < Math.min(anyRows.length, 5); r++) {
                var testRow = anyRows[r];
                if (testRow.textContent && testRow.textContent.trim().length > 20) {
                    rows.push(testRow);
                }
            }
            debugLog("Selected " + rows.length + " rows for detailed analysis");
        }
        
        if (!rows || rows.length === 0) {
            debugError("No detail rows found!");
            
            // DETECTIVE MODE - Let's see what's actually on the page
            var allTables = document.querySelectorAll('table, tr, div[class*="detail"]');
            debugLog("Found " + allTables.length + " potential containers");
            
            // Show details about the first 10 containers
            debugWarn("DETECTIVE MODE: Analyzing page structure...");
            for (var j = 0; j < Math.min(allTables.length, 10); j++) {
                var element = allTables[j];
                var info = element.tagName + " class='" + (element.className || 'none') + "' id='" + (element.id || 'none') + "'";
                debugLog("Container " + (j+1) + ": " + info);
                
                // If it's a table or div, show some content
                if (element.textContent && element.textContent.trim().length > 0) {
                    var preview = element.textContent.trim().substring(0, 100);
                    debugLog("  Content preview: " + preview);
                }
            }
            
            // Look specifically for call numbers and locations
            debugWarn("Searching for Enterprise-specific elements...");
            
            // Search for Enterprise class patterns
            var callElements = document.querySelectorAll('[class*="detailItemsTable_CALLNUMBER"], [class*="CALLNUMBER"], [class*="call"], [class*="Call"], [class*="CALL"]');
            var locationElements = document.querySelectorAll('[class*="detailItemsTable_LOCATION"], [class*="detailItemsTable_LIBRARY"], [class*="LOCATION"], [class*="LIBRARY"], [class*="location"], [class*="Location"], [class*="library"], [class*="Library"]');
            var allDetailElements = document.querySelectorAll('[class*="detailItemsTable_"]');
            
            debugLog("Found " + callElements.length + " call elements");
            debugLog("Found " + locationElements.length + " location elements");  
            debugLog("Found " + allDetailElements.length + " detailItemsTable elements");
            
            // Show Enterprise-specific elements
            if (allDetailElements.length > 0) {
                debugSuccess("Enterprise detailItemsTable elements found:");
                for (var m = 0; m < Math.min(allDetailElements.length, 10); m++) {
                    var detailEl = allDetailElements[m];
                    if (detailEl.textContent && detailEl.textContent.trim()) {
                        debugLog("Detail " + (m+1) + ": ." + detailEl.className + " = '" + detailEl.textContent.trim().substring(0, 50) + "'");
                    }
                }
            }
            
            // Show call number elements
            if (callElements.length > 0) {
                debugSuccess("Call number elements found:");
                for (var k = 0; k < Math.min(callElements.length, 5); k++) {
                    var callEl = callElements[k];
                    if (callEl.textContent && callEl.textContent.trim()) {
                        debugLog("Call " + (k+1) + ": ." + callEl.className + " = '" + callEl.textContent.trim().substring(0, 50) + "'");
                        
                        // Check if this element is inside a table row
                        var parentRow = callEl.closest('tr');
                        if (parentRow) {
                            debugLog("  → Found parent row: " + parentRow.className);
                        }
                    }
                }
            }
            
            // Show location elements
            if (locationElements.length > 0) {
                debugSuccess("Location elements found:");
                for (var l = 0; l < Math.min(locationElements.length, 5); l++) {
                    var locEl = locationElements[l];
                    if (locEl.textContent && locEl.textContent.trim()) {
                        debugLog("Location " + (l+1) + ": ." + locEl.className + " = '" + locEl.textContent.trim().substring(0, 50) + "'");
                        
                        // Check if this element is inside a table row
                        var parentRow = locEl.closest('tr');
                        if (parentRow) {
                            debugLog("  → Found parent row: " + parentRow.className);
                        }
                    }
                }
            }
            
            return items;
        }
        
        debugLog("Processing " + rows.length + " rows");
        
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var libraryElement = row.querySelector('.detailsLocationCell, [class*="location"], [class*="library"], [class*="detailItemsTable_LOCATION"], [class*="detailItemsTable_LIBRARY"], [class*="asyncFieldLIBRARY"]');
            var callElement = row.querySelector('.detailsCallNoCell, [class*="call"], .detailItemsTable_CALLNUMBER, [class*="detailItemsTable_CALLNUMBER"]');
            
            debugLog("Row " + (i+1) + " analysis:");
            debugLog("  Call element found: " + (callElement ? 'YES - ' + callElement.className + " = '" + callElement.textContent.trim().substring(0, 30) + "'" : 'NO'));
            debugLog("  Library element found: " + (libraryElement ? 'YES - ' + libraryElement.className + " = '" + libraryElement.textContent.trim().substring(0, 30) + "'" : 'NO'));
            
            // DETECTIVE: Always show row contents for analysis
            debugWarn("DETECTIVE: Analyzing row " + (i+1) + " contents:");
            debugLog("  Row class: " + (row.className || 'none'));
            debugLog("  Row ID: " + (row.id || 'none'));
            debugLog("  Row text preview: " + (row.textContent ? row.textContent.trim().substring(0, 100) : 'empty'));
            
            var allCells = row.querySelectorAll('td, th, div, span, input');
            debugLog("  Found " + allCells.length + " cells/elements in this row:");
            
            for (var c = 0; c < Math.min(allCells.length, 15); c++) {
                var cell = allCells[c];
                var cellText = cell.textContent ? cell.textContent.trim().substring(0, 50) : '';
                var cellValue = cell.value || '';
                var displayText = cellText || cellValue;
                
                if (displayText) {
                    debugLog("    Cell " + (c+1) + ": " + cell.tagName + " class='" + (cell.className || 'none') + "' text='" + displayText + "'");
                    
                    // Check if this cell contains call number or library info
                    if (displayText && (displayText.match(/[A-Z]{1,3}\d+/) || displayText.toLowerCase().includes('library') || displayText.toLowerCase().includes('location') || displayText.toLowerCase().includes('mckay'))) {
                        debugSuccess("    ↑ This cell might contain call/library info!");
                    }
                }
            }
            
            if (libraryElement && callElement) {
                var location = libraryElement.textContent.trim();
                var call = callElement.textContent.trim();
                
                debugLog("Found item - Location: " + location + ", Call: " + call);
                
                items.push({
                    element: row,
                    buttonElement: callElement,
                    location: location,
                    call: call,
                    title: "Book Details"
                });
            }
        }
        
        debugSuccess("Found " + items.length + " valid items");
        return items;
    },

    scrapeDom: function() {
        return this.scrapeDetailRows([]);
    },

    attachButton: function(item, buttonDiv) {
        debugLog("Attaching button to: " + item.call);
        
        var targetElement = item.buttonElement || item.element;
        debugLog("Target element: " + (targetElement ? targetElement.tagName + "." + targetElement.className : 'null'));
        
        if (!targetElement) {
            debugError("No target element to attach button to!");
            return;
        }
        
        try {
            // Add some visual styling to make the button obvious
            buttonDiv.style.cssText = 'display: inline-block; margin: 5px; padding: 3px; border: 2px solid red;';
            
            targetElement.appendChild(buttonDiv);
            debugSuccess("Button attached successfully to " + targetElement.tagName);
            
            // Verify the button is actually in the DOM
            if (buttonDiv.parentNode) {
                debugSuccess("✅ Button confirmed in DOM!");
            } else {
                debugError("❌ Button NOT in DOM after attachment!");
            }
            
        } catch (e) {
            debugError("Failed to attach button: " + e.message);
            debugError("Target element type: " + typeof targetElement);
            debugError("Target element tagName: " + (targetElement ? targetElement.tagName : 'undefined'));
        }
    }
};

var springyMap = {
    siteConfig: {
        domain: 'https://byui.libcal.com',
        iid: 4251,
        validLocationNameMap: {
            'David O. McKay Library': true,
            'McKay Library': true,
            'David O McKay Library': true
        },
        
        isValidCollectionRequired: 0, // Disable collection validation for mobile version initially
        
        validCollectionNameMap: {
            // We'll keep this simple for mobile version
            '': true // Allow empty collection
        },
        button: {
            label: 'Map It',
            icon: '<svg class="springy-icon" viewBox="796 796 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M970.135,870.134C970.135,829.191,936.943,796,896,796c-40.944,0-74.135,33.191-74.135,74.134 c0,16.217,5.221,31.206,14.055,43.41l-0.019,0.003L896,996l60.099-82.453l-0.019-0.003 C964.912,901.34,970.135,886.351,970.135,870.134z M896,900.006c-16.497,0-29.871-13.374-29.871-29.872s13.374-29.871,29.871-29.871 s29.871,13.373,29.871,29.871S912.497,900.006,896,900.006z"/></svg>',
            border: '6px'
        },
        isModalWanted: 1,
        
        getModalHtml: function(item, url) {
            return '<div class="springy-underlay"><div class="springy-modal" data-location="' + item.location + '" data-call="' + item.call + '" tabindex="0"><div class="springy-header"><h1>' + item.title + '</h1><div class="springy-header-buttons"><button class="springy-print" aria-label="Print Map"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64-208l0 144-448 0 0-144 448 0z"/></svg></button><button class="springy-close" aria-label="Close Map">×</button></div></div><div class="springy-body"><iframe id="libmaps-iframe" src="' + url + '" title="LibMaps for ' + item.title + '" onload="debugLog(\'LibMaps iframe loaded successfully\');" onerror="debugError(\'LibMaps iframe failed to load\');"></iframe></div></div></div>';
        },
        
        css: '.springy-button-div { display: inline-block; } .springy-button { text-indent: 0; cursor: pointer; position: relative; padding: 6px 12px 6px 6px; box-sizing: border-box; border-width: 0; border-radius: 6px; color: #FFFFFF; background-color: #337AB7; display: inline-block; white-space: nowrap; line-height: 16px; } .springy-underlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 999999; display: none; } .springy-underlay-active { display: flex !important; align-items: center; justify-content: center; } .springy-modal { background: white; border-radius: 10px; max-width: 90%; max-height: 90%; width: 800px; height: 600px; display: flex; flex-direction: column; } .springy-modal-active { display: flex !important; } .springy-header { padding: 15px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; } .springy-body { flex: 1; padding: 0; } .springy-body iframe { width: 100%; height: 100%; border: none; } .springy-close { background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 16px; } .springy-print { background: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-right: 10px; }'
    },

    isValidLocation: function(location) {
        debugLog("Checking location validity: '" + location + "'");
        var isValid = this.siteConfig.validLocationNameMap[location.trim()] === true;
        debugLog("Location '" + location + "' is valid: " + isValid);
        
        if (!isValid) {
            debugWarn("Invalid location found. Valid locations are:");
            for (var validLoc in this.siteConfig.validLocationNameMap) {
                debugLog("  - '" + validLoc + "'");
            }
            
            // Be more flexible - if it contains "McKay" or "library", accept it
            if (location.toLowerCase().includes('mckay') || location.toLowerCase().includes('library')) {
                debugSuccess("Location contains 'McKay' or 'library' - accepting it anyway!");
                return true;
            }
        }
        
        return isValid;
    },

    isValidCollection: function(collection) {
        if (!springyMap.siteConfig.isValidCollectionRequired) {
            return true;
        }
        
        if (!collection || collection.length === 0) {
            debugLog("Collection validation failed - empty collection");
            return false;
        }
        
        var normalizedCollection = collection.trim();
        var isValid = springyMap.siteConfig.validCollectionNameMap[normalizedCollection] === true;
        
        debugLog("Collection validation - '" + normalizedCollection + "': " + isValid);
        
        return isValid;
    },

    normalizeLocationForService: function(location) {
        // Map internal location names to what the Springs service expects
        var locationMap = {
            'David O. McKay Library': 'McKay Library',
            'David O McKay Library': 'McKay Library',
            'McKay Library': 'McKay Library'
        };
        
        var normalized = locationMap[location] || location;
        debugLog("Location normalized from '" + location + "' to '" + normalized + "'");
        return normalized;
    },

    createModal: function(item, params) {
        var url = springyMap.siteConfig.domain + "/libmaps/catalog?" + params.toString();
        debugSuccess("Creating modal with URL: " + url);
        var html = springyMap.siteConfig.getModalHtml(item, url);
        var div = document.createElement("div");
        div.insertAdjacentHTML("afterbegin", html);
        return div;
    },

    createModalClickHandler: function(item, params) {
        return function(event) {
            event.preventDefault();
            event.stopPropagation();
            debugLog("Modal button clicked for: " + item.call);
            
            // Hide debug panel temporarily
            var debugPanel = document.getElementById('libmaps-debug');
            if (debugPanel) {
                debugPanel.style.display = 'none';
            }
            
            if (!item.modal) {
                var modalDiv = springyMap.createModal(item, params);
                item.modal = document.body.appendChild(modalDiv);
                
                // Close button handler
                item.modal.querySelector(".springy-close").addEventListener("click", function() {
                    item.modal.querySelector(".springy-underlay").classList.remove("springy-underlay-active");
                    item.modal.querySelector(".springy-modal").classList.remove("springy-modal-active");
                    // Restore debug panel
                    if (debugPanel) debugPanel.style.display = 'block';
                });
                
                // Print button handler
                item.modal.querySelector(".springy-print").addEventListener("click", function() {
                    window.open(
                        springyMap.siteConfig.domain + "/libmaps/call/print?" + params.toString(),
                        item.call,
                        "height=860,width=630"
                    );
                });
            }
            
            item.modal.querySelector(".springy-underlay").classList.add("springy-underlay-active");
            item.modal.querySelector(".springy-modal").classList.add("springy-modal-active");
            debugSuccess("LibMaps modal displayed");
        };
    },

    createButton: function(item) {
        debugLog("Creating button for: " + item.call);
        
        var button = document.createElement("a");
        button.classList.add("springy-button");
        button.innerHTML = this.siteConfig.button.icon + this.siteConfig.button.label;
        button.href = "#";
        button.style.cssText = 'display: inline-block; background: #337AB7; color: white; padding: 8px 12px; text-decoration: none; border-radius: 6px; margin: 5px; cursor: pointer; border: 2px solid orange;';
        
        // Capture item values in closure to avoid reference issues
        var callNumber = item.call;
        var location = item.location;
        
        // Use the exact original working LibMaps button logic
        var params = new URLSearchParams();
        
        params.set("call", callNumber);
        params.set("location", springyMap.normalizeLocationForService(location));
        params.set("collection", ""); // Empty for mobile version
        params.set("title", "Book Details");
        
        debugLog("Creating LibMaps parameters:");
        debugLog("  Raw location from HTML: '" + location + "'");
        debugLog("  Normalized location: '" + normalizedLocation + "'");
        debugLog("  Call number: '" + callNumber + "'");
        debugLog("  Final URL parameters: " + params.toString());
        
        // Use the exact original working modal click handler
        button.onclick = springyMap.createModalClickHandler({
            title: "Book Details",
            location: location,
            call: callNumber
        }, params);
        
        debugSuccess("Button created with click handler");
        return button;
    },

    setupButtons: function(items) {
        debugSuccess("=== SETTING UP BUTTONS ===");
        debugLog("Items to process: " + items.length);
        
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            debugLog("Processing item " + (i+1) + ": call='" + item.call + "', location='" + item.location + "', collection='" + (item.collection || 'empty') + "'");
            
            if (item.call.length !== 0 && 
                springyMap.isValidLocation(item.location) && 
                springyMap.isValidCollection(item.collection || "")) {
                
                debugSuccess("Creating button for item " + (i+1));
                
                var button = springyMap.createButton(item);
                var buttonDiv = document.createElement("div");
                buttonDiv.classList.add("springy-button-div");
                buttonDiv.insertAdjacentElement("afterbegin", button);
                
                springyILS.attachButton(item, buttonDiv);
                debugSuccess("✅ Button " + (i+1) + " created and attached!");
            } else {
                debugWarn("Skipping item " + (i+1) + " - validation failed");
                debugLog("  Call valid: " + (item.call.length !== 0));
                debugLog("  Location valid: " + springyMap.isValidLocation(item.location));
                debugLog("  Collection valid: " + springyMap.isValidCollection(item.collection || ""));
            }
        }
    },

    injectStyles: function(head, css) {
        debugLog("Injecting CSS styles");
        try {
            var style = document.createElement("style");
            style.innerHTML = css;
            head.appendChild(style);
            debugSuccess("CSS injected successfully");
        } catch (e) {
            debugError("Failed to inject CSS: " + e.message);
        }
    },

    scrape: function() {
        // Track how many times scrape is called
        if (!window.libmapsScrapeCount) {
            window.libmapsScrapeCount = 0;
        }
        window.libmapsScrapeCount++;
        
        debugSuccess("=== STARTING SCRAPE PROCESS (Call #" + window.libmapsScrapeCount + ") ===");
        
        // Check if we've already processed this page
        if (document.body.classList.contains('libmaps-scrape-complete')) {
            debugError("Page already processed - this should not happen! Scrape call #" + window.libmapsScrapeCount);
            return [];
        }
        
        var items = springyILS.scrapeDom();
        debugLog("Scraped " + items.length + " items");
        
        // Mark page as processed
        document.body.classList.add('libmaps-scrape-complete');
        
        if (items.length > 0) {
            var buttonsCreated = this.setupButtons(items);
            
            // Show final result
            setTimeout(function() {
                if (buttonsCreated > 0) {
                    var successMsg = document.createElement('div');
                    successMsg.innerHTML = '🎉 SUCCESS!<br>' + buttonsCreated + ' Map It buttons created!';
                    successMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:green;color:white;padding:25px;font-size:20px;text-align:center;border-radius:15px;z-index:1000002;border:5px solid gold;font-weight:bold;';
                    document.body.appendChild(successMsg);
                    
                    setTimeout(function() { successMsg.remove(); }, 4000);
                } else {
                    debugCritical("No buttons were created despite finding items!");
                }
            }, 1000);
        }
        
        return items;
    },

    watch: function() {
        debugSuccess("=== STARTING DOM WATCHER ===");
        
        var attempts = 0;
        var maxAttempts = isMobileDevice ? 60 : 30;
        var interval = isMobileDevice ? 750 : 500;
        
        debugLog("Max attempts: " + maxAttempts + ", interval: " + interval + "ms");
        
        var watcher = setInterval(function() {
            attempts++;
            debugLog("Watch attempt " + attempts + "/" + maxAttempts);
            
            var targetElement = document.querySelector(".detailItemsTable_CALLNUMBER") ||
                              document.querySelector("[class*='detailItemsTable_CALLNUMBER']") ||
                              document.querySelector("[class*='detailItemsTable_']") ||
                              document.querySelector(".detailItemsTableRow") ||
                              document.querySelector("tbody .detailItemsTableRow") ||
                              document.querySelector(".detailItemsTable");
            
            if (targetElement) {
                debugSuccess("Target elements found!");
                clearInterval(watcher);
                
                setTimeout(function() {
                    springyMap.scrape();
                }, isMobileDevice ? 1500 : 750);
                
            } else if (attempts >= maxAttempts) {
                debugError("Watch timeout - no target elements found");
                clearInterval(watcher);
                
                // Show what we did find
                var allTables = document.querySelectorAll('table');
                var allTrs = document.querySelectorAll('tr');
                debugLog("Found " + allTables.length + " tables and " + allTrs.length + " rows on page");
                
                if (allTrs.length > 0) {
                    debugWarn("Attempting to process any available rows...");
                    springyMap.scrape();
                }
            }
        }, interval);
    }
};

// Initialize when ready
function initializeLibMaps() {
    debugSuccess("=== INITIALIZING LIBMAPS ===");
    
    try {
        springyMap.injectStyles(document.head, springyMap.siteConfig.css);
        springyMap.watch();
        debugSuccess("LibMaps initialized successfully");
    } catch (e) {
        debugCritical("Failed to initialize LibMaps: " + e.message);
    }
}

// Start LibMaps when page is ready
setTimeout(function() {
    debugLog("Starting LibMaps initialization...");
    initializeLibMaps();
}, 3000);

alert('🏁 Complete LibMaps debug script loaded successfully!');