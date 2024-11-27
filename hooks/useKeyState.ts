import { useEffect, useState } from "react";

export const useKeyState = () => {
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());

  const handleKeyDown = (event: KeyboardEvent) => {
    setKeysPressed((prevKeys) => new Set(prevKeys).add(event.key));
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    setKeysPressed((prevKeys) => {
      const newKeys = new Set(prevKeys);
      newKeys.delete(event.key);
      return newKeys;
    });
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  let action: string | null = null;

  if (keysPressed.has("Control")) {
    if (keysPressed.has("c")) {
      action = "copy";
    } else if (keysPressed.has("v")) {
      action = "paste";
    }
  }

  return {
    keyboardShortcut: action,
  };
};
