declare module '*/server/api.mjs' {
  export const handleApi: (request: Request, ctx: { store: unknown; env: Record<string, string> }) => Promise<Response>;
}
declare const __DEMO__: boolean;
