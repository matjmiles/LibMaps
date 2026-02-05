# AI Instructions: Mobile LibMaps & Pull Requests Conflict

## Problem Summary
On mobile devices (iPhone Safari), the "Map It" button from LibMaps does not display, while the "Pickup/Delivery" button from pullRequestsENT does display. Both buttons work correctly on desktop. The scripts appear to be blocking each other on mobile.

## Environment
- **LibMaps script**: `maps.min.test.js` (test version)
- **Pull Requests script**: `pullRequestsENT.min.test.js` (test version)
- **Platform**: iPhone Safari (mobile)
- **Issue**: Map It button doesn't appear, but Pickup/Delivery button does

## Root Cause Analysis

### Initial Hypothesis: Global Variable Conflicts
The `maps.js` file was NOT wrapped in an IIFE (Immediately Invoked Function Expression), causing global variable pollution. Key global variables that could conflict:
- `isMobileDevice`
- `springyILS`
- `springyMap`
- `debugLog`

Meanwhile, `pullRequestsENT.js` WAS properly wrapped in an IIFE, isolating its scope.

### Secondary Hypothesis: Different DOM Structures
Mobile Safari may use a different DOM structure for the availability table:
- **Desktop**: Uses `.detailItemsTable` with `.detailItemsTableRow` elements
- **Mobile**: May use `.detailItemsList` with `.detailItemsListItem` elements

## Fixes Attempted

### 1. IIFE Wrapper for maps.js and maps-test.js
**Date**: February 2026  
**Change**: Wrapped both `maps.js` and `maps-test.js` in IIFE to prevent global scope pollution

```javascript
// Before
var isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
// ... code with global variables

// After
(function() {
'use strict';
var isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
// ... code with local variables
})();
```

**Result**: Scripts now have isolated scope, but Map It button still doesn't appear on mobile.

### 2. Debug Overlay Repositioning
**Issue**: Debug overlays at bottom of screen were blocking the availability button on mobile  
**Change**: Moved overlays to top of screen with smaller height

```javascript
// LibMaps overlay: top-right, green
position:fixed;top:5px;right:5px;max-height:100px;

// PullRequests overlay: top-left, blue  
position:fixed;top:5px;left:5px;max-height:100px;
```

**Result**: Overlays no longer block buttons, but Map It still doesn't appear.

### 3. Enhanced Mobile Scraping Logic
**Issue**: Mobile scraping returning 0 items  
**Change**: Added support for `.detailItemsListItem` DOM structure used on mobile

```javascript
scrapeMobileCallNumbers: function(items) {
    var listItems = document.querySelectorAll('.detailItemsListItem');
    if (listItems.length > 0) {
        // Process mobile-specific DOM structure
        for (var j = 0; j < listItems.length; j++) {
            var listItem = listItems[j];
            var spans = listItem.querySelectorAll('span');
            // Extract CALLNUMBER, LIBRARY, ITYPE from spans
        }
    }
}
```

**Result**: Mobile scraper still finds 0 items.

### 4. Version Tracking in Debug Overlay
**Issue**: Cannot access browser console on iPhone to verify code is loaded  
**Change**: Added version number to debug overlay title

```javascript
// v2.4.0, then v2.4.1
debugDiv.innerHTML = '<strong style="color:#ffff00;">🗺️ v2.4.1</strong>';
```

**Result**: Can now verify correct code version is loaded on mobile.

### 5. Enhanced DOM Structure Debugging (v2.4.1)
**Change**: Added comprehensive DOM inspection to understand mobile structure

```javascript
scrapeMobileCallNumbers: function(items) {
    debugLog("🔍 MOBILE: Starting mobile scrape v2.4.1");
    
    var detailItemsList = document.querySelector('.detailItemsList');
    var detailItemsTable = document.querySelector('.detailItemsTable');
    var listItems = document.querySelectorAll('.detailItemsListItem');
    var tableRows = document.querySelectorAll('.detailItemsTableRow');
    
    debugLog("📱 DOM: list=" + !!detailItemsList + " table=" + !!detailItemsTable);
    debugLog("📱 DOM: listItems=" + listItems.length + " tableRows=" + tableRows.length);
    
    // Find ANY element with detail/availability in class
    var allElements = document.querySelectorAll('[class*="detail"], [class*="avail"], [class*="item"]');
    debugLog("📱 Elements with detail/avail/item: " + allElements.length);
    
    // Show class names to understand structure
    var classNames = [];
    for (var i = 0; i < Math.min(allElements.length, 5); i++) {
        classNames.push(allElements[i].className.substring(0, 40));
    }
    debugLog("📱 Classes: " + classNames.join(' | '));
}
```

