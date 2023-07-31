import {
  ItemDescriptionFieldTableRow,
  ItemDescriptionTableRow,
} from "@/utils/types";
import { Box } from "@mantine/core";
import { useState } from "react";
import CreateItemDescriptionField from "./CreateItemDescriptionField";
import ItemDescriptionFieldTable from "./ItemDescriptionFieldTable";

type Props = {
  description: ItemDescriptionTableRow;
};

const ItemDescriptionField = ({ description }: Props) => {
  const [isCreating, setIsCreating] = useState(false);

  const [itemDescriptionFieldList, setItemDescriptionFieldList] = useState<
    ItemDescriptionFieldTableRow[]
  >([]);
  const [itemDescriptionFieldCount, setsetItemDescriptionFieldCount] =
    useState(0);

  return (
    <Box>
      {!isCreating ? (
        <ItemDescriptionFieldTable
          description={description}
          records={itemDescriptionFieldList}
          setRecords={setItemDescriptionFieldList}
          count={itemDescriptionFieldCount}
          setCount={setsetItemDescriptionFieldCount}
          setIsCreating={setIsCreating}
        />
      ) : null}
      {isCreating ? (
        <CreateItemDescriptionField
          setIsCreating={setIsCreating}
          setItemDescriptionFieldList={setItemDescriptionFieldList}
          setsetItemDescriptionFieldCount={setsetItemDescriptionFieldCount}
          label={description.item_description_label}
          descriptionId={description.item_description_id}
        />
      ) : null}
    </Box>
  );
};

export default ItemDescriptionField;
