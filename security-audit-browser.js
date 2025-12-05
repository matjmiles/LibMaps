/**
 * SECURITY AUDIT RESULTS - LibMaps Production Code
 * 
 * Run this analysis by copying and pasting into browser console on a LibMaps-enabled page
 */

console.log('🛡️ SECURITY & STABILITY AUDIT: LibMaps Production Analysis');
console.log('🔴 RED TEAM PERSPECTIVE: Finding what breaks in production');
console.log('='.repeat(65));

const vulnerabilities = [];
const performanceIssues = [];
const stabilityRisks = [];
const productionFailures = [];
const recommendations = [];

// 1. INJECTION & XSS VULNERABILITIES
console.log('\n🚨 1. INJECTION & XSS VULNERABILITY SCAN');
console.log('-'.repeat(45));

// Check maps.js source for vulnerabilities
if (typeof springyMap !== 'undefined') {
    // Check for innerHTML usage in mobile debug overlay
    if (typeof createMobileDebugOverlay !== 'undefined') {
        const overlayCode = createMobileDebugOverlay.toString();
        if (overlayCode.includes('innerHTML')) {
            vulnerabilities.push('HIGH RISK: innerHTML usage in mobile debug overlay - XSS vector');
            recommendations.push('🔧 Replace innerHTML with textContent in debug overlay');
        }
    }
    
    // Check modal HTML generation
    if (springyMap.siteConfig && springyMap.siteConfig.getModalHtml) {
        const modalCode = springyMap.siteConfig.getModalHtml.toString();
        if (modalCode.includes('${') && !modalCode.includes('escape')) {
            vulnerabilities.push('CRITICAL: Template literals in modal HTML - XSS vulnerability');
            recommendations.push('🔧 Escape all template variables in modal HTML');
        }
    }
    
    // Check URL parameter handling
    if (springyMap.createButton) {
        const buttonCode = springyMap.createButton.toString();
        if (buttonCode.includes('URLSearchParams') && !buttonCode.includes('encodeURI')) {
            vulnerabilities.push('MEDIUM RISK: URL parameters not encoded - potential injection');
            recommendations.push('🔧 Encode URL parameters before setting');
        }
    }
} else {
    productionFailures.push('CRITICAL: springyMap object not defined - script failed to load');
}

// 2. MEMORY LEAKS & PERFORMANCE BOTTLENECKS
console.log('\n⚡ 2. PERFORMANCE & MEMORY LEAK ANALYSIS');
console.log('-'.repeat(43));

// Check for interval cleanup
if (typeof springyMap !== 'undefined' && springyMap.watch) {
    const watchCode = springyMap.watch.toString();
    if (watchCode.includes('setInterval') && watchCode.includes('clearInterval')) {
        console.log('   ✅ Interval properly cleaned up in watch function');
    } else if (watchCode.includes('setInterval')) {
        performanceIssues.push('HIGH RISK: setInterval without guaranteed cleanup - memory leak');
        recommendations.push('🔧 Add window.beforeunload cleanup for intervals');
    }
}

// Check for excessive debug logging
let logCount = 0;
if (typeof mobileLog !== 'undefined') {
    logCount += 10; // Estimate based on mobile logging
}
if (typeof springyMap !== 'undefined' && springyMap.extractCollectionText) {
    const extractCode = springyMap.extractCollectionText.toString();
    logCount += (extractCode.match(/console\.log/g) || []).length;
}
if (logCount > 5) {
    performanceIssues.push(`MEDIUM RISK: ${logCount}+ debug statements in production - performance impact`);
    recommendations.push('🔧 Remove debug logging before production deployment');
}

// 3. ERROR HANDLING & FAULT TOLERANCE
console.log('\n💥 3. ERROR HANDLING & FAULT TOLERANCE ANALYSIS');  
console.log('-'.repeat(48));

