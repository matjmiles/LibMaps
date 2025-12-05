/**
 * LibMaps Unit Tests
 * 
 * Comprehensive test suite to prevent regressions while fixing mobile issues.
 * Run these tests before and after any changes to ensure functionality is preserved.
 */

// Test Framework
class LibMapsTestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }
    
    test(name, testFunc) {
        this.tests.push({ name, func: testFunc });
    }
    
    async runAll() {
        console.log('🧪 LIBMAPS UNIT TESTS STARTING');
        console.log('='.repeat(50));
        
        for (let test of this.tests) {
            try {
                console.log(`\n📋 Testing: ${test.name}`);
                await test.func();
                console.log(`✅ PASSED: ${test.name}`);
                this.results.passed++;
            } catch (error) {
                console.error(`❌ FAILED: ${test.name}`);
                console.error(`   Error: ${error.message}`);
                this.results.failed++;
            }
            this.results.total++;
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('🧪 TEST RESULTS SUMMARY:');
        console.log(`   Total Tests: ${this.results.total}`);
        console.log(`   Passed: ${this.results.passed}`);
        console.log(`   Failed: ${this.results.failed}`);
        console.log(`   Success Rate: ${Math.round((this.results.passed / this.results.total) * 100)}%`);
        
        return this.results;
    }
}

const testRunner = new LibMapsTestRunner();

// Test 1: Core Functions Exist
testRunner.test('Core Functions Exist', () => {
    if (typeof springyMap === 'undefined') {
        throw new Error('springyMap object not found');
    }
    
    const requiredFunctions = [
        'extractText',
        'cleanText', 
        'extractCollectionText',
        'isValidCollection',
        'isValidLocation',
        'normalizeLocationForService'
    ];
    
    requiredFunctions.forEach(funcName => {
        if (typeof springyMap[funcName] !== 'function') {
            throw new Error(`Missing function: springyMap.${funcName}`);
        }
    });
    
    console.log('   ✓ All core functions present');
});

// Test 2: Collection Validation Works  
testRunner.test('Collection Validation', () => {
    const testCollections = [
        { name: 'General Books', expected: true },
        { name: 'General Books - 1st Floor', expected: true },
        { name: 'DVD', expected: true },
        { name: 'Invalid Collection', expected: false },
        { name: '', expected: false },
        { name: null, expected: false }
    ];
    
    testCollections.forEach(test => {
        const result = springyMap.isValidCollection(test.name);
        if (result !== test.expected) {
            throw new Error(`Collection "${test.name}" validation failed. Expected: ${test.expected}, Got: ${result}`);
        }
    });
    
    console.log('   ✓ Collection validation working correctly');
});

// Test 3: Location Validation Works
testRunner.test('Location Validation', () => {
    const testLocations = [
        { name: 'David O. McKay Library', expected: true },
        { name: 'McKay Library', expected: true },
        { name: 'Invalid Location', expected: false },
        { name: '', expected: false },
        { name: null, expected: false }
    ];
    
    testLocations.forEach(test => {
        const result = springyMap.isValidLocation(test.name);
        if (result !== test.expected) {
            throw new Error(`Location "${test.name}" validation failed. Expected: ${test.expected}, Got: ${result}`);
        }
    });
    
    console.log('   ✓ Location validation working correctly');
});

// Test 4: Text Cleaning Works
testRunner.test('Text Cleaning', () => {
    const testTexts = [
        { input: 'Normal Text', expected: 'Normal Text' },
        { input: '  Spaced Text  ', expected: 'Spaced Text' },
        { input: 'Text\n\nwith\nlines', expected: 'Text with lines' },
        { input: '<script>alert("xss")</script>Clean Text', expected: 'Clean Text' },
        { input: '', expected: '' },
        { input: null, expected: '' }
    ];
    
    testTexts.forEach(test => {
        const result = springyMap.cleanText(test.input);
        if (result !== test.expected) {
            throw new Error(`Text cleaning failed. Input: "${test.input}", Expected: "${test.expected}", Got: "${result}"`);
        }
    });
    
    console.log('   ✓ Text cleaning working correctly');
});

