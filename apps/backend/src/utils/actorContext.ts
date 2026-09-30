import { AsyncLocalStorage } from "async_hooks";

// Quién está ejecutando la petición en curso. Permite que un aviso no le llegue
// a la persona que acaba de realizar la acción (ya lo sabe). Los procesos sin
// petición (cron) no tienen actor y avisan a todos los destinatarios.
const actorStorage = new AsyncLocalStorage<number>();

export const runAsActor = <T>(userId: number, callback: () => T): T =>
  actorStorage.run(userId, callback);

export const getCurrentActorId = (): number | undefined => actorStorage.getStore();
