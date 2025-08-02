import React from 'react';
import { Screen, WireframeComponent, COMPONENT_COLORS } from '../types';

interface Props {
  selectedScreen?: Screen;
  selectedComponent?: WireframeComponent;
  onScreenUpdate: (id: string, updates: Partial<Screen>) => void;
  onComponentUpdate: (id: string, updates: Partial<WireframeComponent>) => void;
}

export const Sidebar: React.FC<Props> = ({
  selectedScreen,
  selectedComponent,
  onScreenUpdate,
  onComponentUpdate,
}) => {
  if (selectedComponent) {
    return (
      <div className="sidebar">
        <h3>Component Properties</h3>
        
        <div className="form-group">
          <label>Label</label>
          <input
            type="text"
            value={selectedComponent.label}
            onChange={(e) => onComponentUpdate(selectedComponent.id, { label: e.target.value })}
            placeholder="Container label"
          />
        </div>
        
        <div className="form-group">
          <label>Color</label>
          <div className="color-picker">
            {COMPONENT_COLORS.map((color) => (
              <div
                key={color}
                className={`color-option ${selectedComponent.color === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => onComponentUpdate(selectedComponent.id, { color })}
              />
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Position X</label>
          <input
            type="number"
            value={selectedComponent.position.x}
            onChange={(e) => onComponentUpdate(selectedComponent.id, {
              position: { ...selectedComponent.position, x: parseInt(e.target.value) || 0 }
            })}
          />
        </div>
        
        <div className="form-group">
          <label>Position Y</label>
          <input
            type="number"
            value={selectedComponent.position.y}
            onChange={(e) => onComponentUpdate(selectedComponent.id, {
              position: { ...selectedComponent.position, y: parseInt(e.target.value) || 0 }
            })}
          />
        </div>
        
        <div className="form-group">
          <label>Width</label>
          <input
            type="number"
            value={selectedComponent.size.width}
            onChange={(e) => onComponentUpdate(selectedComponent.id, {
              size: { ...selectedComponent.size, width: parseInt(e.target.value) || 40 }
            })}
            min="40"
            max="400"
          />
        </div>
        
        <div className="form-group">
          <label>Height</label>
          <input
            type="number"
            value={selectedComponent.size.height}
            onChange={(e) => onComponentUpdate(selectedComponent.id, {
              size: { ...selectedComponent.size, height: parseInt(e.target.value) || 20 }
            })}
            min="20"
            max="300"
          />
        </div>
      </div>
    );
  }
  
  if (selectedScreen) {
    return (
      <div className="sidebar">
        <h3>Screen Properties</h3>
        
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={selectedScreen.title}
            onChange={(e) => onScreenUpdate(selectedScreen.id, { title: e.target.value })}
            placeholder="Screen title"
          />
        </div>
        
        <div className="form-group">
          <label>Position X</label>
          <input
            type="number"
            value={selectedScreen.position.x}
            onChange={(e) => onScreenUpdate(selectedScreen.id, {
              position: { ...selectedScreen.position, x: parseInt(e.target.value) || 0 }
            })}
          />
        </div>
        
        <div className="form-group">
          <label>Position Y</label>
          <input
            type="number"
            value={selectedScreen.position.y}
            onChange={(e) => onScreenUpdate(selectedScreen.id, {
              position: { ...selectedScreen.position, y: parseInt(e.target.value) || 0 }
            })}
          />
        </div>
        
        <div className="form-group">
          <label>Components</label>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {selectedScreen.components.length} component(s)
          </p>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Double-click on the screen to add components
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="sidebar">
      <h3>Getting Started</h3>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
        • Click "Add Screen" to create a new screen<br/>
        • Double-click on a screen to quickly add containers<br/>
        • Click on container labels to edit them inline<br/>
        • Drag containers and screens to move them<br/>
        • Use the resize handle to change container size<br/>
        • Select a container, then click "Connect" to link to another screen<br/>
        • Use the three dots menu (⋮) on screens to duplicate or delete<br/>
        • Export your wireframe as an image when done
      </p>
    </div>
  );
};
