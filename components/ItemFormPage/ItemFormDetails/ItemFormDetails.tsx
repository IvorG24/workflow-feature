import { ItemCategoryWithSigner, ItemWithDescriptionType } from "@/utils/types";
import { Container, Paper, Space } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import BreadcrumbWrapper from "@/components/BreadCrumbs/BreadCrumbWrapper";
import CreateItemCategory from "../ItemCategoryList/CreateItemCategory";
import ItemCategoryList from "../ItemCategoryList/ItemCategoryList";
import UpdateItemCategory from "../ItemCategoryList/UpdateItemCategory";
import ItemDescription from "../ItemDescription/ItemDescription";
import CreateItem from "../ItemList/CreateItem";
import ItemList from "../ItemList/ItemList";
import UpdateItem from "../ItemList/UpdateItem";

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

const ItemFormDetails = ({
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
  const itemFormDetailItems = [
    {
      title: "List of Items",
      action: () => {
        setSelectedItem(null);
        setEditItem(null);
      },
    },
  ];

  if (selectedItem || editItem) {
    itemFormDetailItems.push({
      title:
        selectedItem?.item_general_name ?? editItem?.item_general_name ?? "",
      action: () => {
        setSelectedItem(selectedItem);
        setEditItem(editItem);
      },
    });
  }

  return (
    <Container p={0} fluid pos="relative">
      <BreadcrumbWrapper breadcrumbItems={itemFormDetailItems}>
        {!isCreatingItem && !editItem && !selectedItem ? (
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

        <Paper>
          {selectedItem ? (
            <ItemDescription
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
          ) : null}
        </Paper>
      </BreadcrumbWrapper>
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

export default ItemFormDetails;
