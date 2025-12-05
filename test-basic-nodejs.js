/**
 * LibMaps Node.js Basic Tests
 * 
 * Basic validation tests that can run in Node.js without DOM dependencies.
 * For full testing, use libmaps-unit-tests.js in a browser.
 */

console.log('🧪 LIBMAPS BASIC NODE.JS TESTS');
console.log('='.repeat(40));

// Mock basic globals that maps.js expects
global.console = console;
global.document = {
    createElement: () => ({ style: {}, textContent: '', appendChild: () => {} }),
    body: { appendChild: () => {} },
    addEventListener: () => {},
    readyState: 'complete'
};
global.window = { 
    addEventListener: () => {},
    innerWidth: 1920,
    innerHeight: 1080
};
global.navigator = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

// Simple test framework
let testsPassed = 0;
let testsFailed = 0;

function test(name, testFunc) {
    try {
        console.log(`\n📋 Testing: ${name}`);
        testFunc();
        console.log(`✅ PASSED: ${name}`);
        testsPassed++;
    } catch (error) {
        console.error(`❌ FAILED: ${name}`);
        console.error(`   Error: ${error.message}`);
        testsFailed++;
    }
}

// Test 1: File Loading
test('Maps.js File Exists', () => {
    const fs = require('fs');
    const path = require('path');
    
    const mapsPath = path.join(__dirname, 'maps.js');
    if (!fs.existsSync(mapsPath)) {
        throw new Error('maps.js file not found');
    }
    
    const content = fs.readFileSync(mapsPath, 'utf8');
    if (content.length < 1000) {
        throw new Error('maps.js file seems too small');
    }
    
    console.log(`   ✓ maps.js found (${Math.round(content.length / 1024)}KB)`);
});

// Test 2: Core Structure Check
test('Maps.js Structure', () => {
    const fs = require('fs');
    const mapsContent = fs.readFileSync('maps.js', 'utf8');
    
    const requiredPatterns = [
        'springyMap',
        'springyILS', 
        'isMobileDevice',
        'extractCollectionText',
        'isValidCollection',
        'validCollectionNameMap'
    ];
    
    requiredPatterns.forEach(pattern => {
        if (!mapsContent.includes(pattern)) {
            throw new Error(`Missing required pattern: ${pattern}`);
        }
    });
    
    console.log('   ✓ All required patterns found in maps.js');
});

// Test 3: Basic JavaScript Syntax
test('Maps.js Syntax Validation', () => {
    const fs = require('fs');
    const mapsContent = fs.readFileSync('maps.js', 'utf8');
    
    // Try to parse as JavaScript (basic syntax check)
    try {
        // Don't execute, just parse for syntax errors
        new Function(mapsContent);
    } catch (syntaxError) {
        throw new Error(`Syntax error in maps.js: ${syntaxError.message}`);
    }
    
    console.log('   ✓ No syntax errors found');
});

// Test 4: Mobile Detection Pattern
test('Mobile Detection Logic', () => {
    const fs = require('fs');
    const mapsContent = fs.readFileSync('maps.js', 'utf8');
    
    // Check for mobile detection pattern
    if (!mapsContent.includes('iPhone|iPad|iPod|Android')) {
        throw new Error('Mobile detection pattern not found');
    }
    
    // Check for mobile-specific logic
    if (!mapsContent.includes('isMobileDevice')) {
        throw new Error('isMobileDevice variable not found');
    }
    
    console.log('   ✓ Mobile detection logic present');
});

// Test 5: Collection Validation Structure
test('Collection Validation Structure', () => {
    const fs = require('fs');
    const mapsContent = fs.readFileSync('maps.js', 'utf8');
    
    // Check for collection validation components
    const required = [
        'validCollectionNameMap',
        'General Books',
        'isValidCollection',
        'extractCollectionText'
    ];
    
    required.forEach(item => {
        if (!mapsContent.includes(item)) {
            throw new Error(`Missing collection component: ${item}`);
        }
    });
    
    console.log('   ✓ Collection validation structure present');
});

// Test 6: Security Features
test('Security Features Present', () => {
    const fs = require('fs');
    const mapsContent = fs.readFileSync('maps.js', 'utf8');
    
    // Check for XSS prevention
    if (mapsContent.includes('<script>') && !mapsContent.includes('remove')) {
        console.log('   ⚠️ Warning: Script tags found without removal logic');
    }
    
    // Check for text cleaning
    if (!mapsContent.includes('cleanText')) {
        throw new Error('Text cleaning function not found');
    }
    
    console.log('   ✓ Security features present');
});

// Test 7: Button Creation Logic
test('Button Creation Logic', () => {
    const fs = require('fs');
    const mapsContent = fs.readFileSync('maps.js', 'utf8');
    
    const buttonComponents = [
        'createButton',
        'springy-button',
        'Map It',
        'createModal'
    ];
    
    buttonComponents.forEach(component => {
        if (!mapsContent.includes(component)) {
            throw new Error(`Missing button component: ${component}`);
        }
    });
    
    console.log('   ✓ Button creation logic present');
});

// Test 8: Unit Test File Structure
test('Unit Test File Structure', () => {
    const fs = require('fs');
    
    if (!fs.existsSync('libmaps-unit-tests.js')) {
        throw new Error('libmaps-unit-tests.js not found');
    }
    
    const testContent = fs.readFileSync('libmaps-unit-tests.js', 'utf8');
    
    const testComponents = [
        'LibMapsTestRunner',
        'runAll',
        'Collection Validation',
        'Mobile Detection'
    ];
    
    testComponents.forEach(component => {
        if (!testContent.includes(component)) {
            throw new Error(`Missing test component: ${component}`);
        }
    });
    
    console.log('   ✓ Unit test file structure valid');
});

// Run all tests and show results
console.log('\n' + '='.repeat(40));
console.log('🧪 BASIC TEST RESULTS SUMMARY:');
console.log(`   Total Tests: ${testsPassed + testsFailed}`);
console.log(`   Passed: ${testsPassed}`);
console.log(`   Failed: ${testsFailed}`);
console.log(`   Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);

if (testsFailed === 0) {
    console.log('\n✅ ALL BASIC TESTS PASSED!');
    console.log('📝 Ready for browser-based testing');
} else {
    console.log('\n❌ Some tests failed - check issues above');
}

console.log('\n📋 NEXT STEPS:');
console.log('1. Fix any failed tests above');
console.log('2. Run full tests in browser:');
console.log('   - Navigate to a book details page');
console.log('   - Load maps.js in browser console');
console.log('   - Load libmaps-unit-tests.js');
console.log('   - Run: LibMapsTests.runAll()');

process.exit(testsFailed > 0 ? 1 : 0);