import { redirect } from 'next/navigation';

export default function AdminLayout() {
  // Admin console is removed — redirect all traffic to home
  redirect('/');
}

