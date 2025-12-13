import { validatePassword } from './actions';

export default async function PasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const { redirectTo = '/', error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Aiffirmation</h1>
        <p className="text-gray-600 text-center mb-6">
          Enter password to access the prototype
        </p>
        <form action={validatePassword}>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm mb-4">Invalid password</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
