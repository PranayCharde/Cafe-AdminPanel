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

      login: (token, user) => {
        localStorage.setItem("cafe_admin_token", token);
        set({
          token,
          user,
          isAuthenticated: true,
          loading: false,
        });
      },

      logout: () => {
        localStorage.removeItem("cafe_admin_token");
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          loading: false,
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
          if (res.data?.user) {
            set({
              user: res.data.user,
              token,
              isAuthenticated: true,
              loading: false,
            });
          } else {
            get().logout();
          }
        } catch (err) {
          console.warn("Auth check failed:", err);
          get().logout();
        }
      },
    }),
    {
      name: "cafe_admin_session",
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
