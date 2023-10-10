import {
  ServiceScopeChoiceTableRow,
  ServiceScopeTableRow,
} from "@/utils/types";
import { Box } from "@mantine/core";
import { useState } from "react";
import CreateServiceScopeChoice from "./CreateServiceScopeChoice";
import ServiceScopeChoiceTable from "./ServiceScopeChoiceTable";

type Props = {
  scope: ServiceScopeTableRow;
};

const ServiceScopeChoice = ({ scope }: Props) => {
  const [isCreating, setIsCreating] = useState(false);

  const [serviceScopeChoiceList, setServiceScopeChoiceList] = useState<
    ServiceScopeChoiceTableRow[]
  >([]);
  const [serviceScopeChoiceCount, setsetServiceScopeChoiceCount] = useState(0);

  return (
    <Box>
      {!isCreating ? (
        <ServiceScopeChoiceTable
          scope={scope}
          records={serviceScopeChoiceList}
          setRecords={setServiceScopeChoiceList}
          count={serviceScopeChoiceCount}
          setCount={setsetServiceScopeChoiceCount}
          setIsCreating={setIsCreating}
        />
      ) : null}
      {isCreating ? (
        <CreateServiceScopeChoice
          setIsCreating={setIsCreating}
          setServiceScopeChoiceList={setServiceScopeChoiceList}
          setsetServiceScopeChoiceCount={setsetServiceScopeChoiceCount}
          name={scope.service_scope_name}
          scopeId={scope.service_scope_id}
        />
      ) : null}
    </Box>
  );
};

export default ServiceScopeChoice;
