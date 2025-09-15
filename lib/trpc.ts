import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (!url) {
    console.error("No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL");
    return "https://qf0jttcocjvc4ponsbxo0.rork.com"; // Fallback URL
  }
  return url;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: (url, options) => {
        console.log("TRPC Request:", url);
        return fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          },
        });
      },
    }),
  ],
});