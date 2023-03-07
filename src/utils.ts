// https://gist.github.com/jakearchibald/cb03f15670817001b1157e62a076fe95

export function animationInterval(
  ms: number,
  signal: AbortSignal,
  callback: (time: number) => void
) {
  // Prefer currentTime, as it'll better sync animtions queued in the
  // same frame, but if it isn't supported, performance.now() is fine.
  const start = document.timeline?.currentTime ?? performance.now();

  function frame(time: number) {
    if (signal.aborted) return;
    callback(time);
    scheduleFrame(time);
  }

  function scheduleFrame(time: number) {
    const elapsed = time - start;
    const roundedElapsed = Math.round(elapsed / ms) * ms;
    const targetNext = start + roundedElapsed + ms;
    const delay = targetNext - performance.now();
    setTimeout(() => requestAnimationFrame(frame), delay);
  }

  scheduleFrame(start);
}

export const isEnum = <E extends unknown>(
  value: unknown,
  matchingEnum: Record<string, E>
): value is E =>
  Object.keys(matchingEnum).some((key) => matchingEnum[key] === value);
export const getHelperText = (step: number) => {
  switch (step) {
    case 0: {
      return 'Click anywhere to start timer. (Once first set spawns)';
    }
    case 1: {
      return 'Click anywhere to pause timer. (Once Zuk is under 600 HP)';
    }
    case 2: {
      return 'Click anywhere to start Jad. (Once Zuk is under 480 HP)';
    }
    default: {
      return 'Good luck!';
    }
  }
};
