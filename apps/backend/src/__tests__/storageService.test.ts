const send = jest.fn();

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(() => ({ send })),
  PutObjectCommand: jest.fn((input: unknown) => ({ command: "put", input })),
  GetObjectCommand: jest.fn((input: unknown) => ({ command: "get", input })),
  DeleteObjectCommand: jest.fn((input: unknown) => ({ command: "delete", input })),
}));

import {
  deleteObject,
  getObjectBuffer,
  isStorageConfigured,
  putObject,
  resetStorageClient,
} from "../services/storageService";

const setEnv = () => {
  process.env.S3_ENDPOINT = "http://localhost:9000";
  process.env.S3_REGION = "us-east-1";
  process.env.S3_BUCKET = "choferes-documentos";
  process.env.S3_ACCESS_KEY_ID = "minioadmin";
  process.env.S3_SECRET_ACCESS_KEY = "minioadmin";
  process.env.S3_FORCE_PATH_STYLE = "true";
};

beforeEach(() => {
  jest.clearAllMocks();
  resetStorageClient();
  setEnv();
});

afterEach(() => {
  delete process.env.S3_ENDPOINT;
  delete process.env.S3_BUCKET;
  delete process.env.S3_ACCESS_KEY_ID;
  delete process.env.S3_SECRET_ACCESS_KEY;
  resetStorageClient();
});

describe("isStorageConfigured", () => {
  it("es false si falta cualquier credencial", () => {
    delete process.env.S3_ACCESS_KEY_ID;
    expect(isStorageConfigured()).toBe(false);
  });

  it("es true con la configuración completa", () => {
    expect(isStorageConfigured()).toBe(true);
  });
});

describe("putObject", () => {
  it("sube el binario y devuelve una clave dentro de documents/", async () => {
    send.mockResolvedValue({});

    const key = await putObject(Buffer.from("hola"), "text/plain", "notas.txt");

    expect(key).toMatch(/^documents\/[0-9a-f-]+\.txt$/);
    const [command] = send.mock.calls[0];
    expect(command.command).toBe("put");
    expect(command.input).toMatchObject({
      Bucket: "choferes-documentos",
      Key: key,
      ContentType: "text/plain",
    });
    expect(Buffer.isBuffer(command.input.Body)).toBe(true);
  });

  it("falla claro cuando el storage no está configurado", async () => {
    delete process.env.S3_BUCKET;
    resetStorageClient();

    await expect(putObject(Buffer.from("x"), "text/plain", "a.txt")).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});

describe("getObjectBuffer", () => {
  it("devuelve el contenido como Buffer", async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    send.mockResolvedValue({ Body: { transformToByteArray: async () => bytes } });

    const buffer = await getObjectBuffer("documents/abc.docx");

    expect(buffer.equals(Buffer.from(bytes))).toBe(true);
  });

  it("traduce un fallo de S3 a 404", async () => {
    send.mockRejectedValue(new Error("NoSuchKey"));

    await expect(getObjectBuffer("documents/inexistente.docx")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("deleteObject", () => {
  it("envía el borrado del objeto", async () => {
    send.mockResolvedValue({});

    await deleteObject("documents/abc.docx");

    expect(send.mock.calls[0][0].command).toBe("delete");
    expect(send.mock.calls[0][0].input).toMatchObject({ Key: "documents/abc.docx" });
  });
});
