import { ItemWithDescriptionType } from "@/utils/types";
import { Container, Paper } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import BreadcrumbWrapper from "@/components/BreadCrumbs/BreadCrumbWrapper";
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

  const ItemFormDetailsItems = [
    {
      title: "List of PED Items",
      action: () => {
        setSelectedItem(null);
      },
    },
  ];

  if (selectedItem) {
    ItemFormDetailsItems.push({
      title: selectedItem.item_general_name,
      action: () => {
        setSelectedItem(selectedItem);
      },
    });
  }

  return (
    <Container p={0} fluid pos="relative">
      <BreadcrumbWrapper breadcrumbItems={ItemFormDetailsItems}>
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
          <CreateItem setIsCreatingItem={setIsCreatingItem} />
        ) : null}
        {editItem ? (
          <UpdateItem
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
    </Container>
  );
};

export default ItemFormDetails;
