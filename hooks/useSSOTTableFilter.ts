import { Dispatch, SetStateAction, useState } from "react";

type ShowColumnList = { [key: string]: boolean };

export type SSOTTableData = {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  columnList: ShowColumnList;
  setColumnList: Dispatch<SetStateAction<ShowColumnList>>;
};

export const useSSOTTableFilter = (
  defaultShow: boolean,
  columnList: string[]
): SSOTTableData => {
  const [show, setShow] = useState(defaultShow);
  const [columnListState, setColumnListState] = useState<ShowColumnList>(
    convertColumnListArrayToObject(columnList)
  );

  return {
    show,
    setShow,
    columnList: columnListState,
    setColumnList: setColumnListState,
  };
};

const convertColumnListArrayToObject = (array: string[]): ShowColumnList => {
  const obj: ShowColumnList = {};

  array.forEach((item) => {
    obj[item.toLowerCase().replace(/\s+/g, "_")] = true;
  });

  return obj;
};
