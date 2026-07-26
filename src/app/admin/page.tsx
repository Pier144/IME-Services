import { redirect } from 'next/navigation';
import { adminRoutes } from '@/lib/routes';

/** L'area riservata si apre sulla gestione delle news. */
export default function AdminIndex() {
  redirect(adminRoutes.news);
}
