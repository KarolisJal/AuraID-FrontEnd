export const AccessRequestStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED'
};

// These are JSDoc type definitions for documentation and IDE support
/**
 * @typedef {Object} AccessRequestDTO
 * @property {number} id
 * @property {number} resourceId
 * @property {number} permissionId
 * @property {string} justification
 * @property {string} status
 * @property {string|null} approverComment
 * @property {string|null} approvedAt
 * @property {string} createdAt
 * @property {string} resourceName
 * @property {string} permissionName
 * @property {string} requesterName
 * @property {string|null} approverName
 */

/**
 * @typedef {Object} CreateAccessRequestDTO
 * @property {number} resourceId
 * @property {number} permissionId
 * @property {string} justification
 */ 