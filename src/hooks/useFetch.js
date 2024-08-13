import { useEffect, useState } from 'react';
import axios from 'src/lib/axios';

function useFetch(url, keyExtractor) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/admin/${url}`);
        if (data.success) {
          if (keyExtractor) {
            setData(data.data[keyExtractor]);
          } else {
            setData(data.data);
          }
          setLoading(false);
        } else throw data.message;
      } catch (error) {
        setError(error.message);
      }
    })();
  }, [keyExtractor, url]);

  return [data, loading, error];
}

export default useFetch;
