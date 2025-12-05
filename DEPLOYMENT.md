# LibMaps Deployment Guide

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] **Debug Mode Disabled**: Ensure `debugMode = false` in maps.js
- [ ] **Collections Configured**: Update `validCollectionNameMap` for your library
- [ ] **Locations Configured**: Update `validLocationNameMap` for your library
- [ ] **Tests Passing**: Run `LibMapsTests.runAll()` with >95% success rate
- [ ] **LibCal API Configured**: Verify domain and institution ID settings

### Step-by-Step Deployment

#### 1. Configure Your Library Settings

Edit the configuration in `maps.js`:

```javascript
springyMap.siteConfig = {
    domain: 'https://your-library.libcal.com',  // Your LibCal domain
    iid: 1234,                                  // Your institution ID
    
    validLocationNameMap: {
        'Your Library Name': true,
        'Branch Library': true,
        // Add all your locations
    },
    
    validCollectionNameMap: {
        'General Collection': true,
        'Reference': true,
        'Special Collections': true,
        // Add all your collections
    }
};
```

#### 2. Upload to SirsiDynix Enterprise

**Option A: Direct Integration**
```html
<!-- Add to your catalog item detail templates -->
<script src="/path/to/maps.js"></script>
```

**Option B: Content Management System**
1. Access your SirsiDynix Enterprise admin panel
2. Navigate to Web Templates → Item Detail
3. Add the script reference before closing `</body>` tag
4. Save and publish changes

#### 3. Test Deployment

1. **Navigate** to an item detail page
2. **Verify** "Map It" buttons appear on call numbers
3. **Test** mobile functionality on various devices
4. **Run** test suite: `LibMapsTests.runAll()`

#### 4. Monitor and Validate

- **Check** browser console for errors
- **Verify** no duplicate buttons appear
- **Test** modal functionality and map display
- **Confirm** security measures are active (no XSS vulnerabilities)

## 🔧 Configuration Options

### Essential Settings

```javascript
// Required: Your LibCal integration
domain: 'https://your-library.libcal.com',
iid: 1234, // Your LibCal institution ID

// Security settings
debugMode: false, // MUST be false in production
isValidCollectionRequired: 1, // Enable collection validation

// UI preferences  
isModalWanted: 1, // Use modal dialogs (recommended)
button: {
    label: 'Map It', // Button text
    border: '6px'    // Button styling
}
```

### Advanced Configuration

```javascript
// Custom button styling
css: '.springy-button { /* your custom styles */ }',

// Generic scraping fallback
isGenericScrapeWanted: 0, // Use SirsiDynix-specific scraping

// Location handling
isUsingFixedLocation: 0 // Enable dynamic location detection
```

## 🧪 Testing in Production

### Automated Testing

```javascript
// Run comprehensive test suite
LibMapsTests.runAll();

// Expected results:
// - Total Tests: 15
// - Success Rate: 97-100%
// - All security tests passing
```

### Manual Testing Checklist

#### Desktop Testing
- [ ] Buttons appear on item records
- [ ] No duplicate buttons
- [ ] Modal opens correctly
- [ ] Maps load properly
- [ ] Print functionality works

#### Mobile Testing
- [ ] Single button per item
- [ ] Touch-friendly interface
- [ ] Responsive modal design
- [ ] Collection extraction works
- [ ] No DOM conflicts

#### Security Testing
- [ ] No XSS vulnerabilities
- [ ] Input sanitization active
- [ ] Safe error handling
- [ ] No debug information leaked

## 🚨 Troubleshooting

### Common Deployment Issues

#### "No Map It buttons appear"
**Cause**: DOM selectors not matching your catalog system
**Solution**:
1. Run `testCurrentPage()` to analyze DOM structure
2. Verify selectors in `scrapeMobileCallNumbers` function
3. Check browser console for errors

#### "Multiple buttons per item"
**Cause**: Script loaded multiple times or caching issues
**Solution**:
1. Ensure script is only loaded once per page
2. Clear browser cache
3. Check for duplicate script includes

#### "Maps not loading"
**Cause**: Incorrect LibCal configuration
**Solution**:
1. Verify `domain` and `iid` settings
2. Check LibCal API accessibility
3. Confirm institution has mapping service enabled

#### "Mobile layout broken"
**Cause**: CSS conflicts or mobile detection issues
**Solution**:
1. Run `quickMobileCheck()` to verify mobile detection
2. Check for CSS conflicts
3. Test mobile-specific DOM selectors

### Debug Mode for Troubleshooting

**ONLY for development/troubleshooting - NOT production:**

```javascript
var debugMode = true; // Enable detailed logging
```

This will provide extensive console output for diagnosing issues.

## 📊 Performance Monitoring

### Key Metrics to Monitor

- **Button Generation Time**: Should be <100ms per page
- **DOM Processing**: Minimal impact on page load
- **Error Rate**: Should be <1% of page views
- **Mobile Performance**: Consistent with desktop

### Monitoring Tools

```javascript
// Performance timing
console.time('LibMaps Processing');
springyMap.scrape();
console.timeEnd('LibMaps Processing');

// Error tracking
window.addEventListener('error', function(e) {
    if (e.message.includes('LibMaps') || e.message.includes('springy')) {
        // Log LibMaps-related errors
        console.error('LibMaps Error:', e);
    }
});
```

## 🔄 Updates and Maintenance

### Regular Maintenance

1. **Monthly**: Run test suite to ensure continued functionality
2. **Quarterly**: Review and update collection/location mappings
3. **Annually**: Update to latest LibMaps version

### Version Updates

1. **Download** latest `maps.js` from repository
2. **Backup** current configuration settings
3. **Update** script file
4. **Restore** your custom configuration
5. **Test** thoroughly before deploying

## 📞 Support

### Getting Help

1. **GitHub Issues**: [Report problems](https://github.com/matjmiles/LibMaps/issues)
2. **Documentation**: [Project Wiki](https://github.com/matjmiles/LibMaps/wiki)
3. **Testing Tools**: Use built-in diagnostic functions

### Reporting Issues

Include this information when reporting issues:

- **Browser and version**
- **Device type (desktop/mobile)**
- **SirsiDynix Enterprise version**
- **Console error messages**
- **Test suite results** (`LibMapsTests.runAll()`)

---

**Deployment completed successfully? 🎉 Your library users can now easily find items with interactive maps!**