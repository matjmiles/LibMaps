// MINIMAL LibMaps Test Script - iPhone Debugging
// This is a stripped-down version to test if the script loads at all

alert('🟢 MINIMAL TEST: LibMaps script is loading!');

// Test mobile detection
var isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    alert('📱 Mobile device detected: ' + navigator.userAgent.substring(0, 50));
} else {
    alert('💻 Desktop device detected');
}

// Change page title as proof script ran
try {
    document.title = "🧪 LIBMAPS TEST - " + document.title;
    alert('✅ Page title changed successfully');
} catch (e) {
    alert('❌ Error changing title: ' + e.message);
}

// Try to add a simple visible element
setTimeout(function() {
    try {
        var testDiv = document.createElement('div');
        testDiv.innerHTML = '🔴 SCRIPT IS WORKING!';
        testDiv.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;background:red;color:white;padding:20px;font-size:20px;text-align:center;z-index:999999;border:5px solid yellow;';
        
        if (document.body) {
            document.body.appendChild(testDiv);
            alert('✅ Red test div added to page');
        } else {
            alert('❌ Document body not available');
        }
        
        // Remove after 10 seconds
        setTimeout(function() {
            if (testDiv && testDiv.parentNode) {
                testDiv.parentNode.removeChild(testDiv);
            }
        }, 10000);
        
    } catch (e) {
        alert('❌ Error creating test div: ' + e.message);
    }
}, 1000);

alert('🏁 End of minimal test script reached');