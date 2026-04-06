// @ts-nocheck — Deno runtime file: npm: imports and Deno globals are valid at runtime.
import { createClient } from 'npm:@supabase/supabase-js@2'

// Always return HTTP 200 so supabase.functions.invoke exposes the body.
// Errors are indicated by { success: false, error: '...' } in the JSON.
const ok = (data: object) =>
  new Response(JSON.stringify({ success: true, ...data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

const fail = (error: string) =>
  new Response(JSON.stringify({ success: false, error }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return fail('Method not allowed')

    const authorization = req.headers.get('Authorization')
    if (!authorization) return fail('Missing authorization header')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return fail(`Unauthorized: ${authError?.message ?? 'no user'}`)

    const { data: requesterProfile, error: requesterError } = await supabaseAdmin
      .from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (requesterError) return fail(`Profile check failed: ${requesterError.message}`)
    if (requesterProfile?.role !== 'admin') return fail('Forbidden: caller is not admin')

    const { email, password, fullName, phone, role } = await req.json()
    if (!email || !password || !fullName) return fail('email, password, and fullName are required')
    if (password.length < 6) return fail('Password must be at least 6 characters')

    const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (createError || !newUser) return fail(`Auth create failed: ${createError?.message ?? 'unknown'}`)

    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: newUser.id,
      full_name: fullName,
      email,
      phone: phone || null,
      role: role === 'admin' ? 'admin' : 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (profileError) return fail(`Profile upsert failed: ${profileError.message}`)

    return ok({ userId: newUser.id })
  } catch (err) {
    return fail(`Unhandled: ${err?.message ?? String(err)}`)
  }
})