// Check collection extraction error handling
if (typeof springyMap !== 'undefined' && springyMap.extractCollectionText) {
    const extractCode = springyMap.extractCollectionText.toString();
    if (extractCode.includes('try') && extractCode.includes('catch')) {
        console.log('   ✅ Error handling present in collection extraction');
    } else {
        stabilityRisks.push('HIGH RISK: No error handling in collection extraction - will break on exceptions');
        recommendations.push('🔧 Wrap collection extraction in try-catch blocks');
    }
    
    // Check null checks
    if (extractCode.includes('if (!collectionElement)')) {
        console.log('   ✅ Null check present for collection element');
    } else {
        stabilityRisks.push('MEDIUM RISK: Missing null checks in collection extraction');
    }
}

// 4. PRODUCTION FAILURE SCENARIOS
console.log('\n🔥 4. PRODUCTION FAILURE SCENARIO TESTING');
console.log('-'.repeat(44));

// Test DOM availability
const testElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER');
if (testElements.length === 0) {
    productionFailures.push('WARNING: No call number elements found - may fail on this page type');
    recommendations.push('🔧 Test script on various Enterprise page types');
} else {
    console.log(`   ✅ Found ${testElements.length} call number elements on page`);
}

// Test collection elements
const collectionElements = document.querySelectorAll('.detailItemsTable_SD_HZN_COLLECTION, [class*="COLLECTION"]');
if (collectionElements.length === 0) {
    productionFailures.push('WARNING: No collection elements found - mobile detection may fail');
    recommendations.push('🔧 Verify mobile collection detection selectors');
} else {
    console.log(`   ✅ Found ${collectionElements.length} collection elements on page`);
}

// 5. MOBILE-SPECIFIC VULNERABILITIES
console.log('\n📱 5. MOBILE-SPECIFIC VULNERABILITY SCAN');
console.log('-'.repeat(42));

// Check mobile detection reliability
if (typeof isMobileDevice !== 'undefined') {
    console.log(`   📱 Mobile device detected: ${isMobileDevice}`);
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Mobile') && !isMobileDevice) {
        stabilityRisks.push('MEDIUM RISK: Mobile detection may be unreliable');
        recommendations.push('🔧 Improve mobile detection regex');
    }
} else {
    stabilityRisks.push('HIGH RISK: Mobile detection variable not defined');
}

// Check debug overlay injection risk
if (typeof createMobileDebugOverlay !== 'undefined' && isMobileDevice) {
    const existingOverlay = document.getElementById('mobile-debug-overlay');
    if (existingOverlay) {
        console.log('   🔍 Mobile debug overlay active - contains sensitive debug info');
        vulnerabilities.push('LOW RISK: Debug overlay visible in production - information disclosure');
        recommendations.push('🔧 Remove debug overlay in production builds');
    }
}

// 6. DATA VALIDATION & SANITIZATION
console.log('\n🧹 6. DATA VALIDATION & SANITIZATION AUDIT');
console.log('-'.repeat(44));

// Test collection text sanitization
if (typeof springyMap !== 'undefined' && springyMap.cleanText) {
    console.log('   ✅ Text cleaning function exists');
    
    // Test with malicious input
    try {
        const maliciousInput = '<script>alert("XSS")</script>';
        const cleaned = springyMap.cleanText(maliciousInput);
        if (cleaned.includes('<script>')) {
            vulnerabilities.push('CRITICAL: Text cleaning does not remove script tags');
            recommendations.push('🔧 Implement proper HTML sanitization');
        } else {
            console.log('   ✅ Text cleaning removes script tags');
        }
    } catch (e) {
        stabilityRisks.push('MEDIUM RISK: Text cleaning function may throw exceptions');
    }
} else {
    vulnerabilities.push('MEDIUM RISK: No text cleaning function found');
    recommendations.push('🔧 Implement text sanitization for user input');
}

// 7. PERFORMANCE BOTTLENECK TESTING
console.log('\n⚡ 7. LIVE PERFORMANCE TESTING');
console.log('-'.repeat(32));

const startTime = performance.now();

// Test DOM query performance
try {
    for (let i = 0; i < 100; i++) {
        document.querySelectorAll('.detailItemsTable_CALLNUMBER');
    }
    const queryTime = performance.now() - startTime;
    
    if (queryTime > 10) {
        performanceIssues.push(`MEDIUM RISK: DOM queries taking ${queryTime.toFixed(2)}ms - potential bottleneck`);
        recommendations.push('🔧 Cache DOM query results');
    } else {
        console.log(`   ✅ DOM query performance acceptable (${queryTime.toFixed(2)}ms)`);
    }
} catch (e) {
    stabilityRisks.push('HIGH RISK: DOM querying throws exceptions');
}

