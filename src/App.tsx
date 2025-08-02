import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import { 
  WireframeProject, 
  Screen as ScreenType, 
  WireframeComponent as WireframeComponentType,
  SCREEN_SIZE,
  COMPONENT_COLORS 
} from './types';
import { Screen } from './components/Screen';
import { Connection } from './components/Connection';
import { Sidebar } from './components/Sidebar';
import './App.css';

const App: React.FC = () => {
  const [project, setProject] = useState<WireframeProject>({
    screens: [],
    connections: [],
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ screenId: string; componentId?: string } | null>(null);
  const [connectionDescription, setConnectionDescription] = useState('');
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const addScreen = () => {
    const newScreen: ScreenType = {
      id: uuidv4(),
      position: { 
        x: 50 + project.screens.length * 450, 
        y: 50 
      },
      size: SCREEN_SIZE,
      title: `Screen ${project.screens.length + 1}`,
      components: [],
    };
    
    setProject(prev => ({
      ...prev,
      screens: [...prev.screens, newScreen],
      selectedScreenId: newScreen.id,
    }));
  };

  const duplicateScreen = (screenId: string) => {
    const screenToDuplicate = project.screens.find(s => s.id === screenId);
    if (!screenToDuplicate) return;

    const newScreen: ScreenType = {
      ...screenToDuplicate,
      id: uuidv4(),
      title: `${screenToDuplicate.title} Copy`,
      position: {
        x: screenToDuplicate.position.x + 50,
        y: screenToDuplicate.position.y + 50,
      },
      components: screenToDuplicate.components.map(component => ({
        ...component,
        id: uuidv4(),
        screenId: uuidv4(), // This will be updated below
      })),
    };

    // Update component screenIds to match the new screen
    newScreen.components = newScreen.components.map(component => ({
      ...component,
      screenId: newScreen.id,
    }));

    setProject(prev => ({
      ...prev,
      screens: [...prev.screens, newScreen],
      selectedScreenId: newScreen.id,
    }));
  };

  const updateScreen = (id: string, updates: Partial<ScreenType>) => {
    setProject(prev => ({
      ...prev,
      screens: prev.screens.map(screen => 
        screen.id === id ? { ...screen, ...updates } : screen
      ),
    }));
  };

  const deleteScreen = (id: string) => {
    setProject(prev => ({
      ...prev,
      screens: prev.screens.filter(screen => screen.id !== id),
      connections: prev.connections.filter(conn => 
        conn.fromScreenId !== id && conn.toScreenId !== id
      ),
      selectedScreenId: prev.selectedScreenId === id ? undefined : prev.selectedScreenId,
    }));
  };

  const selectScreen = (id: string) => {
    if (isConnecting && connectionStart && connectionStart.screenId !== id) {
      finishConnection(id);
    } else {
      setProject(prev => ({
        ...prev,
        selectedScreenId: id,
        selectedComponentId: undefined,
      }));
    }
  };

  const selectComponent = (componentId: string) => {
    setProject(prev => ({
      ...prev,
      selectedComponentId: componentId,
      selectedScreenId: undefined,
    }));
  };

  const addComponent = (component: WireframeComponentType) => {
    setProject(prev => ({
      ...prev,
      screens: prev.screens.map(screen => 
        screen.id === component.screenId 
          ? { ...screen, components: [...screen.components, component] }
          : screen
      ),
    }));
  };

  const updateComponent = (id: string, updates: Partial<WireframeComponentType>) => {
    setProject(prev => ({
      ...prev,
      screens: prev.screens.map(screen => ({
        ...screen,
        components: screen.components.map(component =>
          component.id === id ? { ...component, ...updates } : component
        ),
      })),
    }));
  };

  const deleteComponent = (id: string) => {
    setProject(prev => ({
      ...prev,
      screens: prev.screens.map(screen => ({
        ...screen,
        components: screen.components.filter(component => component.id !== id),
      })),
      selectedComponentId: prev.selectedComponentId === id ? undefined : prev.selectedComponentId,
    }));
  };

  const startConnection = () => {
    if (project.selectedComponentId) {
      // Find the screen that contains the selected component
      const componentScreen = project.screens.find(screen => 
        screen.components.some(comp => comp.id === project.selectedComponentId)
      );
      
      if (componentScreen) {
        setIsConnecting(true);
        setConnectionStart({ 
          screenId: componentScreen.id,
          componentId: project.selectedComponentId 
        });
      }
    } else if (project.selectedScreenId) {
      setIsConnecting(true);
      setConnectionStart({ 
        screenId: project.selectedScreenId
      });
    }
  };

  const finishConnection = (targetScreenId: string) => {
    if (connectionStart && connectionStart.screenId !== targetScreenId) {
      const fromScreen = project.screens.find(s => s.id === connectionStart.screenId);
      const toScreen = project.screens.find(s => s.id === targetScreenId);
      
      if (fromScreen && toScreen) {
        let startPoint = {
          x: fromScreen.position.x + fromScreen.size.width / 2,
          y: fromScreen.position.y + fromScreen.size.height / 2,
        };

        // If connecting from a specific component, calculate edge position
        if (connectionStart.componentId) {
          const component = fromScreen.components.find(c => c.id === connectionStart.componentId);
          if (component) {
            const componentAbsoluteX = fromScreen.position.x + component.position.x;
            const componentAbsoluteY = fromScreen.position.y + component.position.y + 40; // Account for header
            const componentCenterX = componentAbsoluteX + component.size.width / 2;
            const componentCenterY = componentAbsoluteY + component.size.height / 2;
            
            const toScreenCenterX = toScreen.position.x + toScreen.size.width / 2;
            const toScreenCenterY = toScreen.position.y + toScreen.size.height / 2;
            
            // Calculate direction from component to target screen
            const dx = toScreenCenterX - componentCenterX;
            const dy = toScreenCenterY - componentCenterY;
            
            // Determine which edge of the component to start from
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);
            
            if (absX > absY) {
              // Horizontal direction is dominant
              if (dx > 0) {
                // Going right
                startPoint = {
                  x: componentAbsoluteX + component.size.width,
                  y: componentCenterY,
                };
              } else {
                // Going left
                startPoint = {
                  x: componentAbsoluteX,
                  y: componentCenterY,
                };
              }
            } else {
              // Vertical direction is dominant
              if (dy > 0) {
                // Going down
                startPoint = {
                  x: componentCenterX,
                  y: componentAbsoluteY + component.size.height,
                };
              } else {
                // Going up
                startPoint = {
                  x: componentCenterX,
                  y: componentAbsoluteY,
                };
              }
            }
          }
        }
        
        // Calculate end point at the edge of the target screen
        const toScreenCenterX = toScreen.position.x + toScreen.size.width / 2;
        const toScreenCenterY = toScreen.position.y + toScreen.size.height / 2;
        
        // Calculate direction from start point to target screen center
        const dx = toScreenCenterX - startPoint.x;
        const dy = toScreenCenterY - startPoint.y;
        
        let endPoint = {
          x: toScreenCenterX,
          y: toScreenCenterY,
        };
        
        // Determine which edge of the target screen to end at
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        
        if (absX > absY) {
          // Horizontal direction is dominant
          if (dx > 0) {
            // Coming from left
            endPoint = {
              x: toScreen.position.x,
              y: toScreenCenterY,
            };
          } else {
            // Coming from right
            endPoint = {
              x: toScreen.position.x + toScreen.size.width,
              y: toScreenCenterY,
            };
          }
        } else {
          // Vertical direction is dominant
          if (dy > 0) {
            // Coming from top
            endPoint = {
              x: toScreenCenterX,
              y: toScreen.position.y,
            };
          } else {
            // Coming from bottom
            endPoint = {
              x: toScreenCenterX,
              y: toScreen.position.y + toScreen.size.height,
            };
          }
        }
        
        const newConnection = {
          id: uuidv4(),
          fromScreenId: connectionStart.screenId,
          toScreenId: targetScreenId,
          fromComponentId: connectionStart.componentId,
          description: connectionDescription || (connectionStart.componentId ? 'Click' : 'Navigate'),
          startPoint,
          endPoint,
        };
        
        setProject(prev => ({
          ...prev,
          connections: [...prev.connections, newConnection],
        }));
      }
    }
    
    setIsConnecting(false);
    setConnectionStart(null);
    setConnectionDescription('');
  };

  const exportAsImage = async () => {
    if (canvasRef.current) {
      try {
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: '#f1f5f9',
          scale: 2,
        });
        
        const link = document.createElement('a');
        link.download = 'wireframe.png';
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Error exporting image:', error);
        alert('Error exporting image. Please try again.');
      }
    }
  };

  const clearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the entire wireframe?')) {
      setProject({
        screens: [],
        connections: [],
      });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isConnecting && (e.target as HTMLElement).classList.contains('canvas')) {
      setIsConnecting(false);
      setConnectionStart(null);
      setConnectionDescription('');
    } else if ((e.target as HTMLElement).classList.contains('canvas')) {
      setProject(prev => ({
        ...prev,
        selectedScreenId: undefined,
        selectedComponentId: undefined,
      }));
    }
  };

  const selectedScreen = project.screens.find(s => s.id === project.selectedScreenId);
  const selectedComponent = project.screens
    .flatMap(s => s.components)
    .find(c => c.id === project.selectedComponentId);

  const canConnect = project.selectedComponentId || project.selectedScreenId;
  const connectionInstructions = isConnecting 
    ? (connectionStart?.componentId 
        ? 'Click on a screen to connect this component' 
        : 'Click on a screen to connect')
    : (project.selectedComponentId 
        ? 'Connect this component to another screen'
        : project.selectedScreenId 
          ? 'Connect this screen to another screen'
          : 'Select a component or screen first');

  return (
    <div className="app">
      <div className="toolbar">
        <h1>Wireframer</h1>
        
        <div className="toolbar-section">
          <button className="btn btn-primary" onClick={addScreen}>
            Add Screen
          </button>
          
          <button 
            className="btn" 
            onClick={startConnection}
            disabled={!canConnect}
            title={connectionInstructions}
          >
            {isConnecting ? 'Click target screen' : 'Connect'}
          </button>
          
          {isConnecting && (
            <input
              type="text"
              placeholder="Connection description"
              value={connectionDescription}
              onChange={(e) => setConnectionDescription(e.target.value)}
              style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
            />
          )}
        </div>
        
        <div className="toolbar-section" style={{ marginLeft: 'auto' }}>
          <button className="btn" onClick={exportAsImage}>
            Export Image
          </button>
          
          <button className="btn" onClick={clearCanvas}>
            Clear All
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flex: 1 }}>
        <div className="canvas-container">
          <div 
            ref={canvasRef}
            className="canvas"
            onClick={handleCanvasClick}
            style={{ minHeight: '1000px', minWidth: '1500px' }}
          >
            {project.screens.map((screen) => (
              <Screen
                key={screen.id}
                screen={screen}
                isSelected={project.selectedScreenId === screen.id}
                selectedComponentId={project.selectedComponentId}
                onSelect={selectScreen}
                onUpdate={updateScreen}
                onDuplicate={duplicateScreen}
                onDelete={deleteScreen}
                onComponentSelect={selectComponent}
                onComponentUpdate={updateComponent}
                onComponentDelete={deleteComponent}
                onComponentAdd={addComponent}
              />
            ))}
            
            {project.connections.map((connection) => (
              <Connection key={connection.id} connection={connection} />
            ))}
          </div>
        </div>
        
        <Sidebar
          selectedScreen={selectedScreen}
          selectedComponent={selectedComponent}
          onScreenUpdate={updateScreen}
          onComponentUpdate={updateComponent}
        />
      </div>
    </div>
  );
};

export default App;
