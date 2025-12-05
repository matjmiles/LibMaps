// sirsiDynix Enterprise - Springs Lib Maps Integration
// Fixed version addressing common integration issues

console.log("ENTERPRISE INTEGRATION: Initializing Springs Lib Maps...");

// Mobile detection and debugging setup
var isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var debugMode = true; // Set to false in production

function debugLog(message, data, level) {
    if (debugMode) {
        var fullMessage = "LIBMAPS DEBUG: " + message;
        var timestamp = new Date().toLocaleTimeString();
        
        // Always log to console
        console.log(fullMessage, data || "");
        
        // ULTRA-VISIBLE MOBILE DEBUG SYSTEM FOR IPHONE
        if (isMobileDevice) {
            // First, test if we can even create elements
            try {
                addEmergencyDebug('📱 Creating debug panel...');
                
                var debugDiv = document.getElementById('libmaps-debug');
                if (!debugDiv) {
                    debugDiv = document.createElement('div');
                    debugDiv.id = 'libmaps-debug';
                    // Make it IMPOSSIBLE to miss on iPhone
                    debugDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:rgba(255,0,0,0.98);color:white;padding:20px;font-family:Arial,sans-serif;font-size:16px;z-index:999999999;border-bottom:5px solid yellow;box-shadow:0 0 20px rgba(255,0,0,0.8);min-height:80px;';
                    
                    // Test if body exists
                    if (!document.body) {
                        addEmergencyDebug('❌ ERROR: Document body not ready!');
                        return;
                    }
                    
                    addEmergencyDebug('✅ Body exists, adding debug panel...');
                
                // Large, finger-friendly close button for iPhone
                var closeBtn = document.createElement('button');
                closeBtn.innerHTML = 'HIDE DEBUG';
                closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;background:#ff4444;color:white;border:2px solid white;font-size:14px;padding:8px 12px;border-radius:8px;font-weight:bold;cursor:pointer;';
                closeBtn.onclick = function() { 
                    debugDiv.style.display = 'none';
                    // Show a small indicator that debug is hidden
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
                
                // Add toggle button to minimize/maximize
                var toggleBtn = document.createElement('button');
                toggleBtn.innerHTML = '−';
                toggleBtn.style.cssText = 'position:absolute;top:2px;right:30px;background:#333;color:white;border:none;font-size:14px;cursor:pointer;width:20px;height:20px;border-radius:50%;';
                var isMinimized = false;
                toggleBtn.onclick = function() {
                    if (isMinimized) {
                        debugDiv.style.height = '150px';
                        toggleBtn.innerHTML = '−';
                        isMinimized = false;
                    } else {
                        debugDiv.style.height = '30px';
                        toggleBtn.innerHTML = '+';
                        isMinimized = true;
                    }
                };
                debugDiv.appendChild(toggleBtn);
                
                // Large, prominent title
                var title = document.createElement('div');
                title.innerHTML = '📱 LIBMAPS IPHONE DEBUG 📱';
                title.style.cssText = 'font-weight:bold;font-size:20px;margin-bottom:10px;color:yellow;margin-right:280px;text-shadow:2px 2px 4px rgba(0,0,0,0.8);';
                debugDiv.appendChild(title);
                
                // Status indicator
                var status = document.createElement('div');
                status.id = 'libmaps-status';
                status.innerHTML = '🔄 INITIALIZING...';
                status.style.cssText = 'font-size:18px;font-weight:bold;color:yellow;margin-bottom:10px;';
                debugDiv.appendChild(status);
                
                // Add content container
                var content = document.createElement('div');
                content.id = 'libmaps-debug-content';
                content.style.cssText = 'margin-top:25px;';
                debugDiv.appendChild(content);
                
                try {
                    document.body.appendChild(debugDiv);
                    addEmergencyDebug('✅ Debug panel added to body!');
                    
                    // Test if it's actually visible
                    setTimeout(function() {
                        var testDiv = document.getElementById('libmaps-debug');
                        if (testDiv && testDiv.offsetHeight > 0) {
                            addEmergencyDebug('✅ Debug panel is visible!');
                        } else {
                            addEmergencyDebug('❌ Debug panel exists but not visible!');
                        }
                    }, 500);
                    
                } catch (e) {
                    addEmergencyDebug('❌ Error adding to body: ' + e.message);
                }
                
            } catch (e) {
                addEmergencyDebug('❌ Error creating debug panel: ' + e.message);
            }
            
            var content = document.getElementById('libmaps-debug-content');
            var levelColor = level === 'error' ? '#ff6666' : level === 'warn' ? '#ffaa00' : level === 'success' ? '#66ff66' : '#ffffff';
            var logEntry = document.createElement('div');
            logEntry.style.cssText = 'margin:2px 0;color:' + levelColor + ';word-wrap:break-word;';
            logEntry.innerHTML = '[' + timestamp + '] ' + message + (data ? ' | ' + JSON.stringify(data) : '');
            content.appendChild(logEntry);
            
            // Auto-scroll to bottom
            content.scrollTop = content.scrollHeight;
            
            // Keep only last 50 entries to prevent memory issues
            var entries = content.children;
            while (entries.length > 50) {
                content.removeChild(entries[0]);
            }
        }
        
        // Also add to page content for extreme debugging (can be toggled)
        if (level === 'error' || level === 'critical') {
            var pageDebug = document.getElementById('page-debug-info');
            if (!pageDebug) {
                pageDebug = document.createElement('div');
                pageDebug.id = 'page-debug-info';
                pageDebug.style.cssText = 'position:fixed;bottom:10px;left:10px;background:red;color:white;padding:10px;font-size:12px;z-index:999998;max-width:90%;border-radius:5px;';
                document.body.appendChild(pageDebug);
            }
            pageDebug.innerHTML = '<strong>CRITICAL:</strong> ' + message;
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
            alert('LibMaps Critical: ' + message);
        }, 100);
    }
}

// IMMEDIATE ALERT FOR IPHONE USERS
if (isMobileDevice) {
    alert('🚀 LibMaps Debug Starting! Look for RED debug panel at top of page.');
}

// EMERGENCY FALLBACK - Add visible text directly to page body
function addEmergencyDebug(message) {
    if (isMobileDevice) {
        var emergencyDiv = document.createElement('div');
        emergencyDiv.innerHTML = message;
        emergencyDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:15px;font-size:18px;text-align:center;z-index:999999999;border-bottom:3px solid yellow;';
        
        // Force add to body even if not ready
        if (document.body) {
            document.body.appendChild(emergencyDiv);
        } else {
            // If body doesn't exist yet, try again in 100ms
            setTimeout(function() {
                if (document.body) {
                    document.body.appendChild(emergencyDiv);
                }
            }, 100);
        }
    }
}

// Test emergency debug immediately
addEmergencyDebug('🚨 EMERGENCY DEBUG ACTIVE - LibMaps initializing...');

// IMMEDIATE VISUAL TEST - Create a simple test element
if (isMobileDevice) {
    var testElement = document.createElement('div');
    testElement.id = 'libmaps-test-element';
    testElement.innerHTML = '🧪 LIBMAPS TEST ELEMENT - Script is running!';
    testElement.style.cssText = 'position:fixed;top:50px;left:10px;right:10px;background:purple;color:white;padding:15px;font-size:16px;text-align:center;z-index:999999999;border:3px solid white;border-radius:10px;';
    
    // Try multiple methods to add it
    function addTestElement() {
        if (document.body) {
            document.body.appendChild(testElement);
            console.log('Test element added to body');
        } else if (document.documentElement) {
            document.documentElement.appendChild(testElement);
            console.log('Test element added to documentElement');
        } else {
            setTimeout(addTestElement, 50);
        }
    }
    
    addTestElement();
    
    // Remove test element after 8 seconds
    setTimeout(function() {
        if (testElement && testElement.parentNode) {
            testElement.parentNode.removeChild(testElement);
        }
    }, 8000);
}

// BACKUP METHOD - Direct HTML injection
if (isMobileDevice) {
    try {
        document.write('<div id="backup-debug" style="position:fixed;top:0;left:0;right:0;background:blue;color:white;padding:10px;font-size:14px;z-index:999999999;text-align:center;">🔵 BACKUP DEBUG: LibMaps script is running on mobile device</div>');
    } catch (e) {
        // Even document.write failed
    }
}

debugLog("=== LIBMAPS MOBILE DEBUG START ===");
debugSuccess("Mobile device detected: " + isMobileDevice);
debugLog("User agent: " + navigator.userAgent);
debugLog("Document ready state: " + document.readyState);
debugLog("Document URL: " + document.URL);
debugLog("Window size: " + window.innerWidth + "x" + window.innerHeight);

// VISIBLE PROOF SCRIPT IS RUNNING - Change page title
if (isMobileDevice) {
    try {
        var originalTitle = document.title;
        document.title = "📱 LIBMAPS DEBUG ACTIVE - " + originalTitle;
        addEmergencyDebug('📝 Page title changed to show LibMaps is active');
    } catch (e) {
        addEmergencyDebug('❌ Could not change page title: ' + e.message);
    }
}

// Add prominent page indicator
if (isMobileDevice) {
    var pageIndicator = document.createElement('div');
    pageIndicator.innerHTML = '📱 LIBMAPS ACTIVE - DEBUG PANEL ABOVE';
    pageIndicator.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:orange;color:black;text-align:center;padding:10px;font-size:16px;font-weight:bold;z-index:999998;border-top:3px solid red;';
    document.body.appendChild(pageIndicator);
    
    setTimeout(function() {
        if (document.contains(pageIndicator)) {
            pageIndicator.remove();
        }
    }, 8000);
}

var springyILS = {
    getTitle: function(element) {
        // Try multiple selector strategies for better compatibility
        var titleSelectors = [
            // Most specific first - actual title content
            ".displayElementText.text-p.INITIAL_TITLE_SRCH",
            ".displayElementText.INITIAL_TITLE_SRCH", 
            ".detail_biblio_title",
            ".TITLE_ABNP:not(.TITLE_ABNP_label)",
            ".INITIAL_TITLE_SRCH:not(.INITIAL_TITLE_SRCH_label)"
        ];
        
        // Always search from document level first
        for (var i = 0; i < titleSelectors.length; i++) {
            var title = document.querySelector(titleSelectors[i]);
            if (title && title.textContent && title.textContent.trim()) {
                var titleText = title.textContent.trim();
                console.log("ENTERPRISE: Found title using selector:", titleSelectors[i]);
                console.log("ENTERPRISE: Title text:", titleText);
                return title;
            }
        }
        
        // Try alternative selectors for different page layouts
        var alternativeSelectors = [
            // Look for any element with title-related content
            "[class*='TITLE']:not([class*='label']):not([class*='_label'])",
            ".detail_biblio .INITIAL_TITLE_SRCH",
            "#detail_biblio0 .INITIAL_TITLE_SRCH"
        ];
        
        for (var k = 0; k < alternativeSelectors.length; k++) {
            var elements = document.querySelectorAll(alternativeSelectors[k]);
            for (var l = 0; l < elements.length; l++) {
                var elem = elements[l];
                if (elem && elem.textContent && elem.textContent.trim() && 
                    !elem.classList.contains('label') && 
                    !elem.textContent.trim().endsWith(':')) {
                    console.log("ENTERPRISE: Found title using alternative selector:", alternativeSelectors[k]);
                    console.log("ENTERPRISE: Title text:", elem.textContent.trim());
                    return elem;
                }
            }
        }
        
        // Final fallback: use document title (remove " - Library Name" suffix if present)
        var docTitle = document.title;
        if (docTitle) {
            // Clean up common title suffixes
            docTitle = docTitle.replace(/ - .*$/, '').trim();
            console.log("ENTERPRISE: Using document title as fallback:", docTitle);
            // Create a virtual element to return consistent interface
            var virtualTitle = {
                textContent: docTitle,
                innerText: docTitle
            };
            return virtualTitle;
        }
        
        console.warn("ENTERPRISE: No title found at all");
        return null;
    },
    
    scrapeDetailRows: function(items) {
        debugSuccess("=== STARTING DETAIL ROW SCRAPING ===");
        debugLog("Current items array length: " + items.length);
        
        // Try both selector patterns for better compatibility
        var selectors = [
            ".detailItemsTableRow:not(.libmaps-proc)",
            "tbody .detailItemsTableRow:not(.libmaps-proc)",
            ".detailItemsTable tr:not(.libmaps-proc)", // Additional mobile selector
            "[class*='detailItems'] tr:not(.libmaps-proc)" // Wildcard selector
        ];
        
        debugLog("Trying " + selectors.length + " selectors for detail rows");
        
        var rows = null;
        var workingSelector = null;
        
        for (var i = 0; i < selectors.length; i++) {
            debugLog("Testing selector " + (i+1) + "/" + selectors.length + ": " + selectors[i]);
            var testRows = document.querySelectorAll(selectors[i]);
            debugLog("Selector result: " + testRows.length + " elements");
            
            if (testRows.length > 0) {
                rows = testRows;
                workingSelector = selectors[i];
                debugSuccess("SUCCESS: Found " + rows.length + " rows using: " + workingSelector);
                break;
            }
        }
        
        if (!rows || rows.length === 0) {
            debugError("No detail rows found with any selector!");
            debugLog("Attempting broader search...");
            
            // Broader search for debugging
            var allRows = document.querySelectorAll('tr');
            var allDivs = document.querySelectorAll('div[class*="row"], div[class*="item"], div[class*="detail"]');
            debugWarn("Found " + allRows.length + " total TR elements on page");
            debugWarn("Found " + allDivs.length + " potential item containers");
            
            if (allRows.length > 0) {
                debugLog("Sample TR classes: " + (allRows[0].className || 'no classes'));
            }
            return items;
        }
        
        if (!rows || rows.length === 0) {
            console.warn("ENTERPRISE: No detail rows found");
            return items;
        }
        
        for (let i = 0; i < rows.length; i++) {
            console.log(`ENTERPRISE: Processing row ${i + 1} of ${rows.length}`);
            
            var row = rows[i];
            var title = springyILS.getTitle(row);
            var callElement = row.querySelector(".detailItemsTable_CALLNUMBER");
            var libraryElement = row.querySelector(".detailItemsTable_LIBRARY");
            var collectionElement = row.querySelector(".detailItemsTable_SD_HZN_COLLECTION");
            
            if (callElement && libraryElement) {
                row.classList.add("libmaps-proc");
                
                // Extract location - try multiple approaches
                var locationElement = libraryElement.querySelector(".asyncFieldLIBRARY:last-of-type") ||
                                     libraryElement.querySelector(".asyncFieldLIBRARY") ||
                                     libraryElement;
                
                var location = springyMap.extractText(locationElement);
                var call = springyMap.extractText(callElement);
                var collection = springyMap.extractCollectionText(collectionElement);
                var titleText = springyMap.extractText(title);
                
                console.log(`  Row ${i + 1} data:`, {
                    location: location,
                    call: call,
                    collection: collection,
                    title: titleText
                });
                
                // Validate before adding
                var locationValid = springyMap.isValidLocation(location);
                var collectionValid = springyMap.isValidCollection(collection);
                var callValid = call && call.length > 0;
                
                console.log(`  Validation - Location: ${locationValid}, Collection: ${collectionValid}, Call: ${callValid}`);
                
                if (callValid && locationValid && collectionValid) {
                    items.push({
                        element: row,
                        buttonElement: callElement,
                        location: location,
                        call: call,
                        title: titleText,
                        collection: collection
                    });
                    console.log(`  ✓ Row ${i + 1} added to items`);
                } else {
                    console.log(`  ✗ Row ${i + 1} failed validation`);
                }
            } else {
                console.log(`  ✗ Row ${i + 1} missing required elements (call: ${!!callElement}, library: ${!!libraryElement})`);
            }
        }
        
        console.log(`ENTERPRISE: Scraped ${items.length} valid items`);
        return items;
    },
    
    scrapeDom: function() {
        return springyILS.scrapeDetailRows([]);
    },
    
    attachButton: function(item, buttonDiv) {
        console.log("ENTERPRISE: Attaching button to:", item.call);
        (item.buttonElement || item.element).appendChild(buttonDiv);
    },
    
    setupListeners: function() {
        // Reserved for future use
    }
};

var springyMap = {
    callbackId: 1,
    siteConfig: {},
    
    cleanText: function(text) {
        if (!text) return "";
        
        // Clean and normalize text
        var cleaned = text.trim()
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .replace(/Unknown$/, "")  // Remove trailing "Unknown"
            .replace(/\s+$/, "");     // Remove trailing whitespace again
        
        return cleaned;
    },
    
    extractText: function(element) {
        if (!element) return "";
        
        var text = "";
        if (element.textContent) {
            text = element.textContent;
        } else if (element.innerText) {
            text = element.innerText;
        }
        
        // Additional cleanup for collection fields that might have concatenated values
        var cleaned = springyMap.cleanText(text);
        
        // Log the before/after for debugging
        if (text !== cleaned) {
            console.log(`ENTERPRISE: Text cleaned - Before: '${text}', After: '${cleaned}'`);
        }
        
        return cleaned;
    },
    
    extractCollectionText: function(element) {
        if (!element) return "";
        
        var rawText = "";
        if (element.textContent) {
            rawText = element.textContent;
        } else if (element.innerText) {
            rawText = element.innerText;
        }
        
        if (!rawText) return "";
        
        console.log(`ENTERPRISE: Raw collection text: '${rawText}'`);
        
        // Clean the text first
        var cleaned = springyMap.cleanText(rawText);
        console.log(`ENTERPRISE: Cleaned collection text: '${cleaned}'`);
        
        // Try to match against valid collection names
        var validCollections = Object.keys(springyMap.siteConfig.validCollectionNameMap);
        
        // First, try exact match
        if (springyMap.siteConfig.validCollectionNameMap[cleaned]) {
            console.log(`ENTERPRISE: Exact collection match found: '${cleaned}'`);
            return cleaned;
        }
        
        // If no exact match, try to find a valid collection that's contained in the text
        for (var i = 0; i < validCollections.length; i++) {
            var validCollection = validCollections[i];
            if (cleaned.indexOf(validCollection) === 0) {
                console.log(`ENTERPRISE: Partial collection match found: '${validCollection}' from '${cleaned}'`);
                return validCollection;
            }
        }
        
        // If still no match, try case-insensitive partial matching
        var lowerCleaned = cleaned.toLowerCase();
        for (var j = 0; j < validCollections.length; j++) {
            var validCollection = validCollections[j];
            if (lowerCleaned.indexOf(validCollection.toLowerCase()) === 0) {
                console.log(`ENTERPRISE: Case-insensitive collection match found: '${validCollection}' from '${cleaned}'`);
                return validCollection;
            }
        }
        
        console.log(`ENTERPRISE: No collection match found for: '${cleaned}'`);
        return cleaned; // Return the cleaned version even if no match
    },
    
    normalizeLocationForService: function(location) {
        // Map internal location names to what the Springs service expects
        var locationMap = {
            'David O. McKay Library': 'McKay Library',
            'David O McKay Library': 'McKay Library',
            'McKay Library': 'McKay Library'
        };
        
        var normalized = locationMap[location] || location;
        console.log(`ENTERPRISE: Location normalized from '${location}' to '${normalized}'`);
        return normalized;
    },
    
    injectStyles: function(head, css) {
        var style = document.createElement("style");
        style.type = "text/css";
        style.innerText = css;
        head.insertBefore(style, head.firstChild);
        console.log("ENTERPRISE: Styles injected");
    },
    
    createModal: function(item, params) {
        var url = springyMap.siteConfig.domain + "/libmaps/catalog?" + params.toString();
        var html = springyMap.siteConfig.getModalHtml(item, url);
        var div = document.createElement("div");
        div.insertAdjacentHTML("afterbegin", html);
        return div;
    },
    
    createIcon: function() {
        var iconSvg = springyMap.siteConfig.button.icon;
        if (iconSvg.length === 0) return null;
        
        return (new DOMParser()).parseFromString(iconSvg, "application/xml").documentElement;
    },
    
    createKeyHandler: function() {
        return function(event) {
            if (event.keyCode === 13) { // Enter key
                event.stopPropagation();
                this.click();
            }
        };
    },
    
    createModalClickHandler: function(item, params) {
        return function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            if (!item.modal) {
                var modalDiv = springyMap.createModal(item, params);
                item.modal = document.body.appendChild(modalDiv);
                
                // Close button handler
                item.modal.querySelector(".springy-close").addEventListener("click", function() {
                    item.modal.querySelector(".springy-underlay").classList.remove("springy-underlay-active");
                    item.modal.querySelector(".springy-modal").classList.remove("springy-modal-active");
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
        };
    },
    
    createButton: function(item) {
        console.log("ENTERPRISE: Creating button for:", item.call);
        
        var icon = springyMap.createIcon();
        var label = document.createTextNode(springyMap.siteConfig.button.label);
        var params = new URLSearchParams();
        
        params.set("call", item.call);
        params.set("location", springyMap.normalizeLocationForService(item.location));
        params.set("collection", item.collection || "");
        params.set("title", item.title || "");
        
        if (springyMap.siteConfig.isModalWanted) {
            var button = document.createElement("button");
            button.setAttribute("type", "button");
            button.classList.add("springy-button");
            
            if (icon !== null) button.appendChild(icon);
            button.appendChild(label);
            
            button.onclick = springyMap.createModalClickHandler(item, params);
            button.addEventListener("keydown", springyMap.createKeyHandler());
            
            return button;
        } else {
            var link = document.createElement("a");
            link.classList.add("springy-button");
            
            if (icon !== null) link.appendChild(icon);
            link.appendChild(label);
            link.setAttribute("target", "_blank");
            link.href = springyMap.siteConfig.domain + "/libmaps/catalog/full?" + params.toString();
            
            link.addEventListener("click", function(event) {
                event.stopPropagation();
                this.blur();
                return false;
            });
            link.addEventListener("keydown", springyMap.createKeyHandler());
            
            return link;
        }
    },
    
    isValidLocation: function(location) {
        if (springyMap.siteConfig.isUsingFixedLocation) {
            return true;
        }
        
        if (!location || location.length === 0) {
            return false;
        }
        
        // Normalize location name for comparison
        var normalizedLocation = location.trim();
        var isValid = springyMap.siteConfig.validLocationNameMap[normalizedLocation] === true;
        
        console.log(`ENTERPRISE: Location validation - '${normalizedLocation}': ${isValid}`);
        
        if (!isValid) {
            console.log("ENTERPRISE: Available locations:", Object.keys(springyMap.siteConfig.validLocationNameMap));
        }
        
        return isValid;
    },
    
    isValidCollection: function(collection) {
        if (!springyMap.siteConfig.isValidCollectionRequired) {
            return true;
        }
        
        if (!collection || collection.length === 0) {
            console.log("ENTERPRISE: Collection validation failed - empty collection");
            return false;
        }
        
        var normalizedCollection = collection.trim();
        var isValid = springyMap.siteConfig.validCollectionNameMap[normalizedCollection] === true;
        
        console.log(`ENTERPRISE: Collection validation - '${normalizedCollection}': ${isValid}`);
        
        if (!isValid) {
            console.log("ENTERPRISE: Available collections:", Object.keys(springyMap.siteConfig.validCollectionNameMap));
        }
        
        return isValid;
    },
    
    setupButtons: function(items) {
        debugSuccess("=== SETTING UP BUTTONS ===");
        debugLog("Items to process: " + items.length);
        
        if (items.length === 0) {
            debugError("No items to create buttons for!");
            return;
        }
        
        for (let i = 0; i < items.length; i++) {
            var item = items[i];
            debugLog("Processing item " + (i+1) + "/" + items.length + ": " + item.call + " at " + item.location);
            
            var callValid = item.call && item.call.length !== 0;
            var locationValid = springyMap.isValidLocation(item.location);
            var collectionValid = springyMap.isValidCollection(item.collection);
            
            debugLog("Validation - Call: " + callValid + ", Location: " + locationValid + ", Collection: " + collectionValid);
            
            if (callValid && locationValid && collectionValid) {
                debugLog("Creating button for item: " + item.call);
                
                try {
                    var button = springyMap.createButton(item);
                    if (button) {
                        var buttonDiv = document.createElement("div");
                        buttonDiv.classList.add("springy-button-div");
                        buttonDiv.insertAdjacentElement("afterbegin", button);
                        
                        debugLog("Button created successfully, attempting to attach...");
                        debugLog("Button element: " + buttonDiv.tagName + " with innerHTML length: " + buttonDiv.innerHTML.length);
                        
                        springyILS.attachButton(item, buttonDiv);
                        debugSuccess("✓ Button created and attached for item " + (i+1));
                        
                        // Verify button is in DOM
                        setTimeout(function() {
                            var buttonInDom = document.contains(buttonDiv);
                            debugLog("Button in DOM: " + buttonInDom);
                            if (!buttonInDom) {
                                debugError("Button created but not found in DOM!");
                            }
                        }, 100);
                    } else {
                        debugError("createButton returned null/undefined");
                    }
                } catch (e) {
                    debugError("Error creating button: " + e.message);
                }
            } else {
                debugWarn("✗ Skipping item " + (i+1) + " - validation failed");
                debugLog("Item details: call='" + item.call + "', location='" + item.location + "', collection='" + item.collection + "'");
            }
        }
    },
    
    scrapeDomGeneric: function() {
        var items = [];
        var elements = document.querySelectorAll(".libmaps-button:not(.libmaps-proc), .libmap-button:not(.libmaps-proc)");
        
        for (let i = 0; i < elements.length; i++) {
            var element = elements[i];
            element.classList.add("libmaps-proc");
            
            var callNumber = element.dataset.callnumber || "";
            var location = element.dataset.location || "";
            
            if (callNumber.length !== 0 && location.length !== 0) {
                items.push({
                    element: element,
                    buttonElement: element,
                    location: location,
                    call: callNumber,
                    title: element.dataset.title || "",
                    collection: element.dataset.collection || ""
                });
            }
        }
        
        return items;
    },
    
    scrape: function() {
        debugLog("Starting scrape process");
        debugLog("Generic scrape wanted: " + springyMap.siteConfig.isGenericScrapeWanted);
        
        var items = springyMap.siteConfig.isGenericScrapeWanted ? 
                   springyMap.scrapeDomGeneric() : 
                   springyILS.scrapeDom();
        
        debugLog("Found " + items.length + " items to process");
        
        springyMap.setupButtons(items);
        debugLog("Scrape completed successfully");
        
        return items;
    },
    
    watch: function() {
        debugSuccess("=== STARTING DOM WATCHER ===");
        debugLog("Page title: " + document.title);
        debugLog("Body children count: " + document.body.children.length);
        
        var attempts = 0;
        var maxAttempts = isMobileDevice ? 60 : 30; // More attempts for mobile
        var interval = isMobileDevice ? 750 : 500; // Longer intervals for mobile
        
        debugLog("Watcher config - maxAttempts: " + maxAttempts + ", interval: " + interval);
        debugLog("Looking for selectors: .detailItemsTableRow, tbody .detailItemsTableRow, .detailItemsTable, .detailItems");
        
        var watcher = setInterval(function() {
            attempts++;
            debugLog("Watch attempt " + attempts + "/" + maxAttempts);
            
            // Try multiple selectors to find target elements with detailed logging
            var selectors = [
                ".detailItemsTableRow",
                "tbody .detailItemsTableRow", 
                ".detailItemsTable",
                ".detailItems",
                "[class*='detailItems']"
            ];
            
            var targetElement = null;
            var foundSelector = null;
            
            for (var i = 0; i < selectors.length; i++) {
                var element = document.querySelector(selectors[i]);
                if (element) {
                    targetElement = element;
                    foundSelector = selectors[i];
                    debugSuccess("Found target using selector: " + foundSelector);
                    debugLog("Element tag: " + element.tagName + ", classes: " + (element.className || 'none'));
                    break;
                } else {
                    debugLog("Selector failed: " + selectors[i]);
                }
            }
            
            // Additional debugging - check what IS on the page
            if (!targetElement && attempts === 1) {
                debugWarn("No target elements found. Checking page structure...");
                var allDivs = document.querySelectorAll('div[class*="detail"], table[class*="detail"], tr[class*="detail"]');
                debugLog("Found " + allDivs.length + " elements with 'detail' in class name");
                for (var j = 0; j < Math.min(allDivs.length, 5); j++) {
                    debugLog("Detail element " + j + ": " + allDivs[j].tagName + " class=" + allDivs[j].className);
                }
            }
            
            if (targetElement) {
                debugSuccess("=== TARGET ELEMENTS FOUND ===" );
                debugLog("Found selector: " + foundSelector);
                debugLog("Element info: " + targetElement.tagName + " with " + targetElement.children.length + " children");
                clearInterval(watcher);
                
                // Longer delay for mobile to ensure rendering is complete
                var renderDelay = isMobileDevice ? 1500 : 750;
                setTimeout(function() {
                    springyMap.scrape();
                }, renderDelay);
                
            } else if (attempts >= maxAttempts) {
                debugLog("Watch timeout - target elements not found after " + maxAttempts + " attempts");
                clearInterval(watcher);
                
                // Try one more time with generic scraping
                setTimeout(function() {
                    debugLog("Attempting generic scrape as fallback");
                    springyMap.siteConfig.isGenericScrapeWanted = true;
                    springyMap.scrape();
                }, isMobileDevice ? 2000 : 1000);
            }
        }, interval);
    }
};

// Configuration and initialization with multiple DOM ready strategies
(function() {
    debugLog("Configuring Springs Lib Maps integration");
    
    springyMap.siteConfig = {
        domain: 'https://byui.libcal.com',
        iid: 4251,
        isUsingFixedLocation: 0,
        isValidCollectionRequired: 1,
        
        // Updated location mapping to handle potential variations
        // We accept these location names from the DOM extraction
        validLocationNameMap: {
            'David O. McKay Library': true,
            'McKay Library': true,
            'David O McKay Library': true // Alternative without periods
        },
        
        // Comprehensive collection mapping
        validCollectionNameMap: {
            'Audio Books': true,
            'CD': true,
            'Double Oversize Books': true,
            'DVD': true,
            'General Books': true,
            'General Books - 1st Floor': true,
            'Juvenile Literature': true,
            'LP Records - Special Collections': true,
            'Map': true,
            'Microfilm - Special Collections': true,
            'Manuscripts - Special Collections': true,
            'Oversize Books': true,
            'Oversize Juvenile': true,
            'Popular Books': true,
            'Reserve Area': true,
            'Sheet Music': true,
            'SP+ Special Collections Oversized': true,
            'Special Coll.-Campus Authors': true,
            'Special Coll.-Caxton Press': true,
            'Special Coll.-Church History': true,
            'Special Coll.-Education Collection': true,
            'Special Coll.-Greater Yellowstone Ecosystem': true,
            'Special Coll.-Hinckley Music Collection': true,
            'Special Coll.-Historical Literature and Reference': true,
            'Special Coll.-Music': true,
            'Special Coll.-Printing Reference': true,
            'Special Coll.-Scriptures': true,
            'Special Coll.-Upper Snake River Valley History': true,
            'Special Coll.-Vardis Fisher': true,
            'Special Collections': true,
            'Teacher Learning Center': true,
            'Technical Services': true,
            'Univ. Archives-Campus Publications': true,
            'Univ. Archives-Campus Speeches': true
        },
        
        button: {
            label: 'Map It',
            icon: '<svg class="springy-icon" viewBox="796 796 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M970.135,870.134C970.135,829.191,936.943,796,896,796c-40.944,0-74.135,33.191-74.135,74.134 c0,16.217,5.221,31.206,14.055,43.41l-0.019,0.003L896,996l60.099-82.453l-0.019-0.003 C964.912,901.34,970.135,886.351,970.135,870.134z M896,900.006c-16.497,0-29.871-13.374-29.871-29.872s13.374-29.871,29.871-29.871 s29.871,13.373,29.871,29.871S912.497,900.006,896,900.006z"/></svg>',
            border: '6px'
        },
        
        isModalWanted: 1,
        isGenericScrapeWanted: 0,
        
        getModalHtml: function(item, url) {
            return `<div class="springy-underlay"><div class="springy-modal" data-location="${item.location}" data-zone="${item.zone}" data-call="${item.call}" tabindex="0"><div class="springy-header"><h1>${item.title}</h1><div class="springy-header-buttons"><button class="springy-print" aria-label="Print Map"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64 32l32 0c17.7 0 32-14.3 32-32l0-96c0-35.3-28.7-64-64-64L64 192c-35.3 0-64 28.7-64 64l0 96c0 17.7 14.3 32 32 32l32 0 0 64c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-64zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg></button><button class="springy-close" aria-label="Close" data-placement="bottom"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg></button></div></div><div class="springy-content"><iframe title="Map Image" src="${url}" style="position: relative; width: 100%; height: 100%; border: none;"></iframe></div></div></div>`;
        },
        
        css: '.springy-button-div { display: inline-block; } .springy-button { text-indent: 0; cursor: pointer; position: relative; padding: 6px 12px 6px 6px; box-sizing: border-box; border-width: 0; border-radius: 6px; color: #FFFFFF; background-color: #337AB7; display: inline-block; white-space: nowrap; line-height: 16px; } a.springy-button { color: #FFFFFF; text-decoration: none; } .springy-button:hover { color: #FFFFFF; background-color: #286090; } a.springy-button:hover { color: #FFFFFF; background-color: #286090; } .springy-button:focus { color: #FFFFFF; background-color: #286090; opacity: 80%; box-shadow: none; } a.springy-button:focus { color: #FFFFFF; background-color: #286090; opacity: 80%; box-shadow: none; } .springy-icon { padding-right: 4px; background-repeat: no-repeat; display: inline-block; vertical-align: middle; fill: currentColor; height: 16px; width: 16px; min-height: 16px; min-width: 16px; } .springy-underlay { padding: 0; top: 0; left: 0; width: 100%; height: 100%; display: none; background-color: rgba(0, 0, 0, .5); flex-direction: column; align-items: center; } .springy-underlay-active { display: flex; position: fixed; z-index: 30000; } .springy-modal { font-family: Arial, Helvetica, Verdana; display: flex; flex-direction: column; overflow-y: auto; width: 80%; max-width: 1200px; height: 90vh; margin-top: 3vh; background-color: #fff; border-radius: 5px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5); opacity: 0; } .springy-modal-active { opacity: 1; } .springy-header { display: flex; justify-content: space-between; border-bottom: 1px solid #d6d6d6; margin-bottom: 10px; margin-top: 14px; } .springy-header h1 { margin: 0 0 12px 12px; font-size: 24px; max-width: 80%; padding: 0; } .springy-header-buttons { margin-right: 12px; height: 100%; } .springy-header-buttons button { vertical-align: middle; padding: 2px 14px; margin-left: 6px; height: unset; border: none; background: none; color: rgb(51, 51, 51); } .springy-header-buttons button:hover { background: rgba(0,0,0,.07); box-shadow: 0 0 1px 1px rgba(0,0,0,.14) } .springy-header-buttons svg { width: 16px; height: 16px; vertical-align: -0.125em; } .springy-content { display: flex; flex-grow: 1; } .springy-directions-email-form button, .springy-directions-email-result { margin-left: 10px; }'
    };
    
    function initializeLibMaps() {
        debugSuccess("=== INITIALIZING LIBMAPS ===");
        debugLog("Final document ready state: " + document.readyState);
        debugLog("Page fully loaded: " + (document.readyState === 'complete'));
        debugLog("Head element exists: " + !!document.head);
        debugLog("Body element exists: " + !!document.body);
        
        try {
            debugLog("Injecting CSS styles...");
            springyMap.injectStyles(document.head, springyMap.siteConfig.css);
            debugSuccess("Styles injected successfully");
        } catch (e) {
            debugError("Failed to inject styles: " + e.message);
        }
        
        try {
            debugLog("Starting DOM watcher...");
            springyMap.watch();
            debugSuccess("Watcher started successfully");
        } catch (e) {
            debugError("Failed to start watcher: " + e.message);
        }
        
        debugSuccess("=== LIBMAPS INITIALIZATION COMPLETE ===");
    }
    
    // Multiple DOM ready strategies for better mobile compatibility
    function domReady(callback) {
        debugSuccess("=== DOM READY CHECK ===");
        debugLog("Document.readyState: " + document.readyState);
        
        if (document.readyState === 'loading') {
            debugLog("Document still loading, setting up event listeners...");
            
            var fired = false;
            
            // Strategy 1: DOMContentLoaded
            document.addEventListener('DOMContentLoaded', function() {
                if (!fired) {
                    fired = true;
                    debugSuccess("DOM ready via DOMContentLoaded");
                    debugLog("Body ready, children: " + document.body.children.length);
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
                debugWarn("Setting mobile timeout fallback (3 seconds)");
                setTimeout(function() {
                    if (!fired) {
                        fired = true;
                        debugCritical("DOM ready via timeout fallback (mobile) - this indicates slow loading!");
                        debugLog("Final body children count: " + document.body.children.length);
                        callback();
                    }
                }, 3000);
            }
        } else {
            debugSuccess("Document already ready: " + document.readyState);
            debugLog("Body children: " + document.body.children.length);
            callback();
        }
    }
    
    // Debug summary function
    function showDebugSummary() {
        if (isMobileDevice) {
            setTimeout(function() {
                debugSuccess("=== FINAL DEBUG SUMMARY ===");
                
                var buttons = document.querySelectorAll('.springy-button-div, .springy-button');
                var detailRows = document.querySelectorAll('.detailItemsTableRow, tbody .detailItemsTableRow, .detailItemsTable tr');
                var debugPanel = document.getElementById('libmaps-debug');
                
                debugLog("LibMaps buttons found: " + buttons.length);
                debugLog("Detail rows found: " + detailRows.length);
                debugLog("Debug panel active: " + (debugPanel ? 'YES' : 'NO'));
                debugLog("Page URL: " + window.location.href);
                debugLog("Page title: " + document.title);
                
                if (buttons.length === 0 && detailRows.length > 0) {
                    debugCritical("PROBLEM: Found detail rows but no LibMaps buttons!");
                } else if (buttons.length === 0 && detailRows.length === 0) {
                    debugCritical("PROBLEM: No detail rows found - might be wrong page type");
                } else if (buttons.length > 0) {
                    debugSuccess("SUCCESS: LibMaps integration appears to be working!");
                }
                
                // Add manual trigger button
                var manualBtn = document.createElement('button');
                manualBtn.innerHTML = 'Retry LibMaps';
                manualBtn.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#007bff;color:white;border:none;padding:15px;font-size:16px;border-radius:5px;z-index:1000000;';
                manualBtn.onclick = function() {
                    debugLog("Manual retry triggered");
                    manualBtn.remove();
                    initializeLibMaps();
                };
                document.body.appendChild(manualBtn);
                
                // Auto-remove manual button after 10 seconds
                setTimeout(function() {
                    if (document.contains(manualBtn)) {
                        manualBtn.remove();
                    }
                }, 10000);
                
            }, 5000); // Wait 5 seconds for everything to complete
        }
    }
    
    // Initialize when DOM is ready
    domReady(function() {
        initializeLibMaps();
        showDebugSummary();
    });
})();