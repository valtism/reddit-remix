import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
  // TODO: Disallow this route if user is not logged in
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const name = formData.get("name");
  const description = formData.get("description");

  // TODO: Replace with Zod
  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { name: "Name is required", description: null } },
      { status: 400 }
    );
  }
  if (typeof description !== "string") {
    return json(
      { errors: { name: null, description: "Description must be a string" } },
      { status: 400 }
    );
  }

  // TODO: Add user as admin role
  const community = await prisma.community.create({
    data: { name, description },
  });

  return redirect(`/${community.name}`);
}

export default function NewCommunity() {
  return (
    <Form method="post">
      <label htmlFor="name">Name</label>
      <input name="name" />
      <label htmlFor="description">Description</label>
      <input name="description" />
      <button type="submit">Create</button>
    </Form>
  );
}