// Test 5: Collection Extraction Works
testRunner.test('Collection Text Extraction', () => {
    // Create mock collection elements
    const testCases = [
        { text: 'General Books', expected: 'General Books' },
        { text: 'General Books - 1st Floor', expected: 'General Books - 1st Floor' },
        { text: 'Collection: DVD', expected: 'DVD' },
        { text: 'Some prefix General Books suffix', expected: 'General Books' }
    ];
    
    testCases.forEach(test => {
        const mockElement = document.createElement('div');
        mockElement.textContent = test.text;
        
        const result = springyMap.extractCollectionText(mockElement);
        if (!result || !result.includes(test.expected.split(' ')[0])) {
            throw new Error(`Collection extraction failed. Text: "${test.text}", Expected to contain: "${test.expected}", Got: "${result}"`);
        }
    });
    
    console.log('   ✓ Collection text extraction working');
});

// Test 6: Duplicate Prevention Logic
testRunner.test('Duplicate Prevention', () => {
    if (typeof springyILS === 'undefined') {
        throw new Error('springyILS object not found');
    }
    
    const requiredFunctions = [
        'createItemKey',
        'isGloballyProcessed', 
        'markAsProcessed',
        'isDuplicateItem'
    ];
    
    requiredFunctions.forEach(funcName => {
        if (typeof springyILS[funcName] !== 'function') {
            throw new Error(`Missing function: springyILS.${funcName}`);
        }
    });
    
    console.log('   ✓ Duplicate prevention functions present');
});

// Test 7: Button Creation Components
testRunner.test('Button Creation Components', () => {
    const requiredFunctions = [
        'createButton',
        'createModal',
        'createIcon'
    ];
    
    requiredFunctions.forEach(funcName => {
        if (typeof springyMap[funcName] !== 'function') {
            throw new Error(`Missing button function: springyMap.${funcName}`);
        }
    });
    
    console.log('   ✓ Button creation functions present');
});

// Test 8: Mobile Detection
testRunner.test('Mobile Detection', () => {
    if (typeof isMobileDevice === 'undefined') {
        throw new Error('isMobileDevice variable not defined');
    }
    
    console.log(`   ✓ Mobile detection: ${isMobileDevice}`);
    console.log(`   User Agent: ${navigator.userAgent}`);
});

// Test 9: DOM Element Detection (Page-Specific)
testRunner.test('DOM Element Detection', () => {
    const callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER');
    const libraryElements = document.querySelectorAll('.detailItemsTable_LIBRARY');
    const collectionElements = document.querySelectorAll('.detailItemsTable_SD_HZN_COLLECTION');
    
    console.log(`   Call Elements Found: ${callElements.length}`);
    console.log(`   Library Elements Found: ${libraryElements.length}`);
    console.log(`   Collection Elements Found: ${collectionElements.length}`);
    
    if (callElements.length === 0) {
        console.log('   ⚠️ No call elements found - may not be on item details page');
    }
    
    console.log('   ✓ DOM detection completed');
});

// Test 10: Button Duplicate Prevention
testRunner.test('Button Duplicate Prevention', () => {
    const callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER');
    
    if (callElements.length > 0) {
        const testElement = callElements[0];
        const existingButtons = testElement.querySelectorAll('.springy-button-div');
        
        console.log(`   Existing buttons on first call element: ${existingButtons.length}`);
        
        // If there are multiple buttons, that's a problem
        if (existingButtons.length > 1) {
            throw new Error(`Multiple buttons detected on single element: ${existingButtons.length}`);
        }
        
        console.log('   ✓ No duplicate buttons detected');
    } else {
        console.log('   ⚠️ No call elements to test button duplication');
    }
});

// Test 11: Mobile-Specific Functionality
testRunner.test('Mobile Detection and Functions', () => {
    if (typeof isMobileDevice === 'undefined') {
        throw new Error('isMobileDevice variable not defined');
    }
    
    if (typeof springyILS === 'undefined') {
        throw new Error('springyILS object not found');
    }
    
    // Test mobile-specific functions exist
    if (typeof springyILS.scrapeMobileCallNumbers !== 'function') {
        throw new Error('Mobile scraping function scrapeMobileCallNumbers not found');
    }
    
    console.log(`   ✓ Mobile detection: ${isMobileDevice}`);
    console.log('   ✓ Mobile scraping function exists');
});

