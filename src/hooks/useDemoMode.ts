import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "mock_data_enabled")
        .single();
      setIsDemoMode(data?.value === "true");
    };
    check();
    const ch = supabase
      .channel("demo-mode-hook")
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () => check())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return isDemoMode;
};
