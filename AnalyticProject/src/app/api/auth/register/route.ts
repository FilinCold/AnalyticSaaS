import { signIn } from '@/auth';
import { isCredentialsFailure } from '@/lib/auth/errors';
import { RegisterError, registerUser } from '@/lib/auth/register';

type RegisterBody = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: RegisterBody;

  try {
    body = (await request.json()) as RegisterBody;
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
    const user = await registerUser(body.email, body.password);

    try {
      await signIn('credentials', {
        email: user.email,
        password: body.password,
        redirect: false,
      });
    } catch (error) {
      if (isCredentialsFailure(error)) {
        return Response.json(
          { error: 'Registered but session failed' },
          { status: 500 },
        );
      }
      const detail = error instanceof Error ? error.message : String(error);
      console.error('[auth/register] signIn failed:', error);
      return Response.json(
        {
          error: 'Registered but session failed',
          ...(process.env.NODE_ENV === 'development' ? { detail } : {}),
        },
        { status: 500 },
      );
    }

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof RegisterError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    const detail = error instanceof Error ? error.message : String(error);
    console.error('[auth/register] failed:', error);
    return Response.json(
      {
        error: 'Registration failed',
        ...(process.env.NODE_ENV === 'development' ? { detail } : {}),
      },
      { status: 500 },
    );
  }
}
