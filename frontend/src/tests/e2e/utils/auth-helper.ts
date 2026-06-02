import { Page, request } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@corporacao.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
let cachedAuth: { token: string; user: any } | null = null;

export async function loginAndSetStorage(page: Page) {
  if (!cachedAuth) {
    const authRequest = await request.newContext();

    let token: string | undefined;
    let user: any;
    let lastError = "";

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = await authRequest.post(
        "http://localhost:3001/api/auth/login",
        {
          data: {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
          },
        },
      );

      let payload: any = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (response.ok() && payload?.token && payload?.user) {
        token = payload.token;
        user = payload.user;
        break;
      }

      lastError = `status=${response.status()} body=${JSON.stringify(payload)}`;
      await page.waitForTimeout(500);
    }

    if (!token || !user) {
      throw new Error(`Falha no login E2E: ${lastError}`);
    }

    cachedAuth = { token, user };
  }

  await page.goto("/login");
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem("@Corporacao:token", token);
      localStorage.setItem("@Corporacao:user", JSON.stringify(user));
    },
    { token: cachedAuth.token, user: cachedAuth.user },
  );

  return cachedAuth;
}

export async function waitForHydration(page: Page) {
  await page.waitForTimeout(1000);
}
