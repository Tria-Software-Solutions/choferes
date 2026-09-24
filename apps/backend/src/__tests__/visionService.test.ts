/* eslint-disable @typescript-eslint/no-require-imports */

const mockFetch = jest.fn();
jest.spyOn(global, "fetch").mockImplementation(mockFetch as unknown as typeof fetch);

type RespondOptions = {
  status?: number;
  text: string;
};

const respond = ({ status = 200, text }: RespondOptions) => {
  mockFetch.mockImplementation(() => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      text: () =>
        Promise.resolve(status >= 200 && status < 300 ? text : text),
      json: () =>
        Promise.resolve(
          status >= 200 && status < 300
            ? (JSON.parse(text) as { candidates?: unknown[] })
            : { error: { message: text } },
        ),
    });
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.GEMINI_API_KEY = "test_gemini_key";
});

afterEach(() => {
  delete process.env.GEMINI_API_KEY;
});

describe("visionService.processImage", () => {
  it("debería devolver el resultado estructurado cuando Gemini responde", async () => {
    respond({
      text: JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '```json\n{"date":"2026-09-24","entries":[{"ticket":"001","licensePlate":"ABC-123","brand":"Honda","color":"Rojo","parkingSpace":"A1","observation":null}]}\n```',
                },
              ],
            },
          },
        ],
      }),
    });

    const visionService = require("../services/visionService");
    const result = await visionService.processImage("image/jpeg", "aGVsbG8=");

    expect(result.date).toBe("2026-09-24");
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toEqual({
      ticket: "001",
      licensePlate: "ABC-123",
      brand: "Honda",
      color: "Rojo",
      parkingSpace: "A1",
      observation: "",
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("v1beta/models/gemini-2.0-flash:generateContent");
    expect(url).toContain("key=test_gemini_key");
    const body = JSON.parse(String(options.body)) as {
      contents: Array<{ parts: unknown[] }>;
    };
    expect(body.contents).toHaveLength(1);
    expect(body.contents[0].parts).toHaveLength(2);
  });

  it("debería devolver entries vacío cuando la respuesta no trae candidates", async () => {
    respond({ text: JSON.stringify({}) });

    const visionService = require("../services/visionService");
    const result = await visionService.processImage("image/png", "aGVsbG8=");

    expect(result.entries).toEqual([]);
  });

  it("debería mapear un 429 a un mensaje de cuota en español", async () => {
    respond({
      status: 429,
      text: JSON.stringify({
        error: { message: "Quota exceeded for quota metric" },
      }),
    });

    const visionService = require("../services/visionService");
    await expect(visionService.processImage("image/jpeg", "aGVsbG8=")).rejects.toThrow(
      /cuota de uso de Gemini API/,
    );
  });

  it("debería mapear un error de API key inválida", async () => {
    respond({
      status: 400,
      text: JSON.stringify({
        error: { message: "The API key in the request is invalid" },
      }),
    });

    const visionService = require("../services/visionService");
    await expect(visionService.processImage("image/jpeg", "aGVsbG8=")).rejects.toThrow(
      /API key de Gemini no es válida/,
    );
  });

  it("debería lanzar error cuando no hay GEMINI_API_KEY configurada", async () => {
    delete process.env.GEMINI_API_KEY;
    const visionService = require("../services/visionService");
    await expect(visionService.processImage("image/jpeg", "aGVsbG8=")).rejects.toThrow(
      "GEMINI_API_KEY no está configurada en el servidor.",
    );
  });

  it("debería lanzar error de conexión si fetch falla", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    const visionService = require("../services/visionService");
    await expect(visionService.processImage("image/jpeg", "aGVsbG8=")).rejects.toThrow(
      /No se pudo conectar con el servicio de Gemini/,
    );
  });
});