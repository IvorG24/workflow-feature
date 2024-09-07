import { deleteInterviewOnlineMeeting } from "@/backend/api/delete";
import {
  getCurrentDate,
  getInterviewOnlineMeeting,
  getPhoneMeetingSlots,
} from "@/backend/api/get";
import { createInterviewOnlineMeeting } from "@/backend/api/post";
import {
  cancelPhoneInterview,
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
  LoadingOverlay,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { EmailNotificationTemplateProps } from "../Resend/EmailNotificationTemplate";

type SchedulingType = {
  meeting_type: "technical" | "qualifying" | "phone";
  target_id: string;
  intialDate: string | null;
  refetchData: () => Promise<void>;
  status: string;
  isRefetchingData: boolean;
  date_created: string;
  setIsReadyToSelect: React.Dispatch<React.SetStateAction<boolean>>;
  isReadyToSelect: boolean;
};

type HrSlotType = {
  slot_start: string;
  slot_end: string;
  isDisabled: boolean;
};

const SchedulingCalendar = ({
  setIsReadyToSelect,
  isReadyToSelect,
  meeting_type,
  target_id,
  intialDate,
  refetchData,
  status,
  date_created,
  isRefetchingData,
}: SchedulingType) => {
  const testOnlineMeetingProps = {
    interview_meeting_date_created: moment().toISOString(),
    interview_meeting_interview_id: target_id,
    interview_meeting_provider_id: "test-provider-id",
    interview_meeting_url: "https://mock-url.com/meeting",
  };

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
  const [isReschedule, setIsReschedule] = useState(false);

  const [interviewOnlineMeeting, setInterviewOnlineMeeting] =
    useState<InterviewOnlineMeetingTableRow | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>();
  const appliedDate = moment(date_created);
  const minDate = moment(currentDate).format();
  const maxDate = appliedDate.clone().add(30, "days").toDate();
  const scheduleDate = intialDate ? moment(intialDate) : moment();
  const initialDate = moment(intialDate).format();
  const isDayBeforeSchedule =
    scheduleDate.startOf("day").diff(moment(minDate).startOf("day"), "days") ===
    1;
  const isAfterSchedule = scheduleDate
    .startOf("day")
    .isBefore(moment(minDate).startOf("day"));
  const isToday = moment(intialDate).isSame(
    moment(currentDate).format(),
    "day"
  );
  const cancelRestricted = moment(minDate).isSameOrAfter(
    moment(initialDate),
    "minutes"
  );

  const formatTimeToLocal = (dateTime: string) => {
    return moment(dateTime).format("hh:mm A");
  };

  const cancelInterviewHandler = async () => {
    if (cancelRestricted) {
      notifications.show({
        message: "Cannot cancel interview.",
        color: "orange",
      });
      return;
    }
    try {
      setIsloading(true);
      const params = {
        target_id,
        status: "CANCELLED",
      };

      if (meeting_type === "phone") {
        if (interviewOnlineMeeting) {
          await handleCancelOnlineMeeting(
            interviewOnlineMeeting.interview_meeting_provider_id
          );
        }
        await cancelPhoneInterview(supabaseClient, params);
      }
      refetchData();
      notifications.show({
        message: "Interview cancellation successful!",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: "Error cancelling interview:",
        color: "orange",
      });
    } finally {
      setIsloading(false);
    }
  };

  const rescheduleHandler = () => {
    setIsEdit(true);
    setIsReschedule(true);
    setSelectedSlot("");
    setSelectedDate(null);
    setIsReadyToSelect(true);
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
          const newDate = await getCurrentDate(supabaseClient);
          setCurrentDate(newDate);
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
    setIsReadyToSelect(false);
    setIsEdit(false);

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
                  interview_meeting_id:
                    interviewOnlineMeeting.interview_meeting_id,
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
          disabled: slot.isDisabled,
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
      fetchTime({ breakDuration: 0, slotDuration: 5 });
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
      subject: `HR Phone Interview Schedule | Sta. Clara International Corporation`,
      userFullname,
      message: `
          <p>
            Your HR phone interview has been scheduled. Please find the details
            of your interview below:
          </p>
          <p>
            <strong>Date</strong>:{" "}
            <span>${moment(tempDate).format("dddd, MMMM Do YYYY")}</span>
          </p>
          <p>
            <strong>Time</strong>:{" "}
            <span>${moment(tempDate).format("h:mm A")}</span>
          </p>
          <p>
            <strong>Meeting Link</strong>
            <a href=${meetingUrl}>Interview Meeting Link</a>
          </p>
          <p>
            If you have any questions or need to make adjustments, please
            contact us at recruitment@staclara.com.ph. We look forward to
            speaking with you.
          </p>
      )`,
      closingPhrase: "Best regards,",
      signature: "Sta. Clara International Corporation Recruitment Team",
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
      interview_meeting_id: interviewOnlineMeeting.interview_meeting_id,
    };

    const newInterviewOnlineMeeting = await updateInterviewOnlineMeeting(
      supabaseClient,
      interviewOnlineMeetingProps
    );

    setInterviewOnlineMeeting(newInterviewOnlineMeeting);

    const emailNotificationProps = {
      subject: `HR Phone Interview Schedule | Sta. Clara International Corporation`,
      userFullname,
      message: `
          <p>
            Your HR phone interview has been rescheduled. Please find the
            details of your interview new interview below:
          </p>
          <p>
            <strong>Date</strong>:{" "}
            <span>${moment(tempDate).format("dddd, MMMM Do YYYY")}</span>
          </p>
          <p>
            <strong>Time</strong>:{" "}
            <span>${moment(tempDate).format("h:mm A")}</span>
          </p>
          <p>
            <strong>Meeting Link</strong>
            <a href=${meetingUrl}>Interview Meeting Link</a>
          </p>
          <p>
            If you have any questions or need to make adjustments, please
            contact us at recruitment@staclara.com.ph. We look forward to
            speaking with you.
          </p>
      )`,
      closingPhrase: "Best regards,",
      signature: "Sta. Clara International Corporation Recruitment Team",
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
      if (process.env.NODE_ENV === "production") {
        await fetch("/api/ms-graph/cancel-meeting", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meetingId,
          }),
        });
      }

      await deleteInterviewOnlineMeeting(
        supabaseClient,
        interviewOnlineMeeting.interview_meeting_id
      );
    } catch (error) {
      notifications.show({
        message: "Failed to cancel MS Teams meeting",
        color: "red",
      });
    }
  };

  const handleSendEmailNotification = async ({
    userFullname,
    subject,
    message,
    closingPhrase,
    signature,
  }: {
    userFullname: string;
    subject: string;
    message: string;
    closingPhrase: string;
    signature: string;
  }) => {
    const emailNotificationProps: {
      to: string;
      subject: string;
    } & EmailNotificationTemplateProps = {
      to: user?.user_email as string,
      subject: subject,
      greetingPhrase: `Dear ${userFullname},`,
      message: message,
      closingPhrase,
      signature,
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

  const openCancelInterviewModal = () =>
    modals.openConfirmModal({
      title: "Please confirm your action",
      children: (
        <Text size="sm">
          Are you sure you want to cancel your {meeting_type} interview?
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => cancelInterviewHandler(),
      confirmProps: { color: "dark" },
      centered: true,
    });

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
      <Flex direction="column" gap={10} mb={20}>
        <LoadingOverlay visible={isLoading} />
        {status === "CANCELLED" && (
          <>
            {intialDate && (
              <Stack>
                <Group>
                  <Text>Scheduled Date:</Text>
                  <Text component="a" fw="bold">
                    {" "}
                    {formatDate(new Date(intialDate))}
                  </Text>
                </Group>
                <Group>
                  <Text>Scheduled Time:</Text>
                  <Text component="a" fw="bold">
                    {" "}
                    {moment(new Date(intialDate)).format("hh:mm A")}
                  </Text>
                </Group>
              </Stack>
            )}
          </>
        )}
        {status === "QUALIFIED" && (
          <>
            {intialDate && (
              <Stack>
                <Group>
                  <Text>Scheduled Date:</Text>
                  <Text component="a" fw="bold">
                    {" "}
                    {formatDate(new Date(intialDate))}
                  </Text>
                </Group>
                <Group>
                  <Text>Scheduled Time:</Text>
                  <Text component="a" fw="bold">
                    {" "}
                    {moment(new Date(intialDate)).format("hh:mm A")}
                  </Text>
                </Group>
              </Stack>
            )}
          </>
        )}
        {isReadyToSelect === false &&
          intialDate &&
          status !== "CANCELLED" &&
          status !== "QUALIFIED" && (
            <>
              {(() => {
                return (
                  <>
                    <Stack>
                      <Group>
                        <Text>Scheduled Date:</Text>
                        <Text component="a" fw="bold">
                          {" "}
                          {intialDate ? formatDate(new Date(intialDate)) : ""}
                        </Text>
                      </Group>
                      <Group>
                        <Text>Scheduled Time:</Text>
                        <Text component="a" fw="bold">
                          {" "}
                          {selectedSlot && intialDate
                            ? selectedSlot
                            : intialDate
                            ? formatTimeToLocal(intialDate)
                            : ""}
                        </Text>
                      </Group>
                    </Stack>
                    <Group>
                      <Text>Action: </Text>
                      <Group spacing="xs">
                        <Button
                          onClick={rescheduleHandler}
                          style={{ width: "max-content" }}
                          disabled={
                            isLoading ||
                            isRefetchingData ||
                            isDayBeforeSchedule ||
                            isAfterSchedule ||
                            isToday
                          }
                          color="orange"
                        >
                          Reschedule
                        </Button>
                        <Button
                          onClick={openCancelInterviewModal}
                          style={{ width: "max-content" }}
                          disabled={
                            isLoading || isRefetchingData || cancelRestricted
                          }
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
                  setSelectedDate(null);
                  setIsEdit(true);
                }}
                disabled={!Boolean(!isReadyToSelect)}
              >
                Set Schedule
              </Button>
            </Group>

            {isReschedule && isEdit && (
              <Button
                color="dark"
                onClick={() => {
                  setIsReschedule(false);
                  setIsReadyToSelect(true);
                }}
                disabled={isToday}
              >
                Cancel
              </Button>
            )}
          </Group>
        )}

        {isReadyToSelect && (
          <>
            <Group>
              <Text>Select Date:</Text>
              <DatePickerInput
                value={selectedDate}
                onChange={setSelectedDate}
                minDate={moment(minDate).toDate()}
                maxDate={maxDate}
                clearable
                icon={<IconCalendar size={16} />}
                w={260}
              />
            </Group>

            <Group>
              <Text>Select Time:</Text>
              <Select
                data={removePrevTime()}
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
            {!isReschedule && (
              <Group position="left" align="center" spacing="xs">
                <Text style={{ marginBottom: 0 }}>Action:</Text>
                <Button
                  style={{ width: "min-content" }}
                  color="dark"
                  onClick={() => {
                    setIsReadyToSelect(false);
                  }}
                  disabled={
                    isLoading || isRefetchingData || isDayBeforeSchedule
                  }
                >
                  Cancel
                </Button>
                <Button
                  onClick={setScheduleHandler}
                  disabled={isLoading || isRefetchingData}
                >
                  Submit
                </Button>
              </Group>
            )}
            {isReschedule && (
              <Group position="left" align="center" spacing="xs">
                <Text style={{ marginBottom: 0 }}>Action:</Text>
                <Button
                  style={{ width: "min-content" }}
                  color="dark"
                  onClick={() => {
                    setIsReadyToSelect(false);
                  }}
                  disabled={
                    isLoading || isRefetchingData || isDayBeforeSchedule
                  }
                >
                  Cancel
                </Button>
                <Button
                  onClick={setScheduleHandler}
                  disabled={isLoading || isRefetchingData}
                >
                  Submit
                </Button>
              </Group>
            )}
          </>
        )}

        {/* meeting details */}
        {!isReadyToSelect && interviewOnlineMeeting && status === "PENDING" ? (
          <Flex gap="xs" align="center" mt="sm">
            <Text>Online Meeting:</Text>

            {/* JoyRide for showing the next step after scheduling */}

            {/* Button to join the online meeting */}
            <Button
              className="meeting-link"
              disabled={!moment(initialDate).isSame(moment(minDate), "day")}
              onClick={() =>
                window.open(
                  interviewOnlineMeeting.interview_meeting_url,
                  "_blank" // Opens the meeting URL in a new tab
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
