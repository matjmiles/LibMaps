// sirsiDynix Enterprise - Springs Lib Maps Integration
// Production Version - Mobile Compatible with Duplicate Prevention

console.log("ENTERPRISE INTEGRATION: Initializing Springs Lib Maps...");

// Mobile detection
var isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

var springyILS = {
    // Global processed items tracking for duplicate prevention
    processedItems: new Set(),
    
    isGloballyProcessed: function(call, location, collection) {
        return springyILS.processedItems.has(call);
    },
    
    markAsProcessed: function(call, location, collection) {
        springyILS.processedItems.add(call);
    },
    
    getTitle: function(element) {
        // Try multiple selector strategies for better compatibility
        var titleSelectors = [
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
                return title;
            }
        }
        
        // Try alternative selectors for different page layouts
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
                    return elem;
                }
            }
        }
        
        // Final fallback: use document title
        var docTitle = document.title;
        if (docTitle) {
            docTitle = docTitle.replace(/ - .*$/, '').trim();
            var virtualTitle = {
                textContent: docTitle,
                innerText: docTitle
            };
            return virtualTitle;
        }
        
        return null;
    },
    
    // Duplicate prevention - focuses on call number only
    isDuplicateItem: function(newItem, existingItems) {
        for (var i = 0; i < existingItems.length; i++) {
            var existing = existingItems[i];
            if (existing.call === newItem.call) {
                return true;
            }
        }
        return false;
    },
    
    // Enterprise Mobile HTML Structure Detection
    scrapeMobileEnterpriseStructure: function(items) {
        // Look for Enterprise mobile pattern: .detailItemsTable_CALLNUMBER elements directly
        var allCallElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER:not(.libmaps-processed)');
        
        // Filter out label elements, keep only value elements
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
            
            // Keep actual call numbers
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
            
            // Check if call number already processed
            if (springyILS.isGloballyProcessed(callText, null, null)) {
                continue;
            }
            
            // Find the container row/element for this call number
            var container = callElement.closest('tr') || callElement.closest('div') || callElement.parentElement;
            
            // Look for library/location info near this call element
            var libraryElement = null;
            var collectionElement = null;
            
            if (container) {
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
                continue;
            }
            
            // Validate
            var locationValid = springyMap.isValidLocation(location);
            var collectionValid = springyMap.isValidCollection(collection);
            var callValid = callText && callText.length > 0;
            
            if (callValid && locationValid && collectionValid) {
                items.push(potentialItem);
                springyILS.markAsProcessed(callText, location, collection);
            }
        }
        
        return items;
    },
    
    scrapeDetailRows: function(items) {
        // Try Enterprise mobile structure FIRST on mobile
        if (isMobileDevice) {
            items = springyILS.scrapeMobileEnterpriseStructure(items);
        }
        
        // Traditional row detection (for desktop or mobile fallback)
        var selectors = [
            ".detailItemsTableRow:not(.libmaps-proc)",
            "tbody .detailItemsTableRow:not(.libmaps-proc)",
            ".detailItemsTable tr:not(.libmaps-proc)"
        ];
        
        // Add mobile-specific selectors
        if (isMobileDevice) {
            selectors.push(
                "[class*='detailItems'] tr:not(.libmaps-proc)",
                ".detailItemsTable_CALLNUMBER:not(.libmaps-proc)",
                "[class*='detailItemsTable_CALLNUMBER']:not(.libmaps-proc)"
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
                
                // Extract location
                var locationElement = libraryElement.querySelector(".asyncFieldLIBRARY:last-of-type") ||
                                     libraryElement.querySelector(".asyncFieldLIBRARY") ||
                                     libraryElement;
                
                var location = springyMap.extractText(locationElement);
                var call = springyMap.extractText(callElement);
                var collection = springyMap.extractCollectionText(collectionElement);
                var titleText = springyMap.extractText(title);
                
                // Check if call number already processed
                if (springyILS.isGloballyProcessed(call, location, collection)) {
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
                    continue;
                }
                
                // Validate before adding
                var locationValid = springyMap.isValidLocation(location);
                var collectionValid = springyMap.isValidCollection(collection);
                var callValid = call && call.length > 0;
                
                if (callValid && locationValid && collectionValid) {
                    items.push(potentialItem);
                    springyILS.markAsProcessed(call, location, collection);
                }
            }
        }
        
        return items;
    },

    scrapeDom: function() {
        return springyILS.scrapeDetailRows([]);
    },

    attachButton: function(item, buttonDiv) {
        var targetElement = item.buttonElement || item.element;
        
        // Check if button already exists to prevent duplicates
        var existingButton = targetElement ? targetElement.querySelector('.springy-button-div') : null;
        if (existingButton) {
            return;
        }
        
        if (targetElement) {
            targetElement.appendChild(buttonDiv);
        }
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
            .replace(/Unknown$/, "")
            .replace(/\s+$/, "");
        
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
    
    extractCollectionText: function(collectionElement) {
        if (!collectionElement) return "";
        
        var rawText = springyMap.extractText(collectionElement);
        var cleaned = springyMap.cleanText(rawText);
        
        if (!cleaned) return cleaned;
        
        var validCollections = Object.keys(springyMap.siteConfig.validCollectionNameMap);
        
        for (var i = 0; i < validCollections.length; i++) {
            var validCollection = validCollections[i];
            if (cleaned.toLowerCase().includes(validCollection.toLowerCase())) {
                return validCollection;
            }
        }
        
        return cleaned;
    },

    normalizeLocationForService: function(location) {
        // Map internal location names to what the Springs service expects
        var locationMap = {
            'David O. McKay Library': 'McKay Library',
            'David O McKay Library': 'McKay Library',
            'McKay Library': 'McKay Library'
        };
        
        return locationMap[location] || location;
    },

    injectStyles: function(head, css) {
        var style = document.createElement("style");
        style.type = "text/css";
        style.innerText = css;
        head.insertBefore(style, head.firstChild);
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
            
            // Mobile-friendly button styling
            if (isMobileDevice) {
                button.style.cssText = 'padding:10px 15px;font-size:16px;min-height:44px;touch-action:manipulation;';
            }
            
            if (icon !== null) button.appendChild(icon);
            button.appendChild(label);
            
            button.onclick = springyMap.createModalClickHandler(item, params);
            button.addEventListener("keydown", springyMap.createKeyHandler());
            
            return button;
        } else {
            var link = document.createElement("a");
            link.classList.add("springy-button");
            
            // Mobile-friendly link styling
            if (isMobileDevice) {
                link.style.cssText = 'padding:10px 15px;font-size:16px;min-height:44px;touch-action:manipulation;display:inline-block;';
            }
            
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
        
        var normalizedLocation = location.trim();
        return springyMap.siteConfig.validLocationNameMap[normalizedLocation] === true;
    },

    isValidCollection: function(collection) {
        if (!springyMap.siteConfig.isValidCollectionRequired) {
            return true;
        }
        
        if (!collection || collection.length === 0) {
            return false;
        }
        
        var normalizedCollection = collection.trim();
        return springyMap.siteConfig.validCollectionNameMap[normalizedCollection] === true;
    },

    setupButtons: function(items) {
        for (let i = 0; i < items.length; i++) {
            var item = items[i];
            
            if (item.call.length !== 0 && 
                springyMap.isValidLocation(item.location) && 
                springyMap.isValidCollection(item.collection)) {
                
                var button = springyMap.createButton(item);
                var buttonDiv = document.createElement("div");
                buttonDiv.classList.add("springy-button-div");
                buttonDiv.insertAdjacentElement("afterbegin", button);
                
                springyILS.attachButton(item, buttonDiv);
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
        var items = springyMap.siteConfig.isGenericScrapeWanted ? 
                   springyMap.scrapeDomGeneric() : 
                   springyILS.scrapeDom();
        
        springyMap.setupButtons(items);
        return items;
    },

    // Mobile-Aware DOM Timing
    watch: function() {
        var attempts = 0;
        var maxAttempts = isMobileDevice ? 60 : 30;
        var interval = isMobileDevice ? 750 : 500;
        
        var watcher = setInterval(function() {
            attempts++;
            
            var targetElement = document.querySelector(".detailItemsTableRow") ||
                              document.querySelector("tbody .detailItemsTableRow") ||
                              document.querySelector(".detailItemsTable");
            
            // Additional mobile fallback selectors
            if (!targetElement && isMobileDevice) {
                targetElement = document.querySelector(".detailItems") ||
                              document.querySelector("[class*='detailItems']") ||
                              document.querySelector(".detailItemsTable_CALLNUMBER") ||
                              document.querySelector("[class*='detailItemsTable_CALLNUMBER']");
            }
            
            if (targetElement) {
                clearInterval(watcher);
                
                var renderDelay = isMobileDevice ? 1500 : 750;
                
                setTimeout(function() {
                    springyMap.scrape();
                }, renderDelay);
                
            } else if (attempts >= maxAttempts) {
                clearInterval(watcher);
                
                var fallbackDelay = isMobileDevice ? 2000 : 1000;
                setTimeout(function() {
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
        
        validLocationNameMap: {
            'David O. McKay Library': true,
            'McKay Library': true,
            'David O McKay Library': true
        },
        
        // CORRECTED: Collection mapping from mapsOld.js
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
            return `<div class="springy-underlay"><div class="springy-modal" data-location="${item.location}" data-zone="${item.zone}" data-call="${item.call}" tabindex="0"><div class="springy-header"><h1>${item.title}</h1><div class="springy-header-buttons"><button class="springy-print" aria-label="Print Map"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64-208l0 144-448 0 0-144 448 0z"/></svg></button><button class="springy-close" aria-label="Close Map">×</button></div></div><div class="springy-body"><iframe src="${url}" title="LibMaps for ${item.title}"></iframe></div></div></div>`;
        },
        
        css: '.springy-button-div { display: inline-block; } .springy-button { text-indent: 0; cursor: pointer; position: relative; padding: 6px 12px 6px 6px; box-sizing: border-box; border-width: 0; border-radius: 6px; color: #FFFFFF; background-color: #337AB7; display: inline-block; white-space: nowrap; line-height: 16px; } a.springy-button { color: #FFFFFF; text-decoration: none; } .springy-button:hover { color: #FFFFFF; background-color: #286090; } a.springy-button:hover { color: #FFFFFF; background-color: #286090; } .springy-button:focus { color: #FFFFFF; background-color: #286090; opacity: 80%; box-shadow: none; } a.springy-button:focus { color: #FFFFFF; background-color: #286090; opacity: 80%; box-shadow: none; } .springy-icon { width: 16px; height: 16px; fill: currentColor; margin-right: 6px; } .springy-underlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9998; display: none; } .springy-underlay-active { display: flex; align-items: center; justify-content: center; } .springy-modal { background: #fff; border-radius: 6px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.3); max-width: 90%; max-height: 90%; width: 800px; height: 600px; display: flex; flex-direction: column; } .springy-modal-active { display: flex; } .springy-header { padding: 15px 20px; border-bottom: 1px solid #e5e5e5; display: flex; justify-content: space-between; align-items: center; } .springy-header h1 { font-size: 20px; margin: 0; color: #333; } .springy-header-buttons { display: flex; gap: 10px; } .springy-print, .springy-close { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; } .springy-print { background: #007cba; color: white; } .springy-close { background: #6c757d; color: white; } .springy-body { flex: 1; padding: 0; } .springy-body iframe { width: 100%; height: 100%; border: none; }'
    };
    
    springyMap.injectStyles(document.head, springyMap.siteConfig.css);
    springyMap.watch();
    
    console.log("ENTERPRISE: Integration initialized successfully");
})();