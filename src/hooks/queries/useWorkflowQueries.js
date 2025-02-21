import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../../services/workflowApi';
import { toast } from 'react-toastify';

const WORKFLOWS_QUERY_KEY = 'workflows';

export const useWorkflowQueries = () => {
  const queryClient = useQueryClient();

  // Get all workflows
  const useWorkflows = (page = 0, size = 20) => {
    return useQuery({
      queryKey: [WORKFLOWS_QUERY_KEY, 'list', page, size],
      queryFn: async () => {
        const response = await workflowApi.getAllWorkflows(page, size);
        return response.data;
      },
      keepPreviousData: true,
    });
  };

  // Get workflow by ID
  const useWorkflowById = (id) => {
    return useQuery({
      queryKey: [WORKFLOWS_QUERY_KEY, 'detail', id],
      queryFn: async () => {
        const response = await workflowApi.getWorkflowById(id);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create workflow mutation
  const useCreateWorkflow = () => {
    return useMutation({
      mutationFn: async (workflowData) => {
        const response = await workflowApi.createWorkflow(workflowData);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [WORKFLOWS_QUERY_KEY] });
        toast.success('Workflow created successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create workflow');
      },
    });
  };

  // Update workflow mutation
  const useUpdateWorkflow = () => {
    return useMutation({
      mutationFn: async ({ id, data }) => {
        const response = await workflowApi.updateWorkflow(id, data);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ 
          queryKey: [WORKFLOWS_QUERY_KEY, 'detail', variables.id] 
        });
        queryClient.invalidateQueries({ 
          queryKey: [WORKFLOWS_QUERY_KEY, 'list'] 
        });
        toast.success('Workflow updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update workflow');
      },
    });
  };

  // Delete workflow mutation
  const useDeleteWorkflow = () => {
    return useMutation({
      mutationFn: async (id) => {
        await workflowApi.deleteWorkflow(id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [WORKFLOWS_QUERY_KEY] });
        toast.success('Workflow deleted successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete workflow');
      },
    });
  };

  // Execute step action mutation
  const useExecuteStepAction = () => {
    return useMutation({
      mutationFn: async ({ stepExecutionId, action, data }) => {
        let response;
        switch (action) {
          case 'approve':
            response = await workflowApi.approveStep(stepExecutionId, data);
            break;
          case 'reject':
            response = await workflowApi.rejectStep(stepExecutionId, data);
            break;
          case 'request-changes':
            response = await workflowApi.requestStepChanges(stepExecutionId, data);
            break;
          default:
            throw new Error('Invalid step action');
        }
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [WORKFLOWS_QUERY_KEY] });
        toast.success('Step action executed successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to execute step action');
      },
    });
  };

  return {
    useWorkflows,
    useWorkflowById,
    useCreateWorkflow,
    useUpdateWorkflow,
    useDeleteWorkflow,
    useExecuteStepAction,
  };
}; 