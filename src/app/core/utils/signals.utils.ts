import { WritableSignal, signal, effect, untracked } from '@angular/core';

/**
 * Creates a signal that reverts to its initial value after a specified duration.
 *
 * @param initialValue The initial and revert-to value of the signal.
 * @param duration The time in milliseconds to wait before reverting.
 * @returns A WritableSignal that automatically reverts.
 */
export function revertingSignal<T>(initialValue: T, duration: number): WritableSignal<T> {
  const state = signal(initialValue);
  let timeoutId: any;

  effect(() => {
    // Get the current value to track it for changes.
    const currentValue = state();

    // Use untracked to read the initial value without creating a dependency.
    untracked(() => {
      if (currentValue !== initialValue) {
        // If a timeout is already scheduled, clear it to reset the timer.
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        // Schedule the revert action.
        timeoutId = setTimeout(() => {
          state.set(initialValue);
        }, duration);
      }
    });
  }, { allowSignalWrites: true }); // Required for effects that write to signals.

  return state;
}
