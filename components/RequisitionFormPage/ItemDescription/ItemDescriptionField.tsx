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
  const [itemDescriptionFieldCount, setsetItemDecsriptionFieldCount] =
    useState(0);

  return (
    <Box>
      {!isCreating ? (
        <ItemDescriptionFieldTable
          description={description}
          records={itemDescriptionFieldList}
          setRecords={setItemDescriptionFieldList}
          count={itemDescriptionFieldCount}
          setCount={setsetItemDecsriptionFieldCount}
          setIsCreating={setIsCreating}
        />
      ) : null}
      {isCreating ? (
        <CreateItemDescriptionField
          setIsCreating={setIsCreating}
          setItemDescriptionFieldList={setItemDescriptionFieldList}
          setsetItemDecsriptionFieldCount={
            setsetItemDecsriptionFieldCount
          }
          label={description.item_description_label}
          descriptionId={description.item_description_id}
        />
      ) : null}
    </Box>
  );
};

export default ItemDescriptionField;
