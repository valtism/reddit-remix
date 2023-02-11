import type { User, Comment } from "@prisma/client";
import { Form } from "@remix-run/react";
import type { SerializeFrom } from "@remix-run/server-runtime";
import { useState } from "react";

type CommentWithRelations = Comment & {
  author: User;
  children: { id: string }[];
};

interface CommentTreeProps {
  comment?: SerializeFrom<CommentWithRelations>;
  allComments: SerializeFrom<CommentWithRelations>[];
}

export function CommentTree({ comment, allComments }: CommentTreeProps) {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  if (!comment) return null;

  return (
    <div className="border border-gray-300 ml-2 first:ml-0">
      <div>{comment.author.username}</div>
      <p>{comment.body}</p>
      <Form action={`${comment.id}/delete`} method="post" replace>
        <button type="submit" className="hover:underline">
          Delete Comment
        </button>
      </Form>
      <button
        onClick={() => setIsReplyOpen((prev) => !prev)}
        className="hover:underline"
      >
        {isReplyOpen ? "Cancel" : "Reply"}
      </button>
      {!!isReplyOpen && (
        <Form action={`${comment.id}/reply`} method="post" replace>
          <textarea name="reply" />
          <button type="submit">Reply</button>
        </Form>
      )}
      {!!comment.children.length &&
        comment.children.map((child) => (
          <CommentTree
            key={child.id}
            comment={allComments.find((comment) => comment.id === child.id)}
            allComments={allComments}
          />
        ))}
    </div>
  );
}
