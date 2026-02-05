// sirsiDynix Enterprise - Springs Lib Maps Integration
// TEST VERSION - Full debugging enabled
// Date: 2026-02-05
// Version: 2.4.0-test
// IIFE wrapper to prevent global variable conflicts with other scripts

(function() {
'use strict';

console.log("=== LIBMAPS v2.4.1-test ===");

// Mobile detection and debugging setup
var isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var debugMode = true; // ENABLED for testing

// Debug overlay for testing
function createTestOverlay() {
    var mobileFlag = isMobileDevice ? '📱' : '🖥️';
    var debugDiv = document.createElement('div');
    debugDiv.id = 'libmaps-test-debug';
    debugDiv.style.cssText = 'position:fixed;top:5px;right:5px;background:rgba(0,80,0,0.95);color:#00ff00;padding:8px;font-family:monospace;font-size:9px;z-index:999999;border:2px solid #00ff00;max-height:100px;max-width:280px;overflow-y:auto;border-radius:4px;';
    debugDiv.innerHTML = '<strong style="color:#ffff00;">🗺️ v2.4.3 ' + mobileFlag + '</strong>';
    
    // Close button
    var closeBtn = document.createElement('span');
    closeBtn.innerHTML = ' ❌';
    closeBtn.style.cssText = 'position:absolute;top:2px;right:4px;cursor:pointer;color:#fff;font-size:10px;';
    closeBtn.onclick = function() { debugDiv.style.display = 'none'; };
    debugDiv.querySelector('strong').appendChild(closeBtn);
    
    document.body.appendChild(debugDiv);
    return debugDiv;
}

function debugLog(message, data) {
    if (debugMode) {
        console.log("LIBMAPS DEBUG: " + message, data || "");
        
        // Show on debug overlay
        setTimeout(function() {
            try {
                var debugDiv = document.getElementById('libmaps-test-debug');
                if (!debugDiv && document.body) {
                    debugDiv = createTestOverlay();
                }
                if (debugDiv) {
                    var timestamp = new Date().toLocaleTimeString();
                    var color = message.includes('✅') ? '#00ff00' :
                               message.includes('❌') || message.includes('ERROR') ? '#ff4444' :
                               message.includes('MOBILE') ? '#00ffff' : 
                               message.includes('⚠️') ? '#ffff00' : '#ffffff';
                    debugDiv.innerHTML += '<div style="color:' + color + ';margin:2px 0;font-size:10px;">' + timestamp + ': ' + message + '</div>';
                    
                    if (data && typeof data === 'object') {
                        debugDiv.innerHTML += '<div style="color:#888888;margin-left:10px;font-size:9px;">' + JSON.stringify(data, null, 2) + '</div>';
                    }
                    
                    debugDiv.scrollTop = debugDiv.scrollHeight;
                }
            } catch (e) {
                console.error('Debug overlay error:', e);
            }
        }, 50);
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
                var titleText = title.textContent.trim();
                debugLog("Found title using selector: " + titleSelectors[i]);
                return title;
            }
        }
        
        var alternativeSelectors = [
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
                    debugLog("Found title using alternative selector: " + alternativeSelectors[k]);
                    return elem;
                }
            }
        }
        
        var docTitle = document.title;
        if (docTitle) {
            docTitle = docTitle.replace(/ - .*$/, '').trim();
            debugLog("Using document title as fallback: " + docTitle);
            return { textContent: docTitle, innerText: docTitle };
        }
        
        debugLog("⚠️ No title found at all");
        return null;
    },
    
    scrapeDetailRows: function(items) {
        debugLog("📋 STARTING: Detail row scraping");
        debugLog("📱 MOBILE CHECK: isMobileDevice = " + isMobileDevice);
        
        if (isMobileDevice) {
            debugLog("📱 MOBILE: Trying mobile-specific scraping first");
            items = this.scrapeMobileCallNumbers(items);
            
            if (items.length > 0) {
                debugLog("✅ MOBILE: Found " + items.length + " items");
                return items;
            }
            debugLog("⚠️ MOBILE: No items found, falling back to desktop method");
        }
        
        var selectors = [
            ".detailItemsTableRow:not(.libmaps-proc)",
            "tbody .detailItemsTableRow:not(.libmaps-proc)",
            ".detailItemsTable tr:not(.libmaps-proc)",
            "[class*='detailItems'] tr:not(.libmaps-proc)"
        ];
        
        var rows = null;
        for (var i = 0; i < selectors.length && !rows; i++) {
            rows = document.querySelectorAll(selectors[i]);
            if (rows.length > 0) {
                debugLog("Found " + rows.length + " rows using selector: " + selectors[i]);
                break;
            }
        }
        
        if (!rows || rows.length === 0) {
            debugLog("⚠️ No detail rows found");
            return items;
        }
        
        for (var i = 0; i < rows.length; i++) {
            debugLog("Processing row " + (i + 1) + " of " + rows.length);
            
            var row = rows[i];
            var title = springyILS.getTitle(row);
            var callElement = row.querySelector(".detailItemsTable_CALLNUMBER");
            var libraryElement = row.querySelector(".detailItemsTable_LIBRARY");
            var collectionElement = row.querySelector(".detailItemsTable_SD_HZN_COLLECTION");
            var itypeElement = row.querySelector(".detailItemsTable_ITYPE");
            
            if (callElement && libraryElement) {
                row.classList.add("libmaps-proc");
                
                var locationElement = libraryElement.querySelector(".asyncFieldLIBRARY:last-of-type") ||
                                     libraryElement.querySelector(".asyncFieldLIBRARY") ||
                                     libraryElement;
                
                var location = springyMap.extractText(locationElement);
                var call = springyMap.extractText(callElement);
                var titleText = springyMap.extractText(title);
                
                // PRIMARY SOURCE: Use ITYPE (Material Type) column for collection
                var collection = '';
                
                if (itypeElement) {
                    var itypeText = springyMap.extractText(itypeElement);
                    debugLog("🎯 PRIMARY: Checking ITYPE column: '" + itypeText + "'");
                    
                    if (itypeText && springyMap.isValidCollection(itypeText)) {
                        collection = itypeText;
                        debugLog("✅ Using ITYPE as collection: '" + collection + "'");
                    }
                }
                
                // FALLBACK: Only check SD_HZN_COLLECTION if ITYPE didn't work
                if (!collection || collection === '') {
                    debugLog("⚠️ ITYPE not valid, falling back to SD_HZN_COLLECTION...");
                    collection = springyMap.extractCollectionText(collectionElement);
                }
                
                debugLog("📊 ROW " + (i + 1) + " FINAL EXTRACTION:", {
                    location: location,
                    call: call,
                    collection: collection,
                    source: itypeElement && springyMap.isValidCollection(springyMap.extractText(itypeElement)) ? 'ITYPE' : 'SD_HZN_COLLECTION'
                });
                
                debugLog("Row " + (i + 1) + " extracted data:", {
                    location: location,
                    call: call,
                    collection: collection,
                    title: titleText ? titleText.substring(0, 50) : ''
                });
                
                var locationValid = springyMap.isValidLocation(location);
                var collectionValid = springyMap.isValidCollection(collection);
                var callValid = call && call.length > 0;
                
                debugLog("Validation - Location: " + locationValid + ", Collection: " + collectionValid + ", Call: " + callValid);
                
                if (springyILS.isGloballyProcessed(call, location, collection)) {
                    debugLog("Row " + (i + 1) + " already processed globally, skipping");
                    continue;
                }
                
                if (callValid && locationValid && collectionValid) {
                    var potentialItem = {
                        element: row,
                        buttonElement: callElement,
                        location: location,
                        call: call,
                        title: titleText,
                        collection: collection
                    };
                    
                    if (springyILS.isDuplicateItem(potentialItem, items)) {
                        debugLog("Row " + (i + 1) + " is duplicate, skipping");
                        continue;
                    }
                    
                    items.push(potentialItem);
                    springyILS.markAsProcessed(call, location, collection);
                    debugLog("✅ Row " + (i + 1) + " added to items");
                } else {
                    debugLog("❌ Row " + (i + 1) + " failed validation");
                }
            } else {
                debugLog("❌ Row " + (i + 1) + " missing required elements");
            }
        }
        
        debugLog("Scraped " + items.length + " valid items");
        return items;
    },

    scrapeMobileCallNumbers: function(items) {
        debugLog("🔍 MOBILE: Starting mobile scrape v2.4.1");
        
        // Debug: Show what's actually in the DOM - find ANY availability content
        var detailItemsList = document.querySelector('.detailItemsList');
        var detailItemsTable = document.querySelector('.detailItemsTable');
        var listItems = document.querySelectorAll('.detailItemsListItem');
        var tableRows = document.querySelectorAll('.detailItemsTableRow');
        
        debugLog("📱 DOM: list=" + !!detailItemsList + " table=" + !!detailItemsTable);
        debugLog("📱 DOM: listItems=" + listItems.length + " tableRows=" + tableRows.length);
        
        // Try to find ANY element with 'detail' or 'availability' in class
        var allElements = document.querySelectorAll('[class*="detail"], [class*="avail"], [class*="item"]');
        debugLog("📱 Elements with detail/avail/item: " + allElements.length);
        
        // Show first few class names to understand structure
        var classNames = [];
        for (var i = 0; i < Math.min(allElements.length, 5); i++) {
            classNames.push(allElements[i].className.substring(0, 40));
        }
        debugLog("📱 Classes: " + classNames.join(' | '));
        
        // Try mobile list structure first
        if (listItems.length > 0) {
            debugLog("📱 Using detailItemsListItem structure");
            for (var j = 0; j < listItems.length; j++) {
                var listItem = listItems[j];
                var spans = listItem.querySelectorAll('span');
                var callNumber = '';
                var library = '';
                var itypeValue = '';
                var sdHznValue = '';
                
                spans.forEach(function(span) {
                    var className = span.className || '';
                    var text = span.textContent.trim();
                    
                    if (className.indexOf('CALLNUMBER') !== -1) {
                        callNumber = text;
                    }
                    if (className.indexOf('LIBRARY') !== -1 && className.indexOf('asyncField') !== -1) {
                        library = text;
                    }
                    if (className.indexOf('ITYPE') !== -1) {
                        itypeValue = text;
                    }
                    if (className.indexOf('SD_HZN_COLLECTION') !== -1) {
                        sdHznValue = text;
                    }
                });
                
                // Get library from async field if not found
                if (!library) {
                    var libEl = listItem.querySelector('.asyncFieldLIBRARY');
                    if (libEl) library = libEl.textContent.trim();
                }
                
                debugLog("📱 Item " + (j+1) + ": call='" + callNumber + "' lib='" + library + "' itype='" + itypeValue + "'");
                
                // Use ITYPE first, then SD_HZN_COLLECTION
                var collection = '';
                if (itypeValue && itypeValue !== '' && itypeValue !== '-' && itypeValue !== 'Searching...') {
                    collection = itypeValue;
                } else if (sdHznValue && sdHznValue !== '' && sdHznValue !== '-' && sdHznValue !== 'Searching...' && sdHznValue !== 'Unknown') {
                    collection = sdHznValue;
                }
                
                if (callNumber && library && callNumber.length > 2) {
                    var isValidLoc = springyMap.isValidLocation(library);
                    var isValidColl = springyMap.isValidCollection(collection);
                    debugLog("📱 Validation: loc=" + isValidLoc + " coll=" + isValidColl + " ('" + collection + "')");
                    
                    if (isValidLoc && isValidColl) {
                        var itemKey = (callNumber + '|' + library + '|' + collection).toLowerCase();
                        if (!springyILS.processedItems.has(itemKey)) {
                            springyILS.processedItems.add(itemKey);
                            items.push({
                                element: listItem,
                                buttonElement: listItem,
                                location: library,
                                call: callNumber,
                                title: document.title,
                                collection: collection
                            });
                            debugLog("✅ MOBILE: Added item: " + callNumber);
                        }
                    }
                }
            }
            return items;
        }
        
        var callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER:not(.libmaps-processed)');
        debugLog("🔍 MOBILE: Found " + callElements.length + " unprocessed call elements");
        
        if (callElements.length === 0) {
            var altSelectors = [
                '.detailItemsTable_CALLNUMBER',
                '.CALLNUMBER',
                '[class*="CALLNUMBER"]'
            ];
            
            altSelectors.forEach(function(selector) {
                var altElements = document.querySelectorAll(selector);
                debugLog("Alt selector '" + selector + "' found " + altElements.length + " elements");
            });
        }
        
        for (var i = 0; i < callElements.length; i++) {
            var callElement = callElements[i];
            var callText = springyMap.extractText(callElement);
            
            if (!callText || callText.length === 0) continue;
            
            var invalidCallTexts = ['Shelf Number', 'Call Number', 'Location', 'Collection', 'Library', 'Status', 'Due Date'];
            
            var isInvalidCall = invalidCallTexts.some(function(invalid) {
                return callText.toLowerCase().includes(invalid.toLowerCase());
            });
            
            if (isInvalidCall) continue;
            
            if (callText.length < 3 || !/[A-Za-z]/.test(callText) || !/[0-9]/.test(callText)) continue;
            
            debugLog("✅ MOBILE: Processing valid call element: " + callText);
            callElement.classList.add('libmaps-processed');
            
            var container = callElement.closest('tr') || callElement.closest('div') || callElement.parentElement;
            
            if (!container) continue;
            
            var libraryElement = container.querySelector('.detailItemsTable_LIBRARY') || 
                                container.querySelector('[class*="LIBRARY"]');
                                
            var collectionElement = container.querySelector('.detailItemsTable_SD_HZN_COLLECTION') ||
                                   container.querySelector('[class*="COLLECTION"]');
            
            var itypeElement = container.querySelector('.detailItemsTable_ITYPE');
            
            var location = 'David O. McKay Library';
            if (libraryElement) {
                var locationElement = libraryElement.querySelector(".asyncFieldLIBRARY:last-of-type") ||
                                     libraryElement.querySelector(".asyncFieldLIBRARY") ||
                                     libraryElement;
                location = springyMap.extractText(locationElement) || location;
            }
            
            // PRIMARY SOURCE: Use ITYPE (Material Type) for collection
            var collection = '';
            
            if (itypeElement) {
                var itypeText = springyMap.extractText(itypeElement);
                debugLog("🎯 MOBILE PRIMARY: Checking ITYPE: '" + itypeText + "'");
                
                if (itypeText && springyMap.isValidCollection(itypeText)) {
                    collection = itypeText;
                    debugLog("✅ MOBILE: Using ITYPE as collection: '" + collection + "'");
                }
            }
            
            // FALLBACK: Only check SD_HZN_COLLECTION if ITYPE didn't work
            if (!collection || collection === '') {
                debugLog("⚠️ MOBILE: ITYPE not valid, falling back to SD_HZN_COLLECTION...");
                if (collectionElement) {
                    collection = springyMap.extractCollectionText(collectionElement);
                }
                
                // Last resort default
                if (!collection || !springyMap.isValidCollection(collection)) {
                    collection = 'General Books';
                    debugLog("⚠️ MOBILE: Using default collection: 'General Books'");
                }
            }
            
            var titleText = springyILS.getTitle() ? springyMap.extractText(springyILS.getTitle()) : document.title;
            
            debugLog("Mobile item extracted:", {
                call: callText,
                location: location,
                collection: collection
            });
            
            var locationValid = springyMap.isValidLocation(location);
            var collectionValid = springyMap.isValidCollection(collection);
            var callValid = callText && callText.length > 0;
            
            if (springyILS.isGloballyProcessed(callText, location, collection)) continue;
            
            if (callValid && locationValid && collectionValid) {
                var potentialItem = {
                    element: container || callElement,
                    buttonElement: callElement,
                    location: location,
                    call: callText,
                    title: titleText,
                    collection: collection
                };
                
                if (springyILS.isDuplicateItem(potentialItem, items)) continue;
                
                items.push(potentialItem);
                springyILS.markAsProcessed(callText, location, collection);
                debugLog("✅ Mobile item added");
            }
        }
        
        debugLog("Mobile scraping complete - found " + items.length + " items");
        return items;
    },
    
    scrapeDom: function() {
        return springyILS.scrapeDetailRows([]);
    },
    
    attachButton: function(item, buttonDiv) {
        debugLog("Attaching button to: " + item.call);
        (item.buttonElement || item.element).appendChild(buttonDiv);
    },
    
    setupListeners: function() {}
};

