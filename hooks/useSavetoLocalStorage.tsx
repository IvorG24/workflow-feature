import { useRouter } from "next/router";
import { useEffect } from "react";

type UseSaveToLocalStorageProps = {
  saveToLocalStorage: () => void;
};

const useSaveToLocalStorage = ({
  saveToLocalStorage,
}: UseSaveToLocalStorageProps) => {
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeStart", saveToLocalStorage);
    return () => {
      router.events.off("routeChangeStart", saveToLocalStorage);
    };
  }, [router.events, saveToLocalStorage]);
};

export default useSaveToLocalStorage;
