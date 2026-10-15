// Prueba de integración (sin mocks) del cliente S3 real contra un endpoint
// S3-compatible mínimo servido localmente. Verifica el ciclo completo por HTTP:
// path-style addressing, envío del binario, descarga y borrado.
import http from "http";
import type { AddressInfo } from "net";
import {
  deleteObject,
  getObjectBuffer,
  putObject,
  resetStorageClient,
} from "../services/storageService";

const store = new Map<string, Buffer>();
let server: http.Server;

// Extrae la clave del objeto del path "/<bucket>/<key...>".
const keyFromPath = (url: string): string => {
  const path = decodeURIComponent(url.split("?")[0]);
  return path.replace(/^\/[^/]+\//, "");
};

beforeAll(async () => {
  server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk as Buffer));
    req.on("end", () => {
      const key = keyFromPath(req.url ?? "/");
      if (req.method === "PUT") {
        store.set(key, Buffer.concat(chunks));
        res.writeHead(200, { ETag: '"abc"' });
        res.end();
        return;
      }
      if (req.method === "GET") {
        const body = store.get(key);
        if (!body) {
          res.writeHead(404, { "Content-Type": "application/xml" });
          res.end("<Error><Code>NoSuchKey</Code></Error>");
          return;
        }
        res.writeHead(200, { "Content-Length": String(body.length) });
        res.end(body);
        return;
      }
      if (req.method === "DELETE") {
        store.delete(key);
        res.writeHead(204);
        res.end();
        return;
      }
      res.writeHead(400);
      res.end();
    });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  process.env.S3_ENDPOINT = `http://127.0.0.1:${port}`;
  process.env.S3_REGION = "us-east-1";
  process.env.S3_BUCKET = "choferes-documentos";
  process.env.S3_ACCESS_KEY_ID = "test";
  process.env.S3_SECRET_ACCESS_KEY = "test";
  process.env.S3_FORCE_PATH_STYLE = "true";
  resetStorageClient();
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  delete process.env.S3_ENDPOINT;
  resetStorageClient();
});

describe("storageService contra un S3 local", () => {
  it("sube, descarga y borra un objeto por HTTP", async () => {
    const content = Buffer.from("contenido real de un documento");

    const key = await putObject(content, "text/plain", "prueba.txt");
    expect(key).toMatch(/^documents\/[0-9a-f-]+\.txt$/);

    // El servidor guardó el binario bajo la clave (path-style: /bucket/key).
    expect(store.get(key)?.equals(content)).toBe(true);

    const downloaded = await getObjectBuffer(key);
    expect(downloaded.equals(content)).toBe(true);

    await deleteObject(key);
    expect(store.has(key)).toBe(false);
  });

  it("un objeto inexistente se traduce a 404", async () => {
    await expect(getObjectBuffer("documents/no-existe.docx")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
