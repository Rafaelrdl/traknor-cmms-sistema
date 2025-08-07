# Responsive Navigation Test Cases

## Desktop Breakpoints (Navigation should show horizontally)

### 2xl screens (≥1440px)
- ✅ All 9 navigation items should be visible
- ✅ No overflow menu should appear
- ✅ Logo and user menu should be positioned correctly

### xl screens (≥1280px)
- ✅ First 8 navigation items should be visible
- ✅ 1 item should be in overflow menu (Relatórios)
- ✅ Overflow menu button should be visible

### lg screens (≥1024px)  
- ✅ First 6 navigation items should be visible
- ✅ 3 items should be in overflow menu (Estoque, Procedimentos, Relatórios)
- ✅ Overflow menu button should be visible

### md screens (≥768px)
- ✅ First 4 navigation items should be visible
- ✅ 5 items should be in overflow menu
- ✅ Overflow menu button should be visible

## Mobile Breakpoints (≤767px)
- ✅ Desktop navigation should be hidden
- ✅ Hamburger menu button should be visible in top-right
- ✅ Clicking hamburger opens full-screen slide-down menu
- ✅ All 9 navigation items should be visible in mobile menu
- ✅ Active item should be highlighted
- ✅ Clicking item closes menu and navigates
- ✅ ESC key closes menu
- ✅ Body scroll should be prevented when menu is open

## Accessibility Features
- ✅ All interactive elements have proper ARIA labels
- ✅ Keyboard navigation works (Tab, Enter, ESC)
- ✅ Focus states are visible
- ✅ Screen readers can access all navigation items

## Animation Features
- ✅ Mobile menu slides down smoothly (200ms duration)
- ✅ Menu items animate in with staggered delay (50ms each)
- ✅ Hover states have smooth transitions (200ms)
- ✅ Active states update immediately

## Test Instructions

1. Start development server
2. Open browser developer tools
3. Test each breakpoint using responsive design mode
4. Verify navigation behavior at each screen size
5. Test mobile menu interactions (tap, swipe, keyboard)
6. Verify accessibility with screen reader
7. Check focus management and keyboard navigation