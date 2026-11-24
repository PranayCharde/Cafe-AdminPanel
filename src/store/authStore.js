import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../lib/api";

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      sessionNotice: null,

      setSessionNotice: (msg) => set({ sessionNotice: msg }),
      clearSessionNotice: () => set({ sessionNotice: null }),

      login: (token, user) => {
        // Enforce strict administrator role
        if (!user || user.role !== "admin") {
          throw new Error("Access restricted: Only authorized staff and administrator accounts can access this console.");
        }

        localStorage.setItem("cafe_admin_token", token);
        set({
          token,
          user,
          isAuthenticated: true,
          loading: false,
          sessionNotice: null,
        });
      },

      logout: (notice = null) => {
        localStorage.removeItem("cafe_admin_token");
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          loading: false,
          sessionNotice: notice,
        });
      },

      checkAuth: async () => {
        const token = localStorage.getItem("cafe_admin_token");
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null, loading: false });
          return;
        }

        try {
          const res = await authApi.getMe();
          const user = res.data?.user;

          // Strict verification: user must exist and have role === 'admin'
          if (user && user.role === "admin") {
            set({
              user,
              token,
              isAuthenticated: true,
              loading: false,
            });
          } else {
            console.warn("User does not have admin permissions. Logging out.");
            get().logout("Access restricted: Administrator credentials required.");
          }
        } catch (err) {
          console.warn("Admin session verification failed:", err);
          get().logout("Session expired or invalid. Please sign in again.");
        }
      },
    }),
    {
      name: "cafe_admin_session",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Listen for global session expiry events dispatched by API client
if (typeof window !== "undefined") {
  window.addEventListener("admin_session_expired", (event) => {
    const notice = event?.detail?.message || "Your session has expired. Please sign in again.";
    useAuthStore.getState().logout(notice);
  });
}

export default useAuthStore;
