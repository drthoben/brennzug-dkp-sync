export async function readJsonFromFile(file: File) {
  return new Promise<any>((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (event) => {
      try {
        resolve(JSON.parse(event.target.result as string));
      }
      catch (error) {
        reject(error);
      }
    };

    fileReader.readAsText(file);
  });
}
