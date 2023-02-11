import type { Community, Post, User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getPost({
  id,
  userId,
}: {
  id: Post["id"];
  userId?: User["id"];
}) {
  return prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      url: true,
      createdAt: true,
      author: true,
      _count: { select: { postVotes: true } },
      comments: {
        select: {
          id: true,
          body: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { id: true, email: true } },
        },
      },
      postVotes: {
        where: { OR: [{ userId }] },
        select: {
          vote: true,
        },
      },
    },
  });
}

export async function getPostList({
  communityName,
}: {
  communityName: Community["name"];
}) {
  return prisma.post.findMany({
    where: { community: { name: communityName } },
    select: {
      id: true,
      title: true,
      url: true,
      description: true,
      createdAt: true,
      author: { select: { email: true } },
    },
  });
  // TODO: pagination
}

export async function createPost({
  title,
  url,
  description,
  authorId,
  communityId,
}: Pick<Post, "title" | "url" | "description" | "communityId" | "authorId"> & {
  authorId: NonNullable<Post["authorId"]>;
}) {
  return prisma.post.create({
    data: {
      title,
      url,
      description,
      author: { connect: { id: authorId } },
      community: { connect: { id: communityId } },
    },
  });
}

export function deletePost({
  id,
  authorId,
}: {
  id: Post["id"];
  authorId: Post["authorId"];
}) {
  return prisma.post.delete({
    where: { id, authorId },
  });
}

export function getPostWithComments(postId: Post["id"]) {
  return prisma.post.findUnique({
    where: { id: postId },
    include: {
      comments: {
        include: {
          author: true,
          children: { select: { id: true } },
        },
      },
    },
  });
}
