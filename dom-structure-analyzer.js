/**
 * Mobile vs Desktop DOM Structure Comparison Tool
 * 
 * This diagnostic tool analyzes the DOM structure differences between
 * mobile and desktop to identify why collection extraction fails on mobile.
 */

function analyzeDOMStructures() {
    console.log('🔍 DOM STRUCTURE COMPARISON DIAGNOSTIC');
    console.log('='.repeat(60));
    
    // Device detection
    var isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log(`📱 Device Type: ${isMobile ? 'MOBILE' : 'DESKTOP'}`);
    console.log(`🌐 User Agent: ${navigator.userAgent}`);
    console.log(`📏 Viewport: ${window.innerWidth}x${window.innerHeight}`);
    
    // Find all call number elements
    var callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER');
    console.log(`\n📞 Found ${callElements.length} call number elements`);
    
    callElements.forEach((callEl, index) => {
        var callText = callEl.textContent.trim();
        console.log(`\n📋 ANALYZING CALL ELEMENT ${index + 1}: "${callText}"`);
        console.log('='.repeat(40));
        
        // Skip labels
        if (callText.toLowerCase().includes('shelf number') || 
            callText.toLowerCase().includes('call number')) {
            console.log('⚠️ SKIPPING - Detected as label');
            return;
        }
        
        // Find container
        var container = callEl.closest('tr') || callEl.closest('div') || callEl.parentElement;
        if (!container) {
            console.log('❌ No container found');
            return;
        }
        
        console.log(`📦 Container: ${container.tagName}.${container.className || 'no-class'}`);
        
        // COLLECTION ANALYSIS
        console.log('\n🗂️ COLLECTION ELEMENT SEARCH:');
        
        var collectionSelectors = [
            '.detailItemsTable_SD_HZN_COLLECTION',
            '[class*="COLLECTION"]',
            '[class*="collection"]',
            '.collection',
            '[data-collection]',
            'td[id*="collection"]',
            'td[id*="COLLECTION"]'
        ];
        
        var foundCollection = null;
        
        collectionSelectors.forEach(selector => {
            var elements = container.querySelectorAll(selector);
            console.log(`   "${selector}": ${elements.length} elements found`);
            
            elements.forEach((el, i) => {
                var text = el.textContent.trim();
                if (text && text.length > 0) {
                    console.log(`      Element ${i}: "${text}" (${el.tagName}.${el.className || 'no-class'})`);
                    if (!foundCollection && !text.toLowerCase().includes('collection')) {
                        foundCollection = { element: el, text: text, selector: selector };
                    }
                }
            });
        });
        
        // LIBRARY/LOCATION ANALYSIS
        console.log('\n🏛️ LIBRARY/LOCATION ELEMENT SEARCH:');
        
        var librarySelectors = [
            '.detailItemsTable_LIBRARY',
            '[class*="LIBRARY"]',
            '[class*="library"]',
            '.library',
            '.location',
            '[data-library]',
            '[data-location]'
        ];
        
        var foundLibrary = null;
        
        librarySelectors.forEach(selector => {
            var elements = container.querySelectorAll(selector);
            console.log(`   "${selector}": ${elements.length} elements found`);
            
            elements.forEach((el, i) => {
                var text = el.textContent.trim();
                if (text && text.length > 0) {
                    console.log(`      Element ${i}: "${text}" (${el.tagName}.${el.className || 'no-class'})`);
                    if (!foundLibrary && !text.toLowerCase().includes('library')) {
                        foundLibrary = { element: el, text: text, selector: selector };
                    }
                }
            });
        });
        
        // CONTAINER ANALYSIS - Show all children
        console.log('\n📦 CONTAINER CHILDREN ANALYSIS:');
        var children = container.children;
        console.log(`   Container has ${children.length} direct children:`);
        
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var childText = child.textContent.trim();
            if (childText.length > 0 && childText.length < 100) {
                console.log(`   Child ${i}: ${child.tagName}.${child.className || 'no-class'} - "${childText}"`);
            }
        }
        
        // SIBLING ANALYSIS - Look at neighboring elements
        console.log('\n👫 SIBLING ELEMENTS ANALYSIS:');
        var siblings = container.parentElement ? container.parentElement.children : [];
        console.log(`   Container has ${siblings.length} siblings:`);
        
        for (var j = 0; j < siblings.length; j++) {
            var sibling = siblings[j];
            var siblingText = sibling.textContent.trim();
            if (siblingText.length > 0 && siblingText.length < 100) {
                console.log(`   Sibling ${j}: ${sibling.tagName}.${sibling.className || 'no-class'} - "${siblingText}"`);
            }
        }
        
        // SUMMARY FOR THIS CALL ELEMENT
        console.log('\n📊 SUMMARY FOR THIS CALL ELEMENT:');
        console.log(`   Call Number: "${callText}"`);
        console.log(`   Collection Found: ${foundCollection ? foundCollection.text : 'NONE'}`);
        console.log(`   Collection Selector: ${foundCollection ? foundCollection.selector : 'N/A'}`);
        console.log(`   Library Found: ${foundLibrary ? foundLibrary.text : 'NONE'}`);
        console.log(`   Library Selector: ${foundLibrary ? foundLibrary.selector : 'N/A'}`);
    });
    
    // DOCUMENT-WIDE COLLECTION SEARCH
    console.log('\n\n🌐 DOCUMENT-WIDE COLLECTION SEARCH:');
    console.log('='.repeat(50));
    
    var docSelectors = [
        '.detailItemsTable_SD_HZN_COLLECTION',
        '[class*="COLLECTION"]',
        '[class*="collection"]',
        '.collection',
        '[id*="collection"]',
        '[data-collection]'
    ];
    
    docSelectors.forEach(selector => {
        var elements = document.querySelectorAll(selector);
        console.log(`\n"${selector}": ${elements.length} elements found document-wide`);
        
        elements.forEach((el, i) => {
            var text = el.textContent.trim();
            if (text && text.length > 0 && text.length < 200) {
                console.log(`   Element ${i}: "${text}" (${el.tagName}.${el.className || 'no-class'}#${el.id || 'no-id'})`);
            }
        });
    });
}

