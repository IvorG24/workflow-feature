import {
  checkApproverGroup,
  checkFormIfExist,
  checkIfFormCreated,
  getFormid,
  getTargetNode,
} from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { RequestWithModuleResponseType } from "@/utils/types";
import { ModuleFormItem, TargetNode } from "@/utils/types";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

export type Props = {
  request: RequestWithModuleResponseType;
  status: string;
  isLoading: (loading: boolean) => void;
  moduleId: string;
  userTeamGroup: string[];
  moduleRequestId: string;
};

const useNodeAndForm = ({
  request,
  status,
  isLoading,
  moduleId,
  userTeamGroup,
  moduleRequestId,
}: Props) => {
  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();
  const router = useRouter();
  const teamId = useUserTeamMember();

  const [targetNodes, setTargetNodes] = useState<TargetNode[]>([]);
  const [workflowNodeData, setWorkflowNodeData] = useState<TargetNode[]>([]);
  const [approverGroup, setApproverGroup] = useState<string[]>([]);
  const [isEndNode, setIsEndNode] = useState(false);
  const [isEmptyNode, setisEmptyNode] = useState(false);
  const [formExist, setFormExist] = useState<ModuleFormItem[]>([]);
  const [isNextFormSubmitted, setIsNextFormSubmitted] = useState<
    boolean | null
  >(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [nextForm, setNextForm] = useState<{
    form_id: string;
    form_name: string;
  } | null>(null);

  const handleCreateNextForm = async () => {
    if (nextForm) {
      const checkFormCreated = await checkIfFormCreated(supabaseClient, {
        formId: moduleRequestId,
        moduleRequestId: moduleRequestId,
      });

      if (checkFormCreated) {
        notifications.show({
          message: `Someone created the form already, Please refresh the page`,
          color: "orange",
        });
        return;
      }

      router.push(
        `/${formatTeamNameToUrlKey(activeTeam.team_name)}/module-forms/${moduleId}/create?nextForm=${nextForm.form_id}&requestId=${moduleRequestId}`
      );
    }
  };
  const isTeamIdInApproverGroup = (
    approverGroup: string[],
    teamId: string
  ): boolean => {
    return approverGroup.includes(teamId);
  };
  const fetchNodeAndForm = useCallback(async () => {
    isLoading(true);
    try {
      const nodeData = await getTargetNode(supabaseClient, {
        requestId: request.request_id,
        currentStatus: status,
        workflowVersionId: request.request_signer[0].request_workflow_version,
        workflowId: request.request_signer[0].request_workflow_id,
      });

      if (!nodeData) return;
      setTargetNodes(nodeData.targetNode);
      setWorkflowNodeData(nodeData.workflowNode);

      const formIdData = await getFormid(supabaseClient, {
        moduleId: moduleId,
        moduleVersionId: request.request_signer[0].request_module_version_id,
      });

      const formExist: ModuleFormItem[] = await checkFormIfExist(
        supabaseClient,
        {
          moduleRequestId: moduleRequestId,
          formData: formIdData,
        }
      );
      setFormExist(formExist);
      const endNodeFound = nodeData.targetNode.some(
        (node) => node.target_node_type_label === "End"
      );

      setIsEndNode(endNodeFound);
      if (endNodeFound) {
        setisEmptyNode(true);
        const currentFormIndex = formIdData.findIndex(
          (form) => form.form_id === request.request_form.form_id
        );
        if (
          currentFormIndex !== -1 &&
          currentFormIndex < formIdData.length - 1
        ) {
          setNextForm(formIdData[currentFormIndex + 1]);
        } else {
          setNextForm(null);
        }
      }
    } catch (error) {
    } finally {
      isLoading(false);
    }
  }, [
    supabaseClient,
    request.request_id,
    status,
    moduleId,
    isLoading,
    moduleRequestId,
  ]);

  useEffect(() => {
    fetchNodeAndForm();
  }, [fetchNodeAndForm, status]);

  useEffect(() => {
    const fetchApprover = async () => {
      if (!teamId) return;
      if (formExist.length > 0) {
        const isFormSubmitted = formExist.some(
          (form: ModuleFormItem) => form.form_id === nextForm?.form_id
        );
        setIsNextFormSubmitted(isFormSubmitted);
      }
      const checkApprover = await checkApproverGroup(supabaseClient, {
        requestId: request.request_id,
        requestStatus: targetNodes.map((node) => node.target_node_type_label),
      });
      setApproverGroup(checkApprover as string[]);
    };

    fetchApprover();
  }, [userTeamGroup, formExist, targetNodes, request, teamId]);

  useEffect(() => {
    if (!teamId) return;
    if (approverGroup.length > 0 && userTeamGroup.length > 0) {
      const isUserAlreadyApproved = isTeamIdInApproverGroup(
        approverGroup,
        teamId?.team_member_id || ""
      );
      setIsHidden(isUserAlreadyApproved);
    } else {
      setIsHidden(false);
    }
  }, [approverGroup, userTeamGroup, teamId]);

  return {
    fetchNodeAndForm,
    isNextFormSubmitted,
    workflowNodeData,
    targetNodes,
    isHidden,
    isEndNode,
    isEmptyNode,
    nextForm,
    handleCreateNextForm,
  };
};

export default useNodeAndForm;
