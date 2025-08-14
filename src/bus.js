// Tiny pub/sub for loose coupling
const listeners = {};
export function on(event, fn){ (listeners[event] ||= new Set()).add(fn); }
export function off(event, fn){ listeners[event]?.delete(fn); }
export function emit(event, payload){ listeners[event]?.forEach(fn => fn(payload)); }
