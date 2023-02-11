import { redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const commentId = params.commentId;
  const userId = await requireUserId(request);

  try {
    return await prisma.comment.delete({
      where: {
        id: commentId,
        authorId: userId,
      },
    });
  } catch (error) {
    return null;
  }
}

export async function loader({ request, params }: LoaderArgs) {
  const { communityName, postId } = params;
  return redirect(`/${communityName}/${postId}`);
}

export default function DeleteComment() {
  return null;
}
