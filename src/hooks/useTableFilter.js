import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useDebouncedCallback } from 'use-debounce';
const convertFilterParams = (filterParamsList, query) =>
  [...filterParamsList].map((param) => {
    const queryParam = query[param.fieldKey];
    return {
      ...param,
      value: queryParam === 'true' ? true : queryParam === 'false' ? false : queryParam ?? '',
    };
  });

/**
 * @typedef filterParams
 * @property {string} fieldKey
 * @property {string} title
 * @property {'string' | 'option'} type
 * @property {(string | number | {render: string | number, value: string | number})[]} list
 * @property {string} value
 */

/**
 *
 * @param {number} page
 * @param {filterParams[]} filterParamsList
 * @returns {{filterParams:filterParams[], setFilterParams:Dispatch<SetStateAction<filterParams[]>>, onPageChange: (e:React.MouseEvent, value:number)=>void}}
 */
function useTableFilter(page, filterParamsList = []) {
  const { push, query, pathname } = useRouter();

  const [filterParams, setFilterParams] = useState(convertFilterParams(filterParamsList, query));
  const hasFiltered = useRef(false);
  const firstLoad = useRef(true);

  const filter = useDebouncedCallback(async () => {
    if (firstLoad.current) return;
    if (Object.values(filterParams).some((param) => param.value !== '')) {
      const params = Object.assign(
        { page: 1 },
        ...filterParams
          .filter((param) => param.value !== '')
          .map((param) => ({ [param.fieldKey]: param.value }))
      );
      const url_params = new URLSearchParams(params).toString();
      push(`${pathname}?${url_params}`);
      hasFiltered.current = true;
    } else if (hasFiltered.current) {
      push(`${pathname}?page=${page}`);
    }
  }, 1000);

  const onPageChange = useCallback(
    (_, value) => {
      const params = Object.assign(
        { page: value + 1 },
        ...filterParams
          .filter((param) => param.value !== '')
          .map((param) => ({ [param.fieldKey]: param.value }))
      );
      const url_params = new URLSearchParams(params).toString();
      push(`${pathname}?${url_params}`);
    },
    [filterParams, pathname, push]
  );

  useEffect(() => {
    setFilterParams(convertFilterParams(filterParamsList, query));
  }, [filterParamsList, query]);

  useEffect(() => {
    filter();
    firstLoad.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...filterParams.map((param) => param.value)]);

  return {
    filterParams,
    setFilterParams,
    onPageChange,
  };
}

export default useTableFilter;
