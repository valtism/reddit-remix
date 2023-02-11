import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { getCommunity } from "~/models/community.server";
import { createPost } from "~/models/post.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);

  const communityName = params.communityName;
  invariant(communityName, "communityName not found");
  const community = await getCommunity({ name: communityName });
  if (!community) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const url = formData.get("url");
  const description = formData.get("description");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { title: "Title is required", url: null, description: null } },
      { status: 400 }
    );
  }

  if (typeof url !== "string" || url.length === 0) {
    return json(
      { errors: { title: null, url: "Url is required", description: null } },
      { status: 400 }
    );
  }

  if (typeof description !== "string" || description.length === 0) {
    return json(
      {
        errors: {
          title: null,
          url: null,
          description: "Description is required",
        },
      },
      { status: 400 }
    );
  }

  const post = await createPost({
    title,
    url,
    description,
    authorId: userId,
    communityId: community.id,
  });

  return redirect(`/${community.name}/${post.id}`);
}

export default function NewPost() {
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.url) {
      urlRef.current?.focus();
    } else if (actionData?.errors?.description) {
      descriptionRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form method="post">
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Title: </span>
          <input
            ref={titleRef}
            name="title"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.title && (
          <div className="text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>URL: </span>
          <input
            ref={urlRef}
            name="url"
            aria-invalid={actionData?.errors?.url ? true : undefined}
            aria-errormessage={
              actionData?.errors?.url ? "url-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.url && (
          <div className="text-red-700" id="url-error">
            {actionData.errors.url}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Description: </span>
          <textarea
            ref={descriptionRef}
            name="description"
            rows={8}
            aria-invalid={actionData?.errors?.description ? true : undefined}
            aria-errormessage={
              actionData?.errors?.description ? "description-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.description && (
          <div className="text-red-700" id="description-error">
            {actionData.errors.description}
          </div>
        )}
      </div>

      <div className="text-right">
        <button type="submit">Submit</button>
      </div>
    </Form>
  );
}
