import { redirect } from 'next/navigation';

export default function PriceRedirect() {
  redirect('/catalog');
}
