import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
    "https://mejunloxleohvniwprfl.supabase.co";

const supabasePublishableKey =
    "sb_publishable_3dZ1g6klbui5PMA07OiV0g_ZzyWH7eH";


export const supabase =
    createClient(
        supabaseUrl,
        supabasePublishableKey
    );