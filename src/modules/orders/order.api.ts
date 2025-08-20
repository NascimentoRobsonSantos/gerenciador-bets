import { ApiResponse } from './order.model';

export async function getOrders(
  page: number = 1,
  limit: number = 10,
  origin?: 'mercado_livre' | 'shopee',
  start_date?: '',
  end_date?: ''
): Promise<ApiResponse> {
  let url = `https://webhook.clientes.acontece.ai/webhook/orders?page=${page}&limit=${limit}`;
  if (origin) {
    url += `&order-origem=${origin}`;
  }
  if (start_date) {
    url += `&start_date=${start_date}`;
  }
  if (end_date) {
    url += `&end_date=${end_date}`;
  }
  console.log('Request URL:', url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // The API returns an array with a single object containing totalItems and data
    // We need to handle the case where the array is empty or the structure is different
    if (Array.isArray(data) && data.length > 0) {
      const apiResponse = data[0] as ApiResponse;
      apiResponse.data = apiResponse.data.map(order => ({
        ...order,
        total_amount: parseFloat(order.total_amount as any),
      }));
      return apiResponse;
    }

    // If the API returns a single object directly
    if (typeof data === 'object' && data !== null && 'data' in data) {
        const apiResponse = data as ApiResponse;
        apiResponse.data = apiResponse.data.map(order => ({
          ...order,
          total_amount: parseFloat(order.total_amount as any),
        }));
        return apiResponse;
    }

    // Return a default structure if the response is not as expected
    return { totalItems: '0', data: [] };

  } catch (error) {
    console.error('Failed to fetch orders:', error);
    // In case of an error, return a default response to avoid breaking the app
    return { totalItems: '0', data: [] };
  }
}

export async function getOrderStatistics(
  startDate: string,
  endDate: string,
  origin?: 'mercado_livre' | 'shopee'
): Promise<ApiResponse> {
  let url = `https://webhook.clientes.acontece.ai/webhook/orders?start_date=${startDate}&end_date=${endDate}`;
  if (origin) {
    url += `&order-origem=${origin}`;
  }
  console.log('Request URL:', url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const apiResponse = data[0] as ApiResponse;
      apiResponse.data = apiResponse.data.map(order => ({
        ...order,
        total_amount: parseFloat(order.total_amount as any),
      }));
      return apiResponse;
    }

    if (typeof data === 'object' && data !== null && 'data' in data) {
        const apiResponse = data as ApiResponse;
        apiResponse.data = apiResponse.data.map(order => ({
          ...order,
          total_amount: parseFloat(order.total_amount as any),
        }));
        return apiResponse;
    }

    return { totalItems: '0', data: [] };

  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return { totalItems: '0', data: [] };
  }
}
