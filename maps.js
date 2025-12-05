// sirsiDynix Enterprise - Springs Lib Maps Integration
// Fixed version addressing common integration issues

console.log("ENTERPRISE INTEGRATION: Initializing Springs Lib Maps...");

// Mobile detection and debugging setup
var isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var debugMode = true; // Set to false in production

// Enhanced mobile debug overlay function
function createMobileDebugOverlay() {
    var debugDiv = document.createElement('div');
    debugDiv.id = 'libmaps-debug';
    debugDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        right: 10px;
        background: rgba(0,0,0,0.95);
        color: #00ff00;
        padding: 15px;
        font-family: monospace;
        font-size: 13px;
        z-index: 999999;
        border: 3px solid #ff0000;
        max-height: 350px;
        overflow-y: auto;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(255,0,0,0.5);
    `;
    debugDiv.innerHTML = '<strong style="color:#ffff00;">🐛 LIBMAPS MOBILE DEBUG</strong><br>';
    
    // Add close button
    var closeBtn = document.createElement('div');
    closeBtn.innerHTML = '❌';
    closeBtn.style.cssText = 'position:absolute;top:5px;right:10px;cursor:pointer;color:#fff;font-size:16px;';
    closeBtn.onclick = function() { debugDiv.style.display = 'none'; };
    debugDiv.appendChild(closeBtn);
    
    document.body.appendChild(debugDiv);
    return debugDiv;
}

function debugLog(message, data) {
    if (debugMode) {
        console.log("LIBMAPS DEBUG: " + message, data || "");
        
        // Enhanced mobile debug overlay for better troubleshooting
        if (isMobileDevice) {
            setTimeout(function() {
                try {
                    var debugDiv = document.getElementById('libmaps-debug');
                    if (!debugDiv && document.body) {
                        debugDiv = createMobileDebugOverlay();
                    }
                    if (debugDiv) {
                        var timestamp = new Date().toLocaleTimeString();
                        var color = message.includes('✓') ? '#00ff00' : 
                                   message.includes('✗') || message.includes('ERROR') ? '#ff4444' : 
                                   message.includes('MOBILE') ? '#00ffff' : '#ffffff';
                        debugDiv.innerHTML += `<div style="color:${color};margin:2px 0;">${timestamp}: ${message}</div>`;
                        
                        // Show data if provided
                        if (data && typeof data === 'object') {
                            debugDiv.innerHTML += `<div style="color:#888888;margin-left:20px;font-size:11px;">${JSON.stringify(data)}</div>`;
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

debugLog("Mobile device detected: " + isMobileDevice);
debugLog("User agent: " + navigator.userAgent);

var springyILS = {
    // DUPLICATE PREVENTION: Track processed items to prevent duplicate buttons
    processedItems: new Set(),
    
    createItemKey: function(call, location, collection) {
        return (call + '|' + location + '|' + collection).toLowerCase();
    },
    
    isGloballyProcessed: function(call, location, collection) {
        var key = this.createItemKey(call, location, collection);
        return this.processedItems.has(key);
    },
    
    markAsProcessed: function(call, location, collection) {
        var key = this.createItemKey(call, location, collection);
        this.processedItems.add(key);
        debugLog("Marked as processed: " + key);
    },
    
    isDuplicateItem: function(potentialItem, existingItems) {
        for (var i = 0; i < existingItems.length; i++) {
            var existing = existingItems[i];
            if (existing.call === potentialItem.call && 
                existing.location === potentialItem.location && 
                existing.collection === potentialItem.collection) {
                return true;
            }
        }
        return false;
    },

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
        debugLog("📋 STARTING: Detail row scraping");
        debugLog("📱 MOBILE CHECK: isMobileDevice = " + isMobileDevice);
        debugLog("🌐 USER AGENT: " + navigator.userAgent);
        debugLog("📏 VIEWPORT: " + window.innerWidth + "x" + window.innerHeight);
        
        // MOBILE-FIRST APPROACH: If on mobile, try direct call number detection first
        if (isMobileDevice) {
            debugLog("📱 MOBILE: Device detected - trying mobile-specific scraping first");
            debugLog("📱 MOBILE: Current items array length before mobile scraping: " + items.length);
            
            items = this.scrapeMobileCallNumbers(items);
            
            debugLog("📱 MOBILE: Items array length after mobile scraping: " + items.length);
            
            // If mobile scraping found items, use those and skip row-based scraping to prevent duplicates
            if (items.length > 0) {
                debugLog("✅ MOBILE: Mobile scraping found " + items.length + " items - skipping row-based scraping to prevent duplicates");
                return items;
            } else {
                debugLog("⚠️ MOBILE: No items found via mobile scraping, falling back to desktop method");
            }
        } else {
            debugLog("💻 DESKTOP: Not a mobile device, using desktop scraping only");
        }
        
        // DESKTOP/FALLBACK: Traditional row-based scraping
        var selectors = [
            ".detailItemsTableRow:not(.libmaps-proc)",
            "tbody .detailItemsTableRow:not(.libmaps-proc)",
            ".detailItemsTable tr:not(.libmaps-proc)", // Additional mobile selector
            "[class*='detailItems'] tr:not(.libmaps-proc)" // Wildcard selector
        ];
        
        debugLog("Trying " + selectors.length + " row selectors");
        
        var rows = null;
        for (var i = 0; i < selectors.length && !rows; i++) {
            debugLog("Testing selector: " + selectors[i]);
            rows = document.querySelectorAll(selectors[i]);
            if (rows.length > 0) {
                debugLog("Found " + rows.length + " rows using selector: " + selectors[i]);
                break;
            }
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
                
                // Check if this item is already processed globally to prevent duplicates
                if (springyILS.isGloballyProcessed(call, location, collection)) {
                    console.log(`  ✗ Row ${i + 1} already processed globally, skipping`);
                    continue;
                }
                
                if (callValid && locationValid && collectionValid) {
                    // Create potential item
                    var potentialItem = {
                        element: row,
                        buttonElement: callElement,
                        location: location,
                        call: call,
                        title: titleText,
                        collection: collection
                    };
                    
                    // Check for duplicates within current batch
                    if (springyILS.isDuplicateItem(potentialItem, items)) {
                        console.log(`  ✗ Row ${i + 1} is duplicate within current batch, skipping`);
                        continue;
                    }
                    
                    items.push(potentialItem);
                    springyILS.markAsProcessed(call, location, collection);
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

    // MOBILE-SPECIFIC: Direct call number detection for mobile devices
    scrapeMobileCallNumbers: function(items) {
        debugLog("🔍 MOBILE: Starting mobile-specific call number detection");
        
        // Find call number elements directly (mobile DOM structure is different)
        var callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER:not(.libmaps-processed)');
        debugLog("🔍 MOBILE: Found " + callElements.length + " unprocessed call elements for mobile");
        
        // Debug: Show all call elements found
        if (callElements.length === 0) {
            debugLog("❌ MOBILE: No call elements found! Testing alternative selectors...");
            
            // Test alternative selectors
            var altSelectors = [
                '.detailItemsTable_CALLNUMBER',
                '.CALLNUMBER',
                '[class*="CALLNUMBER"]',
                '[class*="callnumber"]',
                '.call-number',
                '.callNumber'
            ];
            
            altSelectors.forEach(function(selector) {
                var altElements = document.querySelectorAll(selector);
                debugLog("🔍 MOBILE: Selector '" + selector + "' found " + altElements.length + " elements");
                if (altElements.length > 0) {
                    for (var k = 0; k < Math.min(3, altElements.length); k++) {
                        debugLog("📋 MOBILE: Element " + k + " text: '" + altElements[k].textContent.trim() + "'");
                    }
                }
            });
        }
        
        for (var i = 0; i < callElements.length; i++) {
            var callElement = callElements[i];
            var callText = springyMap.extractText(callElement);
            
            if (!callText || callText.length === 0) {
                debugLog("❌ MOBILE: Skipping call element " + (i + 1) + " - no call text");
                continue;
            }
            
            // Filter out labels and non-call-number text
            var invalidCallTexts = [
                'Shelf Number',
                'Call Number', 
                'Location',
                'Collection',
                'Library',
                'Status',
                'Due Date'
            ];
            
            var isInvalidCall = invalidCallTexts.some(function(invalid) {
                return callText.toLowerCase().includes(invalid.toLowerCase());
            });
            
            if (isInvalidCall) {
                debugLog("❌ MOBILE: Skipping call element " + (i + 1) + " - detected as label: '" + callText + "'");
                continue;
            }
            
            // Additional validation: Real call numbers usually contain letters and numbers
            if (callText.length < 3 || !/[A-Za-z]/.test(callText) || !/[0-9]/.test(callText)) {
                debugLog("❌ MOBILE: Skipping call element " + (i + 1) + " - doesn't look like call number: '" + callText + "'");
                continue;
            }
            
            debugLog("✅ MOBILE: Processing valid call element " + (i + 1) + ": " + callText);
            
            // Mark DOM element as processed immediately to prevent duplicates
            callElement.classList.add('libmaps-processed');
            
            // Find container for this call element
            var container = callElement.closest('tr') || callElement.closest('div') || callElement.parentElement;
            
            if (!container) {
                debugLog("No container found for call element " + (i + 1));
                continue;
            }
            
            // Look for library and collection elements in the same container
            var libraryElement = container.querySelector('.detailItemsTable_LIBRARY') || 
                                container.querySelector('[class*="LIBRARY"]') ||
                                container.querySelector('[class*="library"]');
                                
            var collectionElement = container.querySelector('.detailItemsTable_SD_HZN_COLLECTION') ||
                                   container.querySelector('[class*="COLLECTION"]') ||
                                   container.querySelector('[class*="collection"]');
            
            // Extract data with defaults for mobile
            var location = 'David O. McKay Library'; // Default for mobile
            if (libraryElement) {
                var locationElement = libraryElement.querySelector(".asyncFieldLIBRARY:last-of-type") ||
                                     libraryElement.querySelector(".asyncFieldLIBRARY") ||
                                     libraryElement;
                location = springyMap.extractText(locationElement) || location;
            }
            
            var collection = 'General Books'; // Default for mobile
            if (collectionElement) {
                collection = springyMap.extractCollectionText(collectionElement) || collection;
            }
            
            var titleText = springyILS.getTitle() ? springyMap.extractText(springyILS.getTitle()) : document.title;
            
            debugLog("Mobile item " + (i + 1) + " extracted data:", {
                call: callText,
                location: location,
                collection: collection,
                title: titleText
            });
            
            // Validate
            var locationValid = springyMap.isValidLocation(location);
            var collectionValid = springyMap.isValidCollection(collection);
            var callValid = callText && callText.length > 0;
            
            debugLog("Mobile validation - Location: " + locationValid + ", Collection: " + collectionValid + ", Call: " + callValid);
            
            // Check if this item is already processed globally to prevent duplicates
            if (springyILS.isGloballyProcessed(callText, location, collection)) {
                debugLog("✗ Mobile item " + (i + 1) + " already processed globally, skipping");
                continue;
            }
            
            if (callValid && locationValid && collectionValid) {
                // Create potential item
                var potentialItem = {
                    element: container || callElement,
                    buttonElement: callElement,
                    location: location,
                    call: callText,
                    title: titleText,
                    collection: collection
                };
                
                // Check for duplicates within current batch
                if (springyILS.isDuplicateItem(potentialItem, items)) {
                    debugLog("✗ Mobile item " + (i + 1) + " is duplicate within current batch, skipping");
                    continue;
                }
                
                items.push(potentialItem);
                springyILS.markAsProcessed(callText, location, collection);
                debugLog("✓ Mobile item " + (i + 1) + " added to items");
            } else {
                debugLog("✗ Mobile item " + (i + 1) + " failed validation");
            }
        }
        
        debugLog("Mobile scraping complete - found " + items.length + " valid mobile items");
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
        console.log(`ENTERPRISE: Setting up buttons for ${items.length} items`);
        
        for (let i = 0; i < items.length; i++) {
            var item = items[i];
            
            if (item.call.length !== 0 && 
                springyMap.isValidLocation(item.location) && 
                springyMap.isValidCollection(item.collection)) {
                
                console.log(`ENTERPRISE: Creating button for item ${i + 1}`);
                
                var button = springyMap.createButton(item);
                var buttonDiv = document.createElement("div");
                buttonDiv.classList.add("springy-button-div");
                buttonDiv.insertAdjacentElement("afterbegin", button);
                
                springyILS.attachButton(item, buttonDiv);
            } else {
                console.log(`ENTERPRISE: Skipping item ${i + 1} - validation failed`);
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
        debugLog("Starting DOM watcher");
        
        var attempts = 0;
        var maxAttempts = isMobileDevice ? 60 : 30; // More attempts for mobile
        var interval = isMobileDevice ? 750 : 500; // Longer intervals for mobile
        
        debugLog("Watcher config - maxAttempts: " + maxAttempts + ", interval: " + interval);
        
        var watcher = setInterval(function() {
            attempts++;
            debugLog("Watch attempt " + attempts + "/" + maxAttempts);
            
            // Try multiple selectors to find target elements
            var targetElement = document.querySelector(".detailItemsTableRow") ||
                              document.querySelector("tbody .detailItemsTableRow") ||
                              document.querySelector(".detailItemsTable") ||
                              document.querySelector(".detailItems") ||
                              document.querySelector("[class*='detailItems']");
            
            if (targetElement) {
                debugLog("Target elements found, initializing scrape");
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
        debugLog("🚀 INIT: Initializing LibMaps");
        debugLog("📄 INIT: Document ready state: " + document.readyState);
        debugLog("📱 INIT: Mobile device: " + isMobileDevice);
        debugLog("🔗 INIT: Current URL: " + window.location.href);
        debugLog("📏 INIT: Viewport: " + window.innerWidth + "x" + window.innerHeight);
        
        // Quick DOM check
        var totalElements = document.querySelectorAll('*').length;
        var callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER').length;
        var libraryElements = document.querySelectorAll('.detailItemsTable_LIBRARY').length;
        
        debugLog("🔍 INIT: DOM elements - Total: " + totalElements + ", Call: " + callElements + ", Library: " + libraryElements);
        
        debugLog("🎨 INIT: Injecting styles");
        springyMap.injectStyles(document.head, springyMap.siteConfig.css);
        
        debugLog("⏰ INIT: Starting watcher");
        springyMap.watch();
        
        debugLog("✅ INIT: Integration initialized successfully");
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
    
    // Initialize when DOM is ready
    domReady(initializeLibMaps);
})();