**Result**: Debug shows `isGenericScraperWanted=true`, `Found 0 items`, `Setting up buttons for 0 items` - the enhanced DOM debugging output is not appearing in overlay, suggesting the mobile scraper may not even be called.

## Current Debug Output (v2.4.1)
```
🗺️ v2.4.1
...
isGenericScraperWanted=true
Found 0 items
Setting up buttons for 0 items
```

## Files Modified
1. `test-versions/maps-test.js` - IIFE wrapper, enhanced mobile scraping, debug overlay
2. `test-versions/maps.min.test.js` - Minified version
3. `maps.js` - IIFE wrapper for production
4. `maps.min.js` - Minified production version
5. `test-versions/pullRequestsENT-test.js` - Debug overlay repositioning
6. `test-versions/pullRequestsENT.min.test.js` - Minified version

## Outstanding Questions

1. **Why isn't the mobile DOM debug output appearing?**
   - The `scrapeMobileCallNumbers` function should log DOM structure details
   - These logs are not showing in the overlay
   - This suggests either:
     a. `isMobileDevice` is false (not detecting as mobile)
     b. The code path isn't reaching `scrapeMobileCallNumbers`
     c. Debug messages are being truncated

2. **What is the actual DOM structure on mobile Safari?**
   - Need to see the class names of elements containing availability info
   - May be completely different from desktop structure

3. **Is there a timing issue?**
   - Mobile may load availability data asynchronously
   - Script may run before DOM is populated

4. **Is pullRequestsENT interfering before LibMaps runs?**
   - Both scripts watch for DOM changes
   - One may be modifying the DOM before the other can process it

## Solution: Fix for Mobile Watcher Timeout (v2.4.3)
**Date**: February 5, 2026
**Model**: Gemini 3 Pro (Preview)

The issue was resolved by identifying that the `springyMap.watch()` function was waiting for desktop-specific DOM elements (`.detailItemsTableRow`) which do NOT exist on the mobile version of the catalog. Because these elements were never found, the watcher would timeout and incorrectly fall back to a generic scraping mode or fail entirely.

### The Fix
The `watch` function was updated to specifically look for mobile DOM elements:
- `.detailItemsList`
- `.detailItemsListItem`
- `.asyncFieldSD_ITEM_STATUS`

**Code Change in `test-versions/maps-test.js`**:

```javascript
// Updated watcher query arguments to include mobile elements
var targetElement = document.querySelector(".detailItemsTableRow") ||
                    document.querySelector("tbody .detailItemsTableRow") ||
                    document.querySelector(".detailItemsTable") ||
                    // NEW: Mobile specific selectors
                    document.querySelector(".detailItemsList") ||
                    document.querySelector(".detailItemsListItem") ||
                    document.querySelector(".asyncFieldSD_ITEM_STATUS");
```

### Instructions for Future AI Models
If the "Map It" button disappears on mobile again:
1. **Check the Watcher**: Ensure `springyMap.watch()` is looking for elements that actually exist in the mobile DOM (`.detailItemsListItem`).
2. **Verify IIFE**: Confirm all scripts are wrapped in `(function() { 'use strict'; ... })();` to prevent global variable collisions (like `isMobileDevice`).
3. **Debug Overlays**: Use small, top-positioned debug overlays with version numbers to verify the correct file is loaded on mobile devices (where console access is difficult).
4. **Mobile Detection**: Explicitly validatate `isMobileDevice` regex is working.

## Final Regeneration Commands
To apply these changes to production:

```powershell
# Regenerate minified test files
npx terser "test-versions/maps-test.js" -o "test-versions/maps.min.test.js" --compress --mangle
npx terser "test-versions/pullRequestsENT-test.js" -o "test-versions/pullRequestsENT.min.test.js" --compress --mangle

# Regenerate minified production files
npx terser "maps.js" -o "maps.min.js" --compress --mangle
```
