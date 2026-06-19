import { useState, useEffect } from 'react';

export const useHash = () => {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = (newHash) => {
    window.location.hash = newHash;
  };

  return [hash, navigate];
};
