import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { getPost } from "~/models/post.server";
import type { action as createCommentAction } from "~/routes/$communityName.$postId.comment";
import { getUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const communityName = params.communityName;
  const postId = params.postId;
  invariant(communityName, "communityName not found");
  invariant(postId, "postId not found");
  const userId = await getUserId(request);
  const post = await getPost({
    id: postId,
    userId: userId,
  });
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ post });
}

export default function PostPage() {
  const actionData = useActionData<typeof createCommentAction>();
  const transition = useTransition();
  const isAdding = !!transition.submission;

  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  return (
    <div>
      <Post />
      <Form ref={formRef} action="comment" method="post" replace>
        <textarea
          name="content"
          placeholder="Enter comment here"
          className={clsx(
            actionData?.errors?.content && "border border-red-600"
          )}
        />
        {actionData?.errors?.content && (
          <div className="text-red-600">{actionData.errors.content}</div>
        )}
        <button type="submit" name="intent" value="comment">
          {isAdding ? "Submitting" : "Submit"}
        </button>
      </Form>
      <Outlet />
    </div>
  );
}

function Post() {
  const { post } = useLoaderData<typeof loader>();

  const userVote = post.postVotes?.[0];
  const hasUpvoted = userVote?.vote === true;
  const hasDownvoted = userVote?.vote === false;

  return (
    <div className="my-4">
      <Form action="vote" method="post" replace>
        <button
          type="submit"
          name="intent"
          value="upvote"
          className={clsx(hasUpvoted && "font-medium")}
        >
          Upvote
        </button>
        <button
          type="submit"
          name="intent"
          value="downvote"
          className={clsx(hasDownvoted && "font-medium")}
        >
          Downvote
        </button>
      </Form>
      <div>
        {post._count.postVotes} {post._count.postVotes === 1 ? "vote" : "votes"}
      </div>
      <div>
        {post.url ? (
          <a href={post.url} target="_blank" rel="noreferrer">
            {post.title}
          </a>
        ) : (
          <Link to={`post/${post.id}`}>{post.title}</Link>
        )}
      </div>
      <div>
        {formatDistanceToNow(new Date(post.createdAt))} ago by{" "}
        {post.author?.email}
      </div>
      <Form method="post" action="delete">
        <button type="submit">Delete Post</button>
      </Form>
    </div>
  );
}
