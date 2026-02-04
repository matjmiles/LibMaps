# LibMaps Test Versions

**Created:** 2026-02-04  
**Purpose:** Debug wrong location navigation when clicking the Map It button

## Issue Description
The maps button shows on the screen, but when clicked, it takes users to the wrong location. These test versions include extensive debugging to identify the root cause.

## Files Created

### Full Debug Versions (Readable)
- **maps-test.js** - Full debug version of maps.js with visible debug overlay
- **pullRequestsENT-test.js** - Full debug version of pullRequestsENT.js with visible debug overlay
- **BYUI_master_test.js** - Master file pointing to test versions

### Minified Debug Versions (Drop-in Replacements)
- **maps.min.test.js** - Minified debug version, can replace maps.min.js
- **pullRequestsENT.min.test.js** - Minified debug version, can replace pullRequestsENT.min.js

## How to Deploy for Testing

### Option 1: Using the Master Test File
1. Upload all test files to the server in a `/custom/web/test/` folder
2. Modify the test account to use `BYUI_master_test.js` instead of `BYUI_master.js`
3. Update paths in `BYUI_master_test.js` if your folder structure is different

### Option 2: Direct Replacement (Minified Versions)
1. Rename current production files:
   - `maps.min.js` → `maps.min.js.backup`
   - `pullRequestsENT.min.js` → `pullRequestsENT.min.js.backup`
2. Upload test files with production names:
   - `maps.min.test.js` → rename to `maps.min.js`
   - `pullRequestsENT.min.test.js` → rename to `pullRequestsENT.min.js`

## Debug Features

### Visual Debug Overlays
When loaded, you'll see debug overlays on the page:
- **Green overlay (bottom-right)**: LibMaps debug info
- **Blue overlay (bottom-left)**: Pull Requests debug info

### Console Logging
All debug info is also logged to the browser console with prefixes:
- `LIBMAPS DEBUG:` - Maps functionality
- `PULL REQUESTS DEBUG:` - Pickup/Delivery functionality

### Key Debug Points
The test versions log:
1. **Collection extraction**: Shows raw and cleaned collection text
2. **Location extraction**: Shows location mapping
3. **Validation results**: Shows which validations pass/fail
4. **Button click params**: When clicking "Map It", logs exact URL parameters sent

## What to Look For

### When Testing:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Navigate to a book details page
4. Watch the debug overlay and console
5. **Click the "Map It" button** and observe the logged parameters

### Key Things to Check:
- Is the **collection** being extracted correctly?
- Is the **location** being extracted correctly?
- Are the URL parameters correct when clicking "Map It"?
- Compare extracted values with what the book actually shows

## Collection Name Mapping Issue

The test versions include an expanded `validCollectionNameMap` that covers variations:
- Both singular and plural (CD/CDs, DVD/DVDs)
- Various Special Collections formats
- Multiple location name formats

## After Testing

Once you identify the issue:
1. Document the incorrect extraction/mapping found
2. Fix the production maps.js file
3. Regenerate maps.min.js
4. Restore original production files

## Reverting to Production

To revert:
1. Remove test files from server
2. Restore original `BYUI_master.js` in test account
3. Or rename backup files back to original names
