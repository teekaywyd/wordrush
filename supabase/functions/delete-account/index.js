import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {

    // Handle CORS preflight request
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: corsHeaders,
        });
    }

    try {

        const authHeader =
            req.headers.get("Authorization");

        if (!authHeader) {
            return new Response(
                JSON.stringify({
                    error: "NOT AUTHENTICATED",
                }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json",
                    },
                }
            );
        }

        // Client used to identify the logged-in user
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL"),
            Deno.env.get("SUPABASE_ANON_KEY"),
            {
                global: {
                    headers: {
                        Authorization: authHeader,
                    },
                },
            }
        );

        // Get the currently authenticated user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return new Response(
                JSON.stringify({
                    error: "USER NOT FOUND",
                }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json",
                    },
                }
            );
        }

        // Admin client
        // SERVICE_ROLE_KEY stays on the server.
        const adminSupabase = createClient(
            Deno.env.get("SUPABASE_URL"),
            Deno.env.get(
                "SUPABASE_SERVICE_ROLE_KEY"
            )
        );

        // Permanently delete the authenticated user
        const {
            error: deleteError,
        } =
            await adminSupabase.auth.admin.deleteUser(
                user.id
            );

        if (deleteError) {
            return new Response(
                JSON.stringify({
                    error: deleteError.message,
                }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json",
                    },
                }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
            }),
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Content-Type":
                        "application/json",
                },
            }
        );

    } catch (error) {

        return new Response(
            JSON.stringify({
                error: error.message,
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type":
                        "application/json",
                },
            }
        );
    }
});