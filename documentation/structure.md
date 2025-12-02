# EchoVault Frontend - Project Structure

## Directory Structure

```
EchoVault-Frontend/
├── html/
│   └── template.html          # Main HTML template
├── js/
│   ├── main.js               # Application entry point
│   └── navigation/           # Navigation components
│       ├── navbar.js         # Top navigation bar
│       └── sidebar.js        # Side navigation menu
├── imgs/                     # Image assets
└── documentation/            # Project documentation
```

## JavaScript Package Structure

### Core Principles

1. **Modular Design**: Each component is self-contained with clear responsibilities
2. **ES6 Modules**: Use import/export for module management
3. **Folder Organization**: Group related functionality in subdirectories
4. **Naming Conventions**: Use descriptive names that reflect functionality
5. **Image File Structure**: Place images in imgs in a subfolder with the same name as the html page

### Recommended Package Structure

```
js/
├── main.js                   # Application bootstrap
├── components/               # Reusable UI components
│   ├── buttons/
│   ├── forms/
│   └── modals/
├── navigation/               # Navigation-related modules
│   ├── navbar.js
│   └── sidebar.js
├── pages/                    # Page-specific logic
│   ├── home/
│   ├── dashboard/
│   └── settings/
├── utils/                    # Utility functions
│   ├── api.js
│   ├── helpers.js
│   └── constants.js
└── services/                 # External service integrations
    ├── auth.js
    └── data.js
```

### Module Creation Guidelines

1. **Export Functions**: Use named exports for better tree-shaking
2. **Import Dependencies**: Import only what you need
3. **Self-Contained**: Each module should work independently
4. **Clear Interface**: Provide clear public API

Example module structure:
```javascript
// js/components/button/primaryButton.js
export function createPrimaryButton(text, onClick) {
    // Implementation
}

export function destroyPrimaryButton(element) {
    // Implementation
}
```

