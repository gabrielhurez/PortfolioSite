import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../keystatic.config";

const handler = makeRouteHandler({ config });

// The editor writes straight to the files on disk, so it only answers on localhost during development:
// never on the live site, and never to other devices (the dev server also only listens on localhost)
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

const guard = (method: (request: Request) => Promise<Response>) => (request: Request) => {
  if (process.env.NODE_ENV !== "development" || !LOCAL_HOSTS.has(new URL(request.url).hostname)) {
    return new Response("Not found", { status: 404 });
  }
  return method(request);
};

export const GET = guard(handler.GET);
export const POST = guard(handler.POST);
