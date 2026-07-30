import { signIn } from '@/auth';
import { isCredentialsFailure } from '@/lib/auth/errors';

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    return Response.json(
      { error: 'email and password are required' },
      { status: 400 },
    );
  }

  try {
    await signIn('credentials', {
      email: body.email,
      password: body.password,
      redirect: false,
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (isCredentialsFailure(error)) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    const detail = error instanceof Error ? error.message : String(error);
    console.error('[auth/login] failed:', error);
    return Response.json(
      {
        error: 'Login failed',
        ...(process.env.NODE_ENV === 'development' ? { detail } : {}),
      },
      { status: 500 },
    );
  }
}
