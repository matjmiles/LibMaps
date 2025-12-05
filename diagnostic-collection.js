// LibMaps Collection Mapping Troubleshoot Tool
// Quick diagnostic script to compare what we're extracting vs what should be mapped

console.log("=== LIBMAPS COLLECTION MAPPING DIAGNOSTIC ===");

// Test extraction on current page
function diagnosticTest() {
    console.log("1. TESTING COLLECTION EXTRACTION...");
    
    // Find collection elements using our current selectors
    var collectionElements = document.querySelectorAll('.detailItemsTable_SD_HZN_COLLECTION');
    console.log("Found " + collectionElements.length + " collection elements");
    
    collectionElements.forEach(function(element, index) {
        console.log("Collection Element " + (index + 1) + ":");
        console.log("  Raw HTML:", element.outerHTML);
        console.log("  textContent:", "'" + element.textContent + "'");
        console.log("  innerText:", "'" + element.innerText + "'");
        console.log("  Classes:", element.className);
    });
    
    console.log("\n2. TESTING LOCATION EXTRACTION...");
    
    // Find library elements 
    var libraryElements = document.querySelectorAll('.detailItemsTable_LIBRARY');
    console.log("Found " + libraryElements.length + " library elements");
    
    libraryElements.forEach(function(element, index) {
        console.log("Library Element " + (index + 1) + ":");
        console.log("  Raw HTML:", element.outerHTML);
        
        // Test our extraction method
        var locationElement = element.querySelector(".asyncFieldLIBRARY:last-of-type") ||
                             element.querySelector(".asyncFieldLIBRARY") ||
                             element;
        console.log("  Selected location element:", locationElement.textContent);
        console.log("  Classes:", locationElement.className);
    });
    
    console.log("\n3. TESTING CURRENT EXTRACTION VS EXPECTED...");
    
    // Test our current extraction functions if they exist
    if (typeof springyMap !== 'undefined' && springyMap.extractCollectionText) {
        collectionElements.forEach(function(element, index) {
            var extracted = springyMap.extractCollectionText(element);
            var isValid = springyMap.isValidCollection(extracted);
            console.log("Collection " + (index + 1) + ":");
            console.log("  Extracted: '" + extracted + "'");
            console.log("  Is Valid: " + isValid);
            
            if (!isValid) {
                console.log("  Available collections:", Object.keys(springyMap.siteConfig.validCollectionNameMap));
            }
        });
    }
}

// Run the diagnostic
diagnosticTest();

console.log("\n=== COMPARE WITH MAPSOLD.JS BEHAVIOR ===");
console.log("Please compare these results with mapsOld.js extraction on the same book");