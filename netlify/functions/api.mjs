import serverless from 'serverless-http';
import { app } from '../../server.mjs';

export const handler = serverless(app, {
  // Tell serverless-http to base64-encode binary responses (required for Netlify)
  binary: ['audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/*', 'application/octet-stream'],
  // Ensure Express always sees the original request path from the Netlify redirect
  request(request, event) {
    if (event.path) {
      const qs = event.queryStringParameters
        ? '?' + new URLSearchParams(event.queryStringParameters).toString()
        : '';
      request.url = event.path + qs;
    }
  },
});
