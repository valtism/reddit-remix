import type { User, Community } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Community } from "@prisma/client";

export function getCommunity({ name }: Pick<Community, "name">) {
  return prisma.community.findFirst({
    where: { name },
    include: { posts: true },
  });
}

export function createCommunity({
  name,
  description,
  userId,
}: Pick<Community, "name" | "description"> & {
  userId: User["id"];
}) {
  return prisma.community.create({
    data: {
      name,
      description,
    },
  });
}

export function deletCommunity({
  id,
  userId,
}: Pick<Community, "id"> & { userId: User["id"] }) {
  return prisma.community.deleteMany({
    where: { id },
  });
}
