# ARCHITECTURE.md  
**Springshare LibMaps ⇄ SirsiDynix Enterprise Integration Script**  
*(Based on `maps.js`)*

## 1. Purpose and Scope

This script integrates **Springshare LibMaps** inside **SirsiDynix Enterprise** by:

- Scraping bibliographic item data from Enterprise’s DOM  
- Extracting call number, location, collection, and title  
- Validating those values against controlled configuration  
- Generating “Map It” buttons for each valid item  
- Launching a modal or external LibMaps page to show shelving location  

This is **not a standalone application**.  
It runs **inside a third-party product** and must tolerate inconsistent, shifting DOM structures—especially between **mobile and desktop** views.

---

## 2. High-Level Architecture

The logic is broken into two main modules:

---

### **A. `springyILS` — Enterprise Integration Layer**

This module handles:

- Detecting item rows across multiple Enterprise DOM layouts  
- Supporting both **desktop** and **mobile** HTML structures  
- Extracting DOM nodes for:
  - Title  
  - Call number  
  - Library  
  - Collection  
- Preventing duplicate processing (`.libmaps-proc` tag)  
- Producing normalized item objects for mapping  

`springyILS` focuses exclusively on the **Enterprise side** of the integration.

---

### **B. `springyMap` — LibMaps Mapping + UI Layer**

Responsible for:

- Extracting and cleaning text fields  
- Validating location and collection names  
- Generating:
  - The “Map It” button  
  - The LibMaps modal  
  - The external full map view link  
- Injecting all required CSS  
- Managing modal open/close/print behaviors  
- Running the DOM watcher to know when Enterprise content is ready  

This module contains all business rules and mapping behavior.

---

## 3. Execution Flow

### **1. DOM Ready Detection**

Enterprise pages load inconsistently.  
The script uses four methods to detect readiness:

1. `DOMContentLoaded`  
2. `readystatechange`  
3. `window.onload`  
4. Mobile-only timeout fallback (3 seconds)

Once fired, the script runs `initializeLibMaps()`.

---

### **2. Initialization**

`initializeLibMaps()` performs:

1. CSS injection  
2. Startup of the DOM watcher  
3. Configuration of site-level settings  

---

### **3. DOM Watching**

Enterprise loads table rows asynchronously.  
The script polls until detail rows appear.

- Desktop: **30 attempts**, **500ms interval**  
- Mobile: **60 attempts**, **750ms interval**

When detected → begin scraping.  
If not detected → fallback to generic scraping mode.

---

### **4. Scraping Flow**

The scraper determines which method to use:

- **Primary:** `springyILS.scrapeDetailRows()`  
- **Fallback:** `springyMap.scrapeDomGeneric()`  

Each discovered item is validated:

- Call number must exist  
- Location must be in `validLocationNameMap`  
- Collection must be in `validCollectionNameMap` (if required)

Invalid entries are skipped safely.

---

### **5. UI Attachment**

For each validated item:

1. A “Map It” button is generated  
2. A wrapper `<div>` is created  
3. The button is inserted into the correct DOM location  
4. Modal/link behavior is wired up  
5. Duplicate rows are prevented from being processed again  

---

## 4. Mobile vs Desktop DOM Architecture

Enterprise uses different HTML structures depending on device type.

### **Desktop Characteristics**
- Rows: `.detailItemsTableRow`  
- Predictable table structure  
- Standard Enterprise markup  

### **Mobile Characteristics**
- Label/value pairs  
- Extra wrapper elements  
- Semantic label classes (`detailChildFieldLabel`, etc.)  
- Timing delays due to slower rendering  

The script handles these using:

- Multiple selector strategies  
- Dedicated mobile timing settings  
- Filtering out label-only elements  
- Debug overlays visible only on mobile  

---

## 5. Configuration System (`siteConfig`)

The integration is driven by configurable values stored in `siteConfig`, including:

### **A. Core Fields**
- `domain`: Springshare base URL  
- `iid`: Institution ID  
- `isUsingFixedLocation`: bypass location validation if needed  
- `isValidCollectionRequired`: toggle collection-level validation  

### **B. Validation Lists**
- `validLocationNameMap`  
- `validCollectionNameMap`  

These lists must reflect actual Enterprise + Springshare data.

### **C. UI Config**
- Button label & SVG icon  
- Modal HTML template  
- Complete CSS block injected at runtime  
- Modal vs link behavior (`isModalWanted`)  

### **D. Operational Flags**
- `isGenericScrapeWanted`  
- `isValidCollectionRequired`

Configuration keeps all business rules separate from scraping logic.

---

## 6. Text Normalization

Enterprise often outputs:

- Extra whitespace  
- Newlines  
- Label prefixes  
- Concatenated values  
- “Unknown” suffixes  

The script cleans text by:

- Collapsing whitespace  
- Removing trailing “Unknown”  
- Debouncing newlines  
- Performing exact, partial, and case-insensitive collection matching  

This ensures consistent behavior across DOM inconsistencies.

---

## 7. Modal Architecture

The modal consists of:

- `.springy-underlay` (background dim + click block)  
- `.springy-modal` (main container)  
- Header with:
  - Item title  
  - Print button  
  - Close button  
- `<iframe>` that loads LibMaps content  

The modal is:

- Added once per item  
- Hidden/shown using CSS class toggles  
- Keyboard accessible via Enter key handler  

All styles are injected into the page to avoid Enterprise CSS conflicts.

---

## 8. Debugging and Error Handling

### **Debug Features**
- Verbose console logs  
- Mobile debug overlay in upper-right corner  
- Selector testing information  
- Validation logs (call, location, collection)  
- Text “before/after” cleanup logs  
- Watcher attempt tracking  

### **Fail-Safe Behavior**
If scraping fails:

- Generic scrape is attempted  
- Buttons appear only for valid items  
- Script avoids throwing visible errors  
- Enterprise page continues functioning normally  

---

## 9. Architectural Constraints

These constraints guide safe modification:

### **1. Enterprise DOM Is Unstable**
Never rely on fixed selectors.  
Always provide multiple fallback selectors.

### **2. Must Not Block UI**
All logic must be asynchronous or event-driven.

### **3. Errors Must Be Silent**
Do not break the Enterprise interface.

### **4. CSS Must Be Self-Contained**
No dependency on host styles.

### **5. Debug Mode Must Be Easy to Toggle**
Set via a single `debugMode` flag.

---

## 10. Future-Proofing Considerations

Enhancements may include:

- Updating selectors when Enterprise updates markup  
- Adding new collections and locations  
- Improving mobile scraping  
- Enhancing accessibility in modals  
- Creating a standalone test harness with fake Enterprise HTML  
- Adding automated selector health checking  

---

## 11. File of Record

This architecture describes the behavior of:

- **`maps.js`** (current production integration script)

This document should be updated whenever scraper logic, validation rules, or UI handling changes.

---

## 12. Summary

This script is a **robust, multi-environment DOM integration layer** that bridges Enterprise’s unpredictable markup with Springshare LibMaps’ mapping functionality. Its architecture emphasizes:

- Flexibility  
- Fault tolerance  
- Mobile compatibility  
- Complete isolation from host CSS  
- Strict validation  
- Config-driven behavior  

It is engineered to continue functioning even as SirsiDynix makes changes to their DOM.

