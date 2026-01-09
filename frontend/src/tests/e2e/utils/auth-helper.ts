import { Page, request } from '@playwright/test';

export async function loginAndSetStorage(page: Page) {
  const authRequest = await request.newContext();
  const response = await authRequest.post('http://localhost:3001/api/auth/login', {
    data: {
      email: 'admin@corporacao.com',
      password: 'admin123'
    }
  });

  const { token, user } = await response.json();

  await page.goto('/login');
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('@Corporacao:token', token);
    localStorage.setItem('@Corporacao:user', JSON.stringify(user));
  }, { token, user });

  return { token, user };
}

export async function waitForHydration(page: Page) {
  await page.waitForTimeout(1000);
}
