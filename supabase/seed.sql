-- =============================================================================
-- Service Connect Hub - Demo bootstrap seed (runs ONCE when services are empty)
-- =============================================================================
-- Ensures customer dashboard is usable: 3 vendors, 10 services, 5 completed
-- + 3 pending bookings, reviews. Respects RLS; no frontend/service_role usage.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_pw TEXT;
  -- Fixed UUIDs so we can link services and bookings
  v_v1 UUID := 'd1000001-4000-4000-8000-000000000001'::uuid;
  v_v2 UUID := 'd1000002-4000-4000-8000-000000000002'::uuid;
  v_v3 UUID := 'd1000003-4000-4000-8000-000000000003'::uuid;
  v_c1 UUID := 'd2000001-4000-4000-8000-000000000001'::uuid;
BEGIN
  -- GUARD: Seed only if no services exist (no duplicates)
  IF EXISTS (SELECT 1 FROM public.services LIMIT 1) THEN
    RETURN;
  END IF;

  v_pw := crypt('Password123!', gen_salt('bf'));

  -- -------------------------------------------------------------------------
  -- 1. auth.users: 3 vendors + 1 customer (trigger creates profiles + user_roles)
  -- -------------------------------------------------------------------------
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    (v_v1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.vendor1@example.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rajesh Kumar","role":"vendor"}', now(), now()),
    (v_v2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.vendor2@example.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Sharma","role":"vendor"}', now(), now()),
    (v_v3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.vendor3@example.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Amit Patel","role":"vendor"}', now(), now()),
    (v_c1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.customer@example.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Anil Gupta","role":"customer"}', now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- 2. auth.identities (required for email sign-in)
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  SELECT id, id, id, format('{"sub":"%s","email":"%s"}', id, email)::jsonb, 'email', now(), now(), now()
  FROM auth.users
  WHERE id IN (v_v1, v_v2, v_v3, v_c1)
  ON CONFLICT (id) DO NOTHING;

  -- 3. Profiles/roles created by handle_new_user trigger; optionally enrich
  UPDATE public.profiles SET phone = '+91 9876543210', address = 'Bengaluru, Karnataka' WHERE id = v_v1;
  UPDATE public.profiles SET phone = '+91 9876543211', address = 'Kolkata, WB' WHERE id = v_v2;
  UPDATE public.profiles SET phone = '+91 9876543212', address = 'Ahmedabad, Gujarat' WHERE id = v_v3;

  -- -------------------------------------------------------------------------
  -- 4. SERVICES: 10 rows, is_available = true, linked to 3 vendors
  -- -------------------------------------------------------------------------
  INSERT INTO public.services (id, vendor_id, name, description, category, price, duration_minutes, is_available, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_v1, 'Tap & faucet repair', 'Fix leaking taps and faucets', 'plumbing', 350.00, 45, true, now(), now()),
    (gen_random_uuid(), v_v1, 'Geyser installation', 'New geyser with safety valve', 'plumbing', 1200.00, 90, true, now(), now()),
    (gen_random_uuid(), v_v1, 'Blocked drain clearing', 'Kitchen/bathroom drain', 'plumbing', 800.00, 60, true, now(), now()),
    (gen_random_uuid(), v_v2, 'Wiring & switch repair', 'House wiring and socket replacement', 'electrical', 400.00, 60, true, now(), now()),
    (gen_random_uuid(), v_v2, 'Fan & light fitting', 'Ceiling fan and light installation', 'electrical', 350.00, 45, true, now(), now()),
    (gen_random_uuid(), v_v2, 'AC servicing (split)', 'Gas check, cleaning, filter wash', 'appliance_repair', 600.00, 90, true, now(), now()),
    (gen_random_uuid(), v_v3, 'Door repair & alignment', 'Door hinge and alignment', 'carpentry', 600.00, 60, true, now(), now()),
    (gen_random_uuid(), v_v3, 'Furniture assembly', 'Flat-pack furniture assembly', 'carpentry', 500.00, 90, true, now(), now()),
    (gen_random_uuid(), v_v3, 'Full home deep cleaning', 'Deep clean 2BHK/3BHK', 'cleaning', 2500.00, 240, true, now(), now()),
    (gen_random_uuid(), v_v3, 'Interior wall painting', '2 coats emulsion for 1BHK', 'painting', 4500.00, 240, true, now(), now());
END $$;

-- Collect service IDs and insert bookings (outside DO block so we can use the inserted rows)
DO $$
DECLARE
  v_c1 UUID := 'd2000001-4000-4000-8000-000000000001'::uuid;
  v_svc RECORD;
  v_svc_ids UUID[] := ARRAY[]::UUID[];
  v_bid UUID;
  v_i INT;
  v_completed UUID[] := ARRAY[]::UUID[];
BEGIN
  IF (SELECT COUNT(*) FROM public.bookings) > 0 THEN
    RETURN;
  END IF;

  SELECT array_agg(id ORDER BY created_at) INTO v_svc_ids FROM public.services WHERE vendor_id IN ('d1000001-4000-4000-8000-000000000001'::uuid, 'd1000002-4000-4000-8000-000000000002'::uuid, 'd1000003-4000-4000-8000-000000000003'::uuid);
  IF array_length(v_svc_ids, 1) < 8 THEN
    RETURN;
  END IF;

  -- 5 completed bookings (customer v_c1)
  FOR v_i IN 1..5 LOOP
    v_bid := gen_random_uuid();
    SELECT s.id, s.vendor_id, s.price INTO v_svc FROM public.services s WHERE s.id = v_svc_ids[v_i];
    INSERT INTO public.bookings (id, customer_id, service_id, vendor_id, booking_date, booking_time, status, created_at, updated_at)
    VALUES (v_bid, v_c1, v_svc.id, v_svc.vendor_id, (current_date - (v_i * 7))::date, '10:00'::time, 'completed', now(), now());
    INSERT INTO public.payments (id, booking_id, amount, status, transaction_id, payment_method, created_at)
    VALUES (gen_random_uuid(), v_bid, v_svc.price, 'success', 'txn_' || encode(gen_random_bytes(8), 'hex'), 'razorpay', now());
    v_completed := array_append(v_completed, v_bid);
  END LOOP;

  -- 3 pending bookings
  FOR v_i IN 6..8 LOOP
    SELECT s.id, s.vendor_id INTO v_svc FROM public.services s WHERE s.id = v_svc_ids[v_i];
    INSERT INTO public.bookings (id, customer_id, service_id, vendor_id, booking_date, booking_time, status, created_at, updated_at)
    VALUES (gen_random_uuid(), v_c1, v_svc.id, v_svc.vendor_id, (current_date + v_i)::date, '14:00'::time, 'pending', now(), now());
  END LOOP;

  -- 6. Reviews for completed bookings (rating 3-5)
  FOR v_i IN 1..array_length(v_completed, 1) LOOP
    SELECT b.service_id, b.vendor_id INTO v_svc FROM public.bookings b WHERE b.id = v_completed[v_i];
    INSERT INTO public.reviews (id, booking_id, customer_id, vendor_id, service_id, rating, comment, created_at)
    VALUES (gen_random_uuid(), v_completed[v_i], v_c1, v_svc.vendor_id, v_svc.service_id, (ARRAY[3,4,4,5,5]::smallint[])[v_i], (ARRAY['Good service.', 'On time. Recommended.', 'Satisfied.', 'Excellent!', 'Very professional.']::text[])[v_i], now())
    ON CONFLICT (booking_id) DO NOTHING;
  END LOOP;
END $$;
