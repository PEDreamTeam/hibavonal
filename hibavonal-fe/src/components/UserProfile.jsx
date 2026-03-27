import { useUser } from '../hooks/useUser';

function UserProfile({ userId }) {
  const { user, isLoading, isError } = useUser(userId);

  if (isLoading) return <p>Várnunk kell...</p>;
  if (isError) return <p>Valami hiba történt.</p>;

  return (
    <div>
      <h3>{user.name}</h3>
      <h3>{user.email}</h3>
    </div>
  );
}
