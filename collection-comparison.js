/**
 * Collection Mapping Comparison Tool
 * 
 * This tool helps identify differences between mapsOld.js and maps.js
 * by testing both versions on the same page and comparing results.
 * 
 * Usage:
 * 1. Load a book page in Enterprise
 * 2. Paste this script in console
 * 3. Review the comparison results
 * 4. Look for differences in extraction or validation
 */

// Comparison Test Function
function runCollectionComparison() {
    console.log('🔍 COLLECTION MAPPING COMPARISON DIAGNOSTIC');
    console.log('='.repeat(50));
    
    // Test current maps.js behavior
    console.log('\n📊 TESTING CURRENT maps.js BEHAVIOR:');
    const currentResults = testCurrentExtraction();
    
    // Test original mapsOld.js behavior  
    console.log('\n📊 TESTING ORIGINAL mapsOld.js BEHAVIOR:');
    const originalResults = testOriginalExtraction();
    
    // Compare results
    console.log('\n🔄 COMPARISON ANALYSIS:');
    compareResults(currentResults, originalResults);
    
    return {
        current: currentResults,
        original: originalResults
    };
}

// Test current maps.js extraction logic
function testCurrentExtraction() {
    const results = {
        version: 'maps.js (current)',
        collectionElements: [],
        extractedCollections: [],
        validatedCollections: [],
        locations: [],
        errors: []
    };
    
    try {
        // Find collection elements using current logic
        const collectionEls = document.querySelectorAll('td[id^="item_location_"]');
        console.log(`   Found ${collectionEls.length} collection elements`);
        
        collectionEls.forEach((el, index) => {
            try {
                const elementInfo = {
                    index: index,
                    id: el.id,
                    innerHTML: el.innerHTML,
                    textContent: el.textContent.trim()
                };
                results.collectionElements.push(elementInfo);
                console.log(`   Element ${index}: ID="${el.id}", Text="${elementInfo.textContent}"`);
                
                // Test current extraction logic (if it exists in maps.js)
                if (typeof springyMap !== 'undefined' && springyMap.extractCollectionText) {
                    const extracted = springyMap.extractCollectionText(el);
                    results.extractedCollections.push(extracted);
                    console.log(`   Extracted: "${extracted}"`);
                    
                    // Test validation
                    if (springyMap.isValidCollection) {
                        const isValid = springyMap.isValidCollection(extracted);
                        results.validatedCollections.push({
                            collection: extracted,
                            valid: isValid
                        });
                        console.log(`   Valid: ${isValid}`);
                    }
                } else {
                    console.log('   ⚠️ Current extraction functions not found');
                }
                
            } catch (error) {
                const errorInfo = `Element ${index} error: ${error.message}`;
                results.errors.push(errorInfo);
                console.error(`   ❌ ${errorInfo}`);
            }
        });
        
    } catch (error) {
        results.errors.push(`Current extraction error: ${error.message}`);
        console.error(`❌ ${error.message}`);
    }
    
    return results;
}

// Test original mapsOld.js extraction logic (simulated)
function testOriginalExtraction() {
    const results = {
        version: 'mapsOld.js (original)',
        collectionElements: [],
        extractedCollections: [],
        validatedCollections: [],
        locations: [],
        errors: []
    };
    
    try {
        // Find collection elements using original selector logic
        const collectionEls = document.querySelectorAll('td[id^="item_location_"]');
        console.log(`   Found ${collectionEls.length} collection elements (original method)`);
        
        collectionEls.forEach((el, index) => {
            try {
                const elementInfo = {
                    index: index,
                    id: el.id,
                    innerHTML: el.innerHTML,
                    textContent: el.textContent.trim()
                };
                results.collectionElements.push(elementInfo);
                console.log(`   Element ${index}: ID="${el.id}", Text="${elementInfo.textContent}"`);
                
                // Simulate original extraction logic (simple text content)
                const originalExtracted = el.textContent.trim();
                results.extractedCollections.push(originalExtracted);
                console.log(`   Original Extracted: "${originalExtracted}"`);
                
                // Test against known collection mappings
                const isValidOriginal = testOriginalValidation(originalExtracted);
                results.validatedCollections.push({
                    collection: originalExtracted,
                    valid: isValidOriginal
                });
                console.log(`   Valid (original logic): ${isValidOriginal}`);
                
            } catch (error) {
                const errorInfo = `Original element ${index} error: ${error.message}`;
                results.errors.push(errorInfo);
                console.error(`   ❌ ${errorInfo}`);
            }
        });
        
    } catch (error) {
        results.errors.push(`Original extraction error: ${error.message}`);
        console.error(`❌ ${error.message}`);
    }
    
    return results;
}

// Test original validation logic
function testOriginalValidation(collectionText) {
    // Known collections from mapsOld.js - you'll need to update this based on your actual collections
    const originalValidCollections = [
        'CURRICULUM MATERIALS CENTER',
        'GENERAL COLLECTION', 
        'REFERENCE',
        'PERIODICALS',
        'SPECIAL COLLECTIONS',
        'MEDIA CENTER',
        'RESERVE',
        // Add other known valid collections from your system
    ];
    
    return originalValidCollections.some(validCollection => 
        collectionText.toUpperCase().includes(validCollection.toUpperCase())
    );
}

