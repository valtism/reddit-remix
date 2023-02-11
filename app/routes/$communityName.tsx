import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getCommunity } from "~/models/community.server";

export async function loader({ request, params }: LoaderArgs) {
  const communityName = params.communityName;
  invariant(communityName, "communityName not found");
  const community = await getCommunity({ name: communityName });
  if (!community) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ community });
}

export default function CommunityDetailPage() {
  const { community } = useLoaderData<typeof loader>();

  return (
    <div>
      <Link to={`/${community.name}`}>r/{community.name}</Link>
      <Outlet />
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>This community does not exist</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
