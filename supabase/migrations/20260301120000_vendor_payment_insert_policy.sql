-- Allow vendors to insert a payment when they mark a booking as completed.
-- WITH CHECK: booking must exist, belong to this vendor, and have status 'completed'.
CREATE POLICY "Vendors can create payment for completed booking"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND b.vendor_id = auth.uid()
        AND b.status = 'completed'
    )
  );
