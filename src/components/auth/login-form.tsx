import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/lib/redux/api";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCredentials } from "@/lib/redux/authSlice";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      setErrorMessage(null);
      const response = await login(data).unwrap();

      dispatch(
        setCredentials({
          accessToken: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
          clientToken: response.tokens.clientToken,
          user: response.user,
          view: response.view,
          accesses: response.accesses,
        })
      );

      window.location.reload();
    } catch (error: any) {
      const errorData = error?.data || {};
      const errorCode = errorData?.code || "";
      const errorMsg = errorData?.message || "";

      const formattedErrorMsg = errorMsg.includes("::")
        ? errorMsg.split("::")[1].trim()
        : errorMsg;

      setErrorMessage(formattedErrorMsg || "Login failed");

      if (errorCode === "AUTH_EMAIL_NOTFOUND") {
        form.setError("email", {
          message:
            formattedErrorMsg ||
            "Email not found. Please check your email address.",
        });
      }

      if (errorCode === "AUTH_INVALID_PASSWORD") {
        form.setError("password", {
          message: formattedErrorMsg || "Invalid password. Please try again.",
        });
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 mt-20", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back!</CardTitle>
          <CardDescription>Log in to continue with Opensend </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="email@example.com"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive font-medium" />
                  </FormItem>
                )}
              />

              {errorMessage &&
                !form.formState.errors.email &&
                !form.formState.errors.password && (
                  <div className="text-sm text-destructive">{errorMessage}</div>
                )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
