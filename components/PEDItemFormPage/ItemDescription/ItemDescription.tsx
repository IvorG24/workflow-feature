import { ItemWithDescriptionType } from "@/utils/types";
import { CloseButton, Container, Divider, Flex, Title } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import ItemDescriptionField from "./ItemDescriptionField";

type Props = {
  selectedItem: ItemWithDescriptionType;
  setSelectedItem: Dispatch<SetStateAction<ItemWithDescriptionType | null>>;
};

const ItemDescription = ({ selectedItem, setSelectedItem }: Props) => {
  return (
    <Container p={0} fluid>
      <Flex align="center" justify="space-between">
        <Title order={2}>{`${selectedItem.item_general_name}`}</Title>
        <CloseButton onClick={() => setSelectedItem(null)} />
      </Flex>
      <Divider mb="xl" mt="sm" />

      {selectedItem.item_description.map((description) => {
        return (
          <ItemDescriptionField
            key={description.item_description_id}
            description={description}
          />
        );
      })}
    </Container>
  );
};

export default ItemDescription;
