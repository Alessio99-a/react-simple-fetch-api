# react-simple-fetch

Un hook React per gestire chiamate API in modo semplice ed efficiente, basato sulla libreria `simple-fetch-api`.

## Caratteristiche

- ✅ Gestione automatica dello stato (loading, data, error)
- ✅ Cancellazione automatica delle richieste pendenti
- ✅ Auto-fetch opzionale al mount del componente
- ✅ TypeScript support completo
- ✅ Reset dello stato
- ✅ Override delle opzioni per ogni chiamata

## Installazione

```bash
npm install react-simple-fetch simple-fetch-api
```

## Utilizzo Base

```tsx
import { useFetch } from 'react-simple-fetch';

function UserProfile() {
  const { data, loading, error, execute } = useFetch(
    {
      url: 'https://api.example.com/user/123',
      method: 'GET',
    },
    true
  ); // auto-fetch al mount

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return <div>{data.name}</div>;
}
```

## Utilizzo Manuale

```tsx
function CreateUser() {
  const { data, loading, error, execute, reset } = useFetch({
    url: 'https://api.example.com/users',
    method: 'POST',
  });

  const handleSubmit = async (userData) => {
    const result = await execute({
      body: JSON.stringify(userData),
    });

    if (result.ok) {
      console.log('User created:', result.data);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

## API

### `useFetch<T>(initialOptions, autoFetch?)`

#### Parametri

- `initialOptions`: `ApiFetchOptions` - Opzioni iniziali per la chiamata API
- `autoFetch`: `boolean` (default: `false`) - Se `true`, esegue la chiamata automaticamente al mount

#### Ritorna

Un oggetto contenente:

- `data`: `T | null` - I dati ricevuti dalla chiamata API
- `loading`: `boolean` - Stato di caricamento
- `error`: `ApiError | null` - Eventuale errore
- `execute`: `(options?: Partial<ApiFetchOptions>) => Promise<ApiResult<T>>` - Funzione per eseguire la chiamata
- `reset`: `() => void` - Funzione per resettare lo stato

## Licenza

MIT
