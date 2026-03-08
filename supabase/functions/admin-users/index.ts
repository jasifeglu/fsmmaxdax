import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
    if (!caller) throw new Error('Unauthorized');

    const { data: roleCheck } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();
    if (roleCheck?.role !== 'admin') throw new Error('Unauthorized');

    const { action, ...payload } = await req.json();

    if (action === 'create_user') {
      const { email, full_name, role, password } = payload;
      if (!email || !full_name || !password) throw new Error('Email, name and password are required');
      if (password.length < 8) throw new Error('Password must be at least 8 characters');

      const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });
      if (error) throw error;

      // Update profile
      await supabaseAdmin.from('profiles').update({ full_name }).eq('id', newUser.user.id);

      // Set role (trigger already creates 'technician', update if different)
      if (role && role !== 'technician') {
        await supabaseAdmin.from('user_roles').update({ role }).eq('user_id', newUser.user.id);
      }

      return new Response(JSON.stringify({ user: newUser.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete_user') {
      const { user_id } = payload;
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update_role') {
      const { user_id, role } = payload;
      await supabaseAdmin.from('user_roles').update({ role }).eq('user_id', user_id);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'list_users') {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, created_at');
      const { data: roles } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role');

      const users = (profiles || []).map((p: any) => ({
        ...p,
        role: roles?.find((r: any) => r.user_id === p.id)?.role || 'technician',
      }));

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Unknown action');
  } catch (error: any) {
    console.error('admin-users error:', error);
    const safeMessages: Record<string, string> = {
      'Unauthorized': 'Unauthorized',
      'Email, name and password are required': 'Email, name and password are required',
      'Password must be at least 8 characters': 'Password must be at least 8 characters',
      'Unknown action': 'Unknown action',
    };
    const msg = safeMessages[error.message]
      || (error.message?.includes('already registered') ? 'A user with this email already exists.' : 'An unexpected error occurred.');
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
