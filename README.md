# Wireframer - Visual UX/UI Design Tool

A modern, intuitive wireframing tool built with React and TypeScript for quickly creating visual mockups and user flow diagrams.

## Features

- **Drag & Drop Interface**: Easily create and position screens and components
- **Visual Components**: Rectangle components with X-diagonal patterns to simulate UI elements
- **Customizable**: Change colors, labels, and sizes of components
- **Screen Connections**: Draw arrows between screens to show user flow
- **Export Functionality**: Export your wireframes as high-quality PNG images
- **Responsive Design**: Clean, modern interface that works on different screen sizes

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wireframer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## How to Use

### Creating Screens
1. Click the "Add Screen" button in the toolbar
2. Drag screens by their header to reposition them
3. Select a screen to edit its properties in the sidebar

### Adding Components
1. Double-click on any screen's content area to add a component
2. Drag components to move them within the screen
3. Use the resize handle (bottom-right corner) to change component size
4. Select components to edit their properties (label, color, position, size)

### Creating Connections
1. Select a screen you want to connect from
2. Click "Connect Screens" in the toolbar
3. Optionally add a description for the connection
4. Click on the target screen to create the connection arrow

### Exporting
- Click "Export Image" to download your wireframe as a PNG file
- The export includes all screens, components, and connections

### Keyboard Shortcuts
- `Delete` or `Backspace`: Delete selected component
- Click empty canvas area to deselect all items

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and better development experience
- **HTML2Canvas**: For exporting wireframes as images
- **CSS3**: Modern styling with flexbox and grid
- **UUID**: For generating unique identifiers

## Project Structure

```
src/
├── components/
│   ├── WireframeComponent.tsx  # Individual draggable components
│   ├── Screen.tsx              # Screen containers
│   ├── Connection.tsx          # Arrow connections between screens
│   └── Sidebar.tsx             # Properties panel
├── types.ts                    # TypeScript type definitions
├── App.tsx                     # Main application component
├── App.css                     # Global styles
└── index.tsx                   # Application entry point
```

## Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App (not recommended)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.