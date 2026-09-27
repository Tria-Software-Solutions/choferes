import { resetStore, store } from "./store";
import { setScheduleOrder } from "./slices/schedulesSlice";

describe("store reset", () => {
  it("vacía el estado de todos los slices al cerrar sesión", () => {
    const initial = store.getState();

    store.dispatch(setScheduleOrder([3, 1, 2]));
    expect(store.getState().schedules).not.toEqual(initial.schedules);

    store.dispatch(resetStore());

    expect(store.getState()).toEqual(initial);
  });
});
