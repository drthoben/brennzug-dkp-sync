import { DependencyList, useEffect } from 'react';


export function useAsyncEffect(effect: () => void | Promise<void>, deps?: DependencyList) {
  useEffect(() => {
  	effect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
