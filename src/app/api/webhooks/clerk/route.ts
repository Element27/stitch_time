import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET in environment variables');
    return new Response('Error: Please add CLERK_WEBHOOK_SECRET to .env.local', {
      status: 500,
    });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(SIGNING_SECRET);

  let evt: WebhookEvent;

  // Verify payload with Svix
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as unknown as WebhookEvent;
  } catch (err) {
    console.error('Error verifying Clerk webhook:', err);
    return new Response('Error: Verification error', {
      status: 400,
    });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Supabase client not initialized. Check NEXT_PUBLIC_SUPABASE_URL.');
    return new Response('Error: Supabase not configured', { status: 500 });
  }

  const eventType = evt.type;

  // 1. User Created / Updated Event
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, created_at, updated_at } = evt.data;

    const primaryEmail = email_addresses && email_addresses.length > 0
      ? email_addresses[0].email_address
      : '';

    const userData = {
      id: id,
      email: primaryEmail,
      first_name: first_name || null,
      last_name: last_name || null,
      avatar_url: image_url || null,
      created_at: created_at ? new Date(created_at).toISOString() : new Date().toISOString(),
      updated_at: updated_at ? new Date(updated_at).toISOString() : new Date().toISOString(),
    };

    const { error } = await supabase.from('users').upsert(userData);

    if (error) {
      console.error(`Error saving user ${id} to Supabase:`, error.message);
      return new Response(`Error syncing user: ${error.message}`, { status: 500 });
    }

    console.log(`Successfully synced user ${id} (${primaryEmail}) to Supabase.`);
  }

  // 2. User Deleted Event
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    if (id) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) {
        console.error(`Error deleting user ${id} from Supabase:`, error.message);
      } else {
        console.log(`Successfully removed user ${id} from Supabase.`);
      }
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
