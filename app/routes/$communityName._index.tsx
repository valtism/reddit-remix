import { Form, Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { formatDistanceToNow } from "date-fns";
import invariant from "tiny-invariant";
import { getPostList } from "~/models/post.server";

export async function loader({ request, params }: LoaderArgs) {
  const communityName = params.communityName;
  invariant(communityName, "communityName not found");
  const postList = await getPostList({ communityName: communityName });

  return json({ postList });
}

export default function CommunityIndexPage() {
  const { postList } = useLoaderData<typeof loader>();

  return (
    <div>
      <Link to="new">Create New Post</Link>

      {postList.map((post) => (
        <div key={post.id} className="mt-4">
          <div>
            {post.url ? (
              <a href={post.url} target="_blank" rel="noreferrer">
                {post.title}
              </a>
            ) : (
              <Link to={`${post.id}`}>{post.title}</Link>
            )}
          </div>
          <div>
            {formatDistanceToNow(new Date(post.createdAt))} ago by{" "}
            {post.author.email}
          </div>
          <Link to={`${post.id}`}>Comments</Link>
          <Form method="post" action={`${post.id}/delete`}>
            <button type="submit" name="intent" value="delete">
              Delete
            </button>
          </Form>
        </div>
      ))}
    </div>
  );
}
