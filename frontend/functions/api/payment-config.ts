import { json } from '../_lib/http';
import { getPaymentConfig } from '../_lib/payment-config';

export function onRequestGet() {
  return json(getPaymentConfig());
}
