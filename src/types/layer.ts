// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  annotations: any[];
  opacity: number;
}
