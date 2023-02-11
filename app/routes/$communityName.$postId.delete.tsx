import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { deletePost } from "~/models/post.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const postId = params.postId;
  invariant(postId, "postId not found");
  const userId = await requireUserId(request);
  return deletePost({ id: postId, authorId: userId });
}

export async function loader({ request, params }: LoaderArgs) {
  const communityName = params.communityName;
  return redirect(`/${communityName}`);
}

export default function PostDeletePage() {
  return null;
}
