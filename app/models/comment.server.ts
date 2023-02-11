import type { Comment, Post, User } from "@prisma/client";
import { prisma } from "~/db.server";

export function createComment(
  body: Comment["body"],
  postId: Post["id"],
  authorId: User["id"],
  parentId?: Comment["parentId"]
) {
  return prisma.comment.create({
    data: {
      body,
      postId,
      authorId,
      parentId,
    },
  });
}
