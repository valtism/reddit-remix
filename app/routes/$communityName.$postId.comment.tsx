import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { prisma } from "~/db.server";
import { getUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const postId = params.postId;
  invariant(postId, "postId not found");
  const userId = await getUserId(request);
  const formData = await request.formData();
  const content = formData.get("content");

  const schema = z.string().min(1).max(50_000);
  try {
    const validContent = schema.parse(content);
    const comment = await prisma.comment.create({
      data: {
        body: validContent,
        postId: postId,
        authorId: userId,
      },
    });
    return json(
      {
        comment: comment,
        errors: { content: null },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      // Parse error
      return json(
        {
          comment: null,
          errors: { content: fromZodError(error).message },
        },
        { status: 400 }
      );
    }
    // Generic error
    return json(
      {
        comment: null,
        errors: { content: "Something went wrong" },
      },
      { status: 400 }
    );
  }
}

export async function loader({ params }: LoaderArgs) {
  return redirect("..");
}

export default function CreateComment() {
  return null;
}
