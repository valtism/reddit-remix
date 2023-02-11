import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useOptionalUser } from "~/utils";

import { getUser } from "./session.server";
import tailwindStylesheetUrl from "./styles/tailwind.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Notes",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  const user = useOptionalUser();

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full text-gray-900">
        <header className="flex items-center justify-between bg-gray-300 px-10 py-2">
          <Link to="/">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Reddit thing
            </h1>
          </Link>
          {user ? (
            <div>
              <div>Signed in as {user.username}</div>
              <Form action="/logout" method="post">
                <button type="submit">Logout</button>
              </Form>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/join"
                className="rounded bg-gray-500 px-2 py-1 text-white"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="rounded bg-gray-500 px-2 py-1 text-white"
              >
                Log In
              </Link>
            </div>
          )}
        </header>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