var springyMap = {
    callbackId: 1,
    siteConfig: {},
    
    cleanText: function(text) {
        if (!text) return "";
        
        var cleaned = text.trim()
            .replace(/<script[^>]*>.*?<\/script>/gi, "")
            .replace(/<[^>]*>/g, "")
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .replace(/Searching\.\.\./g, "")
            .replace(/Unknown$/i, "")
            .replace(/^\s+|\s+$/g, "");
        
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
        
        return springyMap.cleanText(text);
    },
    
    extractCollectionText: function(element) {
        if (!element) {
            debugLog("❌ COLLECTION: No element provided");
            return "";
        }
        
        var rawText = "";
        
        debugLog("🔍 COLLECTION DEBUG: Examining element HTML:", element.innerHTML);
        
        // Look for ALL async fields and find the one with actual content
        var allAsyncFields = element.querySelectorAll('.asyncFieldSD_HZN_COLLECTION');
        debugLog("🔍 COLLECTION: Found " + allAsyncFields.length + " async field elements");
        
        for (var af = 0; af < allAsyncFields.length; af++) {
            var field = allAsyncFields[af];
            var fieldText = field.textContent.trim();
            var isHidden = field.classList.contains('hidden');
            var isInProgress = field.classList.contains('asyncInProgressSD_HZN_COLLECTION');
            
            debugLog("🔍 COLLECTION Field " + af + ": text='" + fieldText + "', hidden=" + isHidden + ", inProgress=" + isInProgress);
            
            // Skip "Searching..." and "Unknown" values
            if (fieldText === 'Searching...' || fieldText === 'Unknown' || fieldText === '') {
                continue;
            }
            
            // Skip hidden fields unless they have good data
            if (isHidden && (fieldText === 'Unknown' || fieldText === '')) {
                continue;
            }
            
            // Found a field with actual collection data
            if (fieldText && fieldText.length > 0) {
                rawText = fieldText;
                debugLog("✅ COLLECTION: Using async field " + af + " value: '" + rawText + "'");
                break;
            }
        }
        
        // If no valid async field found, check element's direct text
        if (!rawText) {
            var directText = element.textContent || element.innerText || "";
            directText = directText.replace(/Searching\.\.\./g, '').replace(/Unknown/g, '').trim();
            
            if (directText && directText.length > 0 && directText !== 'Collection') {
                rawText = directText;
                debugLog("🔍 COLLECTION: Using direct text: '" + rawText + "'");
            }
        }
        
        if (!rawText || rawText === 'Unknown' || rawText === '') {
            debugLog("⚠️ COLLECTION: No valid collection text found - returning empty for ITYPE fallback");
            return "";  // Return empty so ITYPE fallback triggers
        }
        
        debugLog("🔍 COLLECTION Raw text before cleaning: '" + rawText + "'");
        
        var cleaned = springyMap.cleanText(rawText);
        debugLog("🔍 COLLECTION Cleaned text: '" + cleaned + "'");
        
        var validCollections = Object.keys(springyMap.siteConfig.validCollectionNameMap);
        
        // Step 1: Exact match
        if (springyMap.siteConfig.validCollectionNameMap[cleaned]) {
            debugLog("✅ COLLECTION Exact match: '" + cleaned + "'");
            return cleaned;
        }
        
        // Step 2: Partial match from start of string
        for (var i = 0; i < validCollections.length; i++) {
            var validCollection = validCollections[i];
            if (cleaned.indexOf(validCollection) === 0) {
                debugLog("✅ COLLECTION Partial match: '" + validCollection + "' from '" + cleaned + "'");
                return validCollection;
            }
        }
        
        // Step 3: Case-insensitive match from start
        var lowerCleaned = cleaned.toLowerCase();
        for (var j = 0; j < validCollections.length; j++) {
            var validCollection = validCollections[j];
            if (lowerCleaned.indexOf(validCollection.toLowerCase()) === 0) {
                debugLog("✅ COLLECTION Case-insensitive match: '" + validCollection + "'");
                return validCollection;
            }
        }
        
        debugLog("⚠️ COLLECTION: No match found for: '" + cleaned + "' - returning as-is");
        return cleaned;
    },
    
    normalizeLocationForService: function(location) {
        var locationMap = {
            'David O. McKay Library': 'McKay Library',
            'David O McKay Library': 'McKay Library',
            'McKay Library': 'McKay Library'
        };
        
        var normalized = locationMap[location] || location;
        debugLog("Location normalized: '" + location + "' -> '" + normalized + "'");
        return normalized;
    },
    
    injectStyles: function(head, css) {
        var style = document.createElement("style");
        style.type = "text/css";
        style.innerText = css;
        head.insertBefore(style, head.firstChild);
        debugLog("Styles injected");
    },
    
    createModal: function(item, params) {
        var url = springyMap.siteConfig.domain + "/libmaps/catalog?" + params.toString();
        debugLog("🗺️ MODAL URL CREATED:", url);
        debugLog("🗺️ URL PARAMS:", {
            call: params.get('call'),
            location: params.get('location'),
            collection: params.get('collection'),
            title: params.get('title')
        });
        
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
            if (event.keyCode === 13) {
                event.stopPropagation();
                this.click();
            }
        };
    },
    
    createModalClickHandler: function(item, params) {
        return function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // LOG THE EXACT PARAMETERS BEING SENT
            debugLog("==============================================");
            debugLog("🗺️ MAP BUTTON CLICKED - PARAMETER DEBUG");
            debugLog("==============================================");
            debugLog("Call Number: " + params.get('call'));
            debugLog("Location: " + params.get('location'));
            debugLog("Collection: " + params.get('collection'));
            debugLog("Title: " + params.get('title'));
            debugLog("Full URL: " + springyMap.siteConfig.domain + "/libmaps/catalog?" + params.toString());
            debugLog("==============================================");
            
            if (!item.modal) {
                var modalDiv = springyMap.createModal(item, params);
                item.modal = document.body.appendChild(modalDiv);
                
                item.modal.querySelector(".springy-close").addEventListener("click", function() {
                    item.modal.querySelector(".springy-underlay").classList.remove("springy-underlay-active");
                    item.modal.querySelector(".springy-modal").classList.remove("springy-modal-active");
                });
                
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
        debugLog("Creating button for: " + item.call);
        debugLog("Button item data:", {
            call: item.call,
            location: item.location,
            collection: item.collection
        });
        
        var icon = springyMap.createIcon();
        var label = document.createTextNode(springyMap.siteConfig.button.label);
        var params = new URLSearchParams();
        
        params.set("call", item.call);
        params.set("location", springyMap.normalizeLocationForService(item.location));
        params.set("collection", item.collection || "");
        params.set("title", item.title || "");
        
        debugLog("🗺️ Button URL params set:", {
            call: params.get('call'),
            location: params.get('location'),
            collection: params.get('collection')
        });
        
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
        if (springyMap.siteConfig.isUsingFixedLocation) return true;
        if (!location || location.length === 0) return false;
        
        var normalizedLocation = location.trim();
        var isValid = springyMap.siteConfig.validLocationNameMap[normalizedLocation] === true;
        
        debugLog("Location validation - '" + normalizedLocation + "': " + isValid);
        
        if (!isValid) {
            debugLog("Available locations: " + Object.keys(springyMap.siteConfig.validLocationNameMap).join(', '));
        }
        
        return isValid;
    },
    
    isValidCollection: function(collection) {
        if (!springyMap.siteConfig.isValidCollectionRequired) return true;
        if (!collection || collection.length === 0) {
            debugLog("Collection validation failed - empty collection");
            return false;
        }
        
        var normalizedCollection = collection.trim();
        var isValid = springyMap.siteConfig.validCollectionNameMap[normalizedCollection] === true;
        
        debugLog("Collection validation - '" + normalizedCollection + "': " + isValid);
        
        if (!isValid) {
            debugLog("Available collections: " + Object.keys(springyMap.siteConfig.validCollectionNameMap).join(', '));
        }
        
        return isValid;
    },
    
    setupButtons: function(items) {
        debugLog("Setting up buttons for " + items.length + " items");
        
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            
            if (item.call.length !== 0 && 
                springyMap.isValidLocation(item.location) && 
                springyMap.isValidCollection(item.collection)) {
                
                debugLog("✅ Creating button for item " + (i + 1));
                
                var button = springyMap.createButton(item);
                var buttonDiv = document.createElement("div");
                buttonDiv.classList.add("springy-button-div");
                buttonDiv.insertAdjacentElement("afterbegin", button);
                
                springyILS.attachButton(item, buttonDiv);
            } else {
                debugLog("❌ Skipping item " + (i + 1) + " - validation failed");
            }
        }
    },
    
    scrapeDomGeneric: function() {
        var items = [];
        var elements = document.querySelectorAll(".libmaps-button:not(.libmaps-proc), .libmap-button:not(.libmaps-proc)");
        
        for (var i = 0; i < elements.length; i++) {
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
        debugLog("🚀 SCRAPE START - isMobile=" + isMobileDevice);
        debugLog("isGenericScrapeWanted=" + springyMap.siteConfig.isGenericScrapeWanted);
        
        var items = springyMap.siteConfig.isGenericScrapeWanted ? 
                   springyMap.scrapeDomGeneric() : 
                   springyILS.scrapeDom();
        
        debugLog("Found " + items.length + " items");
        
        springyMap.setupButtons(items);
        debugLog("✅ Done");
        
        return items;
    },
    
    watch: function() {
        debugLog("Starting watcher");
        
        var attempts = 0;
        var maxAttempts = isMobileDevice ? 60 : 30;
        var interval = isMobileDevice ? 750 : 500;
        
        var watcher = setInterval(function() {
            attempts++;
            debugLog("Watch attempt " + attempts + "/" + maxAttempts);
            
            var targetElement = document.querySelector(".detailItemsTableRow") ||
                              document.querySelector("tbody .detailItemsTableRow") ||
                              document.querySelector(".detailItemsTable") ||
                              document.querySelector(".detailItemsList") ||
                              document.querySelector(".detailItemsListItem") ||
                              document.querySelector(".asyncFieldSD_ITEM_STATUS");
            
            if (targetElement) {
                debugLog("✅ Target elements found");
                
                // CHECK: Are async fields still loading?
                var inProgressFields = document.querySelectorAll('.asyncInProgressSD_HZN_COLLECTION, .asyncInProgressLIBRARY, .asyncInProgressSD_ITEM_STATUS');
                var stillLoading = false;
                
                for (var i = 0; i < inProgressFields.length; i++) {
                    var field = inProgressFields[i];
                    // Check if the field is visible (not replaced by actual data)
                    if (!field.classList.contains('hidden') && field.textContent.includes('Searching')) {
                        stillLoading = true;
                        debugLog("⏳ Async fields still loading... waiting");
                        break;
                    }
                }
                
                if (stillLoading && attempts < maxAttempts) {
                    // Keep waiting for async to complete
                    return;
                }
                
                clearInterval(watcher);
                
                // Extra delay to ensure async fields have populated
                var renderDelay = isMobileDevice ? 2000 : 1000;
                debugLog("⏳ Waiting " + renderDelay + "ms for async fields to settle...");
                
                setTimeout(function() {
                    debugLog("🚀 Starting scrape after async wait");
                    springyMap.scrape();
                }, renderDelay);
                
            } else if (attempts >= maxAttempts) {
                debugLog("⚠️ Watch timeout");
                clearInterval(watcher);
                
                setTimeout(function() {
                    springyMap.siteConfig.isGenericScrapeWanted = true;
                    springyMap.scrape();
                }, isMobileDevice ? 2000 : 1000);
            }
        }, interval);
    }
};

