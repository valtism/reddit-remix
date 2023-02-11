import type { Comment, User } from "@prisma/client";
import { Form, useLoaderData } from "@remix-run/react";
import type { LoaderArgs, SerializeFrom } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { getPostWithComments } from "~/models/post.server";

export async function loader({ request, params }: LoaderArgs) {
  const postId = params.postId;
  const commentId = params.commentId;
  invariant(postId, "postId not found");
  const postWithComments = await getPostWithComments(postId);
  if (!postWithComments) {
    throw new Response("Not Found", { status: 404 });
  }

  const postCommentsById = postWithComments.comments.reduce((obj, comment) => {
    obj[comment.id] = comment;
    return obj;
  }, {} as Record<string, typeof postWithComments["comments"][number]>);

  const rootComment = postWithComments.comments.find(
    (comment) => comment.id === commentId
  );

  if (!rootComment) {
    throw new Response("Not Found", { status: 404 });
  }

  function buildCommentTree(
    comment: typeof postCommentsById[string]
  ): CommentTree {
    return {
      ...comment,
      children: comment.children.map((child) =>
        buildCommentTree(postCommentsById[child.id])
      ),
    };
  }

  const commentTree = buildCommentTree(rootComment);

  return json({ commentTree });
}

type CommentTree = Comment & {
  author: User;
  children: CommentTree[];
};

export default function RootComment() {
  const { commentTree } = useLoaderData<typeof loader>();

  return <CommentTreeComponent commentTree={commentTree} />;
}

function CommentTreeComponent({
  commentTree,
}: {
  commentTree: SerializeFrom<CommentTree>;
}) {
  return (
    <div className="border border-gray-300">
      <h1>{commentTree.author.username}</h1>
      <p>{commentTree.body}</p>
      <Form action="delete" method="post" replace>
        <button type="submit">Delete Comment</button>
      </Form>
      {!!commentTree.children.length &&
        commentTree.children.map((child) => (
          <CommentTreeComponent key={child.id} commentTree={child} />
        ))}
    </div>
  );
}
