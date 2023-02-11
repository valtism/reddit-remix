import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { redirect } from "@remix-run/node";

export async function action({ request, params }: ActionArgs) {
  const postId = params.postId;
  invariant(postId, "postId not found");
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const vote = formData.get("intent");

  if (vote !== "upvote" && vote !== "downvote") {
    throw new Response("Bad Request", { status: 400 });
  }

  const booleanVote = vote === "upvote" ? true : false;

  const existingVote = await prisma.postVote.findUnique({
    where: {
      userId_postId: {
        userId: userId,
        postId: postId,
      },
    },
  });

  if (!existingVote) {
    return await prisma.postVote.create({
      data: {
        vote: booleanVote,
        userId: userId,
        postId: postId,
      },
    });
  }

  if (existingVote.vote === booleanVote) {
    return await prisma.postVote.delete({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });
  }

  return await prisma.postVote.update({
    where: {
      userId_postId: {
        userId: userId,
        postId: postId,
      },
    },
    data: {
      vote: booleanVote,
    },
  });
}

export async function loader({ params }: LoaderArgs) {
  return redirect(`/${params.communityName}/${params.postId}`);
}

export default function PostVote() {
  return null;
}
