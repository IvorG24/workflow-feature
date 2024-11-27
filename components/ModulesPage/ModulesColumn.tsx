import { FormTableRow, ModuleType, workFlowType } from "@/utils/types";
import {
  ActionIcon,
  Button,
  Flex,
  Select,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconSquareRoundedX } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

type ColumnProps = {
  id: number;
  workflowName: string;
  formName: string;
  initialFormData: FormTableRow[];
  initialWorkflowData: workFlowType[];
  setModuleItems: React.Dispatch<React.SetStateAction<ModuleType[]>>;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  index: number;
  columnBodyRef: React.RefObject<HTMLDivElement>;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveColumn: React.Dispatch<React.SetStateAction<number | null>>;
  isEdit: boolean;
  moduleItems: ModuleType[];
  mode: "view" | "create" | "edit";
};

const ModulesColumns = ({
  id,
  workflowName,
  formName,
  initialFormData,
  initialWorkflowData,
  setModuleItems,
  onDragStart,
  onDragOver,
  onDrop,
  index,
  columnBodyRef,
  setIsEdit,
  isEdit,
  moduleItems,
  mode,
  setActiveColumn,
}: ColumnProps) => {
  const [positionMenu, setPositionMenu] = useState<"left" | "right">();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleDragStart = mode !== "view" ? onDragStart : undefined;
  const handleDragOver = mode !== "view" ? onDragOver : undefined;
  const handleDrop = mode !== "view" ? onDrop : undefined;

  // classes
  const arrowRightClass = isEdit
    ? `${styles.arrowRight} ${styles.editArrowMode}`
    : styles.arrowRight;
  const horizontalLineClass = isEdit
    ? `${styles.horizontalLine} ${styles.editHorizontalMode}`
    : styles.horizontalLine;

  const isLastItem = (index: number, arrayLength: number) => {
    return index === arrayLength - 1;
  };
  const filteredFormData = initialFormData.filter((item) =>
    [
      "IT Asset",
      "PED Equipment",
      "PED Part",
      "Services",
      "Item",
      "Other Expenses",
      "PED Item",
    ].includes(item.form_name)
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    type: "form" | "workflow"
  ) => {
    const newValue = event.currentTarget.value;
    if (newValue === "Select Form" || newValue === "Select Workflow") return;

    const data = type === "form" ? initialFormData : initialWorkflowData;
    const field = type === "form" ? "form_name" : "workflow_label";
    const idField = type === "form" ? "form_id" : "workflow_id";

    const isDuplicate = moduleItems.some(
      (module) =>
        module[`module_temp_form_name`] === newValue &&
        module.module_temp_id !== id
    );

    if (isDuplicate) {
      notifications.show({
        message: `A form with the name "${newValue}" already exists.`,
        color: "orange",
      });
      return; // Exit if a duplicate is found
    }

    const item = (data as unknown as Array<{ [key: string]: string }>).find(
      (item) => item[field as keyof typeof item] === newValue
    );

    if (!item) return;
    setModuleItems((prev) =>
      prev.map((module) =>
        module.module_temp_id === id
          ? {
              ...module,
              [`module_temp_${type}_name`]: newValue,
              [`module_connection_${type}_id`]:
                item[idField as keyof typeof item],
            }
          : module
      )
    );
  };

  const deleteHandler = (id: number) => {
    setModuleItems((prev) => prev.filter((item) => item.module_temp_id !== id));
  };
  // for menu
  const handleDoubleClick = (event: React.MouseEvent) => {
    const parentElement = columnBodyRef.current;
    if (mode === "view") return;
    if (parentElement) {
      const rect = parentElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const midpoint = rect.width / 2;
      if (x < midpoint) {
        setPositionMenu("right");
      } else {
        setPositionMenu("left");
      }
      setIsEdit(true);
    }
  };
  const createCustomEvent = (
    value: string
  ): React.ChangeEvent<HTMLSelectElement> => {
    return {
      currentTarget: { value } as EventTarget & HTMLSelectElement,
    } as React.ChangeEvent<HTMLSelectElement>;
  };
  // listener to close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsEdit(false);
        // setActiveColumn(null)
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, setIsEdit]);

  return (
    <>
      {isEdit && (
        <Flex
          p={20}
          sx={{
            backgroundColor: "#f8f9fa",
            position: "absolute",
            top: ".5rem",
            transition: "all 0.5s ease",
            [positionMenu === "left" ? "left" : "right"]: ".5rem",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #ced4da",
            borderRadius: "12px",
            zIndex: 100,
          }}
          ref={menuRef}
          direction="column"
          gap={15}
          className={`${styles.menu} ${isEdit && styles.show}`}
        >
          <ActionIcon
            onClick={() => {
              setIsEdit(false);
              setActiveColumn(null);
            }}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
            }}
          >
            <IconSquareRoundedX color="Red" size={22} />
          </ActionIcon>
          <Select
            data={[
              { value: "Select Form", label: "Select Form" },
              ...filteredFormData.map((item) => ({
                value: item.form_name,
                label: item.form_name,
              })),
            ]}
            className="custom-select" // Add this class
            label="Forms"
            searchable
            value={formName}
            onChange={(value) =>
              handleChange(createCustomEvent(value || ""), "form")
            }
            placeholder="Choose a form"
            sx={{
              width: "100%",
              ".mantine-Select-label": { marginBottom: "8px" },
              ".mantine-Select-input": {
                borderColor: "#ced4da",
                "&:focus": {
                  borderColor: "#339af0",
                  boxShadow: "0 0 0 1px #339af0",
                },
              },
            }}
          />

          <Select
            data={[
              { value: "Select Workflow", label: "Select Workflow" },
              ...initialWorkflowData.map((item) => ({
                value: item.workflow_label,
                label: item.workflow_label,
              })),
            ]}
            searchable
            className="custom-select"
            label="Workflow"
            value={workflowName}
            onChange={(value) =>
              handleChange(createCustomEvent(value || ""), "workflow")
            }
            placeholder="Choose a workflow"
            sx={{
              width: "100%",
              ".mantine-Select-label": { marginBottom: "8px" },
              ".mantine-Select-input": {
                borderColor: "#ced4da",
                "&:focus": {
                  borderColor: "#339af0",
                  boxShadow: "0 0 0 1px #339af0",
                },
              },
            }}
          />
          <Button
            color="red"
            variant="light"
            onClick={() => deleteHandler(id)}
            sx={{
              backgroundColor: "#ffe3e3",
              borderColor: "#ff8787",
              "&:hover": {
                backgroundColor: "#ff8787",
                color: "#fff",
              },
            }}
          >
            Remove
          </Button>
        </Flex>
      )}

      <Tooltip label="Module" withArrow>
        <Flex
          id={`column-${id}`}
          draggable={mode !== "view"}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          align="center"
          direction="column"
          sx={{
            padding: "12px",
            borderRadius: "8px",
            border: `1px solid ${isEdit ? "#339af0" : "#ced4da"}`,
            backgroundColor: isEdit ? "#f0f9ff" : "#ffffff",
            cursor: mode !== "view" ? "grab" : "default",
            transition: "background-color 0.2s ease, border-color 0.2s ease",
            boxShadow:
              "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
            position: "relative",
            "&:hover": {
              backgroundColor: "#f8f9fa",
              borderColor: "#adb5bd",
              boxShadow:
                "0 6px 10px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)",
            },
            "&:before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "6px",
              backgroundColor: isEdit ? "#339af0" : "#adb5bd",
              borderRadius: "8px 0 0 8px",
            },
            "&:after": {
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "6px",
              backgroundColor: "#adb5bd",
              borderRadius: "0 8px 8px 0",
            },
          }}
        >
          <UnstyledButton
            onDoubleClick={handleDoubleClick}
            sx={{
              padding: "16px",
              width: "100%",
              textAlign: "center",
              backgroundColor: "#ffffff",
              borderRadius: "6px",
              boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.05)",
              transition: "background-color 0.2s ease",
            }}
          >
            <Flex direction="column" align="center">
              <Text fz="md" weight={600}>
                {formName}
              </Text>
              <Text fz="sm" c="dimmed">
                Workflow: {workflowName}
              </Text>
            </Flex>
          </UnstyledButton>
        </Flex>
      </Tooltip>

      {!isLastItem(index, moduleItems.length) && (
        <div className={styles.arrowParent}>
          <div className={horizontalLineClass}></div>
          <div className={arrowRightClass}></div>
        </div>
      )}
    </>
  );
};

export default ModulesColumns;
