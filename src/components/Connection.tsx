import React from 'react';
import { Connection as ConnectionType } from '../types';

interface Props {
  connection: ConnectionType;
}

export const Connection: React.FC<Props> = ({ connection }) => {
  const { startPoint, endPoint, description } = connection;
  
  // Calculate arrow direction
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return null;
  
  // Normalize direction
  const unitX = dx / length;
  const unitY = dy / length;
  
  // Arrow head size
  const arrowSize = 10;
  
  // Calculate arrow head points
  const arrowX1 = endPoint.x - arrowSize * unitX - arrowSize * 0.5 * unitY;
  const arrowY1 = endPoint.y - arrowSize * unitY + arrowSize * 0.5 * unitX;
  const arrowX2 = endPoint.x - arrowSize * unitX + arrowSize * 0.5 * unitY;
  const arrowY2 = endPoint.y - arrowSize * unitY - arrowSize * 0.5 * unitX;
  
  // Calculate label position (middle of the line)
  const labelX = (startPoint.x + endPoint.x) / 2;
  const labelY = (startPoint.y + endPoint.y) / 2;
  
  return (
    <>
      <svg
        className="connection-line"
        style={{
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          position: 'absolute',
          pointerEvents: 'none',
        }}
      >
        {/* Main line */}
        <line
          x1={startPoint.x}
          y1={startPoint.y}
          x2={endPoint.x}
          y2={endPoint.y}
          className="connection-arrow"
        />
        
        {/* Arrow head */}
        <polygon
          points={`${endPoint.x},${endPoint.y} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
          className="connection-arrow"
        />
      </svg>
      
      {/* Label */}
      {description && (
        <div
          className="connection-label"
          style={{
            left: labelX - 75, // Center the label (assuming max-width of 150px)
            top: labelY - 10,
          }}
        >
          {description}
        </div>
      )}
    </>
  );
};
