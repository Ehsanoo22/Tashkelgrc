-- Enable clients to update their own logistics (needed for Site Readiness Checklist)
CREATE POLICY "Clients update own logistics" 
ON public.portal_logistics 
FOR UPDATE 
USING (
    project_id IN (SELECT id FROM public.portal_projects WHERE client_id = auth.uid())
) 
WITH CHECK (
    project_id IN (SELECT id FROM public.portal_projects WHERE client_id = auth.uid())
);
