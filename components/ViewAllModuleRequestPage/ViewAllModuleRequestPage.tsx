import { checkFormIfExist } from "@/backend/api/get";
import { useUserProfile } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { RequestWithModuleResponseType } from "@/utils/types";
import { ModuleData, ModuleFormItem } from "@/utils/types";
import {
  Accordion,
  Container,
  Group,
  LoadingOverlay,
  Space,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconClipboardList } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import ViewModuleInfoDetails from "./ViewModuleInfoDetails";

type Request = {
  request: RequestWithModuleResponseType;
  moduleId: string;
  duplicatableSectionIdList: string[];
  sectionIdWithDuplicatableSectionIdList: {
    request_response_duplicatable_section_id: string;
    section_id: string;
  }[];
};

type Props = {
  moduleRequestId: string;
  moduleData: ModuleData;
};

const ViewAllModuleRequestPage = ({ moduleRequestId, moduleData }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const user = useUserProfile();
  const [formCollection, setFormCollection] = useState<ModuleFormItem[]>([]);
  const [formDetails, setFormDetails] = useState<
    Record<string, Request | null>
  >({});
  const [isloading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!moduleRequestId) return;
        if (!user) return;

        const formExist: ModuleFormItem[] = await checkFormIfExist(
          supabaseClient,
          {
            moduleRequestId: moduleRequestId,
          }
        );
        setFormCollection(formExist);
      } catch (e) {
        notifications.show({
          message: "Something went wrong",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [moduleRequestId, user]);

  const handleOnClick = async (requestId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient.rpc(
        "module_request_page_on_load",
        {
          input_data: {
            moduleRequestId: moduleRequestId,
            requestId: requestId,
            userId: user?.user_id,
          },
        }
      );

      if (error) throw error;

      setFormDetails((prev) => ({
        ...prev,
        [requestId]: data as Request,
      }));
    } catch (e) {
      setFormDetails((prev) => ({
        ...prev,
        [requestId]: null,
      }));
    }
    setIsLoading(false);
  };
  const handleAccordionChange = (openedItems: string[]) => {
    if (openedItems.length === 0) {
    }
  };
  const renderRequestForm = (requestData: Request, index: number) => {
    if (!requestData) return <p>Error loading form data.</p>;
    const { request, moduleId, duplicatableSectionIdList } = requestData;
    const uniqueId = `form-${index}`;
    if (request.request_form.form_is_formsly_form) {
      return (
        <div id={uniqueId}>
          {/* {request.request_form.form_name === "Item" && (
            <ModuleItemRequestPage
              moduleId={moduleId}
              request={request}
              duplicatableSectionIdList={duplicatableSectionIdList}
            />
          )}
          {request.request_form.form_name === "Services" && (
            <ModuleServicesRequestPage
              moduleId={moduleId}
              request={request}
              duplicatableSectionIdList={duplicatableSectionIdList}
            />
          )}
          {request.request_form.form_name === "Other Expenses" && (
            <ModuleOtherExpensesRequestPage
              moduleId={moduleId}
              request={request}
              duplicatableSectionIdList={duplicatableSectionIdList}
            />
          )}
          {request.request_form.form_name === "PED Equipment" && (
            <ModulePEDEquipmentRequestPage
              moduleId={moduleId}
              request={request}
              duplicatableSectionIdList={duplicatableSectionIdList}
            />
          )}
          {request.request_form.form_name === "PED Part" && (
            <ModulePEDPartRequestPage
              moduleId={moduleId}
              request={request}
              duplicatableSectionIdList={duplicatableSectionIdList}
            />
          )}
          {request.request_form.form_name === "PED Item" && (
            <ModulePEDItemRequestPage
              moduleId={moduleId}
              request={request}
              duplicatableSectionIdList={duplicatableSectionIdList}
            />
          )}
          {request.request_form.form_name === "IT Asset" && (
            <ModuleItAssetRequestPage
              moduleId={moduleId}
              request={request}
              duplicatableSectionIdList={duplicatableSectionIdList}
            />
          )} */}
        </div>
      );
    } else {
    //   return (
    //     // <ModuleRequestPage
    //     //   moduleId={moduleId}
    //     //   request={request}
    //     //   isFormslyForm={request.request_form.form_is_formsly_form}
    //     // />
    //   );
    }
  };

  return (
    <Container>
      <Title order={2} color="dimmed">
        Module Request
      </Title>
      <Space h="xl" />
      <ViewModuleInfoDetails
        moduleData={moduleData}
        moduleRequestId={moduleRequestId}
        formCollection={formCollection}
      />
      <Title order={4} color="" style={{ marginTop: "20px" }}>
        <Group>
          <IconClipboardList size={24} />
          List of All Forms
        </Group>
      </Title>
      <Space h="xl" />

      <Accordion variant="contained" multiple onChange={handleAccordionChange}>
        {formCollection.map((form, index) => (
          <Accordion.Item value={`item-${index}`} key={form.form_id}>
            <Accordion.Control onClick={() => handleOnClick(form.request_id)}>
              {form.form_name}
            </Accordion.Control>
            <Accordion.Panel>
              {formDetails[form.request_id] ? (
                renderRequestForm(formDetails[form.request_id]!, index)
              ) : formDetails[form.form_id] === null ? (
                <p>Error loading form data.</p>
              ) : (
                <LoadingOverlay visible={isloading} />
              )}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
};

export default ViewAllModuleRequestPage;