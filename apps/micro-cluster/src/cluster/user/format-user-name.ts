export interface FormatUserNameInput {
  username: string;
  email: string;
  alias_name?: string | null;
  profile?: {
    firstname?: string | null;
    middlename?: string | null;
    lastname?: string | null;
  } | null;
}

export function formatUserName(user: FormatUserNameInput): string {
  const parts = [user.profile?.firstname, user.profile?.middlename, user.profile?.lastname]
    .map((p) => (p ?? '').trim())
    .filter((p) => p.length > 0);
  if (parts.length > 0) return parts.join(' ');

  const alias = (user.alias_name ?? '').trim();
  if (alias.length > 0) return alias;

  const username = (user.username ?? '').trim();
  if (username.length > 0) return username;

  return user.email;
}
