# LibMaps API Reference

## 📋 Table of Contents

- [Core API](#core-api)
- [Configuration Objects](#configuration-objects)
- [Processing Functions](#processing-functions)
- [Utility Functions](#utility-functions)
- [Event Handlers](#event-handlers)
- [Error Handling](#error-handling)
- [Mobile API](#mobile-api)
- [Testing API](#testing-api)

---

## 🔧 Core API

### springyMap Object

The main LibMaps namespace containing configuration and primary functions.

#### Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `siteConfig` | Object | Site-specific configuration | ✅ |
| `debug` | Boolean | Enable debug logging | ❌ |

#### Methods

##### `scrape()`
Initiates the catalog scraping process for the current page.

```javascript
var items = springyMap.scrape();
```

**Returns**: `Array<ItemObject>` - Array of processed library items

**Example**:
```javascript
// Basic scraping
var catalogItems = springyMap.scrape();
console.log(`Found ${catalogItems.length} items`);
```

---

## ⚙️ Configuration Objects

### siteConfig

Main configuration object for LibMaps functionality.

```javascript
springyMap.siteConfig = {
    domain: "https://your-institution.libcal.com",
    iid: "your-institution-id",
    gid: "your-group-id",
    lid: "location-id",
    validLocationNameMap: {},
    validCollectionNameMap: {},
    button: {},
    isModalWanted: 1
};
```

#### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `domain` | String | LibCal service domain | `"https://mylib.libcal.com"` |
| `iid` | String | Institution identifier | `"12345"` |

#### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `gid` | String | `null` | Group identifier for multi-site |
| `lid` | String | `null` | Location identifier override |
| `isModalWanted` | Number | `1` | Enable modal display (1=yes, 0=no) |
| `debug` | Boolean | `false` | Enable debug mode |

### validLocationNameMap

Maps catalog location names to standardized identifiers.

```javascript
validLocationNameMap: {
    "Main Library": "main",
    "Science Library": "science",
    "Archives": "archives",
    "Reference Desk": "reference"
}
```

### validCollectionNameMap

Maps collection names to standardized identifiers.

```javascript
validCollectionNameMap: {
    "General Collection": "general",
    "Reference Collection": "reference", 
    "Periodicals": "periodicals",
    "Special Collections": "special"
}
```

### button Configuration

Customizes the appearance and behavior of map buttons.

```javascript
button: {
    label: "Find on Map",
    styling: {
        backgroundColor: "#0066cc",
        color: "white",
        padding: "5px 10px",
        border: "none",
        borderRadius: "3px",
        cursor: "pointer"
    }
}
```

---

## 🔄 Processing Functions

### springyILS Object

Contains item processing and extraction functions.

#### Core Processing Methods

##### `scrapeDetailRows()`
Processes desktop catalog display rows.

```javascript
springyILS.scrapeDetailRows();
```

**Returns**: `Array<ItemObject>` - Processed items from desktop view

##### `scrapeMobileCallNumbers(items)`
Processes mobile catalog elements with enhanced duplicate prevention.

```javascript
var mobileItems = springyILS.scrapeMobileCallNumbers(existingItems);
```

**Parameters**:
- `items` (Array): Existing items array to append to

**Returns**: `Array<ItemObject>` - Combined items with mobile additions

##### `extractText(element)`
Safely extracts and cleans text content from DOM elements.

```javascript
var cleanText = springyILS.extractText(domElement);
```

**Parameters**:
- `element` (Element): DOM element to extract text from

**Returns**: `String` - Sanitized text content

#### Validation Methods

##### `createItemKey(call, location, collection)`
Creates a unique identifier for library items.

```javascript
var itemKey = springyILS.createItemKey("QA123.4", "Main Library", "General");
```

**Parameters**:
- `call` (String): Call number
- `location` (String): Item location
- `collection` (String): Collection name

**Returns**: `String` - Unique item identifier

##### `isGloballyProcessed(call, location, collection)`
Checks if an item has been processed globally.

```javascript
if (!springyILS.isGloballyProcessed(call, location, collection)) {
    // Process the item
    processItem(call, location, collection);
}
```

**Returns**: `Boolean` - true if item already processed

##### `markAsProcessed(call, location, collection)`
Marks an item as processed to prevent duplicates.

```javascript
springyILS.markAsProcessed(call, location, collection);
```

---

## 🛠️ Utility Functions

### Text Processing

##### `cleanText(text)`
Sanitizes text content by removing HTML and scripts.

```javascript
var safeText = springyILS.cleanText(userInput);
```

**Security Features**:
- Removes `<script>` tags
- Strips HTML markup  
- Normalizes whitespace
- Trims leading/trailing spaces

**Example**:
```javascript
var input = "<script>alert('xss')</script>Hello <b>World</b>";
var output = springyILS.cleanText(input); // "Hello World"
```

##### `extractCollectionText(element)`
Extracts collection information from DOM elements.

```javascript
var collection = springyILS.extractCollectionText(collectionElement);
```

**Returns**: `String` - Cleaned collection name or empty string

### DOM Manipulation

##### `appendButton(container, item)`
Creates and appends a map button to a container element.

```javascript
springyILS.appendButton(containerElement, {
    call: "QA123.4",
    location: "Main Library", 
    collection: "General"
});
```

**Parameters**:
- `container` (Element): DOM element to append button to
- `item` (Object): Item data for button generation

---

## 📱 Mobile API

### Mobile Detection

##### `checkMobileDevice()`
Detects if the current device is mobile.

```javascript
var isMobile = checkMobileDevice();
if (isMobile) {
    // Use mobile-optimized processing
}
```

**Detection Criteria**:
- Screen width < 768px
- Touch capability
- Mobile user agents

### Mobile-Specific Processing

##### Mobile DOM Selectors

The mobile API uses specialized selectors for mobile catalog layouts:

```javascript
// Mobile-specific element targeting
var mobileCallElements = document.querySelectorAll('.detailItemsTable_SD_CALL_NUMBER');
var mobileLocationElements = document.querySelectorAll('.detailItemsTable_SD_LOCATION');
```

##### Mobile Collection Detection

```javascript
// Document-wide collection search for mobile
var collectionElements = document.querySelectorAll('.detailItemsTable_SD_HZN_COLLECTION');
var collectionText = springyILS.extractCollectionText(collectionElements[0]);
```

---

## 🧪 Testing API

### Test Runner

##### `LibMapsTestRunner`
Comprehensive testing framework for LibMaps functionality.

```javascript
var testRunner = new LibMapsTestRunner();
testRunner.runAll().then(function(results) {
    console.log('Test Results:', results);
});
```

#### Test Categories

| Category | Description | Test Count |
|----------|-------------|------------|
| Security | XSS prevention, sanitization | 4 tests |
| Mobile | Mobile-specific functionality | 3 tests |
| DOM | DOM manipulation safety | 4 tests |
| Integration | End-to-end workflows | 4 tests |

#### Individual Test Methods

##### Security Tests
```javascript
testRunner.testXSSPrevention();
testRunner.testHTMLSanitization();  
testRunner.testScriptRemoval();
testRunner.testInputValidation();
```

##### Mobile Tests  
```javascript
testRunner.testMobileDetection();
testRunner.testMobileScraping();
testRunner.testMobileButtonCreation();
```

##### DOM Tests
```javascript
testRunner.testDOMSafeManipulation();
testRunner.testElementCreation();
testRunner.testTextExtraction();
testRunner.testEventHandling();
```

##### Integration Tests
```javascript
testRunner.testFullWorkflow();
testRunner.testConfigurationLoading();
testRunner.testErrorHandling();
testRunner.testPerformanceBasics();
```

---

## ⚠️ Error Handling

### Error Types

#### Configuration Errors
```javascript
// Missing required configuration
if (!springyMap.siteConfig.domain) {
    throw new Error("LibMaps: domain is required in siteConfig");
}
```

#### Processing Errors
```javascript
// DOM element not found
try {
    var text = springyILS.extractText(element);
} catch (error) {
    console.warn("LibMaps: Unable to extract text from element", error);
    return ""; // Graceful fallback
}
```

#### Validation Errors
```javascript
// Invalid item data
if (!call || call.trim().length === 0) {
    console.warn("LibMaps: Skipping item with empty call number");
    return null;
}
```

### Error Recovery Strategies

**Graceful Degradation**: Continue processing when non-critical errors occur
**Fallback Processing**: Use alternative methods when primary methods fail  
**Safe Defaults**: Provide sensible defaults for missing configuration
**User Feedback**: Log errors for debugging without breaking functionality

---

## 🔧 Event Handlers

### Lifecycle Events

#### `onBeforeProcessing`
Called before item processing begins.

```javascript
springyMap.onBeforeProcessing = function(elements) {
    console.log(`Starting to process ${elements.length} elements`);
    // Custom pre-processing logic
};
```

#### `onAfterProcessing`  
Called after item processing completes.

```javascript
springyMap.onAfterProcessing = function(items) {
    console.log(`Successfully processed ${items.length} items`);
    // Custom post-processing logic
};
```

#### `onItemProcessed`
Called for each successfully processed item.

```javascript
springyMap.onItemProcessed = function(item) {
    // Track processing statistics
    analytics.trackItemProcessed(item);
};
```

#### `onError`
Called when processing errors occur.

```javascript
springyMap.onError = function(error, context) {
    // Custom error handling
    logError(error, context);
};
```

---

## 📊 Performance Considerations

### Optimization Guidelines

**Batch Processing**: Process multiple items in single operations
**DOM Caching**: Cache frequently accessed DOM elements
**Selective Processing**: Skip already-processed items
**Memory Management**: Clean up references after processing

### Performance Monitoring

```javascript
// Built-in performance timing
console.time('LibMaps Processing');
var items = springyMap.scrape();
console.timeEnd('LibMaps Processing');

// Memory usage tracking
var memoryUsage = performance.memory; // Chrome only
console.log('Memory usage:', memoryUsage);
```

---

## 🔐 Security Considerations

### Input Sanitization

All text content is automatically sanitized:
- HTML tags removed
- Script tags blocked
- Special characters escaped
- Content length limits enforced

### Safe DOM Manipulation

```javascript
// Safe element creation
var button = document.createElement('button');
button.textContent = safeText; // Use textContent, not innerHTML
button.onclick = safeClickHandler;
```

### Configuration Validation

```javascript
// Validate configuration before use
if (typeof springyMap.siteConfig.domain !== 'string') {
    throw new Error('Invalid domain configuration');
}
```

---

This API reference provides comprehensive documentation for integrating and extending LibMaps functionality in library catalog systems.