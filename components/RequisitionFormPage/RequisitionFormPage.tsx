import { ItemWithDescriptionType } from "@/utils/types";
import { Center, Container, Paper, Space, Text, Title } from "@mantine/core";
import { useState } from "react";
import ItemDescription from "./ItemDescription/ItemDescription";
import CreateItem from "./ItemList/CreateItem";
import ItemList from "./ItemList/ItemList";

type Props = {
  items: ItemWithDescriptionType[];
  itemsCount: number;
};

const RequisitionFormPage = ({ items, itemsCount }: Props) => {
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<ItemWithDescriptionType | null>(null);

  const [itemList, setItemList] = useState(items);
  const [itemCount, setItemCount] = useState(itemsCount);

  return (
    <Container>
      <Title color="dimmed" order={2}>
        Requisition Form
      </Title>
      <Space h="xl" />
      <Paper p="xl" shadow="xs">
        {!isCreatingItem ? (
          <ItemList
            itemList={itemList}
            setItemList={setItemList}
            itemCount={itemCount}
            setItemCount={setItemCount}
            setIsCreatingItem={setIsCreatingItem}
            setSelectedItem={setSelectedItem}
          />
        ) : null}
        {isCreatingItem ? (
          <CreateItem
            setIsCreatingItem={setIsCreatingItem}
            setItemList={setItemList}
            setItemCount={setItemCount}
          />
        ) : null}
      </Paper>
      <Space h="xl" />
      <Paper p="xl" shadow="xs">
        {!selectedItem ? (
          <Center>
            <Text color="dimmed">No item selected</Text>
          </Center>
        ) : null}
        {selectedItem ? (
          <ItemDescription
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
        ) : null}
      </Paper>
    </Container>
  );
};

export default RequisitionFormPage;
