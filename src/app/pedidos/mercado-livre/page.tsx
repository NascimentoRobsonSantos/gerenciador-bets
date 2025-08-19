"use client";

import { getOrders } from '@/modules/orders/order.api';
import { OrdersTable } from '@/components/Table';
import { Suspense, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

import { useEffect } from 'react';
import { Order } from '@/modules/orders/order.model';

export default function MercadoLivrePage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(currentSearchParams.get('start_date') || '');
  const [endDate, setEndDate] = useState(currentSearchParams.get('end_date') || '');
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const handleFilter = () => {
    setIsFilterLoading(true);
    const params = new URLSearchParams(Array.from(currentSearchParams.entries()));
    if (startDate) {
      params.set('start_date', startDate);
    } else {
      params.delete('start_date');
    }
    if (endDate) {
      params.set('end_date', endDate);
    } else {
      params.delete('end_date');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
    setIsFilterModalOpen(false);
  };

  useEffect(() => {
    const fetchOrdersData = async () => {
      setDataLoading(true);
      const page = Number(currentSearchParams.get('page')) || 1;
      const limit = Number(currentSearchParams.get('limit')) || 10;
      const start_date = currentSearchParams.get('start_date') as string;
      const end_date = currentSearchParams.get('end_date') as string;

      try {
        const apiResponse = await getOrders(page, limit, 'mercado_livre', start_date, end_date);
        setOrders(apiResponse.data);
        setTotalItems(Number(apiResponse.totalItems));
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
        setTotalItems(0);
      } finally {
        setDataLoading(false);
        setIsFilterLoading(false);
      }
    };

    fetchOrdersData();
  }, [currentSearchParams]);

  const page = Number(currentSearchParams.get('page')) || 1;
  const limit = Number(currentSearchParams.get('limit')) || 10;

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Pedidos do Mercado Livre</h2>
        <Button onClick={() => setIsFilterModalOpen(true)} variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400">
          <Filter className="h-4 w-4 mr-1" />
          Filtros
        </Button>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <OrdersTable
          orders={orders}
          totalItems={totalItems}
          searchParams={{
            page: String(page),
            limit: String(limit),
          }}
          startDate={startDate}
          endDate={endDate}
          onFilter={handleFilter}
          isFilterLoading={isFilterLoading || dataLoading}
        />
      </Suspense>

      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Filtros de Data</DialogTitle>
            <DialogDescription>Selecione o período para filtrar os pedidos.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="start-date">Data de Início</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-gray-800 border-gray-600 text-white" />
            </div>
            <div>
              <Label htmlFor="end-date">Data de Fim</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-gray-800 border-gray-600 text-white" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button type="button" onClick={handleFilter} disabled={isFilterLoading}>
              {isFilterLoading ? 'Filtrando...' : 'Filtrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
