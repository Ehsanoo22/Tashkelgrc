-- Drop the restrictive check constraint on document types so admins can use custom labels
ALTER TABLE public.portal_documents DROP CONSTRAINT IF EXISTS portal_documents_type_check;
