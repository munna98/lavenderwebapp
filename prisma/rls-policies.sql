-- ══════════════════════════════════════════════════════════════
--  Lavender Auto Parts — Supabase RLS Policies
--  Run this in: Supabase Dashboard → SQL Editor
--  Run AFTER: npx prisma migrate dev (tables must exist first)
-- ══════════════════════════════════════════════════════════════

-- ─── Helper: is the current JWT user an admin? ────────────────
-- We store the role in our own `users` table, keyed by auth.uid()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
      AND role = 'ADMIN'
      AND "isActive" = true
  );
$$;

-- ─── Enable RLS on all tables ────────────────────────────────
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.po_sequence    ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════
--  users
-- ══════════════════════════════════════════════════════════════

-- SELECT: user can see their own row; admins can see all
CREATE POLICY "users_select"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()::text
    OR public.is_admin()
  );

-- INSERT: admin only
CREATE POLICY "users_insert"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- UPDATE: admin only
CREATE POLICY "users_update"
  ON public.users FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: admin only
CREATE POLICY "users_delete"
  ON public.users FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
--  suppliers
-- ══════════════════════════════════════════════════════════════

-- SELECT: any authenticated user
CREATE POLICY "suppliers_select"
  ON public.suppliers FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: admin only
CREATE POLICY "suppliers_insert"
  ON public.suppliers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- UPDATE: admin only
CREATE POLICY "suppliers_update"
  ON public.suppliers FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: admin only
CREATE POLICY "suppliers_delete"
  ON public.suppliers FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════
--  documents
-- ══════════════════════════════════════════════════════════════

-- SELECT: any authenticated user
CREATE POLICY "documents_select"
  ON public.documents FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: any authenticated user (staff create their own POs)
CREATE POLICY "documents_insert"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "createdById");

-- UPDATE: any authenticated user (they can update their own drafts)
--         Sent/Cancelled docs can only be updated by admins
CREATE POLICY "documents_update"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR (auth.uid()::text = "createdById" AND status = 'DRAFT'::"DocumentStatus")
  )
  WITH CHECK (
    public.is_admin()
    OR (auth.uid()::text = "createdById" AND status = 'DRAFT'::"DocumentStatus")
  );

-- DELETE: admin OR creator while still DRAFT
CREATE POLICY "documents_delete"
  ON public.documents FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
    OR (auth.uid()::text = "createdById" AND status = 'DRAFT'::"DocumentStatus")
  );

-- ══════════════════════════════════════════════════════════════
--  document_items
-- ══════════════════════════════════════════════════════════════

-- SELECT: any authenticated user
CREATE POLICY "document_items_select"
  ON public.document_items FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: authenticated user who owns the parent document
CREATE POLICY "document_items_insert"
  ON public.document_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = "documentId"
        AND (d."createdById" = auth.uid()::text OR public.is_admin())
    )
  );

-- UPDATE: same as insert
CREATE POLICY "document_items_update"
  ON public.document_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = "documentId"
        AND (d."createdById" = auth.uid()::text OR public.is_admin())
        AND (d.status = 'DRAFT'::"DocumentStatus" OR public.is_admin())
    )
  );

-- DELETE: admin OR creator's draft
CREATE POLICY "document_items_delete"
  ON public.document_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = "documentId"
        AND (
          public.is_admin()
          OR (d."createdById" = auth.uid()::text AND d.status = 'DRAFT'::"DocumentStatus")
        )
    )
  );

-- ══════════════════════════════════════════════════════════════
--  po_sequence (internal, service role only)
-- ══════════════════════════════════════════════════════════════

-- No authenticated user should read/write this directly — only service role
-- RLS is enabled but no policies are created → effectively blocks all JWT access
-- Our server actions use the service role client (bypasses RLS) to update this

-- ══════════════════════════════════════════════════════════════
--  Seed the PO sequence counter
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.po_sequence (name, current)
VALUES ('po', 0)
ON CONFLICT (name) DO NOTHING;
