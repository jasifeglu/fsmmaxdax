
-- 1. Ticket comments / discussions table
CREATE TABLE public.ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  user_role text NOT NULL DEFAULT 'technician',
  parent_id uuid REFERENCES public.ticket_comments(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  mentions text[] DEFAULT '{}',
  is_question boolean NOT NULL DEFAULT false,
  requires_response boolean NOT NULL DEFAULT false,
  is_resolved boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  is_urgent boolean NOT NULL DEFAULT false,
  is_edited boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_by uuid,
  attachment_urls text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_comments_ticket ON public.ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_parent ON public.ticket_comments(parent_id);

ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "Admin can manage all comments" ON public.ticket_comments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Coordinator: can manage comments on tickets they can see
CREATE POLICY "Coordinator can manage comments" ON public.ticket_comments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'coordinator'));

-- Technicians: can view comments on assigned tickets
CREATE POLICY "Technicians can view comments on assigned tickets" ON public.ticket_comments FOR SELECT TO authenticated
  USING (ticket_id IN (SELECT id FROM public.tickets WHERE assigned_to = auth.uid()));

-- Technicians: can insert own comments on assigned tickets
CREATE POLICY "Technicians can add comments on assigned tickets" ON public.ticket_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND ticket_id IN (SELECT id FROM public.tickets WHERE assigned_to = auth.uid()));

-- Technicians: can update own comments only
CREATE POLICY "Technicians can update own comments" ON public.ticket_comments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND NOT has_role(auth.uid(), 'admin') AND NOT has_role(auth.uid(), 'coordinator'));

-- Enable realtime on notifications and ticket_comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_comments;
