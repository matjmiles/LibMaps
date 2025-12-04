// sirsiDynix Enterprise - Springs Lib Maps Integration
// Step 3: Desktop Working + Mobile Timing + Enterprise Mobile HTML Structure Detection

alert('🚀 LibMaps Step 3 Starting!');

console.log("ENTERPRISE INTEGRATION: Initializing Springs Lib Maps...");

// Mobile detection and debugging setup
var isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var debugMode = true; // Set to false in production

// Emergency debug system for mobile
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

alert('📱 Mobile detected: ' + isMobileDevice);

// debugLog function from Step 1 & 2
function debugLog(message, data) {
    if (debugMode) {
        console.log("LIBMAPS DEBUG: " + message, data || "");
        
        // Create mobile debug overlay for better visibility on mobile
        if (isMobileDevice) {
            // Only add mobile debug when document.body exists
            if (document.body) {
                var debugDiv = document.getElementById('libmaps-debug') || document.createElement('div');
                if (!document.getElementById('libmaps-debug')) {
                    debugDiv.id = 'libmaps-debug';
                    debugDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:rgba(255,0,0,0.9);color:white;padding:15px;font-size:14px;z-index:99999;max-width:350px;max-height:250px;overflow-y:auto;border-radius:5px;border:2px solid yellow;';
                    document.body.appendChild(debugDiv);
                }
                debugDiv.innerHTML += '<div>' + new Date().toLocaleTimeString() + ': ' + message + '</div>';
            }
        }
    }
}

