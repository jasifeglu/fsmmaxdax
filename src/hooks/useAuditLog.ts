import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AuditEntry {
  action: string;
  module: string;
  description: string;
  record_id?: string;
  previous_value?: string;
  new_value?: string;
  reason?: string;
}

export const useAuditLog = () => {
  const { user, role, userName } = useAuth();

  const log = useCallback(
    async (entry: AuditEntry) => {
      if (!user) return;

      const deviceInfo = `${navigator.userAgent.slice(0, 120)}`;

      await supabase.from("audit_logs").insert({
        user_id: user.id,
        user_name: userName || user.email || "",
        user_role: role,
        action: entry.action,
        module: entry.module,
        description: entry.description,
        record_id: entry.record_id || "",
        previous_value: entry.previous_value || "",
        new_value: entry.new_value || "",
        reason: entry.reason || "",
        device_info: deviceInfo,
        ip_address: "",
      });
    },
    [user, role, userName]
  );

  return { log };
};
