/**
 * Collection Fix Verification Test
 * 
 * This script tests the collection extraction fix to ensure it works correctly
 * after restoring the original matching logic.
 * 
 * Usage:
 * 1. Load a book page in Enterprise
 * 2. Paste this script in console
 * 3. Review the test results
 */

function testCollectionFix() {
    console.log('🔧 COLLECTION FIX VERIFICATION TEST');
    console.log('='.repeat(40));
    
    // Test collection extraction with various inputs
    const testCases = [
        // Exact matches
        'General Books',
        'DVD',
        'Special Collections',
        
        // Partial matches (should match at start)
        'General Books - 1st Floor Extra Text',
        'DVD Collection Area',
        'Special Collections Department',
        
        // Should NOT match (middle of string)
        'Some General Books Text',
        'Random DVD Stuff',
        'Other Special Collections Info',
        
        // Real Enterprise examples
        'General Books\n\nAdditional info',
        'Special Coll.-Church History',
        'Audio Books\t\n',
        
        // Edge cases
        '',
        null,
        undefined,
        '   ',
        'GENERAL BOOKS',  // Case differences
        'general books'   // Case differences
    ];
    
    console.log('\n📊 Testing Collection Extraction:');
    
    // Mock collection element for testing
    function createMockElement(text) {
        return {
            textContent: text,
            innerText: text
        };
    }
    
    testCases.forEach((testText, index) => {
        console.log(`\n   Test ${index + 1}: "${testText}"`);
        
        try {
            if (testText === null || testText === undefined) {
                var result = springyMap.extractCollectionText(null);
            } else {
                var mockElement = createMockElement(testText);
                var result = springyMap.extractCollectionText(mockElement);
            }
            
            console.log(`   Result: "${result}"`);
            
            // Check validation
            if (typeof springyMap.isValidCollection === 'function') {
                var isValid = springyMap.isValidCollection(result);
                console.log(`   Valid: ${isValid}`);
                
                if (!isValid && result && result.length > 0) {
                    console.log(`   ⚠️ Extracted "${result}" but not valid - check collection mapping`);
                }
            }
            
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
        }
    });
    
    console.log('\n🔍 Live DOM Test (Desktop & Mobile):');
    
    // Test on actual page elements for both desktop and mobile patterns
    const collectionSelectors = [
        // Desktop selectors
        '.detailItemsTable_SD_HZN_COLLECTION',
        // Mobile selectors  
        '[class*="COLLECTION"]',
        '[class*="collection"]',
        // Legacy/fallback selectors
        'td[id^="item_location_"]',
        '.detailItemsTable_COLLECTION',
        '[data-collection]'
    ];
    
    collectionSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`\n   Selector: ${selector}`);
            console.log(`   Found: ${elements.length} elements`);
            
            elements.forEach((el, index) => {
                try {
                    const extracted = springyMap.extractCollectionText(el);
                    const isValid = springyMap.isValidCollection(extracted);
                    
                    console.log(`   Element ${index}:`);
                    console.log(`     Raw: "${el.textContent.trim()}"`);
                    console.log(`     Extracted: "${extracted}"`);
                    console.log(`     Valid: ${isValid}`);
                    
                    if (!isValid && extracted) {
                        console.log(`     ⚠️ Not valid - may need collection mapping update`);
                    }
                    
                } catch (error) {
                    console.error(`     ❌ Error processing element ${index}: ${error.message}`);
                }
            });
        }
    });
    
    console.log('\n📱💻 Device Context:');
    console.log(`   User Agent: ${navigator.userAgent}`);
    console.log(`   Screen Width: ${screen.width}px`);
    console.log(`   Mobile Detection: ${/iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}`);
    
    console.log('\n✅ Collection Fix Test Complete');
    console.log('📋 This fix applies to BOTH desktop and mobile views');
    console.log('Check results above for any validation issues');
}

// Quick verification function
function quickCollectionCheck() {
    console.log('⚡ QUICK COLLECTION CHECK');
    
    // Check if fix is loaded
    if (typeof springyMap === 'undefined' || typeof springyMap.extractCollectionText === 'undefined') {
        console.log('❌ SpringyMap not loaded - refresh page and try again');
        return;
    }
    
    // Check for console logging (indicates fix is active)
    const testElement = { textContent: 'General Books Test' };
    console.log('\n🧪 Testing extraction with logging:');
    const result = springyMap.extractCollectionText(testElement);
    console.log(`Result: "${result}"`);
    
    // Check actual page
    const collectionElements = document.querySelectorAll('.detailItemsTable_SD_HZN_COLLECTION, [class*="COLLECTION"]');
    if (collectionElements.length > 0) {
        console.log(`\n📚 Found ${collectionElements.length} collection elements on page`);
        console.log('Run testCollectionFix() for detailed analysis');
    } else {
        console.log('\n📭 No collection elements found on this page');
        console.log('Try on a book detail page with holdings information');
    }
}

// Load test functions
console.log('🧪 Collection Fix Test Tools Loaded');
console.log('Available functions:');
console.log('  testCollectionFix() - Complete test suite');
console.log('  quickCollectionCheck() - Quick verification');
console.log('\nStart with quickCollectionCheck() to verify the fix is loaded!');