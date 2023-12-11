import { getEquipmentLookupList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { EquipmentLookupChoices, EquipmentLookupTable } from "@/utils/types";
import { Container, LoadingOverlay } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import CreateEquipmentLookUp from "./CreateEquipmentLookup";
import EquipmentLookupList from "./EquipmentLookupList";
import UpdateEquipmentLookup from "./UpdateEquipmentLookup";

type Props = {
  lookup: {
    table: EquipmentLookupChoices;
    label: string;
  };
};

const EquipmentLookup = ({ lookup }: Props) => {
  const supabaseClient = useSupabaseClient();

  const team = useActiveTeam();

  const [equipmentLookupList, setEquipmentLookupList] = useState<
    EquipmentLookupTable[]
  >([]);
  const [equipmentLookupCount, setEquipmentLookupCount] = useState(0);
  const [isCreatingEquipmentLookup, setIsCreatingEquipmentLookup] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editEquipmentLookup, setEditEquipmentLookup] =
    useState<EquipmentLookupTable | null>(null);

  useEffect(() => {
    const fetchEquipmentLookupList = async () => {
      try {
        if (!team.team_id) return;
        setIsLoading(true);
        const { data, count } = await getEquipmentLookupList(supabaseClient, {
          lookup: lookup.table,
          teamId: team.team_id,
          search: "",
          limit: ROW_PER_PAGE,
          page: 1,
        });
        setEquipmentLookupList(data);
        setEquipmentLookupCount(Number(count ?? 0));
      } catch (e) {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipmentLookupList();
    setIsCreatingEquipmentLookup(false);
  }, []);

  return (
    <Container p={0} fluid pos="relative">
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

      {!isCreatingEquipmentLookup && !editEquipmentLookup ? (
        <EquipmentLookupList
          lookup={lookup}
          equipmentLookupList={equipmentLookupList}
          setEquipmentLookupList={setEquipmentLookupList}
          equipmentLookupCount={equipmentLookupCount}
          setEquipmentLookupCount={setEquipmentLookupCount}
          setIsCreatingEquipmentLookup={setIsCreatingEquipmentLookup}
          setEditEquipmentLookup={setEditEquipmentLookup}
        />
      ) : null}
      {isCreatingEquipmentLookup ? (
        <CreateEquipmentLookUp
          lookup={lookup}
          setIsCreatingEquipmentLookup={setIsCreatingEquipmentLookup}
          setEquipmentLookupList={setEquipmentLookupList}
          setEquipmentLookupCount={setEquipmentLookupCount}
        />
      ) : null}
      {editEquipmentLookup ? (
        <UpdateEquipmentLookup
          lookup={lookup}
          setEquipmentLookupList={setEquipmentLookupList}
          setEditEquipmentLookup={setEditEquipmentLookup}
          editEquipmentLookup={editEquipmentLookup}
        />
      ) : null}
    </Container>
  );
};

export default EquipmentLookup;
