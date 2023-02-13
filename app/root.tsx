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
  useLoaderData,
} from "@remix-run/react";
import clsx from "clsx";
import { getThemeSession } from "~/utils/theme.server";
import {
  NonFlashOfWrongThemeEls,
  ThemeProvider,
  useTheme,
} from "~/utils/ThemeProvider";

import { getUser } from "./session.server";
import tailwindStylesheetUrl from "./styles/tailwind.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Veddit",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  const themeSession = await getThemeSession(request);

  return json({
    user: await getUser(request),
    sessionTheme: themeSession.getTheme(),
  });
}

function App() {
  const { user, sessionTheme } = useLoaderData<typeof loader>();
  const [theme, setTheme] = useTheme();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(sessionTheme)} />
      </head>
      <body className="h-full text-gray-900 dark:bg-gray-900">
        <header className="flex items-center justify-between bg-gray-300 px-4 py-2">
          <Link to="/">
            <h1 className="text-2xl font-extrabold tracking-widest">Veddit</h1>
          </Link>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            Toggle Theme
          </button>
          {user ? (
            <div className="flex gap-2">
              <div>{user.username}</div>
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

export default function AppWithProviders() {
  const { sessionTheme } = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={sessionTheme}>
      <App />
    </ThemeProvider>
  );
}
