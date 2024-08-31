import { getPhoneMeetingSlots } from "@/backend/api/get";
import { updatePhoneInterview } from "@/backend/api/update";
import { formatDate } from "@/utils/constant";
import { Button, Flex, Modal, NativeSelect, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import moment from 'moment';
import { useEffect, useState } from "react";

type SchedulingType = {
  meeting_type: "technical" | "qualifying" | "phone";
  target_id: string;
  intialDate: string | null;
  refetchData: () => Promise<void>;
  status: string;
  isRefetchingData: boolean;
};

type HrSlotType = {
  slot_start: string;
  slot_end: string;
};

const SchedulingCalendar = ({
  meeting_type,
  target_id,
  intialDate,
  refetchData,
  status,
  isRefetchingData,
}: SchedulingType) => {
  const supabaseClient = useSupabaseClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (intialDate) {
      return new Date(intialDate);
    }
    return null;
  });
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [hrSlot, setHrSlot] = useState<HrSlotType[]>([]);
  const [isLoading, setIsloading] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [isReschedule, setIsReschedule] = useState(false);
  const [isReadyToSelect, setIsReadyToSelect] = useState(false);

  const today = moment().startOf('day');
  const minDate = today.toDate();
  const maxDate = today.clone().add(30, 'days').toDate();

  const formatTimeToLocal = (dateTime: string) => {
    return moment(dateTime).format('hh:mm A');
  };

  const cancelInterviewHandler = async () => {
    try {
      const params = {
        target_id,
        status: "CANCELLED",
      };

      if (meeting_type === "phone") {
        await updatePhoneInterview(supabaseClient, params);
      }
      refetchData();
      close();
      notifications.show({
        message: "Interview cancellation successful!",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: "Error cancelling interview:",
        color: "orange",
      });
    }
  };

  const rescheduleHandler = () => {
    setIsEdit(true);
    setIsReschedule(true);
    setIsReadyToSelect(false);
  };

  const setScheduleHandler = async () => {
    if (!selectedSlot || !selectedDate || selectedSlot === "") {
      notifications.show({
        message: "No slot selected or meeting info available.",
        color: "orange",
      });
      return;
    }

    if (selectedSlot === "") return;

    setIsloading(true);

    try {
      const [time] = selectedSlot.split(" ");
      const [hours, minutes] = time.split(":").map(Number);

      const tempDate = new Date(selectedDate);
      tempDate.setHours(hours, minutes);

      const nowUtc = moment().toISOString();

      if (meeting_type === "phone") {
        const params = {
          interview_schedule: tempDate.toISOString(),
          interview_status_date_updated: nowUtc,
          target_id,
          status: "PENDING",
        };
        const { message, status } = await updatePhoneInterview(supabaseClient, params);

        if (status === 'success') {
          setSelectedDate(tempDate);
          notifications.show({
            message: message,
            color: "green",
          });
        }
        if (status === 'error') {
          notifications.show({
            message: message,
            color: "orange",
          });
        }
      }

      await refetchData();


    } catch (error) {
      notifications.show({
        message: "Error updating interview:",
        color: "orange",
      });
    } finally {
      setIsloading(false);
      setIsEdit(false);
    }
  };

  const fetchTime = async ({
    slotDuration,
    breakDuration,
  }: {
    slotDuration: number;
    breakDuration: number;
  }) => {
    if (selectedDate !== null) {
      const start = moment(selectedDate).set({ hour: 8, minute: 0, second: 0, millisecond: 0 }); // Set to 8 AM
      const end = moment(selectedDate).set({ hour: 18, minute: 30, second: 0, millisecond: 0 }); // Set to 6:30 PM

      // meeting duration
      // technical = 15 mins
      // qualifying = 15 mins
      // phone = 5 mins

      // restriction
      // 10 mins rest between meeting
      // schedule limited to 30 days into the future

      const params = {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        meetingDuration: slotDuration * 60 * 1000,
        breakDuration: breakDuration * 60 * 1000,
      };

      try {
        setIsloading(true);
        if (meeting_type === "phone") {
          const data = await getPhoneMeetingSlots(supabaseClient, params);
          setHrSlot(data);
        }
      } catch (error) {
        notifications.show({
          message: "Error fetching meeting slots",
          color: "orange",
        });
      } finally {
        setIsloading(false);
      }
    }
  };

  const removePrevTime = () => {
    const parseTimeString = (timeString: string): moment.Moment => {
      const [time, period] = timeString.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      const formattedHours = period === "PM" ? (hours % 12) + 12 : hours % 12;

      return moment().set({ hour: formattedHours, minute: minutes, second: 0, millisecond: 0 });
    };

    const today = moment().startOf('day');
    const selectedDateMoment = selectedDate ? moment(selectedDate).startOf('day') : null;

    if (selectedDateMoment && today.isSame(selectedDateMoment, 'day')) {
      const now = moment();
      const currentTime = moment().set({ hour: now.hour(), minute: now.minute(), second: 0, millisecond: 0 });

      const filteredSlots = hrSlot
        .map(slot => formatTimeToLocal(slot.slot_start))
        .map(slotTime => parseTimeString(slotTime))
        .filter(slotTime => slotTime.isSameOrAfter(currentTime));

      // Remove the current first time slot
      if (filteredSlots.length > 0) {
        filteredSlots.shift();
      }

      return filteredSlots.map(time => time.format('hh:mm A'));
    } else {
      return hrSlot.map(slot => formatTimeToLocal(slot.slot_start));
    }
  };

  const fetchSlot = () => {
    if (meeting_type === "technical") {
      fetchTime({ breakDuration: 10, slotDuration: 15 });
      setSelectedSlot("");
    }
    if (meeting_type === "qualifying") {
      fetchTime({ breakDuration: 10, slotDuration: 15 });
      setSelectedSlot("");
    }
    if (meeting_type === "phone") {
      fetchTime({ breakDuration: 10, slotDuration: 5 });
      setSelectedSlot("");
    }
  };

  useEffect(() => {
    fetchSlot();
    if (intialDate !== null) {
      setIsEdit(false);
    } else {
      setIsEdit(true);
    }
  }, []);

  useEffect(() => {
    fetchSlot();
  }, [selectedDate]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        centered
        title="Please confirm your action."
        pos="relative"
      >
        <Text mb={15} size="sm">
          Are you sure you want to cancel your {meeting_type} interview?
        </Text>
        <Flex justify="end" gap={5}>
          <Button variant="outline" color="dark" onClick={close}>
            <Text color="black">Cancel</Text>
          </Button>
          <Button onClick={cancelInterviewHandler} mb={5} color="dark">
            Confirm
          </Button>
        </Flex>
      </Modal>
      <Flex direction="column" gap={10} mb={20}>
        {status === "CANCELLED" && (
          <div>
            <Text mb={10} color="red">
              You cancelled your interview
            </Text>
          </div>
        )}

        {isEdit === false && selectedDate && status !== "CANCELLED" && (
          <div>
            {(() => {
              const hours = selectedDate.getHours();
              const minutes = selectedDate.getMinutes();
              const period = hours >= 12 ? "PM" : "AM";
              const timeString = `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")} ${period}`;
              return (
                <div>
                  <Text mb={10}>
                    Schedule:
                    <Text component="a" fw="bold">
                      {" "}
                      {formatDate(selectedDate)} at {timeString}
                    </Text>
                  </Text>
                  <Flex gap={5} style={{ alignItems: "baseline" }}>
                    <Text>Action: </Text>
                    <Flex gap={5}>
                      <Button
                        onClick={rescheduleHandler}
                        style={{ width: "max-content" }}
                        disabled={isLoading || isRefetchingData}
                        color="orange"
                      >
                        Reschedule
                      </Button>
                      <Button
                        onClick={open}
                        style={{ width: "max-content" }}
                        disabled={isLoading || isRefetchingData}
                        color="dark"
                      >
                        Cancel
                      </Button>
                    </Flex>
                  </Flex>
                </div>
              );
            })()}
          </div>
        )}

        {!isReadyToSelect && isEdit && (
          <Flex style={{ alignItems: "baseline" }} gap={5}>
            <Text>Schedule: </Text>
            <Button
              onClick={async () => {
                setIsReadyToSelect(true);
              }}
            >
              Set Schedule
            </Button>
            {isReschedule && isEdit && (
              <Button
                color="dark"
                onClick={() => {
                  setIsEdit(false);
                  setIsReschedule(false);
                }}
              >
                Cancel
              </Button>
            )}
          </Flex>
        )}

        {isEdit && isReadyToSelect && (
          <div>
            <DatePickerInput
              label="Select Date"
              maw="max-content"
              value={selectedDate}
              onChange={setSelectedDate}
              minDate={minDate}
              maxDate={maxDate}
              mb={10}
            />

            {hrSlot && selectedDate && (
              <NativeSelect
                data={["", ...removePrevTime()]}
                label="Select Time"
                maw="max-content"
                value={selectedSlot}
                onChange={(event) => {
                  refetchData();
                  setSelectedSlot(event.currentTarget.value);
                }}
                mb={10}
                disabled={isLoading || isRefetchingData}
              />
            )}

            {selectedSlot && !isReschedule && (
              <Button
                mb={10}
                onClick={setScheduleHandler}
                disabled={isLoading || isRefetchingData}
                style={{ width: "min-content" }}
              >
                <Text fz="md" fw="bold">
                  Submit
                </Text>
              </Button>
            )}

            {isReschedule && selectedSlot && selectedDate && (
              <Flex gap={5} style={{ alignItems: "baseline" }}>
                <Text>Action: </Text>
                <Flex gap={5}>
                  <Button
                    style={{ width: "min-content" }}
                    color="dark"
                    onClick={() => {
                      setIsReschedule(false);
                      setIsEdit(false);
                    }}
                    disabled={isLoading || isRefetchingData}
                  >
                    <Text fz="md" fw="bold">
                      Cancel
                    </Text>
                  </Button>
                  <Button
                    mb={10}
                    onClick={setScheduleHandler}
                    disabled={isLoading || isRefetchingData}
                    style={{ width: "min-content" }}
                  >
                    <Text fz="md" fw="bold">
                      Submit
                    </Text>
                  </Button>
                </Flex>
              </Flex>
            )}
          </div>
        )}
      </Flex>
    </>
  );
};

export default SchedulingCalendar;
