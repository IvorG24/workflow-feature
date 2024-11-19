import { getSCICEmployeeList } from "@/backend/api/get";
import { ROW_PER_PAGE } from "@/utils/constant";
import { SCICEmployeeTableRow } from "@/utils/types";
import { Box, Center, Paper, Space, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import BreadcrumbWrapper from "@/components/BreadCrumbs/BreadCrumbWrapper";
import CreateNewEmployee from "./CreateNewEmployee";
import EditEmployee from "./EditEmployee";
import EmployeeList from "./EmployeeList";

type Props = {
  isOwnerOrAdmin: boolean;
  teamId: string;
};

const TeamEmployee = ({ isOwnerOrAdmin }: Props) => {
  const supabaseClient = useSupabaseClient();
  const [activePage, setActivePage] = useState(1);
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [scicEmployeeList, setScicEmployeeList] = useState<
    SCICEmployeeTableRow[]
  >([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [selectedEmployee, setSelectedEmployee] =
    useState<SCICEmployeeTableRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async (page: number, search?: string) => {
    setIsLoading(true);
    try {
      const { data, totalCount } = await getSCICEmployeeList(supabaseClient, {
        search: search,
        limit: ROW_PER_PAGE,
        page: page,
      });
      setScicEmployeeList(data);
      setEmployeeCount(totalCount);
    } catch (e) {
      notifications.show({
        message: "Error on fetching group list",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const teamEmployeeItems = [
    {
      title: "SCIC Employee",
      action: () => setSelectedEmployee(null),
    }
  ]

  if (selectedEmployee) {
    teamEmployeeItems.push({
      title: selectedEmployee.scic_employee_first_name + " " + selectedEmployee.scic_employee_last_name,
      action: () => setSelectedEmployee(selectedEmployee),
    });
  }

  useEffect(() => {
    handleFetch(1);
  }, []);
  return (
    <Box mt="xl">
      <BreadcrumbWrapper breadcrumbItems={teamEmployeeItems} >
      {!isCreatingEmployee && !selectedEmployee ? (
          <EmployeeList
            activePage={activePage}
            setActivePage={setActivePage}
            scicEmployeeList={scicEmployeeList}
            setScicEmployeeList={setScicEmployeeList}
            setEmployeeCount={setEmployeeCount}
            setIsCreatingEmployee={setIsCreatingEmployee}
            isOwnerOrAdmin={isOwnerOrAdmin}
            handleFetch={handleFetch}
            setSelectedEmployee={setSelectedEmployee}
            selectedEmployee={selectedEmployee}
            isLoading={isLoading}
            employeeCount={employeeCount}
          />
        ) : null}
        {isCreatingEmployee ? (
          <CreateNewEmployee
            activePage={activePage}
            setIsCreatingEmployee={setIsCreatingEmployee}
            handleFetch={handleFetch}
          />
        ) : null}
      <Space h="xl" />
        {selectedEmployee ? (
          <EditEmployee
            activePage={activePage}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            handleFetch={handleFetch}
          />
        ) : null}
      </BreadcrumbWrapper>
    </Box>
  );
};

export default TeamEmployee;
