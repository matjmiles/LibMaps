# Collection Mapping Troubleshooting Plan

## Problem Analysis
- **Issue**: Wrong collection codes and locations showing on map
- **When Introduced**: During mobile compatibility work
- **Impact**: Maps showing incorrect locations for books

## Phase 1: Data Collection Diagnostic

### Step 1.1: Run Collection Diagnostic
1. Load a test book page in Enterprise
2. Run `diagnostic-collection.js` in console with current `maps.js`
3. Record the extracted collection and location values
4. Note any validation failures

### Step 1.2: Baseline Comparison  
1. Load same book page
2. Run `diagnostic-collection.js` with original `mapsOld.js`
3. Compare extraction results
4. Identify differences in extracted values

### Step 1.3: Raw DOM Analysis
1. Inspect actual HTML elements for collection/location
2. Check if mobile compatibility changes affected selectors
3. Verify DOM structure matches our assumptions

## Phase 2: Root Cause Analysis

### Potential Causes to Investigate:

#### A. Collection Text Extraction Changes
- **Issue**: `extractCollectionText()` function modified during mobile work
- **Check**: Compare extraction logic between `mapsOld.js` and `maps.js`
- **Look For**: Changes in text cleaning, partial matching, case sensitivity

#### B. Mobile Detection Interference  
- **Issue**: Mobile-specific extraction affecting desktop
- **Check**: Is mobile extraction running on desktop?
- **Look For**: Mobile-first logic overriding desktop extraction

#### C. DOM Selector Changes
- **Issue**: New selectors not finding correct elements
- **Check**: Verify selector specificity and accuracy
- **Look For**: Added mobile selectors interfering with desktop

#### D. Collection Mapping Errors
- **Issue**: Collection names not matching map service expectations
- **Check**: Compare `validCollectionNameMap` with actual extracted values
- **Look For**: Missing collections or name mismatches

#### E. Location Normalization Issues
- **Issue**: `normalizeLocationForService()` function problems
- **Check**: Verify location mapping logic
- **Look For**: Changes in location name handling

## Phase 3: Systematic Testing

### Test Matrix:
| Device | Browser | mapsOld.js | maps.js | Expected | Actual |
|--------|---------|------------|---------|----------|--------|
| Desktop| Chrome  |            |         |          |        |
| Desktop| Firefox |            |         |          |        |
| iPhone | Chrome  |            |         |          |        |
| iPhone | Safari  |            |         |          |        |

### Test Procedure for Each:
1. Load specific test book
2. Record extracted collection value
3. Record extracted location value  
4. Record final map URL parameters
5. Verify map shows correct location

## Phase 4: Fix Implementation

### Based on findings, likely fixes:

#### Fix A: Extraction Logic Correction
```javascript
// Restore original extraction if modified
extractCollectionText: function(collectionElement) {
    // Compare with mapsOld.js version
    // Restore original logic if changes found
}
```

#### Fix B: Mobile/Desktop Separation
```javascript
// Ensure mobile logic doesn't interfere with desktop
if (isMobileDevice) {
    // Mobile-specific extraction
} else {
    // Desktop extraction (original logic)
}
```

#### Fix C: Collection Validation
```javascript
// Ensure collection names match both:
// 1. What Enterprise outputs
// 2. What map service expects
```

#### Fix D: Location Service Mapping
```javascript
// Verify normalizeLocationForService() mapping
// Ensure internal names map to correct map service locations
```

## Phase 5: Verification

### Verification Steps:
1. Test fix on multiple books
2. Verify both desktop and mobile work correctly  
3. Confirm map locations are accurate
4. Check collection codes match books
5. Ensure no regression in button functionality

## Immediate Action Items

1. **Create diagnostic script** ✅ (diagnostic-collection.js)
2. **Run diagnostic on test book** with both versions
3. **Compare extraction results** between mapsOld.js and maps.js
4. **Identify specific differences** in collection/location extraction
5. **Determine root cause** from comparison
6. **Implement targeted fix** based on findings
7. **Test fix** thoroughly on both desktop and mobile
8. **Document resolution** for future reference

## Test Books to Use
- Find books with different collection types
- Include both common and special collections
- Test books from different locations if available
- Use same books that worked correctly before mobile changes

## Success Criteria
- ✅ Correct collection codes displayed on map
- ✅ Accurate locations shown on map
- ✅ Desktop functionality preserved  
- ✅ Mobile functionality maintained
- ✅ No validation errors in console