// sirsiDynix Enterprise - Springs Lib Maps Integration
// Step 4: Desktop Working + Mobile Timing + Enterprise Mobile HTML + Duplicate Prevention + Mobile Button Enhancements

(function() {
console.log("ENTERPRISE INTEGRATION: Initializing Springs Lib Maps...");

// Mobile detection
var isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);



var springyILS = {
    // STEP 4 ENHANCEMENT: Global processed items tracking
    processedItems: new Set(),
    
    createItemKey: function(call, location, collection) {
        return call+"|"+location+"|"+collection;
    },
    
    isGloballyProcessed: function(call, location, collection) {
        // STEP 4.2: Check by call number only for simpler deduplication
        return springyILS.processedItems.has(call);
    },
    
    markAsProcessed: function(call, location, collection) {
        // STEP 4.2: Track by call number only
        springyILS.processedItems.add(call);
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
                    return elem;
                }
            }
        }
        
        // Final fallback: use document title (remove " - Library Name" suffix if present)
        var docTitle = document.title;
        if (docTitle) {
            // Clean up common title suffixes
            docTitle = docTitle.replace(/ - .*$/, '').trim();
            // Create a virtual element to return consistent interface
            var virtualTitle = {
                textContent: docTitle,
                innerText: docTitle
            };
            return virtualTitle;
        }
        
        return null;
    },
    
    // STEP 4 ENHANCEMENT: Duplicate prevention - now focuses on call number only
    isDuplicateItem: function(newItem, existingItems) {
        // Check if this call number already exists (regardless of location/collection)
        for (var i = 0; i < existingItems.length; i++) {
            var existing = existingItems[i];
            if (existing.call === newItem.call) {
                return true;
            }
        }
        return false;
    },
    
    // Enterprise Mobile HTML Structure Detection from Step 3
    scrapeMobileEnterpriseStructure: function(items) {
        
        // Look for Enterprise mobile pattern: .detailItemsTable_CALLNUMBER elements directly
        var allCallElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER:not(.libmaps-processed)');
        
        // STEP 4.4: Filter out label elements, keep only value elements
        var callElements = [];
        for (var j = 0; j < allCallElements.length; j++) {
            var element = allCallElements[j];
            var text = element.textContent.trim();
            
            // Skip labels like "Shelf Number", "Call Number", etc.
            if (text === "Shelf Number" || text === "Call Number" || 
                element.classList.contains('label') || 
                element.classList.contains('detailChildFieldLabel')) {
                continue;
            }
            
            // Keep actual call numbers (they should have alphanumeric patterns)
            if (text && text.length > 0) {
                callElements.push(element);
            }
        }
        
        
        
        if (callElements.length === 0) {
            return items;
        }
        
        for (var i = 0; i < callElements.length; i++) {
            var callElement = callElements[i];
            callElement.classList.add('libmaps-processed');
            
            var callText = callElement.textContent.trim();
            if (!callText) continue;
            
            // Find the container row/element for this call number
            var container = callElement.closest('tr') || callElement.closest('div') || callElement.parentElement;
            
            // Mobile uses DIV structure, need to look for collection info differently
            var libraryElement = null;
            var collectionElement = null;
            
            if (container) {
                // Try to find library and collection elements in the same container
                libraryElement = container.querySelector('.detailItemsTable_LIBRARY') || 
                                container.querySelector('[class*="LIBRARY"]') ||
                                container.querySelector('[class*="library"]');
                                
                collectionElement = container.querySelector('.detailItemsTable_SD_HZN_COLLECTION') ||
                                   container.querySelector('[class*="COLLECTION"]') ||
                                   container.querySelector('[class*="collection"]');
            }
            
            // Extract data
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
            } else {
            }
            
            var titleText = springyILS.getTitle() ? springyMap.extractText(springyILS.getTitle()) : document.title;
            
                // STEP 4.2 ENHANCEMENT: Check if call number already processed
                if (springyILS.isGloballyProcessed(callText, location, collection)) {
                    continue;
                }            // Create potential item
            var potentialItem = {
                element: container || callElement,
                buttonElement: callElement,
                location: location,
                call: callText,
                title: titleText,
                collection: collection
            };
            
            // Check if this is a duplicate within current items
            if (springyILS.isDuplicateItem(potentialItem, items)) {
                continue;
            }
            
            
            
            // Validate
            var locationValid = springyMap.isValidLocation(location);
            var collectionValid = springyMap.isValidCollection(collection);
            var callValid = callText && callText.length > 0;
            
            if (callValid && locationValid && collectionValid) {
                items.push(potentialItem);
                springyILS.markAsProcessed(callText, location, collection);
            } else {
            }
        }
        
        return items;
    },
    
    scrapeDetailRows: function(items) {
        
        // STEP 4 ENHANCEMENT: Try Enterprise mobile structure FIRST on mobile
        if (isMobileDevice) {
            items = springyILS.scrapeMobileEnterpriseStructure(items);
        }
        
        // Traditional row detection (for desktop or mobile fallback)
        var selectors = [
            ".detailItemsTableRow:not(.libmaps-proc)",
            "tbody .detailItemsTableRow:not(.libmaps-proc)",
            ".detailItemsTable tr:not(.libmaps-proc)"
        ];
        
        // Add mobile-specific selectors from Step 2
        if (isMobileDevice) {
            selectors.push(
                "[class*='detailItems'] tr:not(.libmaps-proc)", // Wildcard selector
                ".detailItemsTable_CALLNUMBER:not(.libmaps-proc)", // Direct call number elements  
                "[class*='detailItemsTable_CALLNUMBER']:not(.libmaps-proc)" // Wildcard call number
            );
        }
        
        var rows = null;
        for (var i = 0; i < selectors.length && !rows; i++) {
            rows = document.querySelectorAll(selectors[i]);
            if (rows.length > 0) {
                break;
            }
        }
        
        if (!rows || rows.length === 0) {
            return items;
        }
        
        
        
        for (let i = 0; i < rows.length; i++) {
            
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
                
                // STEP 4.2 ENHANCEMENT: Check if call number already processed
                if (springyILS.isGloballyProcessed(call, location, collection)) {
                    console.log(`  ✗ Row ${i + 1} call number already processed: ${call}`);
                    continue;
                }
                
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
                
                // Validate before adding
                var locationValid = springyMap.isValidLocation(location);
                var collectionValid = springyMap.isValidCollection(collection);
                var callValid = call && call.length > 0;
                
                if (callValid && locationValid && collectionValid) {
                    items.push(potentialItem);
                    springyILS.markAsProcessed(call, location, collection);
                } else {
                }
            } else {
            }
        }
        
        return items;
    },

    scrapeDomGeneric: function() {
        var items = [];
        var elements = document.querySelectorAll(".libmaps-button:not(.libmaps-proc), .libmap-button:not(.libmaps-proc)");
        
        for (let i = 0; i < elements.length; i++) {
            var element = elements[i];
            element.classList.add("libmaps-proc");
            
            var callNumber = element.dataset.callnumber || "";
            var location = element.dataset.location || "";
            
            if (callNumber.length !== 0 && 
                location.length !== 0) {
                
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
        console.log("ENTERPRISE: Starting scrape process...");
        
        var items = springyMap.siteConfig.isGenericScrapeWanted ? 
                   springyMap.scrapeDomGeneric() : 
                   springyILS.scrapeDom();
        
        springyMap.setupButtons(items);
        console.log("ENTERPRISE: Scrape completed");
        
        return items;
    },

    // Mobile-Aware DOM Timing from Step 2
    watch: function() {
        debugLog("Starting DOM watcher");
        
        var attempts = 0;
        // Mobile-specific timing parameters from Step 2
        var maxAttempts = isMobileDevice ? 60 : 30;  // More attempts for mobile
        var interval = isMobileDevice ? 750 : 500;   // Longer intervals for mobile
        
        debugLog("Watcher config - maxAttempts: " + maxAttempts + ", interval: " + interval + "ms");
        
        var watcher = setInterval(function() {
            attempts++;
            debugLog("Watch attempt " + attempts + "/" + maxAttempts);
            
            // Enhanced mobile selector strategy from Step 2
            var targetElement = document.querySelector(".detailItemsTableRow") ||
                              document.querySelector("tbody .detailItemsTableRow") ||
                              document.querySelector(".detailItemsTable");
            
            // Additional mobile fallback selectors from Step 2
            if (!targetElement && isMobileDevice) {
                debugLog("Trying mobile fallback selectors...");
                targetElement = document.querySelector(".detailItems") ||
                              document.querySelector("[class*='detailItems']") ||
                              document.querySelector(".detailItemsTable_CALLNUMBER") ||
                              document.querySelector("[class*='detailItemsTable_CALLNUMBER']");
            }
            
            if (targetElement) {
                debugLog("Target elements found, initializing scrape");
                clearInterval(watcher);
                
                // Longer render delay for mobile from Step 2
                var renderDelay = isMobileDevice ? 1500 : 750;
                debugLog("Using render delay: " + renderDelay + "ms");
                
                setTimeout(function() {
                    springyMap.scrape();
                }, renderDelay);
                
            } else if (attempts >= maxAttempts) {
                debugLog("Watch timeout - target elements not found after " + maxAttempts + " attempts");
                clearInterval(watcher);
                
                // Longer fallback delay for mobile from Step 2
                var fallbackDelay = isMobileDevice ? 2000 : 1000;
                setTimeout(function() {
                    debugLog("Attempting generic scrape as fallback");
                    springyMap.siteConfig.isGenericScrapeWanted = true;
                    springyMap.scrape();
                }, fallbackDelay);
            }
        }, interval);
    }
};

// Configuration and initialization
    console.log("ENTERPRISE: Configuring Springs Lib Maps integration...");
    
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
            'Map': true,
            'MCF- Microfilm': true,
            'MSS-Manuscripts': true,
            'Oversize Books': true,
            'Oversize Juvenile': true,
            'Popular Books': true,
            'Reserve Collection': true,
            'Sheet Music': true,
            'SP+ Special Collections Oversized': true,
            'SPC- Campus Authors': true,
            'SPC- Caxton Press': true,
            'SPC- Church History': true,
            'SPC- Education Collection': true,
            'SPC- Greater Yellowstone': true,
            'SPC- Hinckley Music Collection': true,
            'SPC- Historical Literature and Reference': true,
            'SPC- Music': true,
            'SPC- Printing Reference': true,
            'SPC- Scriptures': true,
            'SPC- Upper Snake River Valley': true,
            'SPC- Vardis Fisher': true,
            'Special Collections': true,
            'Teacher Learning Center': true,
            'Technical Services': true,
            'UA- PUB- University Archives- Campus Publications': true,
            'UA- SPE- University Archives- Campus Speeches': true
        },
        
        button: {
            label: 'Map It',
            icon: '<svg class="springy-icon" viewBox="796 796 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M970.135,870.134C970.135,829.191,936.943,796,896,796c-40.944,0-74.135,33.191-74.135,74.134 c0,16.217,5.221,31.206,14.055,43.41l-0.019,0.003L896,996l60.099-82.453l-0.019-0.003 C964.912,901.34,970.135,886.351,970.135,870.134z M896,900.006c-16.497,0-29.871-13.374-29.871-29.872s13.374-29.871,29.871-29.871 s29.871,13.373,29.871,29.871S912.497,900.006,896,900.006z"/></svg>',
            border: '6px'
        },
        
        isModalWanted: 1,
        isGenericScrapeWanted: 0,
        
        getModalHtml: function(item, url) {
            // Escape HTML to prevent XSS attacks
            var escapeHtml = function(text) {
                var div = document.createElement('div');
                div.textContent = text || '';
                return div.innerHTML;
            };
            
            var escapedLocation = escapeHtml(item.location);
            var escapedZone = escapeHtml(item.zone || '');
            var escapedCall = escapeHtml(item.call);
            var escapedTitle = escapeHtml(item.title);
            var escapedUrl = encodeURI(url || '');
            
            return `<div class="springy-underlay"><div class="springy-modal" data-location="${escapedLocation}" data-zone="${escapedZone}" data-call="${escapedCall}" tabindex="0"><div class="springy-header"><h1>${escapedTitle}</h1><div class="springy-header-buttons"><button class="springy-print" aria-label="Print Map"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64-208l0 144-448 0 0-144 448 0z"/></svg></button><button class="springy-close" aria-label="Close Map">×</button></div></div><div class="springy-body"><iframe src="${escapedUrl}" title="LibMaps for ${escapedTitle}"></iframe></div></div></div>`;
        },
        
        css: '.springy-button-div { display: inline-block; } .springy-button { text-indent: 0; cursor: pointer; position: relative; padding: 6px 12px 6px 6px; box-sizing: border-box; border-width: 0; border-radius: 6px; color: #FFFFFF; background-color: #337AB7; display: inline-block; white-space: nowrap; line-height: 16px; } a.springy-button { color: #FFFFFF; text-decoration: none; } .springy-button:hover { color: #FFFFFF; background-color: #286090; } a.springy-button:hover { color: #FFFFFF; background-color: #286090; } .springy-button:focus { color: #FFFFFF; background-color: #286090; opacity: 80%; box-shadow: none; } a.springy-button:focus { color: #FFFFFF; background-color: #286090; opacity: 80%; box-shadow: none; } .springy-icon { width: 16px; height: 16px; fill: currentColor; margin-right: 6px; } .springy-underlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 99999; display: none; } .springy-underlay-active { display: flex; align-items: center; justify-content: center; padding: 10px; } .springy-modal { background: #fff; border-radius: 6px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.3); max-width: 95vw; max-height: 95vh; width: 800px; height: 600px; display: flex; flex-direction: column; position: relative; } .springy-modal-active { display: flex; } .springy-header { padding: 10px 15px; border-bottom: 1px solid #e5e5e5; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; } .springy-header h1 { font-size: 18px; margin: 0; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .springy-header-buttons { display: flex; gap: 8px; flex-shrink: 0; } .springy-print, .springy-close { padding: 6px 10px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; min-height: 32px; } .springy-print { background: #007cba; color: white; } .springy-close { background: #6c757d; color: white; } .springy-body { flex: 1; padding: 0; overflow: hidden; } .springy-body iframe { width: 100%; height: 100%; border: none; }'
    };
    
    console.log("ENTERPRISE: Injecting styles...");
    springyMap.injectStyles(document.head, springyMap.siteConfig.css);
    
    console.log("ENTERPRISE: Starting watcher...");
    springyMap.watch();
    
    console.log("ENTERPRISE: Integration initialized successfully");
})();
