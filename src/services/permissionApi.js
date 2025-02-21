import { api } from './api';

/**
 * Matches the backend PermissionType enum
 * @enum {string}
 */
export const PermissionType = {
  READ: 'READ',
  WRITE: 'WRITE',
  DELETE: 'DELETE',
  ADMIN: 'ADMIN'
};

/**
 * Maps permission types to their numeric IDs (1-based index to match Java enum ordinal)
 * @enum {number}
 */
export const PermissionTypeId = {
  READ: 1,
  WRITE: 2,
  DELETE: 3,
  ADMIN: 4
};

/**
 * Maps numeric IDs back to permission types
 * @param {number} id
 * @returns {string}
 */
export const getPermissionTypeById = (id) => {
  const types = Object.entries(PermissionTypeId);
  const found = types.find(([_, value]) => value === id);
  return found ? found[0] : null;
};

/**
 * @typedef Permission
 * @property {number} id
 * @property {PermissionType} name - The permission type
 * @property {string} description
 * @property {boolean} enabled
 */

export const permissionApi = {
  /**
   * Get all permissions with optional pagination
   * @param {number} page - Page number (0-based)
   * @param {number} size - Page size
   * @returns {Promise<{ content: Permission[], totalElements: number }>}
   */
  getAllPermissions: (page = 0, size = 10) => 
    api.get('/permissions', {
      params: { page, size }
    }),
  
  /**
   * Get a single permission by ID
   * @param {number} id - Permission ID
   * @returns {Promise<Permission>}
   */
  getPermissionById: (id) => 
    api.get(`/permissions/${id}`),
  
  /**
   * Create a new permission
   * @param {Omit<Permission, 'id'>} permissionData
   * @returns {Promise<Permission>}
   */
  createPermission: (permissionData) => 
    api.post('/permissions', permissionData),
  
  /**
   * Update an existing permission
   * @param {number} id - Permission ID
   * @param {Partial<Permission>} permissionData
   * @returns {Promise<Permission>}
   */
  updatePermission: (id, permissionData) => 
    api.put(`/permissions/${id}`, permissionData),
  
  /**
   * Delete a permission
   * @param {number} id - Permission ID
   * @returns {Promise<void>}
   */
  deletePermission: (id) => 
    api.delete(`/permissions/${id}`)
};