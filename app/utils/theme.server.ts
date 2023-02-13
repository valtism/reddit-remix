import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";
import type { Theme } from "~/utils/ThemeProvider";
import { isTheme } from "~/utils/ThemeProvider";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");
const sessionSecret = process.env.SESSION_SECRET;

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "veddit-theme",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

export async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: () => {
      const themeValue = session.get("theme");
      return isTheme(themeValue) ? themeValue : null;
    },
    setTheme: (theme: Theme) => session.set("theme", theme),
    commit: () => themeStorage.commitSession(session),
  };
}
