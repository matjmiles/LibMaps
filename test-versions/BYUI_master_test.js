// BYUI Master Test Version
// Date: 2026-02-04
// Purpose: Load test versions of LibMaps scripts for debugging
// 
// INSTRUCTIONS:
// 1. Upload maps-test.js, pullRequestsENT-test.js to the server
// 2. Update the paths below to point to the uploaded test files
// 3. Use this master file in the test account

console.log("==============================================");
console.log("BYUI MASTER TEST VERSION");
console.log("Loading test scripts with debug enabled");
console.log("==============================================");

// Point to your test files on the server
// Files should be in /custom/web/test/ folder
document.writeln('<script src="/custom/web/test/pullRequestsENT.min.test.js" type="text/javascript"><\/script>');
document.writeln('<script src="/custom/web/customCarousel.js" type="text/javascript"><\/script>');
document.writeln('<script src="/custom/web/test/maps.min.test.js" type="text/javascript"><\/script>');
