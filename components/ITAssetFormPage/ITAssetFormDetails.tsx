import { ItemCategoryWithSigner, ItemWithDescriptionType } from "@/utils/types";
import { Center, Container, Paper, Space, Text } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import CreateItemCategory from "../ItemFormPage/ItemCategoryList/CreateItemCategory";
import ItemCategoryList from "../ItemFormPage/ItemCategoryList/ItemCategoryList";
import UpdateItemCategory from "../ItemFormPage/ItemCategoryList/UpdateItemCategory";
import ItemDescription from "./ItemDescription/ItemDescription";
import CreateItem from "./ItemList/CreateItem";
import ItemList from "./ItemList/ItemList";
import UpdateItem from "./ItemList/UpdateItem";

type Props = {
  formId: string;
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
  isCreatingItemCategory: boolean;
  editItemCategory: ItemCategoryWithSigner | null;
  itemCategoryList: ItemCategoryWithSigner[];
  setItemCategoryList: Dispatch<SetStateAction<ItemCategoryWithSigner[]>>;
  itemCategoryCount: number;
  setItemCategoryCount: Dispatch<SetStateAction<number>>;
  setIsCreatingItemCategory: Dispatch<SetStateAction<boolean>>;
  setEditItemCategory: Dispatch<SetStateAction<ItemCategoryWithSigner | null>>;
};

const ITAssetFormDetails = ({
  formId,
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
  isCreatingItemCategory,
  editItemCategory,
  itemCategoryList,
  setItemCategoryList,
  itemCategoryCount,
  setItemCategoryCount,
  setIsCreatingItemCategory,
  setEditItemCategory,
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
          <CreateItem formId={formId} setIsCreatingItem={setIsCreatingItem} />
        ) : null}
        {editItem ? (
          <UpdateItem
            formId={formId}
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
      <Space h="xl" />
      <Paper p="xl" shadow="xs">
        {!isCreatingItemCategory && !editItemCategory ? (
          <ItemCategoryList
            formId={formId}
            itemCategoryList={itemCategoryList}
            itemCategoryCount={itemCategoryCount}
            setItemCategoryCount={setItemCategoryCount}
            setIsCreatingItemCategory={setIsCreatingItemCategory}
            setEditItemCategory={setEditItemCategory}
            setItemCategoryList={setItemCategoryList}
          />
        ) : null}
        {isCreatingItemCategory ? (
          <CreateItemCategory
            formId={formId}
            setIsCreatingItemCategory={setIsCreatingItemCategory}
          />
        ) : null}
        {editItemCategory ? (
          <UpdateItemCategory
            formId={formId}
            setEditItemCategory={setEditItemCategory}
            editItemCategory={editItemCategory}
          />
        ) : null}
      </Paper>
    </Container>
  );
};

export default ITAssetFormDetails;
