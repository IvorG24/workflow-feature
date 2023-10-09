import { getCommentAttachment, getMemberUserData } from "@/backend/api/get";
import { Database } from "@/utils/database";
import { RequestCommentType } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import useRouteChange from "./useRouteChange";

const useRealtimeRequestCommentList = (
  supabaseClient: SupabaseClient<Database>,
  params: { requestId: string; initialCommentList: RequestCommentType[] }
) => {
  const { requestId, initialCommentList } = params;
  const [commentList, setCommentList] = useState(initialCommentList);

  useRouteChange(() => {
    setCommentList(initialCommentList);
  });

  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime request-comment-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comment_table",
          filter: `comment_request_id=eq.${requestId}`,
        },
        async (payload) => {
          // INSERT comment event
          if (payload.eventType === "INSERT") {
            const teamMemberId = payload.new.comment_team_member_id;
            const comment = payload.new;

            const isUserExisting = commentList.find(
              (comment) => comment.comment_team_member_id === teamMemberId
            );

            const commentAttachmentUrlList = await getCommentAttachment(
              supabaseClient,
              { commentId: comment.comment_id }
            );
            // if user has already commented, re-use user data
            if (isUserExisting) {
              const { comment_team_member } = isUserExisting;
              const newComment = {
                ...comment,
                comment_team_member,
                comment_attachment: commentAttachmentUrlList,
              };
              setCommentList((prev) => [
                newComment as RequestCommentType,
                ...prev,
              ]);
            } else {
              const comment_team_member = await getMemberUserData(
                supabaseClient,
                { teamMemberId: comment.comment_team_member_id }
              );

              if (comment_team_member) {
                const newComment = {
                  ...comment,
                  comment_team_member,
                  comment_attachment: commentAttachmentUrlList,
                };
                setCommentList((prev) => [
                  newComment as RequestCommentType,
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
                  (comment) => comment.comment_id !== payload.new.comment_id
                )
              );
            } else {
              // if UPDATE is editing comment content
              const updatedCommentList = commentList.map((comment) => {
                if (comment.comment_id === payload.old.comment_id) {
                  return {
                    ...comment,
                    comment_content: payload.new.comment_content,
                    comment_is_edited: payload.new.comment_is_edited,
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
  }, [supabaseClient, requestId, commentList]);

  return commentList;
};

export default useRealtimeRequestCommentList;