// Test 12: Duplicate Prevention System
testRunner.test('Duplicate Prevention System', () => {
    if (typeof springyILS === 'undefined') {
        throw new Error('springyILS object not found');
    }
    
    const requiredMethods = [
        'createItemKey',
        'isGloballyProcessed',
        'markAsProcessed',
        'isDuplicateItem'
    ];
    
    requiredMethods.forEach(method => {
        if (typeof springyILS[method] !== 'function') {
            throw new Error(`Duplicate prevention method missing: ${method}`);
        }
    });
    
    // Test the duplicate prevention logic
    const testCall = 'TEST123';
    const testLocation = 'Test Library';
    const testCollection = 'Test Collection';
    
    // Should not be processed initially
    if (springyILS.isGloballyProcessed(testCall, testLocation, testCollection)) {
        throw new Error('Item should not be processed initially');
    }
    
    // Mark as processed
    springyILS.markAsProcessed(testCall, testLocation, testCollection);
    
    // Should now be processed
    if (!springyILS.isGloballyProcessed(testCall, testLocation, testCollection)) {
        throw new Error('Item should be marked as processed');
    }
    
    console.log('   ✓ Duplicate prevention system working correctly');
});

// Test 13: Mobile Collection Extraction
testRunner.test('Mobile Collection Extraction', () => {
    // Test if collection elements exist document-wide (mobile fix)
    const docCollectionElements = document.querySelectorAll('.detailItemsTable_SD_HZN_COLLECTION');
    
    console.log(`   Document-wide collection elements: ${docCollectionElements.length}`);
    
    if (docCollectionElements.length > 0) {
        let realCollectionFound = false;
        
        docCollectionElements.forEach((el, index) => {
            const text = el.textContent.trim();
            console.log(`   Collection element ${index}: "${text}"`);
            
            // Check if it's not just a label
            if (text && text.toLowerCase() !== 'collection' && text.length > 3) {
                realCollectionFound = true;
                
                // Test collection text extraction
                if (typeof springyMap !== 'undefined' && springyMap.extractCollectionText) {
                    const extracted = springyMap.extractCollectionText(el);
                    console.log(`   Extracted collection: "${extracted}"`);
                    
                    if (springyMap.isValidCollection && !springyMap.isValidCollection(extracted)) {
                        console.log(`   ⚠️ Warning: Extracted collection "${extracted}" is not valid`);
                    }
                }
            }
        });
        
        if (!realCollectionFound) {
            console.log('   ⚠️ Warning: Only collection labels found, no actual collection data');
        } else {
            console.log('   ✓ Real collection data found');
        }
    } else {
        console.log('   ⚠️ No collection elements found on this page');
    }
});

// Test 14: Mobile Call Number Validation
testRunner.test('Mobile Call Number Validation', () => {
    const callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER');
    
    console.log(`   Found ${callElements.length} call number elements`);
    
    if (callElements.length > 0) {
        let validCallNumbers = 0;
        let invalidCallNumbers = 0;
        
        callElements.forEach((el, index) => {
            const callText = el.textContent.trim();
            
            // Test the mobile call number validation logic
            const invalidCallTexts = ['Shelf Number', 'Call Number', 'Location', 'Collection'];
            const isInvalidCall = invalidCallTexts.some(invalid => 
                callText.toLowerCase().includes(invalid.toLowerCase())
            );
            
            const hasLettersAndNumbers = /[A-Za-z]/.test(callText) && /[0-9]/.test(callText);
            
            if (isInvalidCall || callText.length < 3 || !hasLettersAndNumbers) {
                invalidCallNumbers++;
                console.log(`   Invalid call ${index}: "${callText}" (label or invalid format)`);
            } else {
                validCallNumbers++;
                console.log(`   Valid call ${index}: "${callText}"`);
            }
        });
        
        console.log(`   ✓ Valid call numbers: ${validCallNumbers}, Invalid: ${invalidCallNumbers}`);
        
        if (validCallNumbers === 0) {
            throw new Error('No valid call numbers found');
        }
    } else {
        console.log('   ⚠️ No call number elements found');
    }
});

