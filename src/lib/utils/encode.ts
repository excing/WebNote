
export function encode64(text: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

export function decode64(text: string): string {
  return new TextDecoder().decode(
    Uint8Array.from(atob(text), (c) => c.charCodeAt(0)),
  );
}

export function encode64File(file: File) {
  const reader = new FileReader()

  return new Promise((resolve, reject) => {
    reader.onload = function (event: any) {
      const fileContent = event.target.result
      if (fileContent) {
        resolve(fileContent.split(',')[1])
      } else {
        reject("Read file content failed")
      }
    }
    reader.readAsDataURL(file)
  })
}
