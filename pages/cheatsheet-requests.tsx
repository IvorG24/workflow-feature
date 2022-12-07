// this page was just used to test layout, you can delete it if you want
import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { Database } from "@/utils/database.types";
import {
  FieldTableInsert,
  FormTableInsert,
  FormTypeEnum,
  RequestResponseTableInsert,
  RequestTableInsert,
} from "@/utils/types";
import { Button, Container, Flex, JsonInput } from "@mantine/core";
import {
  useSessionContext,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import type { NextPageWithLayout } from "./_app";

const CheatSheetPage: NextPageWithLayout = () => {
  const supabase = useSupabaseClient<Database>();
  const { isLoading } = useSessionContext();
  const user = useUser();
  const router = useRouter();
  const [responseData, setResponseData] = useState("");

  // Auth check here
  useEffect(() => {
    if (!router.isReady) return;
    if (isLoading) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }
  }, [router, isLoading, supabase, user]);

  // DB functions here

  // Build request form
  const handleBuildRequestForm = async (
    formTableInsert: FormTableInsert,
    fieldTableInsert: FieldTableInsert[]
  ) => {
    const { data: formTableRow } = await supabase
      .from("form_table")
      .insert(formTableInsert)
      .select()
      // .limit(1)
      .single();

    // * TODO: Form priority

    const newFields = fieldTableInsert.map((a) => ({
      ...a,
      form_table_id: formTableRow?.form_id,
    }));

    const { data: fieldTableRow } = await supabase
      .from("field_table")
      .insert(newFields)
      .select();

    setResponseData(JSON.stringify({ formTableRow, fieldTableRow }, null, 2));
    return { formTableRow, fieldTableRow };
  };

  // Fetch request form for creating request
  const handleFetchRequestForm = async (formTableId: number) => {
    // Fetch form name
    const { data: formTableRow } = await supabase
      .from("form_table")
      .select()
      .eq("form_id", formTableId);

    // Fetch fields of form
    const { data: fieldTableRowList } = await supabase
      .from("field_table")
      .select()
      .eq("form_table_id", formTableId);

    setResponseData(
      JSON.stringify({ formTableRow, fieldTableRowList }, null, 2)
    );
    return { formTableRow, fieldTableRowList };
  };

  // Fill out request form
  const handleFillOutRequestForm = async (
    requestTableInsert: RequestTableInsert,
    requestRespoonseTableInsert: RequestResponseTableInsert[]
  ) => {
    const { data: requestTableRow } = await supabase
      .from("request_table")
      .insert(requestTableInsert)
      .select()
      .single();

    const requestResponseTableInsertWithRequestId =
      requestRespoonseTableInsert.map((a) => ({
        ...a,
        request_id: requestTableRow?.request_id as number,
      }));

    const { data: requestResponseTableRow } = await supabase
      .from("request_response_table")
      .insert(requestResponseTableInsertWithRequestId)
      .select();

    setResponseData(
      JSON.stringify({ requestTableRow, requestResponseTableRow }, null, 2)
    );
    return {
      requestTableRow,
      requestResponseTableRow,
    };
  };

  // Fetch a filled out request
  const handleFetchFilledOutRequestForm = async (requestId: number) => {
    const { data: requestTableRow } = await supabase
      .from("request_table")
      .select()
      .eq("request_id", requestId)
      .single();

    // Fetch the field name and field responses of request
    const { data: requestResponseTableRowList } = await supabase
      .from("request_response_table")
      .select(`*, field_table:field_id(*)`)
      .eq("request_id", requestId);

    setResponseData(
      JSON.stringify({ requestTableRow, requestResponseTableRowList }, null, 2)
    );
    return { requestTableRow, requestResponseTableRowList };
  };

  // Fetch request list under a team
  // https://supabase.com/docs/reference/javascript/select#filtering-through-foreign-tables
  const fetchRequestListByTeam = async (teamId: string) => {
    const { data } = await supabase
      .from("request_table")
      .select(`*, form_table!inner(*)`)
      .eq("form_table.team_id", teamId);

    setResponseData(JSON.stringify({ data }, null, 2));
    return data;
  };

  // Fetch request form list under a team
  const fetchFormList = async (teamId: string, formType: FormTypeEnum) => {
    const { data } = await supabase
      .from("form_table")
      .select("*")
      .eq("team_id", teamId)
      .eq("form_type", formType);

    setResponseData(JSON.stringify({ data }, null, 2));
    return data;
  };

  // Fetch sent request list of a user under a team.
  // https://supabase.com/docs/reference/javascript/select#filtering-through-foreign-tables
  const fetchRequestListSentByUserUnderATeam = async (
    userId: string,
    teamId: string
  ) => {
    const { data } = await supabase
      .from("request_table")
      .select(`*, form_table!inner(*)`)
      .eq("requested_by", userId)
      .eq("form_table.team_id", teamId);
    console.log(data);
  };

  // Fetch received request list of a user under a team.
  // https://supabase.com/docs/reference/javascript/select#filtering-through-foreign-tables
  const fetchRequestListReceivedByUserUnderATeam = async (
    userId: string,
    teamId: string
  ) => {
    const { data } = await supabase
      .from("request_table")
      .select(`*, form_table!inner(*)`)
      .eq("approver_id", userId)
      .eq("form_table.team_id", teamId);
    console.log(data);
  };

  // Search request using keyword
  const searchRequestByKeyword = async (keyword: string) => {
    // Search inside request_title and request_description
    const { data } = await supabase
      .from("request_table")
      .select("*")
      .or(
        `or(request_description.ilike.%${keyword}%,request_title.ilike.%${keyword}%)`
      );

    // Search inside request response values
    /// Below can also be used for keyword analytics
    const { data: responseData } = await supabase
      .from("request_response_table")
      .select("*")
      .ilike("response_value", `%${keyword}%`);

    console.log(data);
    console.log(responseData);

    // Combine the result above to display request list.
  };

  // To remove build error no unused vars

  console.log(handleBuildRequestForm);
  console.log(handleFetchRequestForm);
  console.log(handleFillOutRequestForm);
  console.log(handleFetchFilledOutRequestForm);
  console.log(fetchRequestListByTeam);
  console.log(fetchFormList);
  console.log(fetchRequestListSentByUserUnderATeam);
  console.log(fetchRequestListReceivedByUserUnderATeam);
  console.log(searchRequestByKeyword);

  return (
    <div>
      <Meta
        description="Test page used for testing layout"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <Container>
        <Flex>
          <Button>
            Edit this button to call the function you want to test. Only queries
            are provided now.
          </Button>
        </Flex>
        <JsonInput
          label="Query response here"
          placeholder="Query response here"
          value={responseData}
          minRows={100}
        />
      </Container>
    </div>
  );
};

CheatSheetPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default CheatSheetPage;
