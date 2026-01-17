# react-simple-fetch-api

A lightweight React hook to handle API calls in a simple, clean, and efficient way, built on top of the `simple-fetch-api` library.

## Features

- ✅ Automatic state management (`loading`, `data`, `error`)
- ✅ Automatic cancellation of pending requests
- ✅ Optional auto-fetch on component mount
- ✅ Full TypeScript support
- ✅ State reset functionality
- ✅ Per-request options override

## Installation

```bash
npm install react-simple-fetch-api simple-fetch-api
```

## Basic Usage

```tsx
import { useFetch } from 'react-simple-fetch-api';

function UserProfile() {
  const { data, loading, error } = useFetch(
    {
      url: 'https://api.example.com/user/123',
      method: 'GET',
    },
    true
  ); // auto-fetch on mount

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return <div>{data.name}</div>;
}
```

## Manual Execution

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

## API Reference

### `useFetch<T>(initialOptions, autoFetch?)`

#### Parameters

- `initialOptions`: `ApiFetchOptions`
  Initial configuration for the API request.

- `autoFetch`: `boolean` (default: `false`)
  If `true`, the request is executed automatically when the component mounts.

#### Returns

An object containing:

- `data`: `T | null`
  The data returned from the API call.

- `loading`: `boolean`
  Indicates whether the request is in progress.

- `error`: `ApiError | null`
  Any error that occurred during the request.

- `execute`: `(options?: Partial<ApiFetchOptions>) => Promise<ApiResult<T>>`
  Function to manually execute the API request, optionally overriding the initial options.

- `reset`: `() => void`
  Resets `data`, `loading`, and `error` to their initial state.

## License

MIT

---
