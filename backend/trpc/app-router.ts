import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import healthRoute from "@/backend/trpc/routes/health/route";
import servicesListRoute from "@/backend/trpc/routes/services/list/route";

export const appRouter = createTRPCRouter({
  health: healthRoute,
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  services: createTRPCRouter({
    list: servicesListRoute,
  }),
});

export type AppRouter = typeof appRouter;