// Generate HTML structure report
function generateHTMLStructureReport() {
    console.log('\n\n📄 HTML STRUCTURE REPORT:');
    console.log('='.repeat(40));
    
    var callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER');
    
    callElements.forEach((callEl, index) => {
        var callText = callEl.textContent.trim();
        
        // Skip labels
        if (callText.toLowerCase().includes('shelf number') || 
            callText.toLowerCase().includes('call number')) {
            return;
        }
        
        console.log(`\n📋 HTML STRUCTURE FOR CALL ELEMENT ${index + 1}: "${callText}"`);
        console.log('-'.repeat(60));
        
        var container = callEl.closest('tr') || callEl.closest('div') || callEl.parentElement;
        if (container) {
            console.log('Container HTML:');
            console.log(container.outerHTML);
        }
    });
}

// Comparative analysis function
function compareStructures() {
    var isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.log(`\n🔄 STRUCTURE COMPARISON (${isMobile ? 'MOBILE' : 'DESKTOP'} VIEW):`);
    console.log('='.repeat(50));
    
    // This will help compare when run on both mobile and desktop
    var summary = {
        deviceType: isMobile ? 'MOBILE' : 'DESKTOP',
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        callElements: 0,
        collectionElements: {},
        libraryElements: {},
        uniqueCollections: new Set(),
        uniqueLibraries: new Set()
    };
    
    // Count elements
    var callEls = document.querySelectorAll('.detailItemsTable_CALLNUMBER');
    summary.callElements = callEls.length;
    
    // Test collection selectors
    var collectionSelectors = [
        '.detailItemsTable_SD_HZN_COLLECTION',
        '[class*="COLLECTION"]',
        '[class*="collection"]'
    ];
    
    collectionSelectors.forEach(selector => {
        var elements = document.querySelectorAll(selector);
        summary.collectionElements[selector] = elements.length;
        
        elements.forEach(el => {
            var text = el.textContent.trim();
            if (text && text.length > 0) {
                summary.uniqueCollections.add(text);
            }
        });
    });
    
    // Test library selectors
    var librarySelectors = [
        '.detailItemsTable_LIBRARY',
        '[class*="LIBRARY"]',
        '[class*="library"]'
    ];
    
    librarySelectors.forEach(selector => {
        var elements = document.querySelectorAll(selector);
        summary.libraryElements[selector] = elements.length;
        
        elements.forEach(el => {
            var text = el.textContent.trim();
            if (text && text.length > 0) {
                summary.uniqueLibraries.add(text);
            }
        });
    });
    
    // Convert Sets to Arrays for display
    summary.uniqueCollections = Array.from(summary.uniqueCollections);
    summary.uniqueLibraries = Array.from(summary.uniqueLibraries);
    
    console.log('COMPARISON SUMMARY:');
    console.log(JSON.stringify(summary, null, 2));
    
    return summary;
}

// Main diagnostic function
function runFullDOMDiagnostic() {
    analyzeDOMStructures();
    compareStructures();
    console.log('\n\n💡 NEXT STEPS:');
    console.log('1. Run this on DESKTOP view and copy the output');
    console.log('2. Run this on MOBILE view and copy the output'); 
    console.log('3. Compare the two outputs to identify differences');
    console.log('4. Look for collection elements that exist in desktop but not mobile');
    console.log('\nTo generate HTML structure report, run: generateHTMLStructureReport()');
}

// Export functions
window.analyzeDOMStructures = analyzeDOMStructures;
window.generateHTMLStructureReport = generateHTMLStructureReport;
window.compareStructures = compareStructures;
window.runFullDOMDiagnostic = runFullDOMDiagnostic;

console.log('🔍 DOM Structure Comparison Tool Loaded!');
console.log('Available functions:');
console.log('  runFullDOMDiagnostic() - Complete analysis');
console.log('  analyzeDOMStructures() - Detailed DOM analysis');
console.log('  compareStructures() - Comparison summary');
console.log('  generateHTMLStructureReport() - Show HTML structure');
console.log('\nRun runFullDOMDiagnostic() to start!');