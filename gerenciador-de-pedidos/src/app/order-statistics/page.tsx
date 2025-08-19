'use client';

import { getOrderStatistics } from '@/modules/orders/order.api';
import { Order } from '@/modules/orders/order.model';
import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function OrderStatisticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('all');

  useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const formattedStartDate = oneMonthAgo.toISOString().split('T')[0];
    const formattedEndDate = today.toISOString().split('T')[0];
    setStartDate(formattedStartDate);
    setEndDate(formattedEndDate);
    fetchOrders(formattedStartDate, formattedEndDate, selectedMarketplace);
  }, [selectedMarketplace]); // Added selectedMarketplace to dependency array

  const fetchOrders = async (start: string, end: string, marketplace: string) => {
    setLoading(true);
    try {
      const apiResponse = await getOrderStatistics(start, end, marketplace === 'all' ? undefined : marketplace as any);
      setOrders(apiResponse.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchOrders(startDate, endDate, selectedMarketplace);
  }

  const marketplaceData = useMemo(() => {
    const data: { name: string; value: number }[] = [];
    const marketplaceMap = new Map<string, number>();

    orders.forEach((order) => {
      const currentCount = marketplaceMap.get(order.order_origem) || 0;
      marketplaceMap.set(order.order_origem, currentCount + 1);
    });

    marketplaceMap.forEach((value, key) => {
      data.push({ name: key, value });
    });
    return data;
  }, [orders]);

  const periodData = useMemo(() => {
    const data: { date: string; mercado_livre: number; shopee: number }[] = [];
    const periodMap = new Map<string, { mercado_livre: number; shopee: number }>();

    orders.forEach((order) => {
      const date = new Date(order.order_created).toLocaleDateString(); // Group by day
      if (!periodMap.has(date)) {
        periodMap.set(date, { mercado_livre: 0, shopee: 0 });
      }
      const current = periodMap.get(date)!;
      if (order.order_origem === 'mercado_livre') {
        current.mercado_livre += 1;
      } else if (order.order_origem === 'shopee') {
        current.shopee += 1;
      }
    });

    periodMap.forEach((value, key) => {
      data.push({ date: key, mercado_livre: value.mercado_livre, shopee: value.shopee });
    });
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [orders]);

  const totalAmountSum = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  }, [orders]);

  const totalOrdersCount = useMemo(() => {
    return orders.length;
  }, [orders]);

  const uniqueMarketplaces = useMemo(() => {
    const marketplaces = new Set<string>();
    orders.forEach(order => marketplaces.add(order.order_origem));
    return [...Array.from(marketplaces)];
  }, [orders]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

  if (loading) {
    return <div className="p-4 text-center">Carregando Dashboard...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Pedidos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card p-4 rounded-md shadow-md">
          <h2 className="text-lg font-semibold mb-2">Total de Pedidos</h2>
          <p className="text-3xl font-bold">{totalOrdersCount}</p>
        </div>
        <div className="bg-card p-4 rounded-md shadow-md">
          <h2 className="text-lg font-semibold mb-2">Valor Total dos Pedidos</h2>
          <p className="text-3xl font-bold">R$ {totalAmountSum !== undefined && totalAmountSum !== null ? totalAmountSum.toFixed(2) : '0.00'}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-4 rounded-md shadow-md">
          <h2 className="text-lg font-semibold mb-2">Filtros</h2>
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="marketplace">Marketplace</Label>
              <Select value={selectedMarketplace} onValueChange={setSelectedMarketplace}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Selecione um Marketplace" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem key="all" value="all">Todos</SelectItem>
                  {uniqueMarketplaces.map((mp) => (
                    <SelectItem key={mp} value={mp}>
                      {mp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleFilter}>Filtrar</Button>
          </div>
        </div>

        <div className="bg-card p-4 rounded-md shadow-md md:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Pedidos por Marketplace</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={marketplaceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {marketplaceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card p-4 rounded-md shadow-md mt-4">
        <h2 className="text-lg font-semibold mb-2">Pedidos por Período</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={periodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
              <XAxis dataKey="date" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip />
              <Legend />
              <Bar dataKey="mercado_livre" stackId="a" fill="#82ca9d" />
              <Bar dataKey="shopee" stackId="a" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}
