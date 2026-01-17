import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ApiError,
  apiFetch,
  ApiFetchOptions,
  ApiResult,
} from 'simple-fetch-api';

/**
 * Stato interno dell'hook useFetch
 * @template T - Tipo dei dati attesi dalla risposta API
 */
interface UseFetchState<T> {
  /** Dati ricevuti dalla chiamata API, null se non ancora ricevuti o in caso di errore */
  data: T | null;
  /** Indica se la chiamata API è attualmente in corso */
  loading: boolean;
  /** Eventuale errore verificatosi durante la chiamata API */
  error: ApiError | null;
}

/**
 * Valore di ritorno dell'hook useFetch
 * @template T - Tipo dei dati attesi dalla risposta API
 */
interface UseFetchReturn<T> extends UseFetchState<T> {
  /**
   * Esegue la chiamata API con le opzioni configurate
   * @param options - Opzioni parziali per sovrascrivere quelle iniziali
   * @returns Promise contenente il risultato della chiamata API
   */
  execute: (options?: Partial<ApiFetchOptions>) => Promise<ApiResult<T>>;
  /**
   * Resetta lo stato dell'hook ai valori iniziali
   */
  reset: () => void;
}

/**
 * Hook React per gestire chiamate API con gestione automatica dello stato.
 *
 * Fornisce funzionalità di:
 * - Gestione automatica degli stati loading, data ed error
 * - Cancellazione automatica delle richieste pendenti quando ne viene avviata una nuova
 * - Cleanup automatico al unmount del componente
 * - Possibilità di auto-fetch al mount
 * - Reset dello stato
 *
 * @template T - Tipo dei dati attesi dalla risposta API
 *
 * @param {ApiFetchOptions} initialOptions - Opzioni iniziali per la chiamata API (url, method, headers, etc.)
 * @param {boolean} [autoFetch=false] - Se true, esegue automaticamente la chiamata al mount del componente
 *
 * @returns {UseFetchReturn<T>} Oggetto contenente:
 *   - data: dati ricevuti dalla chiamata API
 *   - loading: stato di caricamento
 *   - error: eventuale errore
 *   - execute: funzione per eseguire manualmente la chiamata
 *   - reset: funzione per resettare lo stato
 *
 * @example
 * // Auto-fetch al mount
 * const { data, loading, error } = useFetch({
 *   url: 'https://api.example.com/users',
 *   method: 'GET'
 * }, true);
 *
 * @example
 * // Chiamata manuale con override delle opzioni
 * const { data, loading, execute } = useFetch({
 *   url: 'https://api.example.com/users',
 *   method: 'POST'
 * });
 *
 * const handleSubmit = async (userData) => {
 *   const result = await execute({
 *     body: JSON.stringify(userData)
 *   });
 *   if (result.ok) {
 *     console.log('Success:', result.data);
 *   }
 * };
 *
 * @example
 * // Reset dello stato
 * const { data, reset } = useFetch({
 *   url: 'https://api.example.com/data',
 *   method: 'GET'
 * });
 *
 * const handleClear = () => {
 *   reset(); // Resetta data, loading ed error ai valori iniziali
 * };
 */
export function useFetch<T>(
  initialOptions: ApiFetchOptions,
  autoFetch = false
): UseFetchReturn<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  /**
   * Riferimento all'AbortController per cancellare le richieste in corso
   * @private
   */
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Esegue la chiamata API.
   * Annulla automaticamente eventuali richieste precedenti ancora in corso.
   *
   * @param {Partial<ApiFetchOptions>} [overrideOptions] - Opzioni per sovrascrivere quelle iniziali
   * @returns {Promise<ApiResult<T>>} Risultato della chiamata API
   */
  const execute = useCallback(
    async (overrideOptions?: Partial<ApiFetchOptions>) => {
      // Annulla richiesta precedente se ancora in corso
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState((prev) => ({ ...prev, loading: true, error: null }));

      const options = {
        ...initialOptions,
        ...overrideOptions,
        signal: abortControllerRef.current.signal,
      };

      const result = await apiFetch<T>(options);

      if (result.ok) {
        setState({ data: result.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: result.error });
      }

      return result;
    },
    [initialOptions]
  );

  /**
   * Resetta lo stato dell'hook ai valori iniziali (data: null, loading: false, error: null)
   */
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  /**
   * Effect per gestire auto-fetch e cleanup
   * @private
   */
  useEffect(() => {
    if (autoFetch) {
      execute();
    }

    // Cleanup: annulla richiesta al unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, execute]);

  return {
    ...state,
    execute,
    reset,
  };
}
