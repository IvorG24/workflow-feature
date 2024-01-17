import { OtherExpensesTypeWithCategoryType } from "@/utils/types";
import { Container } from "@mantine/core";
import { useState } from "react";
import CreateOtherExpensesType from "./CreateOtherExpensesType";
import OtherExpensesTypeList from "./OtherExpensesTypeList";
import UpdateOtherExpensesType from "./UpdateOtherExpensesType";

export type TypeForm = {
  type: string;
  isAvailable: boolean;
  category: string;
};

type Props = {
  otherExpensesTypes: OtherExpensesTypeWithCategoryType[];
  otherExpensesTypeCount: number;
};

const OtherExpensesType = ({
  otherExpensesTypes,
  otherExpensesTypeCount,
}: Props) => {
  const [typeList, setTypeList] =
    useState<OtherExpensesTypeWithCategoryType[]>(otherExpensesTypes);
  const [typeCount, setTypeCount] = useState(otherExpensesTypeCount);
  const [isCreatingType, setIsCreatingType] = useState(false);

  const [editType, setEditType] =
    useState<OtherExpensesTypeWithCategoryType | null>(null);

  return (
    <Container p={0} fluid pos="relative">
      {!isCreatingType && !editType ? (
        <OtherExpensesTypeList
          typeList={typeList}
          setTypeList={setTypeList}
          typeCount={typeCount}
          setTypeCount={setTypeCount}
          setIsCreatingType={setIsCreatingType}
          setEditType={setEditType}
        />
      ) : null}
      {isCreatingType ? (
        <CreateOtherExpensesType
          setIsCreatingType={setIsCreatingType}
          setTypeList={setTypeList}
          setTypeCount={setTypeCount}
        />
      ) : null}
      {editType ? (
        <UpdateOtherExpensesType
          setTypeList={setTypeList}
          setEditType={setEditType}
          editType={editType}
        />
      ) : null}
    </Container>
  );
};

export default OtherExpensesType;
