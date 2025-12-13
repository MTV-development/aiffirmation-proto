'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const VALID_PASSWORD = '123mtv123';
const COOKIE_NAME = 'prototype_auth';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds (2592000)

export async function validatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirectTo') as string || '/';

  if (password === VALID_PASSWORD) {
    (await cookies()).set(COOKIE_NAME, Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    redirect(redirectTo);
  }

  redirect(`/password?redirectTo=${encodeURIComponent(redirectTo)}&error=1`);
}