// Configuration - COMPREHENSIVE COLLECTION MAP
debugLog("Configuring Springs Lib Maps integration - TEST VERSION");

springyMap.siteConfig = {
        domain: 'https://byui.libcal.com',
        iid: 4251,
        isUsingFixedLocation: 0,
        isValidCollectionRequired: 1,
        
        validLocationNameMap: {
            'David O. McKay Library': true,
            'McKay Library': true,
            'David O McKay Library': true
        },
        
        // COMPREHENSIVE collection mapping - matches both the production and source
        validCollectionNameMap: {
            // Standard collections
            'Audio Books': true,
            'CD': true,
            'CDs': true,
            'Double Oversize Books': true,
            'DVD': true,
            'DVDs': true,
            'General Books': true,
            'General Books - 1st Floor': true,
            'Juvenile Literature': true,
            'Juvenile Books': true,
            'LP Records - Special Collections': true,
            'Map': true,
            'Microfilm - Special Collections': true,
            'Manuscripts - Special Collections': true,
            'Oversize Books': true,
            'Oversize Juvenile': true,
            'Oversize Juvenile Books': true,
            'Popular Books': true,
            'Reserve Area': true,
            'Reserve Books': true,
            'Sheet Music': true,
            
            // Special Collections variations
            'SP+ Special Collections Oversized': true,
            'Special Coll.': true,
            'Special Coll.-Campus Authors': true,
            'Special Coll.-Caxton Press': true,
            'Special Coll.-Church History': true,
            'Special Coll.-Education Collection': true,
            'Special Coll.-Family History Books': true,
            'Special Coll.-Greater Yellowstone Ecosystem': true,
            'Special Coll.-Hinckley Music': true,
            'Special Coll.-Hinckley Music Collection': true,
            'Special Coll.-Historical Literature': true,
            'Special Coll.-Historical Literature and Reference': true,
            'Special Coll.-LP Records': true,
            'Special Coll.-Manuscripts': true,
            'Special Coll.-Maps': true,
            'Special Coll.-Microfilm': true,
            'Special Coll.-Music': true,
            'Special Coll.-Oversized': true,
            'Special Coll.-Printing Reference': true,
            'Special Coll.-Scriptures': true,
            'Special Coll.-Upper Snake River Valley History': true,
            'Special Coll.-Vardis Fisher': true,
            'Special Collections': true,
            
            // Other
            'Teacher Learning Center': true,
            'Technical Services': true,
            'Technical ServicesBooks': true,
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
            return '<div class="springy-underlay"><div class="springy-modal" data-location="' + item.location + '" data-zone="' + (item.zone || '') + '" data-call="' + item.call + '" tabindex="0"><div class="springy-header"><h1>' + item.title + '</h1><div class="springy-header-buttons"><button class="springy-print" aria-label="Print Map"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64 32l32 0c17.7 0 32-14.3 32-32l0-96c0-35.3-28.7-64-64-64L64 192c-35.3 0-64 28.7-64 64l0 96c0 17.7 14.3 32 32 32l32 0 0 64c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-64zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg></button><button class="springy-close" aria-label="Close" data-placement="bottom"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg></button></div></div><div class="springy-content"><iframe title="Map Image" src="' + url + '" style="position: relative; width: 100%; height: 100%; border: none;"></iframe></div></div></div>';
        },
        
        css: '.springy-button-div { display: inline-block; } .springy-button { text-indent: 0; cursor: pointer; position: relative; padding: 6px 12px 6px 6px; box-sizing: border-box; border-width: 0; border-radius: 6px; color: #FFFFFF; background-color: #337AB7; display: inline-block; white-space: nowrap; line-height: 16px; } a.springy-button { color: #FFFFFF; text-decoration: none; } .springy-button:hover { color: #FFFFFF; background-color: #286090; } a.springy-button:hover { color: #FFFFFF; background-color: #286090; } .springy-button:focus { color: #FFFFFF; background-color: #286090; opacity: 80%; box-shadow: none; } a.springy-button:focus { color: #FFFFFF; background-color: #286090; opacity: 80%; box-shadow: none; } .springy-icon { padding-right: 4px; background-repeat: no-repeat; display: inline-block; vertical-align: middle; fill: currentColor; height: 16px; width: 16px; min-height: 16px; min-width: 16px; } .springy-underlay { padding: 0; top: 0; left: 0; width: 100%; height: 100%; display: none; background-color: rgba(0, 0, 0, .5); flex-direction: column; align-items: center; } .springy-underlay-active { display: flex; position: fixed; z-index: 30000; } .springy-modal { font-family: Arial, Helvetica, Verdana; display: flex; flex-direction: column; overflow-y: auto; width: 80%; max-width: 1200px; height: 90vh; margin-top: 3vh; background-color: #fff; border-radius: 5px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5); opacity: 0; } .springy-modal-active { opacity: 1; } .springy-header { display: flex; justify-content: space-between; border-bottom: 1px solid #d6d6d6; margin-bottom: 10px; margin-top: 14px; } .springy-header h1 { margin: 0 0 12px 12px; font-size: 24px; max-width: 80%; padding: 0; } .springy-header-buttons { margin-right: 12px; height: 100%; } .springy-header-buttons button { vertical-align: middle; padding: 2px 14px; margin-left: 6px; height: unset; border: none; background: none; color: rgb(51, 51, 51); } .springy-header-buttons button:hover { background: rgba(0,0,0,.07); box-shadow: 0 0 1px 1px rgba(0,0,0,.14) } .springy-header-buttons svg { width: 16px; height: 16px; vertical-align: -0.125em; } .springy-content { display: flex; flex-grow: 1; } .springy-directions-email-form button, .springy-directions-email-result { margin-left: 10px; }'
    };
    
    function initializeLibMaps() {
        debugLog("🚀 INIT: Initializing LibMaps TEST VERSION");
        debugLog("📄 Document ready state: " + document.readyState);
        debugLog("📱 Mobile device: " + isMobileDevice);
        debugLog("🔗 Current URL: " + window.location.href);
        
        springyMap.injectStyles(document.head, springyMap.siteConfig.css);
        springyMap.watch();
        
        debugLog("✅ INIT: Test version initialized");
    }
    
    function domReady(callback) {
        if (document.readyState === 'loading') {
            var fired = false;
            
            document.addEventListener('DOMContentLoaded', function() {
                if (!fired) { fired = true; callback(); }
            });
            
            document.addEventListener('readystatechange', function() {
                if (!fired && (document.readyState === 'interactive' || document.readyState === 'complete')) {
                    fired = true; callback();
                }
            });
            
            window.addEventListener('load', function() {
                if (!fired) { fired = true; callback(); }
            });
            
            if (isMobileDevice) {
                setTimeout(function() {
                    if (!fired) { fired = true; callback(); }
                }, 3000);
            }
        } else {
            callback();
        }
    }
    
    domReady(initializeLibMaps);
})();
