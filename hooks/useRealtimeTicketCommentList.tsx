import {
  getCommentAttachment,
  getTicketMemberUserData,
} from "@/backend/api/get";
import { Database } from "@/utils/database";
import { TicketType } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import useRouteChange from "./useRouteChange";

const useRealtimeTicketCommentList = (
  supabaseClient: SupabaseClient<Database>,
  params: { ticketId: string; initialCommentList: TicketType["ticket_comment"] }
) => {
  const { ticketId, initialCommentList } = params;
  const [commentList, setCommentList] = useState(initialCommentList);

  useRouteChange(() => {
    setCommentList(initialCommentList);
  });

  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime ticket-comment-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ticket_comment_table",
          filter: `ticket_comment_ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          // INSERT comment event
          if (payload.eventType === "INSERT") {
            const teamMemberId = payload.new.ticket_comment_team_member_id;
            const comment = payload.new;

            const isUserExisting = commentList.find(
              (comment) =>
                comment.ticket_comment_team_member_id === teamMemberId
            );

            const commentAttachmentUrlList = await getCommentAttachment(
              supabaseClient,
              { commentId: comment.ticket_comment_id }
            );
            // if user has already commented, re-use user data
            if (isUserExisting) {
              const { ticket_comment_team_member } = isUserExisting;
              const newComment = {
                ...comment,
                ticket_comment_team_member,
                ticket_comment_attachment: commentAttachmentUrlList,
              };
              setCommentList((prev) => [
                newComment as TicketType["ticket_comment"][0],
                ...prev,
              ]);
            } else {
              const ticket_comment_team_member = await getTicketMemberUserData(
                supabaseClient,
                { teamMemberId: comment.ticket_comment_team_member_id }
              );

              if (ticket_comment_team_member) {
                const newComment = {
                  ...comment,
                  ticket_comment_team_member,
                  ticket_comment_attachment: commentAttachmentUrlList,
                };
                setCommentList((prev) => [
                  newComment as TicketType["ticket_comment"][0],
                  ...prev,
                ]);
              }
            }
          }
          // UPDATE comment event
          if (payload.eventType === "UPDATE") {
            // if UPDATE event is user deleting a comment
            if (payload.new.comment_is_disabled) {
              setCommentList((prev) =>
                prev.filter(
                  (comment) =>
                    comment.ticket_comment_id !== payload.new.ticket_comment_id
                )
              );
            } else {
              // if UPDATE is editing comment content
              const updatedCommentList = commentList.map((comment) => {
                if (
                  comment.ticket_comment_id === payload.old.ticket_comment_id
                ) {
                  return {
                    ...comment,
                    ticket_comment_content: payload.new.ticket_comment_content,
                    ticket_comment_is_edited:
                      payload.new.ticket_comment_is_edited,
                  };
                }
                return comment;
              });
              setCommentList(updatedCommentList);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, ticketId, commentList]);

  return commentList;
};

export default useRealtimeTicketCommentList;
