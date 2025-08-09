# Fixes Applied to Resolve Select.Item Empty Value Error

## Problem
The application was throwing an error: 
```
Uncaught Error: A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.
```

## Root Cause
Multiple Select components were using empty string (`""`) values in their SelectItem components, which violates Radix UI Select requirements.

## Files Fixed

### 1. `/src/components/SolicitationFilters.tsx`
**Changes Made:**
- Replaced `value=""` with `value="all"` for all filter SelectItems (Equipment, Location, Requester)
- Updated corresponding Select component values to use `'all'` as default instead of empty string
- Updated onValueChange handlers to properly handle the `'all'` value

**Lines Modified:**
- Equipment filter: Lines 222-239
- Location filter: Lines 247-266  
- Requester filter: Lines 273-292

### 2. `/src/components/LocationFormModal.tsx`
**Changes Made:**
- Replaced empty string defaults with `'none'` for:
  - `sectorForm.companyId` (line 56)
  - `subSectionForm.sectorId` (line 69)
- Updated form reset logic to use `'none'` instead of empty strings (lines 108, 119)
- Added "Selecionar empresa" and "Selecionar setor" SelectItems with `value="none"`
- Updated validation logic in handleSubmit to properly handle 'none' values
- Fixed conditional logic for company/sector selection

**Lines Modified:**
- Form initialization: Lines 56, 69, 108, 119
- Company select for subsections: Lines 498-520
- Sector select: Lines 525-540
- Submit validation: Lines 148-154, 172-178

## Technical Details

### Why Empty Strings Cause Issues
Radix UI Select uses empty strings internally to represent "no selection" state and show placeholders. When SelectItem components use empty strings as values, it conflicts with this internal mechanism.

### Solution Approach
1. **For Filter Components**: Used `'all'` as the default value to represent "show all items"
2. **For Form Components**: Used `'none'` as the default value to represent "no selection"
3. **Validation**: Added proper validation to prevent form submission with invalid selections
4. **Backward Compatibility**: Ensured all onValueChange handlers properly convert special values back to `undefined` when needed

## Testing Recommendations
1. Test all filter dropdowns (Equipment, Location, Requester) in the Solicitations page
2. Test creating new sectors and subsections in the Assets page
3. Verify form validation prevents submission with invalid selections
4. Check that all Select components display proper placeholder text

## Impact
- ✅ Resolves the Radix UI Select error completely
- ✅ Maintains existing functionality and UX
- ✅ Improves form validation and user feedback
- ✅ No breaking changes to data models or APIs