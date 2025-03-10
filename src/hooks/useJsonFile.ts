export const useJsonFile = <T>() => {
  const read = (file: File, onRead: (obj: T) => void) => {
    const reader = new FileReader();
    reader.onload = (readevent) => {
      const text = readevent.target?.result;

      if (typeof text !== "string") {
        console.error("File content is not a string");
        return;
      }

      try {
        onRead(JSON.parse(text));
      } catch (error) {
        console.error("Error parsing JSON", error);
      }
    };
    reader.readAsText(file);
  };

  const write = (obj: T, filebasename: string = "data") => {
    try {
      const json = JSON.stringify(obj, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filebasename + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating JSON file", error);
    }
  };

  return { read, write };
};
