export const NotificationType = {
    ACCESS_REQUEST_SUBMITTED: 'ACCESS_REQUEST_SUBMITTED',
    ACCESS_REQUEST_APPROVED: 'ACCESS_REQUEST_APPROVED',
    ACCESS_REQUEST_REJECTED: 'ACCESS_REQUEST_REJECTED',
    ACCESS_REQUEST_CANCELLED: 'ACCESS_REQUEST_CANCELLED',
    RESOURCE_CREATED: 'RESOURCE_CREATED',
    RESOURCE_UPDATED: 'RESOURCE_UPDATED',
    RESOURCE_DELETED: 'RESOURCE_DELETED',
    PERMISSION_GRANTED: 'PERMISSION_GRANTED',
    PERMISSION_REVOKED: 'PERMISSION_REVOKED'
};

/**
 * @typedef {Object} NotificationDTO
 * @property {number} id
 * @property {string} title
 * @property {string} message
 * @property {string} type
 * @property {boolean} read
 * @property {string|null} readAt
 * @property {string} createdAt
 * @property {string} referenceType
 * @property {number} referenceId
 * @property {string} timeAgo
 * @property {string} icon
 */ 