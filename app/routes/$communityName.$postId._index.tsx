import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { CommentTree } from "~/components/CommentTree";
import { getPostWithComments } from "~/models/post.server";

export async function loader({ request, params }: LoaderArgs) {
  const communityName = params.communityName;
  invariant(communityName, "communityName not found");
  const postId = params.postId;
  invariant(postId, "postId not found");
  const post = await getPostWithComments(postId);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ post });
}

export default function PostPage() {
  const { post } = useLoaderData<typeof loader>();

  if (!post.comments.length) return null;

  return (
    <div>
      {post.comments
        .filter((comment) => comment.parentId === null)
        .map((comment) => (
          <CommentTree
            key={comment.id}
            comment={comment}
            allComments={post.comments}
          />
        ))}
    </div>
  );
}
