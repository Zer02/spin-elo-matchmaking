// server/api/leagues/create.post.ts
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Not authenticated' })

  const body = await readBody(event)
  const { name, description, isPublic } = body

  if (!name?.trim()) {
    throw createError({ statusCode: 400, message: 'League name required' })
  }

  const client = serverSupabaseClient(event)

  // Generate a unique slug
  let slug = slugify(name)
  const { count } = await client
    .from('leagues')
    .select('id', { count: 'exact', head: true })
    .like('slug', `${slug}%`)

  if (count && count > 0) slug = `${slug}-${count}`

  const { data: league, error } = await client
    .from('leagues')
    .insert({
      owner_id:    user.id,
      name:        name.trim(),
      slug,
      description: description?.trim() || null,
      is_public:   isPublic !== false,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  // Auto-add the owner as first member
  await client.from('league_members').insert({
    league_id:  league.id,
    profile_id: user.id,
  })

  return { slug: league.slug }
})
