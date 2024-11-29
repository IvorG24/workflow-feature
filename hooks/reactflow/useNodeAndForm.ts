import {
  checkApproverGroup,
  checkFormIfExist,
  getFormid,
} from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { ModuleFormItem, RequestWithResponseType } from "@/utils/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

export type Props = {
  request: RequestWithResponseType;
  isLoading: (loading: boolean) => void;
  moduleId: string;
  userTeamGroup: string[];
  moduleRequestId: string;
  type: "Request" | "Module Request";
};

const useNodeAndForm = ({
  request,
  moduleRequestId,
  isLoading,
  moduleId,
  userTeamGroup,
  type = "Request",
}: Props) => {
  const supabaseClient = useSupabaseClient();
  const activeTeam = useActiveTeam();
  const router = useRouter();
  const teamId = useUserTeamMember();

  const targetNodes = request.request_workflow_data?.targetNode;
  const workflowNodeData = request.request_workflow_data?.workflowNodeData;
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
      router.push(
        `/${formatTeamNameToUrlKey(activeTeam.team_name)}/module-forms/${moduleId}/create?nextForm=${nextForm.form_id}&requestId=${moduleRequestId}`
      );
    }
  };
  console.log(request);

  const isTeamIdInApproverGroup = (
    approverGroup: string[],
    teamId: string
  ): boolean => {
    return approverGroup.includes(teamId);
  };

  const fetchNodeAndForm = useCallback(async () => {
    if (type === "Request") return;

    isLoading(true);
    try {
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

      const endNodeFound =
        targetNodes?.some((node) => node.target_node_type_label === "End") ||
        false;

      setIsEndNode(endNodeFound);
      setIsEndNode(endNodeFound);
      setisEmptyNode(endNodeFound);
      console.log(targetNodes);

      if (endNodeFound) {
        const currentFormIndex = formIdData.findIndex(
          (form) => form.form_id === request.request_form.form_id
        );

        setNextForm(
          currentFormIndex !== -1 && currentFormIndex < formIdData.length - 1
            ? formIdData[currentFormIndex + 1]
            : null
        );
      } else {
        setNextForm(null); // Avoid setting multiple states in separate calls if they're related.
      }
    } catch (error) {
    } finally {
      isLoading(false);
    }
  }, [
    supabaseClient,
    request.request_id,
    moduleId,
    isLoading,
    moduleRequestId,
    type,
  ]);

  useEffect(() => {
    fetchNodeAndForm();
  }, [fetchNodeAndForm]);

  useEffect(() => {
    const fetchApprover = async () => {
      if (!teamId || type === "Request") return;
      if (formExist.length > 0) {
        const isFormSubmitted = formExist.some(
          (form: ModuleFormItem) => form.form_id === nextForm?.form_id
        );
        setIsNextFormSubmitted(isFormSubmitted);
      }
      const checkApprover = await checkApproverGroup(supabaseClient, {
        requestId: request.request_id,
        requestStatus:
          targetNodes?.map((node) => node.target_node_type_label) ?? [],
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
