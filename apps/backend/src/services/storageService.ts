// Almacenamiento de objetos S3-compatible para los binarios de Documentos.
//
// Los archivos ya no viven en Postgres: se suben al bucket y la fila guarda solo
// la clave (`storageKey`). El mismo cliente sirve para Cloudflare R2 (producción)
// y MinIO (desarrollo local), porque ambos hablan la API de S3. La configuración
// es por variables de entorno, así que cambiar de proveedor no toca el código.
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { ServiceError } from "../utils/errors";

interface StorageConfig {
  endpoint?: string;
  region: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  forcePathStyle: boolean;
}

// Se lee en cada llamada (no al importar) para que los tests puedan variar el
// entorno y para no romper el arranque si el storage no está configurado.
const readConfig = (): StorageConfig => ({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "auto",
  bucket: process.env.S3_BUCKET,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  // MinIO y la mayoría de self-hosted necesitan path-style
  // (http://host/bucket/key) en vez de virtual-host (http://bucket.host/key).
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
});

/** true cuando hay bucket, endpoint y credenciales: sin esto no se puede guardar. */
export const isStorageConfigured = (): boolean => {
  const config = readConfig();
  return Boolean(config.bucket && config.endpoint && config.accessKeyId && config.secretAccessKey);
};

let cachedClient: S3Client | null = null;

const getClient = (): { client: S3Client; bucket: string } => {
  const config = readConfig();
  if (!isStorageConfigured()) {
    throw new ServiceError(
      500,
      "El almacenamiento de archivos no está configurado (S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY).",
    );
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId as string,
        secretAccessKey: config.secretAccessKey as string,
      },
    });
  }
  return { client: cachedClient, bucket: config.bucket as string };
};

// La clave incluye un UUID para no pisar objetos entre revisiones: al guardar una
// edición se escribe una clave nueva y se actualiza la fila, así un fallo a mitad
// no deja el archivo anterior corrupto.
const buildKey = (name: string): string => {
  const extension = name.includes(".") ? `.${name.split(".").pop()}` : "";
  return `documents/${randomUUID()}${extension}`;
};

/** Guarda un binario y devuelve la clave con la que quedó almacenado. */
export const putObject = async (
  body: Buffer,
  contentType: string,
  name: string,
): Promise<string> => {
  const { client, bucket } = getClient();
  const key = buildKey(name);
  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
  );
  return key;
};

/** Descarga un objeto completo en memoria (los documentos son de pocos MB). */
export const getObjectBuffer = async (key: string): Promise<Buffer> => {
  const { client, bucket } = getClient();
  try {
    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!response.Body) throw new ServiceError(404, "Archivo no encontrado en el almacenamiento");
    return Buffer.from(await response.Body.transformToByteArray());
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(404, "Archivo no encontrado en el almacenamiento");
  }
};

/** Borra un objeto; no falla si ya no existe. */
export const deleteObject = async (key: string): Promise<void> => {
  const { client, bucket } = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};

/** Solo para tests: descarta el cliente memoizado tras cambiar el entorno. */
export const resetStorageClient = (): void => {
  cachedClient = null;
};
