import { createFileRoute, redirect } from "@tanstack/react-router";
import { store } from "@/lib/redux/store";
import { api } from "@/lib/redux/api";
import { setStoreInfo, setUserData } from "@/lib/redux/authSlice";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const state = store.getState();
    const { isAuthenticated, isInitialized, accessToken } = state.auth;

    if (!accessToken) {
      throw redirect({
        to: "/login",
      });
    }

    if (!isInitialized) {
      try {
        const profile = await store
          .dispatch(
            api.endpoints.getUserProfile.initiate(undefined, {
              forceRefetch: true,
            })
          )
          .unwrap();

        store.dispatch(
          setUserData({
            user: profile.user,
            view: profile.view,
            accesses: profile.accesses,
          })
        );

        const userType = profile.view?.type;

        if (userType === "ADMIN") {
          throw redirect({
            to: "/admin",
          });
        } else if (
          userType === "CLIENT" &&
          profile.accesses &&
          profile.accesses.length > 0
        ) {
          const storeId = String(profile.accesses[0].store_id);

          try {
            const storeInfo = await store
              .dispatch(
                api.endpoints.getStoreInfo.initiate(storeId, {
                  forceRefetch: true,
                })
              )
              .unwrap();

            store.dispatch(setStoreInfo(storeInfo));

            const onboardingDone =
              storeInfo.store.onboarding_procedure.onboarding_status === "DONE";

            if (onboardingDone) {
              throw redirect({
                to: "/dashboard",
              });
            } else {
              throw redirect({
                to: "/onboarding",
                search: {
                  storeId: storeId,
                },
              });
            }
          } catch (error) {
            throw redirect({
              to: "/login",
            });
          }
        } else {
          throw redirect({
            to: "/login",
          });
        }
      } catch (error) {
        throw redirect({
          to: "/login",
        });
      }
    } else {
      const { view, storeInfo } = state.auth;
      const userType = view?.type;

      if (userType === "ADMIN") {
        throw redirect({
          to: "/admin",
        });
      } else if (userType === "CLIENT") {
        if (!storeInfo) {
          throw redirect({
            to: "/login",
          });
        }

        const onboardingDone =
          storeInfo.store.onboarding_procedure.onboarding_status === "DONE";

        if (onboardingDone) {
          throw redirect({
            to: "/dashboard",
          });
        } else {
          throw redirect({
            to: "/onboarding",
            search: {
              storeId: String(storeInfo.store.id),
            },
          });
        }
      } else {
        throw redirect({
          to: "/login",
        });
      }
    }
  },
  component: RootPage,
});

function RootPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
    </div>
  );
}
