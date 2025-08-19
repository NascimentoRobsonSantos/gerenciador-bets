'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/order-statistics' },
    { name: 'Pedidos Mercado Livre', href: '/pedidos/mercado-livre?page=1&limit=10' },
    { name: 'Pedidos Shopee', href: '/pedidos/shopee?page=1&limit=10' },
  ];

  return (
    <aside className="w-64 bg-card text-card-foreground p-4 shadow-md">
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                href={item.href}
                className={`block p-2 rounded transition-colors duration-200 ${pathname === item.href ? 'bg-primary text-primary-foreground' : 'hover:bg-primary hover:text-primary-foreground'}`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
