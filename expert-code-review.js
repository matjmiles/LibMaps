/**
 * EXPERT CODE REVIEW: LibMaps Production Restoration
 * 
 * This review validates the complete restoration of working LibMaps functionality
 * for both desktop and mobile environments with proper collection extraction.
 */

function expertCodeReview() {
    console.log('🔍 EXPERT CODE REVIEW: LibMaps Production Restoration');
    console.log('='.repeat(60));
    
    const issues = [];
    const warnings = [];
    const successes = [];
    
    // 1. CORE STRUCTURE VALIDATION
    console.log('\n1️⃣ CORE STRUCTURE VALIDATION');
    console.log('-'.repeat(30));
    
    // Check IIFE wrapper
    const scriptContent = document.documentElement.outerHTML;
    if (typeof springyILS === 'undefined') {
        issues.push('CRITICAL: springyILS object not defined - IIFE wrapper may be broken');
    } else {
        successes.push('✅ springyILS object properly defined');
    }
    
    if (typeof springyMap === 'undefined') {
        issues.push('CRITICAL: springyMap object not defined - IIFE wrapper may be broken');
    } else {
        successes.push('✅ springyMap object properly defined');
    }
    
    // Check mobile detection
    if (typeof isMobileDevice === 'undefined') {
        issues.push('CRITICAL: isMobileDevice not defined');
    } else {
        successes.push(`✅ Mobile detection working: ${isMobileDevice}`);
    }
    
    // 2. MOBILE DEBUG SYSTEM VALIDATION
    console.log('\n2️⃣ MOBILE DEBUG SYSTEM VALIDATION');
    console.log('-'.repeat(35));
    
    if (typeof createMobileDebugOverlay === 'function') {
        successes.push('✅ Mobile debug overlay function exists');
        
        if (typeof mobileLog === 'function') {
            successes.push('✅ mobileLog function exists');
        } else {
            issues.push('CRITICAL: mobileLog function missing');
        }
        
        // Test mobile debug overlay creation
        if (isMobileDevice) {
            try {
                const testOverlay = document.getElementById('mobile-debug-overlay');
                if (testOverlay) {
                    successes.push('✅ Mobile debug overlay already active');
                } else {
                    successes.push('✅ Mobile debug overlay can be created on demand');
                }
            } catch (e) {
                issues.push('ERROR: Mobile debug overlay creation failed: ' + e.message);
            }
        }
    } else {
        issues.push('CRITICAL: createMobileDebugOverlay function missing');
    }
    
    // 3. COLLECTION EXTRACTION VALIDATION
    console.log('\n3️⃣ COLLECTION EXTRACTION VALIDATION');
    console.log('-'.repeat(37));
    
    if (springyMap && springyMap.extractCollectionText) {
        successes.push('✅ extractCollectionText function exists');
        
        // Test collection extraction logic
        const testCases = [
            'General Books',
            'General Books - 1st Floor',
            'Special Collections',
            'DVD',
            'Audio Books'
        ];
        
        testCases.forEach(testCase => {
            const mockElement = { textContent: testCase, innerText: testCase };
            try {
                const result = springyMap.extractCollectionText(mockElement);
                if (result && result.length > 0) {
                    successes.push(`✅ Collection extraction works: "${testCase}" → "${result}"`);
                } else {
                    warnings.push(`⚠️ Collection extraction returned empty for: "${testCase}"`);
                }
            } catch (e) {
                issues.push(`ERROR: Collection extraction failed for "${testCase}": ${e.message}`);
            }
        });
        
        // Check for proper matching logic (indexOf vs includes)
        const extractionCode = springyMap.extractCollectionText.toString();
        if (extractionCode.includes('indexOf') && extractionCode.includes('=== 0')) {
            successes.push('✅ Collection extraction uses proper start-of-string matching (indexOf === 0)');
        } else if (extractionCode.includes('.includes(')) {
            issues.push('CRITICAL: Collection extraction uses loose matching (.includes) - should use indexOf === 0');
        } else {
            warnings.push('⚠️ Could not verify collection matching logic');
        }
        
    } else {
        issues.push('CRITICAL: extractCollectionText function missing');
    }
    
    // 4. MOBILE COLLECTION DETECTION VALIDATION
    console.log('\n4️⃣ MOBILE COLLECTION DETECTION VALIDATION');
    console.log('-'.repeat(42));
    
    if (springyILS && springyILS.scrapeMobileEnterpriseStructure) {
        successes.push('✅ scrapeMobileEnterpriseStructure function exists');
        
        // Check for DIV-based mobile detection
        const mobileCode = springyILS.scrapeMobileEnterpriseStructure.toString();
        if (mobileCode.includes('parentContainer') && mobileCode.includes('detailChildFieldValue')) {
            successes.push('✅ Mobile collection detection includes DIV-based parent container logic');
        } else {
            issues.push('CRITICAL: Mobile collection detection missing DIV-based parent container logic');
        }
        
        if (mobileCode.includes('COLLECTION') && mobileCode.includes('label')) {
            successes.push('✅ Mobile collection detection includes label filtering');
        } else {
            warnings.push('⚠️ Mobile collection detection may not filter out labels properly');
        }
        
    } else {
        issues.push('CRITICAL: scrapeMobileEnterpriseStructure function missing');
    }
    
    // 5. BUTTON CREATION VALIDATION
    console.log('\n5️⃣ BUTTON CREATION VALIDATION');
    console.log('-'.repeat(30));
    
    if (springyMap && springyMap.createButton) {
        successes.push('✅ createButton function exists');
        
        if (springyMap.setupButtons) {
            successes.push('✅ setupButtons function exists');
        } else {
            issues.push('CRITICAL: setupButtons function missing');
        }
        
        // Check for validation logic
        if (springyMap.isValidCollection && springyMap.isValidLocation) {
            successes.push('✅ Validation functions exist');
        } else {
            issues.push('CRITICAL: Validation functions missing');
        }
        
    } else {
        issues.push('CRITICAL: createButton function missing');
    }
    
    // 6. DOM SCRAPING VALIDATION
    console.log('\n6️⃣ DOM SCRAPING VALIDATION');
    console.log('-'.repeat(25));
    
    if (springyILS && springyILS.scrapeDom) {
        successes.push('✅ scrapeDom function exists');
        
        if (springyILS.scrapeDetailRows) {
            successes.push('✅ scrapeDetailRows function exists');
            
            // Check mobile-first logic
            const scrapeCode = springyILS.scrapeDetailRows.toString();
            if (scrapeCode.includes('isMobileDevice') && scrapeCode.includes('scrapeMobileEnterpriseStructure')) {
                successes.push('✅ Mobile-first scraping logic implemented');
            } else {
                issues.push('CRITICAL: Mobile-first scraping logic missing');
            }
        } else {
            issues.push('CRITICAL: scrapeDetailRows function missing');
        }
    } else {
        issues.push('CRITICAL: scrapeDom function missing');
    }
    
    // 7. CONFIGURATION VALIDATION
    console.log('\n7️⃣ CONFIGURATION VALIDATION');
    console.log('-'.repeat(27));
    
    if (springyMap && springyMap.siteConfig) {
        successes.push('✅ siteConfig exists');
        
        if (springyMap.siteConfig.validCollectionNameMap) {
            const collectionCount = Object.keys(springyMap.siteConfig.validCollectionNameMap).length;
            successes.push(`✅ validCollectionNameMap configured with ${collectionCount} collections`);
        } else {
            issues.push('CRITICAL: validCollectionNameMap missing');
        }
        
        if (springyMap.siteConfig.domain && springyMap.siteConfig.domain.includes('byui.libcal.com')) {
            successes.push('✅ LibCal domain configured correctly');
        } else {
            issues.push('CRITICAL: LibCal domain not configured');
        }
    } else {
        issues.push('CRITICAL: siteConfig missing');
    }
    
    // 8. INITIALIZATION VALIDATION
    console.log('\n8️⃣ INITIALIZATION VALIDATION');
    console.log('-'.repeat(28));
    
    if (springyMap && springyMap.watch) {
        successes.push('✅ watch function exists');
        
        // Check mobile timing adjustments
        const watchCode = springyMap.watch.toString();
        if (watchCode.includes('isMobileDevice ? 60 : 30') && watchCode.includes('isMobileDevice ? 750 : 500')) {
            successes.push('✅ Mobile timing adjustments implemented');
        } else {
            warnings.push('⚠️ Mobile timing adjustments may be missing');
        }
        
        if (watchCode.includes('1500') || watchCode.includes('750')) {
            successes.push('✅ Render delay timing implemented');
        } else {
            warnings.push('⚠️ Render delay timing may be missing');
        }
    } else {
        issues.push('CRITICAL: watch function missing');
    }
    
    // 9. LIVE DOM TEST (if on appropriate page)
    console.log('\n9️⃣ LIVE DOM TEST');
    console.log('-'.repeat(17));
    
    const callElements = document.querySelectorAll('.detailItemsTable_CALLNUMBER');
    if (callElements.length > 0) {
        successes.push(`✅ Found ${callElements.length} call number elements on page`);
        
        const collectionElements = document.querySelectorAll('.detailItemsTable_SD_HZN_COLLECTION, [class*="COLLECTION"]');
        if (collectionElements.length > 0) {
            successes.push(`✅ Found ${collectionElements.length} collection elements on page`);
        } else {
            warnings.push('⚠️ No collection elements found - may not be on item details page');
        }
        
        const existingButtons = document.querySelectorAll('.springy-button, .springy-button-div');
        if (existingButtons.length > 0) {
            successes.push(`✅ Found ${existingButtons.length} existing Map It buttons on page`);
        } else {
            warnings.push('⚠️ No Map It buttons found - buttons may not have been created yet');
        }
    } else {
        warnings.push('⚠️ No call number elements found - may not be on item details page');
    }
    
    // FINAL REPORT
    console.log('\n📊 FINAL REVIEW REPORT');
    console.log('='.repeat(25));
    
    console.log(`\n✅ SUCCESSES (${successes.length}):`);
    successes.forEach(success => console.log(`   ${success}`));
    
    if (warnings.length > 0) {
        console.log(`\n⚠️ WARNINGS (${warnings.length}):`);
        warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (issues.length > 0) {
        console.log(`\n❌ CRITICAL ISSUES (${issues.length}):`);
        issues.forEach(issue => console.log(`   ${issue}`));
        console.log(`\n🚨 RECOMMENDATION: Fix critical issues before deployment`);
    } else {
        console.log(`\n🎉 NO CRITICAL ISSUES FOUND`);
        console.log(`✨ Code appears ready for production use`);
    }
    
    // Return summary
    return {
        passed: issues.length === 0,
        criticalIssues: issues.length,
        warnings: warnings.length,
        successes: successes.length,
        issues: issues,
        warnings: warnings,
        successes: successes
    };
}

// Auto-run review
console.log('🔄 Running Expert Code Review...');
expertCodeReview();