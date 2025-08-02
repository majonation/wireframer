import React, { useState, useRef } from 'react';
import { WireframeComponent as WireframeComponentType, Position } from '../types';

interface Props {
  component: WireframeComponentType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<WireframeComponentType>) => void;
  onDelete: (id: string) => void;
  screenPosition: Position;
}

export const WireframeComponent: React.FC<Props> = ({
  component,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  screenPosition,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(component.label);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState<{ size: { width: number; height: number }; mouse: Position }>({
    size: { width: 0, height: 0 },
    mouse: { x: 0, y: 0 },
  });
  const componentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(component.id);
    
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeStart({
        size: { width: component.size.width, height: component.size.height },
        mouse: { x: e.clientX, y: e.clientY },
      });
    } else if (!(e.target as HTMLElement).classList.contains('component-label-input')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - component.position.x,
        y: e.clientY - component.position.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(400 - component.size.width, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(300 - component.size.height, e.clientY - dragStart.y));
      
      onUpdate(component.id, {
        position: { x: newX, y: newY },
      });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.mouse.x;
      const deltaY = e.clientY - resizeStart.mouse.y;
      
      const newWidth = Math.max(40, Math.min(400 - component.position.x, resizeStart.size.width + deltaX));
      const newHeight = Math.max(20, Math.min(300 - component.position.y, resizeStart.size.height + deltaY));
      
      onUpdate(component.id, {
        size: { width: newWidth, height: newHeight },
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, component]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!isEditing) {
        onDelete(component.id);
      }
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(component.label);
  };

  const handleLabelSubmit = () => {
    onUpdate(component.id, { label: editValue.trim() || 'Component' });
    setIsEditing(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(component.label);
    }
  };

  const handleLabelBlur = () => {
    handleLabelSubmit();
  };

  return (
    <div
      ref={componentRef}
      className={`wireframe-component ${isSelected ? 'selected' : ''}`}
      style={{
        left: component.position.x,
        top: component.position.y,
        width: component.size.width,
        height: component.size.height,
        borderColor: component.color,
        color: component.color,
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="component-label-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleLabelKeyDown}
          onBlur={handleLabelBlur}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            textAlign: 'center',
            width: '100%',
            outline: 'none',
          }}
        />
      ) : (
        <span onClick={handleLabelClick} style={{ cursor: 'text' }}>
          {component.label}
        </span>
      )}
      {isSelected && (
        <div className="resize-handle se" />
      )}
    </div>
  );
};
