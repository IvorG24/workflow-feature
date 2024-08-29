import { getMeetingSlots } from "@/backend/api/get";
import { updatePhoneInterview } from "@/backend/api/update";
import { formatDate } from "@/utils/constant";
import { Button, Flex, Modal, NativeSelect, Text } from "@mantine/core";
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from 'react';

type SchedulingType = {
    meeting_type: 'technical' | 'qualifying' | 'phone';
    target_id: string
    intialDate: string | null
    refetchData: () => Promise<void>
    status: string
    isRefetchingData: boolean
}


type HrSlotType = {
    slot_start: string,
    slot_end: string
}

const SchedulingCalendar = ({ meeting_type, target_id, intialDate, refetchData, status, isRefetchingData }: SchedulingType) => {
    const supabaseClient = useSupabaseClient();
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [hrSlot, setHrSlot] = useState<HrSlotType[]>([])
    const [isLoading, setIsloading] = useState(false)
    const [isEdit, setIsEdit] = useState<boolean | null>(null)
    const [opened, { open, close }] = useDisclosure(false);

    const today = new Date();
    const minDate = today;
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);

    const formatTimeToLocal = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const cancelInterviewHandler = async () => {
        try {
            const params = {
                target_id,
                status: 'BACKOUT',
            };

            if (meeting_type === 'phone') {
                await updatePhoneInterview(supabaseClient, params);
            }
            refetchData()
            close()
            notifications.show({
                message: 'Interview cancellation successful!',
                color: 'green'
            });
        } catch (error) {
            notifications.show({
                message: 'Error cancelling interview:',
                color: 'orange'
            });
        }
    }

    const rescheduleHandler = () => {
        refetchData()
        setIsEdit(true)
    }

    const setScheduleHandler = async () => {

        if (!selectedSlot || !selectedDate) {
            notifications.show({
                message: 'No slot selected or meeting info available.',
                color: 'orange'
            })
            return;
        }

        if (selectedSlot === 'select time') return

        setIsloading(true);

        try {
            const [time] = selectedSlot.split(' ');
            const [hours, minutes] = time.split(':').map(Number);

            const tempDate = new Date(selectedDate);
            tempDate.setHours(hours, minutes, 0, 0);

            setSelectedDate(tempDate);

            const nowUtc = new Date().toISOString();

            const params = {
                interview_schedule: tempDate.toISOString(),
                interview_status_date_updated: nowUtc,
                target_id,
                status: 'PENDING'
            };

            if (meeting_type === 'phone') {
                await updatePhoneInterview(supabaseClient, params);
            }

            refetchData()

            notifications.show({
                message: ' HR phone interview scheduled successfully',
                color: 'green'
            })

        } catch (error) {
            notifications.show({
                message: 'Error updating interview:',
                color: 'orange'
            })
        } finally {
            setIsloading(false);
            setIsEdit(false)
        }

    }

    const fetchTime = async ({ slotDuration, breakDuration }: { slotDuration: number, breakDuration: number }) => {
        if (selectedDate !== null) {
            const start = new Date(selectedDate);
            start.setHours(8, 0, 0, 0); // Set to 8 AM

            const end = new Date(selectedDate);
            end.setHours(17, 0, 0, 0); // Set to 5 PM

            const params = {
                start: start.toISOString(),
                end: end.toISOString(),
                slotDuration: slotDuration * 60 * 1000,
                breakDuration: breakDuration * 60 * 1000
            }

            try {
                setIsloading(true)
                const data = await getMeetingSlots(supabaseClient, params);
                setHrSlot(data)
                setSelectedSlot(data.map(slot => `${formatTimeToLocal(slot.slot_start)}`)[0])
            } catch (error) {
                notifications.show({
                    message: 'Error fetching meeting slots',
                    color: 'orange'
                })
            } finally {
                setIsloading(false)
            }
        }
    }


    useEffect(() => {
        if (meeting_type === 'technical') {
            fetchTime({ breakDuration: 10, slotDuration: 15 })
        }
        if (meeting_type === 'qualifying') {
            fetchTime({ breakDuration: 10, slotDuration: 15 })
        }
        if (meeting_type === 'phone') {
            fetchTime({ breakDuration: 10, slotDuration: 5 })
        }
        if (intialDate !== null) {
            const initialDate = new Date(intialDate);
            setSelectedDate(initialDate);
            setIsEdit(false);
        } else {
            setIsEdit(true)
        }
    }, []);

    useEffect(() => {
        if (meeting_type === 'technical') {
            fetchTime({ breakDuration: 10, slotDuration: 15 })
        }
        if (meeting_type === 'qualifying') {
            fetchTime({ breakDuration: 10, slotDuration: 15 })
        }
        if (meeting_type === 'phone') {
            fetchTime({ breakDuration: 10, slotDuration: 5 })
        }
    }, [selectedDate])

    return (
        <>
            <Modal opened={opened} onClose={close} centered title='Confirm Cancellation'>
                <Flex direction='column'>
                    <Text mb={15} align="center">Are you sure you want to cancel your {meeting_type} interview?</Text>
                </Flex>
                <Flex justify='space-between'>
                    <Button onClick={cancelInterviewHandler} mb={5} color="red">Yes</Button>
                    <Button color="gray" onClick={close}>No</Button>
                </Flex>
            </Modal>
            <Flex direction='column' gap={10} mb={20}>
                {status === 'BACKOUT' &&
                    <div>
                        <Text mb={10} color="red">You cancelled your interview</Text>
                    </div>
                }

                {isEdit === false && selectedDate &&
                    <div>
                        {(() => {
                            const hours = selectedDate.getHours();
                            const minutes = selectedDate.getMinutes();
                            const period = hours >= 12 ? 'PM' : 'AM';
                            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
                            return (
                                <div>
                                    <Text mb={10}>Your Interview will be on:
                                        <Text component="a" fw='bold'> {formatDate(selectedDate)} at {timeString}</Text>
                                    </Text>
                                    <Flex gap={10} direction='column'>
                                        <Button onClick={rescheduleHandler} style={{ width: 'max-content' }} disabled={isLoading || isRefetchingData} color="orange">Reschedule</Button>
                                        <Button onClick={open} style={{ width: 'max-content' }} disabled={isLoading || isRefetchingData} color="dark">Cancel</Button>
                                    </Flex>
                                </div>
                            );
                        })()}
                    </div>
                }

                {isEdit &&
                    <div>
                        <DatePickerInput
                            label="Select Date"
                            maw='max-content'
                            value={selectedDate}
                            onChange={setSelectedDate}
                            minDate={minDate}
                            maxDate={maxDate}
                            mb={10}
                        />

                        {hrSlot &&
                            <NativeSelect
                                data={hrSlot.map(slot => `${formatTimeToLocal(slot.slot_start)}`)}
                                label="Select Time"
                                maw='max-content'
                                value={selectedSlot}
                                onChange={(event) => setSelectedSlot(event.currentTarget.value)}
                                mb={10}
                                disabled={isLoading || isRefetchingData}
                            />
                        }

                        {selectedSlot &&
                            <Button onClick={setScheduleHandler} disabled={isLoading || isRefetchingData}>
                                <Text fz='md' fw='bold' >Set Schedule</Text>
                            </Button>
                        }


                    </div>
                }

            </Flex>
        </>
    );
}

export default SchedulingCalendar;
