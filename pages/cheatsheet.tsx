// this page was just used to test layout, you can delete it if you want
import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { Database } from "@/utils/database.types";
import {
  FieldTableInsert,
  FieldTypeEnum,
  FormTableInsert,
  FormTypeEnum,
  ReviewResponseTableInsert,
  ReviewTableInsert,
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
  const [team, setTeam] = useState("");

  // Auth check here
  useEffect(() => {
    if (!router.isReady) return;
    if (isLoading) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchFirstTeam = async () => {
      const { data } = await supabase
        .from("team_table")
        .select("*")
        .eq("team_name", "SCIC")
        .single();

      setTeam(`${data?.team_id}`);
    };
    fetchFirstTeam();
  }, [router, isLoading, supabase, user]);

  // DB functions here

  // Build review form
  const handleBuildReviewForm = async (
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

  // Fetch review form for creating review
  const handleFetchReviewForm = async (formTableId: number) => {
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

  // Fill out review form
  const handleFillOutReviewForm = async (
    reviewTableInsert: ReviewTableInsert,
    reviewRespoonseTableInsert: ReviewResponseTableInsert[]
  ) => {
    const { data: reviewTableRow } = await supabase
      .from("review_table")
      .insert(reviewTableInsert)
      .select()
      .single();

    const reviewRespoonseTableInsertWithReviewId =
      reviewRespoonseTableInsert.map((a) => ({
        ...a,
        review_id: reviewTableRow?.review_id as number,
      }));

    const { data: reviewResponseTableRow } = await supabase
      .from("review_response_table")
      .insert(reviewRespoonseTableInsertWithReviewId)
      .select();

    setResponseData(
      JSON.stringify({ reviewTableRow, reviewResponseTableRow }, null, 2)
    );
    return {
      reviewTableRow,
      reviewResponseTableRow,
    };
  };

  // Fetch a filled out review
  const handleFetchFilledOutReviewForm = async (reviewId: number) => {
    const { data: reviewTableRow } = await supabase
      .from("review_table")
      .select()
      .eq("review_id", reviewId)
      .single();

    // Fetch the field name and field responses of request
    const { data: reviewResponseTableRowList } = await supabase
      .from("review_response_table")
      .select(`*, field_table:field_id(*)`)
      .eq("review_id", reviewId);

    setResponseData(
      JSON.stringify({ reviewTableRow, reviewResponseTableRowList }, null, 2)
    );
    return { reviewTableRow, reviewResponseTableRowList };
  };

  // Fetch review list under a team
  // https://supabase.com/docs/reference/javascript/select#filtering-through-foreign-tables
  const fetchReviewListByTeam = async (teamId: string) => {
    const { data } = await supabase
      .from("review_table")
      .select(`*, form_table!inner(*)`)
      .eq("form_table.team_id", teamId);

    setResponseData(JSON.stringify({ data }, null, 2));
    return data;
  };

  // Fetch review form list under a team
  const fetchFormList = async (teamId: string, formType: FormTypeEnum) => {
    const { data } = await supabase
      .from("form_table")
      .select("*")
      .eq("team_id", teamId)
      .eq("form_type", formType);

    setResponseData(JSON.stringify({ data }, null, 2));
    return data;
  };

  const formTableData = {
    form_name: "Peer Review",
    form_owner: "34b93dce-ee49-4b42-b7d1-0ef1158b859c",
    team_id: team,
    form_type: "review" as FormTypeEnum,
    form_priority: null,
  };

  const fieldTable = [
    {
      field_name: "Text Field",
      field_type: "text" as FieldTypeEnum,
      field_option: null,
      is_required: true,
      field_tooltip: "This is a text field tooltip",
    },
    {
      field_name: "Number Field",
      field_type: "number" as FieldTypeEnum,
      field_option: null,
      is_required: true,
      field_tooltip: "This is a number field tooltip",
    },
    {
      field_name: "Email Field",
      field_type: "email" as FieldTypeEnum,
      field_option: null,
      is_required: true,
      field_tooltip: "This is a email field tooltip",
    },
    {
      field_name: "Select Field",
      field_type: "select" as FieldTypeEnum,
      field_option: ["aaa", "bbb", "ccc"],
      is_required: true,
      field_tooltip: "This is a select field tooltip",
    },
    {
      field_name: "Multiple Field",
      field_type: "multiple" as FieldTypeEnum,
      field_option: ["aaa", "bbb", "ccc", "ddd", "eee"],
      is_required: true,
      field_tooltip: "This is a multiple field tooltip",
    },
  ];

  const reviewTableData = {
    form_table_id: 1,
    review_source: "34b93dce-ee49-4b42-b7d1-0ef1158b859c",
    review_target: "00320854-19c6-49da-845f-133886c04f94",
  };

  const reviewResponseTableData = [
    {
      field_id: 1,
      response_value: "text",
      review_id: 1,
    },
    {
      field_id: 2,
      response_value: "number",
      review_id: 1,
    },
    {
      field_id: 3,
      response_value: "email",
      review_id: 1,
    },
    {
      field_id: 4,
      response_value: "select",
      review_id: 1,
    },
    {
      field_id: 5,
      response_value: "multiple",
      review_id: 1,
    },
  ];

  return (
    <div>
      <Meta
        description="Test page used for testing layout"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <Container>
        <Flex>
          <Button
            onClick={() => handleBuildReviewForm(formTableData, fieldTable)}
          >
            handleBuildReviewForm
          </Button>
          <Button onClick={() => handleFetchReviewForm(1)}>
            handleFetchReviewForm
          </Button>
          <Button
            onClick={() =>
              handleFillOutReviewForm(reviewTableData, reviewResponseTableData)
            }
          >
            handleFillOutReviewForm
          </Button>
          <Button onClick={() => handleFetchFilledOutReviewForm(1)}>
            handleFetchFilledOutReviewForm
          </Button>
          <Button onClick={() => fetchReviewListByTeam(team)}>
            fetchReviewListByTeam
          </Button>
          <Button onClick={() => fetchFormList(team, "review")}>
            fetchFormList
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
