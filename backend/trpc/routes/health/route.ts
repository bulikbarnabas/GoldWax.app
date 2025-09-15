import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure.query(() => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Backend is running"
  };
});