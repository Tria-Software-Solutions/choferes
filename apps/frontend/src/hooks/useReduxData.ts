import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { AppDispatch, RootState } from "../store/store";

/**
 * Custom hook for managing Redux data fetching with memoized selectors
 * Prevents unnecessary re-renders by providing equality functions
 */
export function useReduxData<T>(
  selector: (state: RootState) => T,
  equalityFn?: (prev: T, next: T) => boolean
): T {
  return useSelector(selector, equalityFn || shallowEqual);
}

/**
 * Custom hook for typed dispatch
 */
export function useAppDispatch(): AppDispatch {
  return useDispatch<AppDispatch>();
}
