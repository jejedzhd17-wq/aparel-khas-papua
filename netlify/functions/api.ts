import serverless from "serverless-http";

import { createServer } from "../../server";

import querystring from "querystring";

export const handler = serverless(createServer(), {
  request: (req: any) => {
    if (Buffer.isBuffer(req.body)) {
      const bodyString = req.body.toString("utf8");
      if (bodyString.trim()) {
        try {
          req.body = JSON.parse(bodyString);
        } catch {
          try {
            req.body = querystring.parse(bodyString);
          } catch (e) {
            console.error("Failed to parse body buffer:", e);
          }
        }
      }
    } else if (typeof req.body === "string" && req.body.trim()) {
      try {
        req.body = JSON.parse(req.body);
      } catch {
        try {
          req.body = querystring.parse(req.body);
        } catch (e) {
          console.error("Failed to parse body string:", e);
        }
      }
    }
  }
});
