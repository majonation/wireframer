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
        x: 50 + project.screens.length * 350, 
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
    setProject(prev => ({
      ...prev,
      selectedScreenId: id,
      selectedComponentId: undefined,
    }));
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
    if (project.selectedScreenId) {
      setIsConnecting(true);
      setConnectionStart({ 
        screenId: project.selectedScreenId,
        componentId: project.selectedComponentId 
      });
    }
  };

  const finishConnection = (targetScreenId: string) => {
    if (connectionStart && connectionStart.screenId !== targetScreenId) {
      const fromScreen = project.screens.find(s => s.id === connectionStart.screenId);
      const toScreen = project.screens.find(s => s.id === targetScreenId);
      
      if (fromScreen && toScreen) {
        const startPoint = {
          x: fromScreen.position.x + fromScreen.size.width / 2,
          y: fromScreen.position.y + fromScreen.size.height / 2,
        };
        
        const endPoint = {
          x: toScreen.position.x + toScreen.size.width / 2,
          y: toScreen.position.y + toScreen.size.height / 2,
        };
        
        const newConnection = {
          id: uuidv4(),
          fromScreenId: connectionStart.screenId,
          toScreenId: targetScreenId,
          fromComponentId: connectionStart.componentId,
          description: connectionDescription || 'Navigate',
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
            disabled={!project.selectedScreenId || isConnecting}
          >
            {isConnecting ? 'Click target screen' : 'Connect Screens'}
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
                onSelect={isConnecting ? finishConnection : selectScreen}
                onUpdate={updateScreen}
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