// Test 15: Mobile vs Desktop DOM Structure
testRunner.test('Mobile DOM Structure Analysis', () => {
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.log(`   Device type: ${isMobile ? 'MOBILE' : 'DESKTOP'}`);
    console.log(`   Viewport: ${window.innerWidth}x${window.innerHeight}`);
    
    // Test mobile-specific selectors
    const callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER');
    const libraryElements = document.querySelectorAll('.detailItemsTable_LIBRARY');
    const collectionElements = document.querySelectorAll('.detailItemsTable_SD_HZN_COLLECTION');
    
    console.log(`   Call elements: ${callElements.length}`);
    console.log(`   Library elements: ${libraryElements.length}`);
    console.log(`   Collection elements: ${collectionElements.length}`);
    
    // On mobile, test if call and collection elements are in different containers
    if (isMobile && callElements.length > 0 && collectionElements.length > 0) {
        const firstCall = callElements[0];
        const firstCollection = collectionElements[0];
        
        // Check if they share the same container
        const callContainer = firstCall.closest('tr') || firstCall.closest('div');
        const collectionInSameContainer = callContainer ? 
            callContainer.contains(firstCollection) : false;
        
        console.log(`   Call and collection in same container: ${collectionInSameContainer}`);
        
        if (!collectionInSameContainer) {
            console.log('   ✓ Mobile DOM structure confirmed: Collection elements separate from call elements');
        }
    }
    
    console.log('   ✓ DOM structure analysis complete');
});

// Utility Functions for Manual Testing
function testCurrentPage() {
    console.log('🔍 CURRENT PAGE ANALYSIS');
    console.log('='.repeat(30));
    
    // Device info
    console.log('📱 Device Info:');
    console.log(`   Mobile: ${typeof isMobileDevice !== 'undefined' ? isMobileDevice : 'undefined'}`);
    console.log(`   User Agent: ${navigator.userAgent}`);
    console.log(`   Viewport: ${window.innerWidth}x${window.innerHeight}`);
    
    // Page elements
    const callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER');
    const mapButtons = document.querySelectorAll('.springy-button-div');
    const processedElements = document.querySelectorAll('.libmaps-proc');
    
    console.log('\n📊 Page Elements:');
    console.log(`   Call Numbers: ${callElements.length}`);
    console.log(`   Map Buttons: ${mapButtons.length}`);
    console.log(`   Processed Elements: ${processedElements.length}`);
    
    if (callElements.length > 0) {
        console.log('\n📋 Call Element Details:');
        callElements.forEach((el, i) => {
            const button = el.querySelector('.springy-button-div');
            const container = el.closest('tr') || el.closest('div');
            console.log(`   ${i + 1}: "${el.textContent.trim()}" - Button: ${button ? 'Yes' : 'No'} - Container: ${container ? container.tagName : 'None'}`);
        });
    }
}

function quickMobileCheck() {
    console.log('📱 QUICK MOBILE CHECK');
    
    if (typeof isMobileDevice === 'undefined') {
        console.log('❌ Mobile detection not loaded');
        return;
    }
    
    console.log(`Mobile Device: ${isMobileDevice}`);
    
    if (!isMobileDevice) {
        console.log('ℹ️ Not mobile - mobile-specific logic may not run');
        return;
    }
    
    const callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER');
    console.log(`Call Elements: ${callElements.length}`);
    
    if (callElements.length === 0) {
        console.log('⚠️ No call elements found for mobile processing');
    } else {
        console.log('✅ Call elements available for mobile processing');
    }
}

// Export test runner
window.LibMapsTests = testRunner;
window.testCurrentPage = testCurrentPage;
window.quickMobileCheck = quickMobileCheck;

console.log('🧪 LibMaps Unit Tests Loaded!');
console.log('Available functions:');
console.log('  LibMapsTests.runAll() - Run all unit tests');
console.log('  testCurrentPage() - Analyze current page');
console.log('  quickMobileCheck() - Quick mobile functionality check');
console.log('\nRun LibMapsTests.runAll() to start testing!');