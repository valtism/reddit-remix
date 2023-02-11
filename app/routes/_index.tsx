import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { prisma } from "~/db.server";

export async function loader({ request, params }: LoaderArgs) {
  return prisma.community.findMany();
}

export default function Index() {
  const communities = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto mt-6 max-w-4xl">
      <h2 className="font-bold">Communities:</h2>
      <Link to="/new">Create a new community</Link>
      <div className="flex flex-col gap-2 mt-4">
        {communities.map((community) => (
          <Link to={`/${community.name}`} key={community.id}>
            {community.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
