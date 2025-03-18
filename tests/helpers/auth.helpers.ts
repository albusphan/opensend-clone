import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Safely clears storage (localStorage, sessionStorage, cookies)
 */
export async function clearStorage(page: Page) {
  try {
    // Navigate to the base URL first
    await page.goto("/");

    // Clear localStorage
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        return true;
      } catch (e) {
        return false;
      }
    });

    // Clear cookies
    await page.context().clearCookies();
  } catch (error) {
    console.error("Failed to clear storage:", error);
  }
}

/**
 * Logs in a user with the given credentials
 */
export async function login(page: Page, email: string, password: string) {
  // Navigate to login page
  await page.goto("/login");

  // Wait for the login form to be visible
  await page.waitForSelector("form");

  // Fill login credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit login form
  await page.click('button[type="submit"]');
}

/**
 * Verifies that the user is redirected to the expected page after login
 */
export async function expectRedirectionToPage(
  page: Page,
  expectedPath: string
) {
  // Wait for navigation/redirection to complete
  await page.waitForURL(`**${expectedPath}*`);

  // Verify URL
  const url = new URL(page.url());
  expect(url.pathname).toContain(expectedPath);
}

/**
 * Checks if a specific element related to user type is visible
 */
export async function verifyUserTypeSpecificElement(
  page: Page,
  userType: string
) {
  switch (userType) {
    case "ADMIN":
      // Admin should have dashboard and admin links
      await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
      break;
    case "CLIENT":
      // Regular members should not have admin link
      await expect(page.getByRole("link", { name: "Admin" })).not.toBeVisible();
      break;
  }

  // Verify logout button is present for all logged in users
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
}
