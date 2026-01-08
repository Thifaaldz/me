# Mobile Performance Optimization TODO

## Plan
1. **CSS Optimizations** - Add GPU acceleration, disable heavy effects on mobile, add reduced motion support
2. **JavaScript Optimizations** - Throttle scroll handlers, disable expensive effects on mobile
3. **HTML Optimizations** - Add lazy loading to images

## Progress
- [x] Optimize style.css for mobile performance
- [x] Optimize script.js for mobile performance  
- [x] Add lazy loading to images in index.html

## Optimizations Applied:

### CSS (style.css)
- Added `prefers-reduced-motion` support for users who prefer reduced motion
- Disabled expensive `binary-rain` animation on mobile
- Disabled `cursor-code` follower on mobile
- Reduced `backdrop-filter` blur on modals from 10px to 4px
- Disabled 3D transforms on project cards on mobile
- Simplified hover effects on mobile
- Disabled pulsing dots animation on mobile
- Disabled glow border animation on mobile

### JavaScript (script.js)
- Added `throttle` utility function for scroll/mousemove handlers
- Added `isMobile()` helper function
- Throttled scroll progress updates to ~60fps
- Disabled parallax effect on mobile
- Disabled 3D card hover effect on mobile
- Optimized IntersectionObserver to stop observing revealed elements

### HTML (index.html)
- Added `loading="lazy"` to all project card images