// Compare the results between versions
function compareResults(current, original) {
    console.log('\n📋 DETAILED COMPARISON:');
    
    // Compare element counts
    console.log(`\n   Elements Found:`);
    console.log(`   Current: ${current.collectionElements.length}`);
    console.log(`   Original: ${original.collectionElements.length}`);
    
    // Compare extracted values
    console.log(`\n   Extracted Collections:`);
    console.log('   Current:', current.extractedCollections);
    console.log('   Original:', original.extractedCollections);
    
    // Find differences in extraction
    const extractionDiffs = findExtractionDifferences(current.extractedCollections, original.extractedCollections);
    if (extractionDiffs.length > 0) {
        console.log(`\n   ⚠️ EXTRACTION DIFFERENCES FOUND:`);
        extractionDiffs.forEach(diff => console.log(`   ${diff}`));
    }
    
    // Compare validation results
    console.log(`\n   Validation Results:`);
    console.log('   Current Valid:', current.validatedCollections.filter(v => v.valid).length);
    console.log('   Original Valid:', original.validatedCollections.filter(v => v.valid).length);
    
    // Find validation differences
    const validationDiffs = findValidationDifferences(current.validatedCollections, original.validatedCollections);
    if (validationDiffs.length > 0) {
        console.log(`\n   ⚠️ VALIDATION DIFFERENCES FOUND:`);
        validationDiffs.forEach(diff => console.log(`   ${diff}`));
    }
    
    // Summary
    console.log(`\n   Error Counts:`);
    console.log(`   Current Errors: ${current.errors.length}`);
    console.log(`   Original Errors: ${original.errors.length}`);
    
    if (current.errors.length > 0) {
        console.log('   Current Errors:', current.errors);
    }
    if (original.errors.length > 0) {
        console.log('   Original Errors:', original.errors);
    }
}

// Find differences in extraction results
function findExtractionDifferences(currentExtractions, originalExtractions) {
    const differences = [];
    
    const maxLength = Math.max(currentExtractions.length, originalExtractions.length);
    
    for (let i = 0; i < maxLength; i++) {
        const current = currentExtractions[i] || '[MISSING]';
        const original = originalExtractions[i] || '[MISSING]';
        
        if (current !== original) {
            differences.push(`Index ${i}: Current="${current}" vs Original="${original}"`);
        }
    }
    
    return differences;
}

// Find differences in validation results
function findValidationDifferences(currentValidations, originalValidations) {
    const differences = [];
    
    const maxLength = Math.max(currentValidations.length, originalValidations.length);
    
    for (let i = 0; i < maxLength; i++) {
        const current = currentValidations[i];
        const original = originalValidations[i];
        
        if (!current || !original) {
            differences.push(`Index ${i}: Missing validation result`);
            continue;
        }
        
        if (current.valid !== original.valid) {
            differences.push(`Index ${i}: "${current.collection}" - Current:${current.valid} vs Original:${original.valid}`);
        }
    }
    
    return differences;
}

// DOM Analysis Helper
function analyzeDOMStructure() {
    console.log('\n🔍 DOM STRUCTURE ANALYSIS:');
    console.log('='.repeat(30));
    
    // Check for different possible collection selectors
    const selectors = [
        'td[id^="item_location_"]',
        'td[id*="location"]',
        '.collection',
        '.location',
        '[data-collection]',
        '[data-location]'
    ];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`\n   Selector: ${selector}`);
            console.log(`   Count: ${elements.length}`);
            elements.forEach((el, index) => {
                console.log(`   Element ${index}: ${el.textContent.trim().substring(0, 50)}...`);
            });
        }
    });
    
    // Check if we're on mobile or desktop view
    console.log(`\n   Device Detection:`);
    console.log(`   User Agent: ${navigator.userAgent}`);
    console.log(`   Screen Width: ${screen.width}`);
    console.log(`   Viewport Width: ${window.innerWidth}`);
    
    // Check if mobile-specific elements exist
    const mobileIndicators = [
        '.mobile-view',
        '.responsive',
        '[data-mobile]',
        '.collapsed'
    ];
    
    mobileIndicators.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`   Mobile indicator "${selector}": ${elements.length} elements`);
        }
    });
}

// Quick Test Function
function quickCollectionTest() {
    console.log('⚡ QUICK COLLECTION TEST');
    console.log('='.repeat(25));
    
    analyzeDOMStructure();
    return runCollectionComparison();
}

// Export for easy access
console.log('📚 Collection Comparison Tool Loaded!');
console.log('Usage:');
console.log('  runCollectionComparison() - Full comparison test');
console.log('  quickCollectionTest() - Quick test with DOM analysis');
console.log('  analyzeDOMStructure() - DOM structure only');
console.log('\nRun quickCollectionTest() to start diagnosis!');