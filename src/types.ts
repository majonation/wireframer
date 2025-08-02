export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WireframeComponent {
  id: string;
  position: Position;
  size: Size;
  label: string;
  color: string;
  screenId: string;
}

export interface Screen {
  id: string;
  position: Position;
  size: Size;
  title: string;
  components: WireframeComponent[];
}

export interface Connection {
  id: string;
  fromScreenId: string;
  toScreenId: string;
  fromComponentId?: string;
  description: string;
  startPoint: Position;
  endPoint: Position;
}

export interface WireframeProject {
  screens: Screen[];
  connections: Connection[];
  selectedScreenId?: string;
  selectedComponentId?: string;
}

export const COMPONENT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
] as const;

export const SCREEN_SIZE = {
  width: 400,
  height: 300,
} as const;
