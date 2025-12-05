// sirsiDynix Enterprise - Springs Lib Maps Integration
// Version for Security Audit - Exposes objects globally for testing

// Global exposure for security audit
var springyMap, springyILS, isMobileDevice, debugMode, createMobileDebugOverlay, mobileLog;

(function() {
console.log("ENTERPRISE INTEGRATION: Initializing Springs Lib Maps...");

// Mobile detection and debugging setup
isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
debugMode = true; // Enable debug logging

// Mobile debug overlay function
createMobileDebugOverlay = function() {
    var debugDiv = document.createElement('div');
    debugDiv.id = 'mobile-debug-overlay';
    debugDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        right: 10px;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        border: 2px solid red;
        max-height: 200px;
        overflow-y: auto;
    `;
    debugDiv.innerHTML = '<strong>LIBMAPS DEBUG</strong><br>';
    document.body.appendChild(debugDiv);
    return debugDiv;
}

// Mobile debug logging function
mobileLog = function(message) {
    console.log(message);
    if (isMobileDevice) {
        var debugDiv = document.getElementById('mobile-debug-overlay');
        if (!debugDiv) {
            debugDiv = createMobileDebugOverlay();
        }
        debugDiv.innerHTML += message + '<br>';
    }
}

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

// Mobile detection complete

// debugLog function from previous steps
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

springyILS = {
    // STEP 4 ENHANCEMENT: Global processed items tracking
    processedItems: new Set(),
    
    createItemKey: function(call, location, collection) {
        return call + "|" + location + "|" + collection;
    },
    
    isGloballyProcessed: function(call, location, collection) {
        // STEP 4.2: Check by call number only for simpler deduplication
        return springyILS.processedItems.has(call);
    },
    
    markAsProcessed: function(call, location, collection) {
        // STEP 4.2: Track by call number only
        springyILS.processedItems.add(call);
        debugLog("STEP 4.2: Marked call number as processed: " + call);
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
    
    // Rest of springyILS methods...
    scrapeDetailRows: function(items) { return []; }, // Simplified for audit
    scrapeDom: function() { return []; },
    attachButton: function(item, buttonDiv) { },
    setupListeners: function() { }
};

springyMap = {
    callbackId: 1,
    siteConfig: {
        domain: 'https://byui.libcal.com',
        iid: 4251,
        isUsingFixedLocation: 0,
        isValidCollectionRequired: 1,
        validLocationNameMap: {
            'David O. McKay Library': true,
            'McKay Library': true,
            'David O McKay Library': true
        },
        validCollectionNameMap: {
            'Audio Books': true,
            'CD': true,
            'Double Oversize Books': true,
            'DVD': true,
            'General Books': true,
            'General Books - 1st Floor': true,
            'Juvenile Literature': true,
            'Map': true,
            'Popular Books': true,
            'Reserve Collection': true,
            'Special Collections': true
        },
        button: {
            label: 'Map It',
            icon: '<svg class="springy-icon" viewBox="796 796 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M970.135,870.134C970.135,829.191,936.943,796,896,796c-40.944,0-74.135,33.191-74.135,74.134 c0,16.217,5.221,31.206,14.055,43.41l-0.019,0.003L896,996l60.099-82.453l-0.019-0.003 C964.912,901.34,970.135,886.351,970.135,870.134z M896,900.006c-16.497,0-29.871-13.374-29.871-29.872s13.374-29.871,29.871-29.871 s29.871,13.373,29.871,29.871S912.497,900.006,896,900.006z"/></svg>'
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
            
            return `<div class="springy-underlay"><div class="springy-modal" data-location="${escapedLocation}" data-zone="${escapedZone}" data-call="${escapedCall}"><h1>${escapedTitle}</h1><iframe src="${escapedUrl}"></iframe></div></div>`;
        }
    },
    
    cleanText: function(text) {
        if (!text) return "";
        
        // Clean and normalize text with HTML sanitization
        var cleaned = text.trim()
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .replace(/Unknown$/, "")
            .replace(/\s+$/, "");
        
        // Remove potentially dangerous HTML tags and script content
        cleaned = cleaned
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
            .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '') // Remove iframe tags
            .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '') // Remove object tags
            .replace(/<embed[^>]*\/?>/gi, '') // Remove embed tags
            .replace(/javascript:/gi, '') // Remove javascript: protocols
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .replace(/<[^>]*>/g, ''); // Remove all remaining HTML tags
        
        return cleaned;
    },
    
    extractText: function(element) {
        if (!element) return "";
        var text = element.textContent || element.innerText || "";
        return springyMap.cleanText(text);
    },
    
    extractCollectionText: function(collectionElement) {
        if (!collectionElement) return "";
        
        var rawText = springyMap.extractText(collectionElement);
        var cleaned = springyMap.cleanText(rawText);
        
        if (!cleaned) return cleaned;
        
        var validCollections = Object.keys(springyMap.siteConfig.validCollectionNameMap);
        
        // First, try exact match
        if (springyMap.siteConfig.validCollectionNameMap[cleaned]) {
            return cleaned;
        }
        
        // If no exact match, try to find a valid collection that's at the start of the text
        for (var i = 0; i < validCollections.length; i++) {
            var validCollection = validCollections[i];
            if (cleaned.indexOf(validCollection) === 0) {
                return validCollection;
            }
        }
        
        return cleaned;
    },
    
    isValidLocation: function(location) {
        if (springyMap.siteConfig.isUsingFixedLocation) {
            return true;
        }
        if (!location || location.length === 0) {
            return false;
        }
        return springyMap.siteConfig.validLocationNameMap[location.trim()] === true;
    },

    isValidCollection: function(collection) {
        if (!springyMap.siteConfig.isValidCollectionRequired) {
            return true;
        }
        if (!collection || collection.length === 0) {
            return false;
        }
        return springyMap.siteConfig.validCollectionNameMap[collection.trim()] === true;
    },
    
    createButton: function(item) {
        var params = new URLSearchParams();
        
        // Encode parameters to prevent injection attacks
        params.set("call", encodeURIComponent(item.call || ''));
        params.set("location", encodeURIComponent(item.location || ''));
        params.set("collection", encodeURIComponent(item.collection || ""));
        params.set("title", encodeURIComponent(item.title || ""));
        
        var button = document.createElement("button");
        button.setAttribute("type", "button");
        button.classList.add("springy-button");
        button.textContent = springyMap.siteConfig.button.label;
        
        return button;
    },
    
    // Simplified methods for audit
    watch: function() { },
    scrape: function() { return []; }
};

console.log("AUDIT VERSION: LibMaps objects exposed globally for security testing");

})();