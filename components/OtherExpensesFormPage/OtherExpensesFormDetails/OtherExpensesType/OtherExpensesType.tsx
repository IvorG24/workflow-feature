import { useActiveTeam } from "@/stores/useTeamStore";
import { OtherExpensesTypeWithCategoryType, Table } from "@/utils/types";
import { Container, LoadingOverlay } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import CreateOtherExpensesType from "./CreateOtherExpensesType";
import OtherExpensesTypeList from "./OtherExpensesTypeList";
import UpdateOtherExpensesType from "./UpdateOtherExpensesType";

export type TypeForm = {
  type: string;
  isAvailable: boolean;
  category: string;
};

type Props = {
  otherExpensesTypes: OtherExpensesTypeWithCategoryType[];
  otherExpensesTypeCount: number;
};

const OtherExpensesType = ({
  otherExpensesTypes,
  otherExpensesTypeCount,
}: Props) => {
  const supabaseClient = useSupabaseClient();

  const team = useActiveTeam();

  const [typeList, setTypeList] =
    useState<OtherExpensesTypeWithCategoryType[]>(otherExpensesTypes);
  const [typeCount, setTypeCount] = useState(otherExpensesTypeCount);
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editType, setEditType] = useState<Table | null>(null);

  useEffect(() => {
    const fetchTypeList = async () => {
      try {
        if (!team.team_id) return;
        setIsLoading(true);

        // setTypeList(data);
        // setTypeCount(Number(count ?? 0));
      } catch (e) {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTypeList();
    setIsCreatingType(false);
  }, []);

  return (
    <Container p={0} fluid pos="relative">
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

      {!isCreatingType && !editType ? (
        <OtherExpensesTypeList
          typeList={typeList}
          setTypeList={setTypeList}
          typeCount={typeCount}
          setTypeCount={setTypeCount}
          setIsCreatingType={setIsCreatingType}
          setEditType={setEditType}
        />
      ) : null}
      {isCreatingType ? (
        <CreateOtherExpensesType
          setIsCreatingType={setIsCreatingType}
          setTypeList={setTypeList}
          setTypeCount={setTypeCount}
        />
      ) : null}
      {editType ? (
        <UpdateOtherExpensesType
          setTypeList={setTypeList}
          setEditType={setEditType}
          editType={editType}
        />
      ) : null}
    </Container>
  );
};

export default OtherExpensesType;
