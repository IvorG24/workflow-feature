import {
  getInterviewOnlineMeeting,
  getPhoneMeetingSlots,
} from "@/backend/api/get";
import { createInterviewOnlineMeeting } from "@/backend/api/post";
import {
  updateInterviewOnlineMeeting,
  updatePhoneInterview,
} from "@/backend/api/update";
import { useUserProfile } from "@/stores/useUserStore";
import { formatDate } from "@/utils/constant";
import {
  InterviewOnlineMeetingTableInsert,
  InterviewOnlineMeetingTableRow,
  InterviewOnlineMeetingTableUpdate,
} from "@/utils/types";
import {
  Button,
  Flex,
  Group,
  Loader,
  Modal,
  Select,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import moment from "moment";
import { useEffect, useState } from "react";

const testOnlineMeetingProps = {
  interview_meeting_date_created: "TEST",
  interview_meeting_interview_id: "TEST",
  interview_meeting_provider_id: "TEST",
  interview_meeting_url: "TEST",
};

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
  isDisabled: boolean;
};

const SchedulingCalendar = ({
  meeting_type,
  target_id,
  intialDate,
  refetchData,
  status,
  isRefetchingData,
}: SchedulingType) => {
  const user = useUserProfile();
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
  const [interviewOnlineMeeting, setInterviewOnlineMeeting] =
    useState<InterviewOnlineMeetingTableRow | null>(null);

  const today = moment().startOf("day");
  const minDate = today.toDate();
  const maxDate = today.clone().add(30, "days").toDate();

  const formatTimeToLocal = (dateTime: string) => {
    return moment(dateTime).format("hh:mm A");
  };

  const cancelInterviewHandler = async () => {
    try {
      const params = {
        target_id,
        status: "CANCELLED",
      };

      if (meeting_type === "phone") {
        // interviewOnlineMeeting && process.env.NODE_ENV === "production"
        if (interviewOnlineMeeting) {
          console.log("called");
          await handleCancelOnlineMeeting(
            interviewOnlineMeeting.interview_meeting_provider_id
          );
        }
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

  const fetchTime = async ({
    slotDuration,
    breakDuration,
  }: {
    slotDuration: number;
    breakDuration: number;
  }) => {
    if (selectedDate !== null) {
      const start = moment(selectedDate).set({
        hour: 8,
        minute: 0,
        second: 0,
        millisecond: 0,
      }); // Set to 8 AM
      const end = moment(selectedDate).set({
        hour: 18,
        minute: 30,
        second: 0,
        millisecond: 0,
      }); // Set to 6:30 PM

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

  const setScheduleHandler = async () => {
    if (!selectedDate) {
      notifications.show({
        message: "Date is required.",
        color: "orange",
      });
      return;
    }
    if (!selectedSlot) {
      notifications.show({
        message: "Time is required.",
        color: "orange",
      });
      return;
    }
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
        const { message, status } = await updatePhoneInterview(
          supabaseClient,
          params
        );

        if (status === "success") {
          if (interviewOnlineMeeting) {
            // update online meeting
            if (process.env.NODE_ENV === "production") {
              await handleRescheduleOnlineMeeting(tempDate);
            } else {
              const newInterviewOnlineMeeting =
                await updateInterviewOnlineMeeting(supabaseClient, {
                  ...testOnlineMeetingProps,
                  inverview_meeting_id:
                    interviewOnlineMeeting.inverview_meeting_id,
                });
              setInterviewOnlineMeeting(newInterviewOnlineMeeting);
            }
          } else {
            // create online meeting
            if (process.env.NODE_ENV === "production") {
              await handleCreateOnlineMeeting(tempDate);
            } else {
              const newInterviewOnlineMeeting =
                await createInterviewOnlineMeeting(
                  supabaseClient,
                  testOnlineMeetingProps
                );

              setInterviewOnlineMeeting(newInterviewOnlineMeeting);
            }
          }

          setSelectedDate(tempDate);
          notifications.show({
            message: message,
            color: "green",
          });
          setIsEdit(false);
        }
        if (status === "error") {
          notifications.show({
            message: message,
            color: "orange",
          });
          fetchTime({ breakDuration: 10, slotDuration: 5 });
          setSelectedSlot("");
        }
      }

      await refetchData();
    } catch (e) {
      notifications.show({
        message: "Error updating schedule",
        color: "orange",
      });
    } finally {
      setIsloading(false);
    }
  };

  const removePrevTime = () => {
    const parseTimeString = (timeString: string): moment.Moment => {
      const [time, period] = timeString.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      const formattedHours = period === "PM" ? (hours % 12) + 12 : hours % 12;

      return moment().set({
        hour: formattedHours,
        minute: minutes,
        second: 0,
        millisecond: 0,
      });
    };

    const today = moment().startOf("day");
    const selectedDateMoment = selectedDate
      ? moment(selectedDate).startOf("day")
      : null;

    if (selectedDateMoment && today.isSame(selectedDateMoment, "day")) {
      const now = moment();
      const currentTime = moment().set({
        hour: now.hour(),
        minute: now.minute(),
        second: 0,
        millisecond: 0,
      });

      const filteredSlots = hrSlot
        .map((slot) => ({
          value: formatTimeToLocal(slot.slot_start),
          label: formatTimeToLocal(slot.slot_start),
          isDisabled: slot.isDisabled,
          time: parseTimeString(formatTimeToLocal(slot.slot_start)),
        }))
        .filter((slot) => slot.time.isSameOrAfter(currentTime));

      // Remove the current first time slot
      if (filteredSlots.length > 0) {
        filteredSlots.shift();
      }

      return filteredSlots;
    } else {
      return hrSlot.map((slot) => ({
        value: formatTimeToLocal(slot.slot_start),
        label: formatTimeToLocal(slot.slot_start),
        disabled: slot.isDisabled,
      }));
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

  const handleCreateOnlineMeeting = async (tempDate: Date) => {
    const hrRepresentativeName = "John Doe"; // replace with actual hr rep name
    const hrRepresentativeEmail = "johndoe@gmail.com"; // replace with actual hr rep email
    const formattedDate = moment(tempDate).format("dddd, MMMM Do YYYY, h:mm A");
    const userFullname = `${user?.user_first_name} ${user?.user_last_name}`;
    const meetingDetails = {
      subject: "HR Interview",
      body: {
        contentType: "HTML",
        content: `Interview with HR representative ${hrRepresentativeName} and applicant ${userFullname} on ${formattedDate}.`,
      },
      start: {
        dateTime: moment(tempDate).format(),
        timeZone: "Asia/Manila",
      },
      end: {
        dateTime: moment(tempDate).add(15, "m").format(),
        timeZone: "Asia/Manila",
      },
      attendees: [
        {
          emailAddress: {
            address: hrRepresentativeEmail, // replace with actual hr rep email
            name: hrRepresentativeName,
          },
          type: "required",
        },
        {
          emailAddress: {
            address: user?.user_email, // replace with actual user
            name: userFullname,
          },
          type: "required",
        },
      ],
      allowNewTimeProposals: true,
      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness",
    };

    const createMeetingResponse = await fetch("/api/ms-graph/create-meeting", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meetingDetails),
    });
    const createMeetingData = await createMeetingResponse.json();

    const meetingUrl = createMeetingData.onlineMeeting.joinUrl;

    const interviewOnlineMeeting: InterviewOnlineMeetingTableInsert = {
      interview_meeting_interview_id: target_id,
      interview_meeting_url: meetingUrl,
      interview_meeting_provider_id: createMeetingData.id,
    };

    const newInterviewOnlineMeeting = await createInterviewOnlineMeeting(
      supabaseClient,
      interviewOnlineMeeting
    );

    setInterviewOnlineMeeting(newInterviewOnlineMeeting);

    const emailNotificationProps = {
      subject: `HR Interview Schedule.`,
      userFullname,
      message: `You are scheduled for an interview with HR representative ${hrRepresentativeName} on ${formattedDate}. Click the link below to join the meeting. If you need further assistance, please reach out to careers@staclara.com.ph`,
      callbackLink: meetingUrl,
      callbackLinkLabel: "HR Interview Meeting Link",
    };

    await handleSendEmailNotification(emailNotificationProps);
  };

  const handleRescheduleOnlineMeeting = async (tempDate: Date) => {
    if (!interviewOnlineMeeting) {
      notifications.show({
        message: "Cannot reschedule meeting because it does not exist",
        color: "red",
      });
      return;
    }
    const hrRepresentativeName = "John Doe"; // replace with actual hr rep name
    const formattedDate = moment(tempDate).format(
      "dddd, MMMM Do YYYY, h:mm:ss a"
    );
    const userFullname = `${user?.user_first_name} ${user?.user_last_name}`;
    const meetingDetails = {
      start: {
        dateTime: moment(tempDate).format(),
        timeZone: "Asia/Manila",
      },
      end: {
        dateTime: moment(tempDate).add(15, "m").format(),
        timeZone: "Asia/Manila",
      },
    };

    const updateMeetingResponse = await fetch("/api/ms-graph/update-meeting", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meetingDetails,
        meetingId: interviewOnlineMeeting.interview_meeting_provider_id,
      }),
    });
    const updateMeetingData = await updateMeetingResponse.json();
    const meetingUrl = updateMeetingData.onlineMeeting.joinUrl;

    const interviewOnlineMeetingProps: InterviewOnlineMeetingTableUpdate = {
      interview_meeting_url: meetingUrl,
      interview_meeting_provider_id: updateMeetingData.id,
      inverview_meeting_id: interviewOnlineMeeting.inverview_meeting_id,
    };

    const newInterviewOnlineMeeting = await updateInterviewOnlineMeeting(
      supabaseClient,
      interviewOnlineMeetingProps
    );

    setInterviewOnlineMeeting(newInterviewOnlineMeeting);

    const emailNotificationProps = {
      subject: `HR Interview Schedule.`,
      userFullname,
      message: `You interview with HR representative ${hrRepresentativeName} has been rescheduled to ${formattedDate}. Click the link below to join the meeting. If you need further assistance, please reach out to careers@staclara.com.ph`,
      callbackLink: meetingUrl,
      callbackLinkLabel: "HR Interview Meeting Link",
    };

    await handleSendEmailNotification(emailNotificationProps);
  };

  const handleCancelOnlineMeeting = async (meetingId: string) => {
    if (!interviewOnlineMeeting) {
      notifications.show({
        message: "Cannot cancel meeting because it does not exist",
        color: "red",
      });
      return;
    }
    try {
      await fetch("/api/ms-graph/cancel-meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId,
        }),
      });
    } catch (error) {
      notifications.show({
        message: "Failed to cancel meeting",
        color: "red",
      });
    }
  };

  const handleSendEmailNotification = async ({
    userFullname,
    subject,
    message,
    callbackLink,
    callbackLinkLabel,
  }: {
    userFullname: string;
    subject: string;
    message: string;
    callbackLink: string;
    callbackLinkLabel: string;
  }) => {
    const emailNotificationProps = {
      to: user?.user_email,
      subject: subject,
      recipientName: userFullname,
      message: message,
      callbackLink: callbackLink,
      callbackLinkLabel: callbackLinkLabel,
    };

    await fetch("/api/resend/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailNotificationProps),
    });
  };

  const handleFetchInterviewOnlineMeeting = async () => {
    const currentInterviewOnlineMeeting = await getInterviewOnlineMeeting(
      supabaseClient,
      target_id
    );

    if (currentInterviewOnlineMeeting) {
      setInterviewOnlineMeeting(currentInterviewOnlineMeeting);
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

  useEffect(() => {
    handleFetchInterviewOnlineMeeting();
  }, [target_id]);

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
          <>
            {(() => {
              const hours = selectedDate.getHours();
              const minutes = selectedDate.getMinutes();
              const period = hours >= 12 ? "PM" : "AM";
              const timeString = `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")} ${period}`;
              return (
                <>
                  <Text mb={10}>
                    Schedule:
                    <Text component="a" fw="bold">
                      {" "}
                      {formatDate(selectedDate)} at {timeString}
                    </Text>
                  </Text>
                  <Group>
                    <Text>Action: </Text>
                    <Group spacing="xs">
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
                    </Group>
                  </Group>
                </>
              );
            })()}
          </>
        )}

        {status === "WAITING FOR SCHEDULE" && (
          <Group>
            <Text>Schedule: </Text>
            <Group spacing="xs">
              <Button
                onClick={async () => {
                  setIsReadyToSelect(true);
                }}
                disabled={!Boolean(!isReadyToSelect && isEdit)}
              >
                Set Schedule
              </Button>
            </Group>

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
          </Group>
        )}

        {isEdit && true && (
          <>
            <Group>
              <Text>Select Date:</Text>
              <DatePickerInput
                value={selectedDate}
                onChange={setSelectedDate}
                minDate={minDate}
                maxDate={maxDate}
                clearable
                icon={<IconCalendar size={16} />}
                w={260}
              />
            </Group>

            <Group>
              <Text>Select Time:</Text>
              <Select
                data={[...removePrevTime()]}
                value={selectedSlot}
                onChange={(value) => {
                  refetchData();
                  setSelectedSlot(value as string);
                }}
                disabled={isLoading || isRefetchingData}
                clearable
                icon={<IconClock size={16} />}
                w={260}
                rightSection={
                  (isLoading || isRefetchingData) && <Loader size={16} />
                }
              />
            </Group>

            <Group spacing="xs">
              <Button
                onClick={async () => {
                  setIsReadyToSelect(false);
                  setSelectedDate(null);
                  setSelectedSlot("");
                }}
                variant="outline"
              >
                Cancel
              </Button>

              <Button
                onClick={setScheduleHandler}
                disabled={isLoading || isRefetchingData}
                style={{ width: "min-content" }}
              >
                <Text fz="md" fw="bold">
                  Submit
                </Text>
              </Button>
            </Group>

            {isReschedule && selectedSlot && selectedDate && (
              <Group>
                <Text>Action: </Text>
                <Group>
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
                </Group>
              </Group>
            )}
          </>
        )}

        {/* meeting details */}
        {interviewOnlineMeeting ? (
          <Flex gap="xs" align="center" mt="sm">
            <Text>Online Meeting:</Text>
            <Button
              onClick={() =>
                window.open(
                  interviewOnlineMeeting.interview_meeting_url,
                  "_blank"
                )
              }
            >
              Join Meeting
            </Button>
          </Flex>
        ) : null}
      </Flex>
    </>
  );
};

export default SchedulingCalendar;
