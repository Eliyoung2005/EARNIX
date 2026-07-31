import { redirect } from 'next/navigation';

export default function AdminCodesRedirect() {
  redirect('/admin/coupons');
}
