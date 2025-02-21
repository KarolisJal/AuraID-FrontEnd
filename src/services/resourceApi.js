import { api } from './api';

// Resource Types enum
export const ResourceType = {
  APPLICATION: 'APPLICATION',
  FOLDER: 'FOLDER',
  SYSTEM: 'SYSTEM',
  DATABASE: 'DATABASE',
  API: 'API',
  NETWORK_RESOURCE: 'NETWORK_RESOURCE'
};

// Permission Types enum
export const PermissionType = {
  READ: 'READ',
  WRITE: 'WRITE',
  EXECUTE: 'EXECUTE',
  ADMIN: 'ADMIN',
  CONFIGURE: 'CONFIGURE'
};

export const resourceApi = {
  // Resource Management
  getAllResources: (params = {}, config = {}) => {
    const { page = 0, size = 10, sort = '' } = params;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    if (sort) {
      queryParams.append('sort', sort);
    }

    const url = `/resources?${queryParams.toString()}`;
    console.log('Making getAllResources request:', {
      url,
      params,
      config
    });

    return api.get(url, config)
      .then(response => {
        console.log('getAllResources response:', {
          status: response.status,
          data: response.data,
          headers: response.headers
        });
        return response;
      })
      .catch(error => {
        console.error('getAllResources error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
        throw error;
      });
  },
  
  getResourceById: (id) => 
    api.get(`/resources/${id}`),
  
  createResource: (resourceData) => 
    api.post('/resources', resourceData),
  
  updateResource: (id, resourceData) => 
    api.put(`/resources/${id}`, resourceData),
  
  deleteResource: (id) => 
    api.delete(`/resources/${id}`),
  
  // Resource Type Specific
  getResourcesByType: (type, page = 0, size = 10, sort = '') => 
    api.get(`/resources/type/${type}`, {
      params: { page, size, sort }
    }),
  
  getResourcesByCreator: (creatorId, page = 0, size = 10, sort = '') => 
    api.get(`/resources/creator/${creatorId}`, {
      params: { page, size, sort }
    }),
  
  // Permission Management
  checkAccess: (resourceId, permissionName) => 
    api.get(`/resources/${resourceId}/access/${permissionName}`),
  
  getResourcePermissions: (resourceId) => 
    api.get(`/resources/${resourceId}/permissions`),
  
  addPermission: (resourceId, permissionData) => 
    api.post(`/resources/${resourceId}/permissions`, permissionData),
  
  updatePermission: (resourceId, permissionId, permissionData) => 
    api.put(`/resources/${resourceId}/permissions/${permissionId}`, permissionData),
  
  deletePermission: (resourceId, permissionId) => 
    api.delete(`/resources/${resourceId}/permissions/${permissionId}`),
  
  // Validation helpers
  validatePath: (path) => 
    api.post('/resources/validate-path', { path }),
  
  checkNameExists: async (name) => {
    try {
      console.log('Checking if name exists:', name);
      const response = await api.get(`/resources?page=0&size=1&name=${encodeURIComponent(name)}`);
      console.log('Name check response:', response?.data);
      
      // Check if any resource in the response has the exact same name (case-sensitive)
      const exists = response?.data?.content?.some(resource => resource.name === name);
      console.log('Exact name match result:', exists);
      return exists;
    } catch (error) {
      console.error('Error checking name existence:', error);
      throw error;
    }
  },
}; 