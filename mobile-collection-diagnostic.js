/**
 * Mobile Collection Diagnostic
 * 
 * This script specifically diagnoses mobile collection extraction issues.
 * Run this on a mobile device or mobile view to debug collection problems.
 */

function diagnoseMobileCollections() {
    console.log('📱 MOBILE COLLECTION DIAGNOSTIC');
    console.log('='.repeat(40));
    
    // Check if we're on mobile
    var isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log(`\n🔍 Device Detection:`);
    console.log(`   Mobile Device: ${isMobile}`);
    console.log(`   User Agent: ${navigator.userAgent}`);
    console.log(`   Screen Width: ${screen.width}px`);
    console.log(`   Viewport Width: ${window.innerWidth}px`);
    
    // Check for call number elements (mobile entry point)
    console.log(`\n📞 Call Number Elements (Mobile Entry Point):`);
    var callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER:not(.libmaps-processed)');
    console.log(`   Found ${callElements.length} call elements`);
    
    if (callElements.length === 0) {
        console.log('   ⚠️ No call elements found - may not be on item details page');
        return;
    }
    
    // Analyze each call element and its container
    callElements.forEach((callElement, index) => {
        console.log(`\n   📖 Call Element ${index + 1}:`);
        console.log(`   Call Text: "${callElement.textContent.trim()}"`);
        
        // Find container
        var container = callElement.closest('tr') || callElement.closest('div') || callElement.parentElement;
        if (!container) {
            console.log('   ❌ No container found');
            return;
        }
        
        console.log(`   Container: ${container.tagName} (${container.className || 'no class'})`);
        
        // Test collection selectors
        console.log(`   🔍 Testing Collection Selectors:`);
        
        var selectors = [
            '.detailItemsTable_SD_HZN_COLLECTION',
            '[class*="COLLECTION"]',
            '[class*="collection"]',
            '.collection',
            '[data-collection]',
            'td[id*="collection"]',
            'td[id*="COLLECTION"]',
            '[class*="Collection"]',
            '*[class*="coll"]'
        ];
        
        var foundCollection = false;
        
        selectors.forEach(selector => {
            var element = container.querySelector(selector);
            if (element) {
                console.log(`   ✅ "${selector}": Found`);
                console.log(`      Text: "${element.textContent.trim()}"`);
                console.log(`      Class: "${element.className || 'none'}"`);
                console.log(`      ID: "${element.id || 'none'}"`);
                
                // Test extraction
                if (typeof springyMap !== 'undefined' && springyMap.extractCollectionText) {
                    var extracted = springyMap.extractCollectionText(element);
                    console.log(`      Extracted: "${extracted}"`);
                    
                    if (springyMap.isValidCollection) {
                        var valid = springyMap.isValidCollection(extracted);
                        console.log(`      Valid: ${valid}`);
                    }
                }
                
                foundCollection = true;
            } else {
                console.log(`   ❌ "${selector}": Not found`);
            }
        });
        
        if (!foundCollection) {
            console.log(`   ⚠️ No collection element found for this call number`);
            
            // Show all elements in container for debugging
            console.log(`   🔍 All elements in container:`);
            var allElements = container.querySelectorAll('*');
            allElements.forEach((el, i) => {
                if (el.textContent.trim() && el.textContent.trim().length < 100) {
                    console.log(`      ${i}: ${el.tagName}.${el.className || 'no-class'} - "${el.textContent.trim()}"`);
                }
            });
        }
    });
    
    // Test general collection element search
    console.log(`\n🔍 General Collection Element Search:`);
    var generalSelectors = [
        'td[id^="item_location_"]',
        '.detailItemsTable_SD_HZN_COLLECTION',
        '[class*="COLLECTION"]',
        '[class*="collection"]',
        '.collection'
    ];
    
    generalSelectors.forEach(selector => {
        var elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`   "${selector}": ${elements.length} elements found`);
            elements.forEach((el, i) => {
                console.log(`      ${i}: "${el.textContent.trim().substring(0, 50)}..."`);
            });
        } else {
            console.log(`   "${selector}": No elements found`);
        }
    });
    
    console.log(`\n✅ Mobile Collection Diagnostic Complete`);
    console.log('Check console logs above for collection element detection issues');
}

// Quick mobile test
function quickMobileTest() {
    console.log('⚡ QUICK MOBILE TEST');
    
    var isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
        console.log('⚠️ Not detected as mobile device');
        console.log('Try on mobile or use browser dev tools mobile emulation');
        return;
    }
    
    console.log('📱 Mobile device detected - running diagnostic...');
    diagnoseMobileCollections();
}

console.log('📱 Mobile Collection Diagnostic Tools Loaded');
console.log('Available functions:');
console.log('  diagnoseMobileCollections() - Full mobile diagnostic');  
console.log('  quickMobileTest() - Quick mobile test');
console.log('\nRun quickMobileTest() to start!');