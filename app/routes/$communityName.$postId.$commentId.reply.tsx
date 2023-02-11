import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { createComment } from "~/models/comment.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const parentId = params.commentId;
  const postId = params.postId;
  invariant(parentId, "Comment ID is required");
  invariant(postId, "Post ID is required");
  const userId = await requireUserId(request);

  try {
    return await createComment("", postId, userId, parentId);
  } catch (error) {
    return null;
  }
}

export async function loader({ request, params }: LoaderArgs) {
  const { communityName, postId } = params;
  return redirect(`/${communityName}/${postId}`);
}

export default function Reply() {
  return null;
}
