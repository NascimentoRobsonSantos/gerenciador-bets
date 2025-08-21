export async function authenticatedFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  // Opcional: Lidar com 401 Unauthorized aqui, redirecionando para o login
  if (response.status === 401) {
    // Redirecionar para a página de login ou limpar o token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  }

  return response;
}