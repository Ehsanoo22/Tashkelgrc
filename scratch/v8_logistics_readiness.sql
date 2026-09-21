-- Add Site Readiness Checklist to Logistics
ALTER TABLE public.portal_logistics 
ADD COLUMN IF NOT EXISTS site_readiness JSONB DEFAULT '[
  {"id": 1, "task": "Scaffolding erected and inspected", "completed": false},
  {"id": 2, "task": "Crane or lifting equipment available", "completed": false},
  {"id": 3, "task": "Unloading zone cleared and accessible", "completed": false},
  {"id": 4, "task": "Site access permits secured", "completed": false}
]'::jsonb;

-- Ensure portal_logistics is in realtime publication (if not already)
ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_logistics;
