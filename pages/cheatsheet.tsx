// this page was just used to test layout, you can delete it if you want
import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { Database } from "@/utils/database.types";
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
  }, [router]);

  // DB functions here

  // Build review form
  const handleBuildReviewForm = async (
    formTableInsert: Database["public"]["Tables"]["form_table"]["Insert"],
    fieldTableInsert: Database["public"]["Tables"]["field_table"]["Insert"][]
  ) => {
    const { data: formTableRow } = await supabase
      .from("form_table")
      .insert(formTableInsert)
      .select()
      // .limit(1)
      .single();

    // * TODO: Form priority

    fieldTableInsert.map((a) => ({
      ...a,
      form_id: formTableRow?.form_id,
    }));

    const { data } = await supabase
      .from("field_table")
      .insert(fieldTableInsert)
      .select();
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

    return { formTableRow, fieldTableRowList };
  };

  // Fill out review form
  const handleFillOutReviewForm = async (
    reviewTableInsert: Database["public"]["Tables"]["review_table"]["Insert"],
    reviewRespoonseTableInsert: Database["public"]["Tables"]["review_response_table"]["Insert"][]
  ) => {
    const { data } = await supabase
      .from("review_table")
      .insert(reviewTableInsert)
      .select()
      .single();

    reviewRespoonseTableInsert.map((a) => ({
      ...a,
      review_id: data?.review_id,
    }));

    await supabase
      .from("review_response_table")
      .insert(reviewRespoonseTableInsert)
      .select();
  };

  // Fetch a filled out review
  const handleFetchFilledOutReviewForm = async (reviewId: number) => {
    // Fetch request title and request description, on_behalf_of, request_status, approver, date created.
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

    return { reviewTableRow, reviewResponseTableRowList };
  };

  // Fetch review list under a team
  // https://supabase.com/docs/reference/javascript/select#filtering-through-foreign-tables
  const fetchReviewListByTeam = async (teamId: string) => {
    const { data } = await supabase
      .from("review_table")
      .select(`*, form_table!inner(*)`)
      .eq("form_table.team_id", teamId);
    return data;
  };

  // Fetch review form list under a team
  const fetchFormList = async (
    teamId: string,
    formType: Database["public"]["Enums"]["form_type"]
  ) => {
    const { data } = await supabase
      .from("form_table")
      .select("*")
      .eq("team_id", teamId)
      .eq("form_type", formType);

    return data;
  };

  return (
    <div>
      <Meta
        description="Test page used for testing layout"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/testpage"
      />
      <Container>
        <Flex>
          <Button onClick={() => handleBuildReviewForm()}>
            handleBuildReviewForm
          </Button>
          <Button onClick={() => handleFetchReviewForm()}>
            handleFetchReviewForm
          </Button>
          <Button onClick={() => handleFillOutReviewForm()}>
            handleFillOutReviewForm
          </Button>
          <Button onClick={() => handleFetchFilledOutReviewForm()}>
            handleFetchFilledOutReviewForm
          </Button>
          <Button onClick={() => fetchReviewListByTeam()}>
            fetchReviewListByTeam
          </Button>
          <Button onClick={() => fetchFormList()}>fetchFormList</Button>
        </Flex>
        <JsonInput
          label="Query response here"
          placeholder="Query response here"
          value={responseData}
        />
      </Container>
    </div>
  );
};

CheatSheetPage.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default CheatSheetPage;
