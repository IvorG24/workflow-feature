import { ItemWithDescriptionType } from "@/utils/types";
import { Center, Container, Paper, Space, Text } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import ItemDescription from "../ItemDescription/ItemDescription";
import CreateItem from "../ItemList/CreateItem";
import ItemList from "../ItemList/ItemList";
import UpdateItem from "../ItemList/UpdateItem";

type Props = {
  isCreatingItem: boolean;
  editItem: ItemWithDescriptionType | null;
  itemList: ItemWithDescriptionType[];
  setItemList: Dispatch<SetStateAction<ItemWithDescriptionType[]>>;
  itemCount: number;
  setItemCount: Dispatch<SetStateAction<number>>;
  setIsCreatingItem: Dispatch<SetStateAction<boolean>>;
  setSelectedItem: Dispatch<SetStateAction<ItemWithDescriptionType | null>>;
  setEditItem: Dispatch<SetStateAction<ItemWithDescriptionType | null>>;
  selectedItem: ItemWithDescriptionType | null;
};

const ItemFormDetails = ({
  isCreatingItem,
  editItem,
  itemList,
  setItemList,
  itemCount,
  setItemCount,
  setIsCreatingItem,
  setSelectedItem,
  setEditItem,
  selectedItem,
}: Props) => {
  return (
    <Container p={0} fluid pos="relative">
      <Paper p="xl" shadow="xs">
        {!isCreatingItem && !editItem ? (
          <ItemList
            itemList={itemList}
            setItemList={setItemList}
            itemCount={itemCount}
            setItemCount={setItemCount}
            setIsCreatingItem={setIsCreatingItem}
            setSelectedItem={setSelectedItem}
            setEditItem={setEditItem}
            editItem={editItem}
          />
        ) : null}
        {isCreatingItem ? (
          <CreateItem setIsCreatingItem={setIsCreatingItem} />
        ) : null}
        {editItem ? (
          <UpdateItem
            setItemList={setItemList}
            setEditItem={setEditItem}
            editItem={editItem}
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

export default ItemFormDetails;
