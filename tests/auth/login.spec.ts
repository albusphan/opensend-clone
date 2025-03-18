import { test, expect } from "@playwright/test";
import { users } from "../fixtures/users";
import {
  login,
  expectRedirectionToPage,
  verifyUserTypeSpecificElement,
  clearStorage,
} from "../helpers/auth.helpers";

test.describe("Login functionality", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test("Admin user login and redirection", async ({ page }) => {
    // Login with admin credentials
    await login(page, users.admin.email, users.admin.password);

    // Verify redirection to admin page
    await expectRedirectionToPage(page, users.admin.expectedRedirect);

    // Verify admin-specific UI elements
    await verifyUserTypeSpecificElement(page, users.admin.type);
  });

  test("Member user login and redirection", async ({ page }) => {
    // Login with member credentials
    await login(page, users.member.email, users.member.password);

    // Verify redirection to dashboard
    await expectRedirectionToPage(page, users.member.expectedRedirect);

    // Verify member-specific UI elements
    await verifyUserTypeSpecificElement(page, users.member.type);

    // Further verification specific to member dashboard if needed
    // For example, check that widgets are visible but not editable
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
    expect(
      page.getByText("here are no widgets configured for your dashboard yet.")
    ).toBeVisible();
  });

  test("Onboarding user login and redirection", async ({ page }) => {
    // Login with onboarding credentials
    await login(page, users.onboarding.email, users.onboarding.password);

    // Verify redirection to onboarding page
    await expectRedirectionToPage(page, users.onboarding.expectedRedirect);

    // Verify onboarding-specific UI elements
    await verifyUserTypeSpecificElement(page, users.onboarding.type);

    // Additional onboarding-specific checks if needed
    // For example, check if onboarding steps are visible
    await expect(page.locator("text=Complete Your Onboarding")).toBeVisible();
  });

  test("Invalid login attempt", async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // Try logging in with invalid credentials
    await page.fill('input[type="email"]', "invalid@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(
      page.locator("text=User with email invalid@example.com doesn't exist")
    ).toBeVisible();

    // Verify we're still on the login page
    const url = new URL(page.url());
    expect(url.pathname).toContain("/login");
  });
});