debugLog("Mobile device detected: " + isMobileDevice);
debugLog("User agent: " + navigator.userAgent);

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
    
    // STEP 3 ENHANCEMENT: Enterprise Mobile HTML Structure Detection
    scrapeMobileEnterpriseStructure: function(items) {
        debugLog("STEP 3: Trying Enterprise mobile HTML structure detection");
        
        // Look for Enterprise mobile pattern: .detailItemsTable_CALLNUMBER elements directly
        var callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER:not(.libmaps-processed)');
        debugLog("Found " + callElements.length + " Enterprise call number elements");
        
        if (callElements.length === 0) {
            return items;
        }
        
        for (var i = 0; i < callElements.length; i++) {
            var callElement = callElements[i];
            callElement.classList.add('libmaps-processed');
            
            var callText = callElement.textContent.trim();
            if (!callText) continue;
            
            debugLog("Processing Enterprise call element " + (i + 1) + ": " + callText);
            
            // Find the container row/element for this call number
            var container = callElement.closest('tr') || callElement.closest('div') || callElement.parentElement;
            
            // Look for library/location info near this call element
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
            }
            
            var titleText = springyILS.getTitle() ? springyMap.extractText(springyILS.getTitle()) : document.title;
            
            debugLog("Enterprise mobile item " + (i + 1) + " data:", {
                call: callText,
                location: location,
                collection: collection,
                title: titleText
            });
            
            // Validate
            var locationValid = springyMap.isValidLocation(location);
            var collectionValid = springyMap.isValidCollection(collection);
            var callValid = callText && callText.length > 0;
            
            debugLog("Enterprise mobile validation - Location: " + locationValid + ", Collection: " + collectionValid + ", Call: " + callValid);
            
            if (callValid && locationValid && collectionValid) {
                items.push({
                    element: container || callElement,
                    buttonElement: callElement,
                    location: location,
                    call: callText,
                    title: titleText,
                    collection: collection
                });
                debugLog("✓ Enterprise mobile item " + (i + 1) + " added to items");
            } else {
                debugLog("✗ Enterprise mobile item " + (i + 1) + " failed validation");
            }
        }
        
        debugLog("STEP 3: Enterprise mobile structure found " + items.length + " valid items");
        return items;
    },
    
    scrapeDetailRows: function(items) {
        debugLog("Starting detail row scraping");
        
        // Additional mobile selectors from Step 2
        var selectors = [
            ".detailItemsTableRow:not(.libmaps-proc)",
            "tbody .detailItemsTableRow:not(.libmaps-proc)",
            ".detailItemsTable tr:not(.libmaps-proc)" // Additional mobile selector
        ];
        
        // Add mobile-specific selectors from Step 2
        if (isMobileDevice) {
            selectors.push(
                "[class*='detailItems'] tr:not(.libmaps-proc)", // Wildcard selector
                ".detailItemsTable_CALLNUMBER:not(.libmaps-proc)", // Direct call number elements
                "[class*='detailItemsTable_CALLNUMBER']:not(.libmaps-proc)" // Wildcard call number
            );
            debugLog("Added mobile-specific selectors, total: " + selectors.length);
        }
        
        var rows = null;
        for (var i = 0; i < selectors.length && !rows; i++) {
            rows = document.querySelectorAll(selectors[i]);
            if (rows.length > 0) {
                console.log(`ENTERPRISE: Found ${rows.length} rows using selector: ${selectors[i]}`);
                break;
            }
        }
        
        // STEP 3: If no traditional rows found on mobile, try Enterprise mobile structure
        if ((!rows || rows.length === 0) && isMobileDevice) {
            debugLog("No traditional rows found on mobile, trying Enterprise mobile structure");
            return springyILS.scrapeMobileEnterpriseStructure(items);
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
            console.log(`ENTERPRISE: Text cleaned from '${text}' to '${cleaned}'`);
        }
        
        return cleaned;
    },
    
    extractCollectionText: function(collectionElement) {
        if (!collectionElement) return "";
        
        var rawText = springyMap.extractText(collectionElement);
        var cleaned = springyMap.cleanText(rawText);
        
        if (!cleaned) return cleaned;
        
        var validCollections = Object.keys(springyMap.siteConfig.validCollectionNameMap);
        
        for (var i = 0; i < validCollections.length; i++) {
            var validCollection = validCollections[i];
            if (cleaned.toLowerCase().includes(validCollection.toLowerCase())) {
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
(function() {
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
            return `<div class="springy-underlay"><div class="springy-modal" data-location="${item.location}" data-zone="${item.zone}" data-call="${item.call}" tabindex="0"><div class="springy-header"><h1>${item.title}</h1><div class="springy-header-buttons"><button class="springy-print" aria-label="Print Map"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64-208l0 144-448 0 0-144 448 0z"/></svg></button><button class="springy-close" aria-label="Close Map">×</button></div></div><div class="springy-body"><iframe src="${url}" title="LibMaps for ${item.title}"></iframe></div></div></div>`;
        },
        
        css: '.springy-button-div { display: inline-block; } .springy-button { text-indent: 0; cursor: pointer; position: relative; padding: 6px 12px 6px 6px; box-sizing: border-box; border-width: 0; border-radius: 6px; color: #FFFFFF; background-color: #337AB7; display: inline-block; white-space: nowrap; line-height: 16px; } a.springy-button { color: #FFFFFF; text-decoration: none; } .springy-button:hover { color: #FFFFFF; background-color: #286090; } a.springy-button:hover { color: #FFFFFF; background-color: #286090; } .springy-button:focus { color: #FFFFFF; background-color: #286090; opacity: 80%; box-shadow: none; } a.springy-button:focus { color: #FFFFFF; background-color: #286090; opacity: 80%; box-shadow: none; } .springy-icon { width: 16px; height: 16px; fill: currentColor; margin-right: 6px; } .springy-underlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9998; display: none; } .springy-underlay-active { display: flex; align-items: center; justify-content: center; } .springy-modal { background: #fff; border-radius: 6px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.3); max-width: 90%; max-height: 90%; width: 800px; height: 600px; display: flex; flex-direction: column; } .springy-modal-active { display: flex; } .springy-header { padding: 15px 20px; border-bottom: 1px solid #e5e5e5; display: flex; justify-content: space-between; align-items: center; } .springy-header h1 { font-size: 20px; margin: 0; color: #333; } .springy-header-buttons { display: flex; gap: 10px; } .springy-print, .springy-close { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; } .springy-print { background: #007cba; color: white; } .springy-close { background: #6c757d; color: white; } .springy-body { flex: 1; padding: 0; } .springy-body iframe { width: 100%; height: 100%; border: none; }'
    };
    
    console.log("ENTERPRISE: Injecting styles...");
    springyMap.injectStyles(document.head, springyMap.siteConfig.css);
    
    console.log("ENTERPRISE: Starting watcher...");
    springyMap.watch();
    
    console.log("ENTERPRISE: Integration initialized successfully");
})();