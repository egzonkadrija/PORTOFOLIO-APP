const http = require("http");
const fs = require("fs");
const path = require("path");

const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const root = path.resolve(__dirname, "..");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function send(response, statusCode, content, contentType) {
  response.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-cache",
  });
  response.end(content);
}

function resolveRequestPath(urlPath) {
  const safePath = decodeURIComponent(urlPath.split("?")[0]);
  const requestedPath = safePath === "/" ? "/index.html" : safePath;
  const absolutePath = path.normalize(path.join(root, requestedPath));

  if (!absolutePath.startsWith(root)) {
    return null;
  }

  return absolutePath;
}

const server = http.createServer((request, response) => {
  const absolutePath = resolveRequestPath(request.url || "/");

  if (!absolutePath) {
    send(response, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.readFile(absolutePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        send(response, 404, "Not Found", "text/plain; charset=utf-8");
        return;
      }

      send(response, 500, "Internal Server Error", "text/plain; charset=utf-8");
      return;
    }

    const extension = path.extname(absolutePath).toLowerCase();
    const contentType = mimeTypes[extension] || "application/octet-stream";
    send(response, 200, content, contentType);
  });
});

server.listen(port, host, () => {
  console.log(`Portfolio app running at http://${host}:${port}`);
});
