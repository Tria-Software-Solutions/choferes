export interface Courier {
  id: number;
  driver: string;
  route: string;
  distance: number;
  trackingNumber: string;
  status: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
