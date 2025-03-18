export const users = {
  admin: {
    email: "test+admin@yopmail.com",
    password: "12345678",
    expectedRedirect: "/admin",
    type: "ADMIN",
  },
  member: {
    email: "test+member@yopmail.com",
    password: "12345678",
    expectedRedirect: "/dashboard",
    type: "CLIENT",
  },
  onboarding: {
    email: "test+onboarding@yopmail.com",
    password: "12345678",
    expectedRedirect: "/onboarding",
    type: "CLIENT",
  },
};
