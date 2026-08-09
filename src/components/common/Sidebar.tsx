"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "Products", href: "/seller/products" },
  { label: "Inventory", href: "/seller/inventory" },
  { label: "Orders", href: "/seller/orders" },
  { label: "Coupons", href: "/seller/coupons" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 border-r border-primary-50 bg-surface-light p-4">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded px-3 py-2 text-sm ${
                  isActive
                    ? "bg-primary-50 font-medium text-primary-900"
                    : "text-primary-500 hover:bg-primary-50"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}