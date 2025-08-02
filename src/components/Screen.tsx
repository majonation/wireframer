import React, { useState } from 'react';
import { Screen as ScreenType, WireframeComponent as WireframeComponentType, Position, COMPONENT_COLORS } from '../types';
import { WireframeComponent } from './WireframeComponent';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  screen: ScreenType;
  isSelected: boolean;
  selectedComponentId?: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ScreenType>) => void;
  onComponentSelect: (componentId: string) => void;
  onComponentUpdate: (componentId: string, updates: Partial<WireframeComponentType>) => void;
  onComponentDelete: (componentId: string) => void;
  onComponentAdd: (component: WireframeComponentType) => void;
}

export const Screen: React.FC<Props> = ({
  screen,
  isSelected,
  selectedComponentId,
  onSelect,
  onUpdate,
  onComponentSelect,
  onComponentUpdate,
  onComponentDelete,
  onComponentAdd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('screen-header')) {
      onSelect(screen.id);
      setIsDragging(true);
      setDragStart({
        x: e.clientX - screen.position.x,
        y: e.clientY - screen.position.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onUpdate(screen.id, {
        position: {
          x: Math.max(0, e.clientX - dragStart.x),
          y: Math.max(0, e.clientY - dragStart.y),
        },
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, screen]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('screen-content')) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newComponent: WireframeComponentType = {
        id: uuidv4(),
        position: { x: Math.max(0, x - 50), y: Math.max(0, y - 25) },
        size: { width: 100, height: 50 },
        label: 'Component',
        color: COMPONENT_COLORS[0],
        screenId: screen.id,
      };
      
      onComponentAdd(newComponent);
      onComponentSelect(newComponent.id);
    }
  };

  return (
    <div
      className={`screen ${isSelected ? 'selected' : ''}`}
      style={{
        left: screen.position.x,
        top: screen.position.y,
        width: screen.size.width,
        height: screen.size.height,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="screen-header">
        {screen.title}
      </div>
      <div 
        className="screen-content"
        onDoubleClick={handleDoubleClick}
      >
        {screen.components.map((component) => (
          <WireframeComponent
            key={component.id}
            component={component}
            isSelected={selectedComponentId === component.id}
            onSelect={onComponentSelect}
            onUpdate={onComponentUpdate}
            onDelete={onComponentDelete}
            screenPosition={screen.position}
          />
        ))}
      </div>
    </div>
  );
};