// 8. DEPENDENCY & SERVICE AVAILABILITY
console.log('\n🔗 8. EXTERNAL DEPENDENCY ANALYSIS');
console.log('-'.repeat(36));

if (typeof springyMap !== 'undefined' && springyMap.siteConfig) {
    const domain = springyMap.siteConfig.domain;
    if (domain && domain.includes('libcal.com')) {
        console.log(`   🌐 External dependency: ${domain}`);
        stabilityRisks.push('MEDIUM RISK: External service dependency - will fail if service down');
        recommendations.push('🔧 Implement timeout and fallback for external service calls');
        
        // Test if domain is reachable (simulation)
        console.log('   ⚠️ Cannot test service availability from browser security restrictions');
        recommendations.push('🔧 Implement service health checks');
    }
} else {
    productionFailures.push('CRITICAL: Site configuration missing or invalid');
}

// FINAL SECURITY ASSESSMENT
console.log('\n🛡️ SECURITY & STABILITY AUDIT RESULTS');
console.log('='.repeat(42));

let riskScore = 0;
riskScore += vulnerabilities.length * 3;
riskScore += performanceIssues.length * 2;
riskScore += stabilityRisks.length * 1;
riskScore += productionFailures.length * 4;

if (vulnerabilities.length > 0) {
    console.log(`\n🚨 SECURITY VULNERABILITIES (${vulnerabilities.length}):`);
    vulnerabilities.forEach(vuln => console.log(`   ${vuln}`));
}

if (performanceIssues.length > 0) {
    console.log(`\n⚡ PERFORMANCE ISSUES (${performanceIssues.length}):`);
    performanceIssues.forEach(issue => console.log(`   ${issue}`));
}

if (stabilityRisks.length > 0) {
    console.log(`\n🏁 STABILITY RISKS (${stabilityRisks.length}):`);
    stabilityRisks.forEach(risk => console.log(`   ${risk}`));
}

if (productionFailures.length > 0) {
    console.log(`\n🔥 PRODUCTION FAILURE RISKS (${productionFailures.length}):`);
    productionFailures.forEach(failure => console.log(`   ${failure}`));
}

if (recommendations.length > 0) {
    console.log(`\n🔧 SECURITY RECOMMENDATIONS (${recommendations.length}):`);
    recommendations.forEach(rec => console.log(`   ${rec}`));
}

// Risk Assessment
console.log(`\n📊 OVERALL SECURITY RISK SCORE: ${riskScore}/50`);
if (riskScore <= 5) {
    console.log('✅ LOW RISK - Generally secure for production');
} else if (riskScore <= 15) {
    console.log('⚠️ MEDIUM RISK - Address issues before production');
} else {
    console.log('🚨 HIGH RISK - Critical security issues require immediate attention');
}

// Specific LibMaps Recommendations
console.log('\n💡 LIBMAPS-SPECIFIC SECURITY RECOMMENDATIONS:');
console.log('   1. Remove all debug logging and overlays before production');
console.log('   2. Implement proper error boundaries for DOM operations'); 
console.log('   3. Add input validation for all collection text processing');
console.log('   4. Use CSP headers to prevent XSS attacks');
console.log('   5. Implement service worker for offline fallback');
console.log('   6. Add performance monitoring for DOM operations');
console.log('   7. Test thoroughly on various Enterprise page layouts');

console.log('\n🔍 AUDIT COMPLETE - Review findings above');

// Return results for programmatic access
const auditResults = {
    riskScore: riskScore,
    vulnerabilities: vulnerabilities,
    performanceIssues: performanceIssues,
    stabilityRisks: stabilityRisks,
    productionFailures: productionFailures,
    recommendations: recommendations,
    securityLevel: riskScore <= 5 ? 'LOW' : riskScore <= 15 ? 'MEDIUM' : 'HIGH'
};

console.log('\n📋 Audit results stored in auditResults variable for further analysis');
auditResults;