export interface DDTWidgetData {
  desired: number;
  room: number;
  flour: number;
  friction: number;
  unit: "F" | "C";
  target: number;
}

export const DEFAULT_DDT_DATA: DDTWidgetData = {
  desired: 78,
  room: 72,
  flour: 72,
  friction: 24,
  unit: "F",
  target: 66,
};

export function calculateWaterTemp(data: Pick<DDTWidgetData, "desired" | "room" | "flour" | "friction">): number {
  return data.desired * 3 - (data.room + data.flour + data.friction);
}
