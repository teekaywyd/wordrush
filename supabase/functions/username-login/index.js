import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return reply(405, { error: "Method not allowed." });

    try {
        const { username, password } = await req.json();
        if (typeof username !== "string" || typeof password !== "string" ||
            !/^[A-Za-z0-9_]{3,15}$/.test(username) || password.length === 0 || password.length > 256) {
            return reply(400, { error: "Enter a valid username and password." });
        }

        const url = Deno.env.get("SUPABASE_URL");
        const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
        const { data: email, error: lookupError } = await service.rpc("resolve_username_email", {
            input_username: username,
        });
        if (lookupError || !email) return reply(401, { error: "Invalid username or password." });

        const auth = createClient(url, Deno.env.get("SUPABASE_ANON_KEY"));
        const { data, error } = await auth.auth.signInWithPassword({ email, password });
        if (error || !data.session) return reply(401, { error: "Invalid username or password." });
        return reply(200, { session: data.session, user: data.user });
    } catch {
        return reply(400, { error: "Unable to sign in. Check your details and try again." });
    }
});

function reply(status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}
