import { useRouter } from "next/router";
import { useEffect } from "react";

type RouteChangeCallback = (url: string) => void;

const useRouteChange = (callback: RouteChangeCallback): void => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      callback(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [callback, router]);
};

export default useRouteChange;
