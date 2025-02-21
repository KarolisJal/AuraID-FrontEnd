export enum NotificationType {
  ACCESS_REQUEST_SUBMITTED = 'ACCESS_REQUEST_SUBMITTED',
  ACCESS_REQUEST_APPROVED = 'ACCESS_REQUEST_APPROVED',
  ACCESS_REQUEST_REJECTED = 'ACCESS_REQUEST_REJECTED',
  ACCESS_REQUEST_CANCELLED = 'ACCESS_REQUEST_CANCELLED',
  RESOURCE_CREATED = 'RESOURCE_CREATED',
  RESOURCE_UPDATED = 'RESOURCE_UPDATED',
  RESOURCE_DELETED = 'RESOURCE_DELETED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED'
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  referenceType: string | null;
  referenceId: number | null;
  timeAgo: string;
  icon: string;
}

export interface NotificationResponse {
  content: Notification[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
} 