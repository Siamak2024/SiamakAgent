# Save Confirmation Modal - Quick Test Guide

**Feature:** Account Save Summary Modal  
**Version:** 1.0  
**Test Date:** _____________

---

## Quick Test Steps

### 1. Basic Display Test
1. Open EA_Engagement_Playbook.html
2. Load or create an engagement
3. Click "Save Account" button
4. **✓ Verify:** Modal appears with success message
5. **✓ Verify:** File name and export date show correctly
6. **✓ Verify:** Schema version shows "v3.0"

### 2. Account Information Test
1. **✓ Verify:** Account name displays correctly
2. **✓ Verify:** Industry and segment show (if available)

### 3. Summary Statistics Test
1. **✓ Verify:** Business Objectives count matches your data
2. **✓ Verify:** Capabilities count matches your data
3. **✓ Verify:** Opportunities count matches your data
4. **✓ Verify:** EA Engagements count = 1 (or more if multiple)

### 4. Application Portfolio Test (if applications exist)
1. **✓ Verify:** Purple section displays
2. **✓ Verify:** Application count accurate
3. **✓ Verify:** APM Capabilities count accurate
4. **✓ Verify:** AI Agents count accurate
5. **✓ Verify:** Total cost shows if applications have cost data
6. **✓ Verify:** Lifecycle breakdown shows if available

### 5. EA Engagement Data Test (if engagements exist)
1. **✓ Verify:** Grey section displays
2. **✓ Verify:** Capabilities count accurate
3. **✓ Verify:** Stakeholders count accurate
4. **✓ Verify:** Applications count accurate
5. **✓ Verify:** WhiteSpots count accurate

### 6. Closing Test
1. **✓ Verify:** Click "Close" button closes modal
2. Open again, **✓ Verify:** Click X button closes modal
3. Open again, **✓ Verify:** Click outside modal closes it

---

## Visual Quality Check

- [ ] Modal is centered on screen
- [ ] Green success theme looks good
- [ ] All colors render properly (blue, yellow, teal, pink, purple, orange)
- [ ] Icons display (check circle, building, chart bar, etc.)
- [ ] Numbers are large and readable
- [ ] Text is properly aligned
- [ ] No overlapping content
- [ ] Responsive at different screen sizes

---

## Edge Case Tests

### Test with Minimal Data
1. Create new account with only 1-2 objectives
2. **✓ Verify:** Modal shows correct counts
3. **✓ Verify:** Application section is hidden (if no apps)
4. **✓ Verify:** Engagement section displays properly

### Test with Complete Data
1. Use account with full data (objectives, capabilities, opportunities, applications)
2. **✓ Verify:** All sections display
3. **✓ Verify:** Purple application section fully populated
4. **✓ Verify:** Grey engagement section fully populated
5. **✓ Verify:** Cost formatting with Euro symbol and commas

### Test with No Applications
1. Use account without APM portfolio
2. **✓ Verify:** Purple application section is hidden
3. **✓ Verify:** Rest of modal displays normally

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

---

## Performance Check

- [ ] Modal opens instantly (< 1 second)
- [ ] No lag when clicking buttons
- [ ] Toast notification appears before modal
- [ ] No console errors

---

## Regression Check

After implementing modal:
- [ ] Save account still works (file downloads)
- [ ] Data still saves to localStorage correctly
- [ ] Toast notification still appears
- [ ] Account can be loaded from file successfully
- [ ] All application data preserved in JSON

---

## Acceptance Criteria

**✓ PASS if:**
- Modal displays after successful save
- All statistics are accurate
- Conditional sections show/hide correctly
- Close functionality works properly
- Visual design matches specification
- No console errors
- Download still works normally

**✗ FAIL if:**
- Modal doesn't appear
- Statistics are incorrect or show undefined
- Visual design is broken
- Close buttons don't work
- Console shows errors
- Download is broken

---

## Notes / Issues Found

_Use this space to document any issues:_

---

**Tester Name:** _____________  
**Test Date:** _____________  
**Result:** [ ] PASS  [ ] FAIL  [ ] NEEDS REVISION

---

## Common Issues & Solutions

### Issue: Modal doesn't appear
**Solution:** Check browser console for errors, verify saveAccountData() completes

### Issue: Statistics show 0
**Solution:** Check data is being passed correctly to showSaveSummaryModal()

### Issue: Application section always hidden
**Solution:** Verify localStorage has 'apm_portfolios' data

### Issue: Visual design broken
**Solution:** Check CSS is loaded, inspect for conflicts

---

**End of Test Guide**
