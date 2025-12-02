# EchoVault Frontend - Styling Guide

## Using the Template

### Basic Setup

1. **Copy template.html** to create new pages
2. **Update the title** and meta information
3. **Modify the main content** section as needed
4. **Import required JavaScript modules**

### Template Features

- **Responsive Layout**: Flexbox-based layout with sidebar and main content
- **Dark Theme**: Pre-configured dark mode styling
- **Component Loading**: Automatic navbar and sidebar loading
- **Tailwind CSS**: Utility-first CSS framework included

### Creating a New Page

1. **Copy the template**:
   ```bash
   cp html/template.html html/your-page.html
   ```

2. **Update the page title**:
   ```html
   <title>EchoVault - Your Page Name</title>
   ```

3. **Replace the main content**:
   ```html
   <main class="flex-1 pt-8 pb-12">
       <!-- Your page content here -->
   </main>
   ```

4. **Add page-specific JavaScript**:
   ```html
   <script type="module">
       import { loadNavbar } from '../js/navigation/navbar.js';
       import { loadSidebar } from '../js/navigation/sidebar.js';
       import { initializePage } from '../js/pages/your-page.js';
       
       loadNavbar('navbar-container');
       loadSidebar('sidebar-container');
       initializePage();
   </script>
   ```

### Component Integration

The template automatically loads:
- **Navbar**: Top navigation component
- **Sidebar**: Side navigation component
- **Main.js**: Application-wide functionality

To add new components:
1. Create the component in the appropriate `js/` subdirectory
2. Export the necessary functions
3. Import and initialize in your page script

### Best Practices

1. **Keep components small** and focused
2. **Use semantic HTML** elements
3. **Test on desktop and laptop** screens (primary target)
4. **Maintain consistent spacing** and layout patterns
5. **Comment complex functionality** when necessary

## Design System

### Color Scheme

The application uses a dark theme with the following color palette:

- **Primary Background**: `bg-gray-900` - Main application background
- **Secondary Background**: `bg-gray-800` - Cards, modals, elevated surfaces
- **Text Colors**: 
  - Primary: `text-white` - Main content text
  - Secondary: `text-gray-400` - Descriptions, subtitles
- **Accent Colors**:
  - Primary Button: `bg-[#55A5F8]` with `hover:bg-[#3F8CE0]`
  - Secondary Button: `bg-gray-700` with `hover:bg-gray-600`

### Layout System

#### Main Layout Structure

```html
<body class="h-full bg-gray-900 text-white">
  <div id="navbar-container"></div>
  <div class="flex max-h-screen bg-gray-900">
    <div id="sidebar-container" class="flex-shrink-0"></div>
    <main class="flex-1 pt-8 pb-12">
      <!-- Page content -->
    </main>
  </div>
</body>
```

#### Content Containers

- **Max Width**: Use `max-w-7xl mx-auto` for content containers
- **Main Padding**: `pt-8 pb-12` for consistent vertical spacing
- **No Horizontal Padding**: Content sits flush against sidebar for desktop/laptop optimization

### Typography

#### Headings

```html
<!-- Page Title -->
<h1 class="text-4xl md:text-6xl font-bold text-white mb-6">

<!-- Section Heading -->
<h2 class="text-3xl font-bold text-center text-white mb-12">

<!-- Card Title -->
<h3 class="text-xl font-semibold text-white">
```

#### Body Text

```html
<!-- Primary Text -->
<p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">

<!-- Description Text -->
<p class="text-gray-400">
```

### Component Styling

#### Buttons

**Primary Button:**
```html
<button class="px-6 py-3 rounded-lg font-semibold bg-[#55A5F8] text-white hover:bg-[#3F8CE0] focus:outline-none focus:ring-2 focus:ring-[#55A5F8] focus:ring-offset-gray-900 transition-all duration-200">
```

**Secondary Button:**
```html
<button class="px-6 py-3 rounded-lg font-semibold bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-all duration-200">
```

#### Cards

```html
<div class="bg-gray-800 rounded-lg shadow-lg p-8 transition-colors duration-300">
  <!-- Card content -->
</div>
```

#### Grid Layouts

```html
<!-- Two Column Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
  <!-- Grid items -->
</div>
```

### Responsive Guidelines

#### Target Devices
- **Primary**: Desktop and laptop screens
- **Breakpoints**: Use `md:` and `lg:` prefixes for responsive behavior
- **No Mobile**: Skip `sm:` classes unless specifically needed

#### Layout Behavior
```html
<!-- Responsive Button Container -->
<div class="flex flex-col sm:flex-row gap-4 justify-center">

<!-- Responsive Text Size -->
<h1 class="text-4xl md:text-6xl font-bold">
```

### Interactive States

#### Hover Effects
```css
/* Button Hover */
hover:bg-[#3F8CE0]
hover:bg-gray-600

/* Card Hover (optional) */
transition-colors duration-300
```

#### Focus States
```css
/* Button Focus */
focus:outline-none 
focus:ring-2 
focus:ring-[#55A5F8] 
focus:ring-offset-gray-900
```

### Spacing System

#### Margins
- **Section Spacing**: `mb-16` between major sections
- **Content Spacing**: `mb-6`, `mb-8`, `mb-12` for content hierarchy
- **Small Spacing**: `mb-4` for related elements

#### Padding
- **Card Padding**: `p-8` for card interiors
- **Button Padding**: `px-6 py-3` for standard buttons
- **Main Content**: `pt-8 pb-12` for page content

### Shadows and Effects

#### Shadows
```css
/* Card Shadow */
shadow-lg

/* Custom shadows (if needed) */
shadow-xl
```

#### Transitions
```css
/* Standard Transition */
transition-all duration-200

/* Color Transitions */
transition-colors duration-300
```

### Best Practices

1. **Consistency**: Always use the established color palette
2. **Accessibility**: Maintain proper contrast ratios
3. **Performance**: Use Tailwind's utility classes for optimal CSS delivery
4. **Dark Theme**: Ensure all components work with the dark theme
5. **Spacing**: Follow the established spacing system for visual harmony
6. **Desktop First**: Optimize layouts for desktop/laptop viewing

### Quick Reference

```html
<!-- Standard Page Container -->
<section class="max-w-7xl mx-auto text-center mb-16">

<!-- Standard Card -->
<div class="bg-gray-800 rounded-lg shadow-lg p-8">

<!-- Standard Button Group -->
<div class="flex flex-col sm:flex-row gap-4 justify-center">
  <button class="px-6 py-3 rounded-lg font-semibold bg-[#55A5F8] text-white hover:bg-[#3F8CE0] focus:outline-none focus:ring-2 focus:ring-[#55A5F8] focus:ring-offset-gray-900 transition-all duration-200">
    Primary Action
  </button>
</div>
```

This styling system ensures consistent, professional appearance across all pages while maintaining the dark theme aesthetic.