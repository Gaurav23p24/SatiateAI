import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY, {
  auth: { detectSessionInUrl: true },
});

export async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/auth/callback.html' },
  });
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.replace('/');
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
