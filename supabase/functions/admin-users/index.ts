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

    // Get caller name for logging
    const getCallerName = async () => {
      const { data: p } = await supabaseAdmin.from('profiles').select('full_name').eq('id', caller.id).single();
      return p?.full_name || caller.email || 'Admin';
    };

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

      await supabaseAdmin.from('profiles').update({ full_name }).eq('id', newUser.user.id);

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
      
      // Get ban status from auth
      const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
      const banMap: Record<string, boolean> = {};
      (authUsers || []).forEach((u: any) => {
        banMap[u.id] = !!u.banned_until && new Date(u.banned_until) > new Date();
      });

      const users = (profiles || []).map((p: any) => ({
        ...p,
        role: roles?.find((r: any) => r.user_id === p.id)?.role || 'technician',
        is_disabled: banMap[p.id] || false,
      }));

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'reset_password') {
      const { user_id, temp_password, reason } = payload;
      if (!user_id || !temp_password) throw new Error('User ID and temporary password are required');
      if (temp_password.length < 8) throw new Error('Temporary password must be at least 8 characters');

      // Get target user name
      const { data: targetProfile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', user_id).single();
      const targetName = targetProfile?.full_name || 'Unknown';

      // Update password
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, { password: temp_password });
      if (error) throw error;

      // Log the action
      const callerName = await getCallerName();
      await supabaseAdmin.from('password_reset_logs').insert({
        admin_id: caller.id,
        admin_name: callerName,
        target_user_id: user_id,
        target_user_name: targetName,
        action: 'reset',
        reason: reason || '',
      });

      // Create notification for the user
      await supabaseAdmin.from('notifications').insert({
        user_id: user_id,
        title: 'Password Reset',
        message: 'Your password has been reset by an administrator. Please login with your new temporary password and change it immediately.',
        type: 'warning',
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'disable_user') {
      const { user_id } = payload;
      // Ban user until far future
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        ban_duration: '876000h', // ~100 years
      });
      if (error) throw error;

      const { data: targetProfile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', user_id).single();
      const callerName = await getCallerName();
      await supabaseAdmin.from('password_reset_logs').insert({
        admin_id: caller.id,
        admin_name: callerName,
        target_user_id: user_id,
        target_user_name: targetProfile?.full_name || 'Unknown',
        action: 'disable',
      });

      await supabaseAdmin.from('notifications').insert({
        user_id: user_id,
        title: 'Account Disabled',
        message: 'Your account has been disabled by an administrator. Contact your admin for more information.',
        type: 'error',
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'enable_user') {
      const { user_id } = payload;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        ban_duration: 'none',
      });
      if (error) throw error;

      const { data: targetProfile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', user_id).single();
      const callerName = await getCallerName();
      await supabaseAdmin.from('password_reset_logs').insert({
        admin_id: caller.id,
        admin_name: callerName,
        target_user_id: user_id,
        target_user_name: targetProfile?.full_name || 'Unknown',
        action: 'enable',
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_reset_logs') {
      const { data: logs } = await supabaseAdmin
        .from('password_reset_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      return new Response(JSON.stringify({ logs: logs || [] }), {
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
      'User ID and temporary password are required': 'User ID and temporary password are required',
      'Temporary password must be at least 8 characters': 'Temporary password must be at least 8 characters',
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
