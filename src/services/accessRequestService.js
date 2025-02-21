import { api } from './api';

export const accessRequestService = {
    createRequest: (data) => {
        console.log('Creating access request with data:', {
            resourceId: data.resourceId,
            permissionId: data.permissionId,
            justification: data.justification,
            // Log any additional fields
            additionalFields: Object.keys(data).filter(k => !['resourceId', 'permissionId', 'justification'].includes(k))
        });
        
        // Validate data before sending
        if (!data.resourceId || !data.permissionId || !data.justification) {
            console.error('Missing required fields:', {
                hasResourceId: !!data.resourceId,
                hasPermissionId: !!data.permissionId,
                hasJustification: !!data.justification
            });
            throw new Error('Missing required fields');
        }

        // Ensure data types are correct
        const requestData = {
            resourceId: Number(data.resourceId),
            permissionId: Number(data.permissionId),
            justification: String(data.justification).trim()
        };

        console.log('Sending formatted request data:', requestData);
        
        return api.post('/access-requests', requestData);
    },

    getRequestById: (id) =>
        api.get(`/workflow-dashboard/requests/${id}`),

    getRequests: async (type = 'all', page = 0, size = 10, sort = 'createdAt,desc', isAdmin = false) => {
        const params = {
            page,
            size,
            sort,
            includeDetails: true,
            includeResource: true,
            includePermission: true,
            includeWorkflow: true
        };

        try {
            let endpoint;
            if (isAdmin) {
                switch (type) {
                    case 'pending':
                        endpoint = '/workflow-dashboard/admin/pending-requests';
                        break;
                    case 'all':
                    default:
                        endpoint = '/workflow-dashboard/admin/all-requests';
                        break;
                }
            } else {
                endpoint = '/workflow-dashboard/user/my-requests';
            }

            console.log('Using endpoint:', endpoint);
            console.log('With params:', params);
            
            const response = await api.get(endpoint, { params });
            console.log('Raw response data:', JSON.stringify(response.data, null, 2));

            // Transform the response data to match expected format
            if (response.data?.content) {
                const transformedContent = response.data.content.map(item => ({
                    id: item.requestId,
                    status: item.status,
                    resource: {
                        name: item.resourceName,
                        type: item.resourceType
                    },
                    requester: item.requesterName,
                    workflow: {
                        name: item.workflowName
                    },
                    currentStep: {
                        name: item.currentStepName,
                        order: item.currentStepOrder,
                        total: item.totalSteps
                    },
                    createdAt: item.createdAt,
                    pendingApprovers: item.pendingApprovers,
                    recentActions: item.recentActions
                }));

                console.log('Transformed content:', transformedContent);

                return {
                    data: {
                        content: transformedContent,
                        totalElements: response.data.totalElements,
                        totalPages: response.data.totalPages,
                        size: response.data.pageSize,
                        number: response.data.pageNumber
                    }
                };
            }

            return {
                data: {
                    content: [],
                    totalElements: 0,
                    totalPages: 1,
                    size,
                    number: page
                }
            };
        } catch (error) {
            console.error('Error fetching requests:', error);
            throw error;
        }
    },

    getPendingRequests: (page = 0, size = 10, sort = 'createdAt,desc') =>
        api.get('/workflow-dashboard/admin/pending-requests', {
            params: { 
                page, 
                size, 
                sort,
                includeDetails: true,
                includeResource: true,
                includePermission: true,
                includeWorkflow: true
            }
        }),

    getRequestsByStatus: (status, page = 0, size = 10, sort = 'createdAt,desc') =>
        api.get(`/workflow-dashboard/admin/requests/status/${status}`, {
            params: { 
                page, 
                size, 
                sort,
                includeDetails: true,
                includeResource: true,
                includePermission: true,
                includeWorkflow: true
            }
        }),

    getMyRequests: (page = 0, size = 10, sort = 'createdAt,desc') =>
        api.get('/workflow-dashboard/user/my-requests', {
            params: { 
                page, 
                size, 
                sort,
                includeDetails: true,
                includeResource: true,
                includePermission: true,
                includeWorkflow: true
            }
        }),

    getRequestsByResource: (resourceId, page = 0, size = 10, sort = 'createdAt,desc') =>
        api.get(`/workflow-dashboard/admin/requests/resource/${resourceId}`, {
            params: { 
                page, 
                size, 
                sort,
                includeDetails: true,
                includeResource: true,
                includePermission: true,
                includeWorkflow: true
            }
        }),

    getPendingCount: () =>
        api.get('/workflow-dashboard/admin/pending-requests/count'),

    approveRequest: (id, comment) =>
        api.post(`/access-requests/${id}/approve`, null, { params: { comment } }),

    rejectRequest: (id, comment) =>
        api.post(`/access-requests/${id}/reject`, null, { params: { comment } }),

    cancelRequest: (id) =>
        api.post(`/access-requests/${id}/cancel`)
}; 