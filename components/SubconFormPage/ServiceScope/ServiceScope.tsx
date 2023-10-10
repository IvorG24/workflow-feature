import { ServiceWithScopeType } from "@/utils/types";
import { CloseButton, Container, Divider, Flex, Title } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import ServiceScopeChoice from "./ServiceScopeChoice";

type Props = {
  selectedService: ServiceWithScopeType;
  setSelectedService: Dispatch<SetStateAction<ServiceWithScopeType | null>>;
};

const ServiceScope = ({ selectedService, setSelectedService }: Props) => {
  return (
    <Container p={0} fluid>
      <Flex align="center" justify="space-between">
        <Title order={2}>{`${selectedService.service_name}`}</Title>
        <CloseButton onClick={() => setSelectedService(null)} />
      </Flex>
      <Divider mb="xl" mt="sm" />

      {selectedService.service_scope.map((scope) => {
        if (
          scope.service_scope_type === "DROPDOWN" ||
          scope.service_scope_type === "MULTISELECT"
        ) {
          return (
            <ServiceScopeChoice key={scope.service_scope_id} scope={scope} />
          );
        }
      })}
    </Container>
  );
};

export default ServiceScope;
