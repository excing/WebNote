
export function encode64(text: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

export function decode64(text: string): string {
  return new TextDecoder().decode(
    Uint8Array.from(atob(text), (c) => c.charCodeAt(0)),
  );
}
