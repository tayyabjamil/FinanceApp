import * as WebBrowser from 'expo-web-browser';
import { SecureStoreAdapter } from './storage';
import { supabase } from './supabase';

// ─── Constants ───────────────────────────────────────────────────────────────

const CLIENT_ID = process.env.EXPO_PUBLIC_TRUELAYER_CLIENT_ID!;
const REDIRECT_URI = 'financeaiapp://truelayer-callback';
const AUTH_URL = 'https://auth.truelayer-sandbox.com';
const DATA_URL = 'https://sandbox.truelayer.com/data/v1';
const STORAGE_KEY = 'truelayer_tokens';

const SCOPES = [
  'accounts',
  'balance',
  'transactions',
  'offline_access', // enables refresh token
].join(' ');

// ─── Types ───────────────────────────────────────────────────────────────────

export type TrueLayerTokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix timestamp ms
};

export type Account = {
  account_id: string;
  account_type: string;
  display_name: string;
  currency: string;
  account_number: { iban?: string; number?: string; sort_code?: string };
  provider: { display_name: string; logo_uri: string };
};

export type Balance = {
  currency: string;
  available: number;
  current: number;
  overdraft?: number;
  update_timestamp: string;
};

export type Transaction = {
  transaction_id: string;
  timestamp: string;
  description: string;
  amount: number;
  currency: string;
  transaction_type: string;
  transaction_category: string;
  merchant_name?: string;
  running_balance?: { amount: number; currency: string };
};

// ─── Token Storage ───────────────────────────────────────────────────────────

async function saveTokens(tokens: TrueLayerTokens): Promise<void> {
  await SecureStoreAdapter.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

async function loadTokens(): Promise<TrueLayerTokens | null> {
  const raw = await SecureStoreAdapter.getItem(STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as TrueLayerTokens;
}

export async function clearTokens(): Promise<void> {
  await SecureStoreAdapter.removeItem(STORAGE_KEY);
}

// ─── Token Refresh ───────────────────────────────────────────────────────────

async function refreshTokens(refresh_token: string): Promise<TrueLayerTokens> {
  const { data, error } = await supabase.functions.invoke('truelayer-token-exchange', {
    body: { action: 'refresh', refresh_token },
  });

  if (error) throw new Error(`Token refresh failed: ${error.message}`);

  const tokens: TrueLayerTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  await saveTokens(tokens);
  return tokens;
}

async function getValidAccessToken(): Promise<string> {
  const tokens = await loadTokens();
  if (!tokens) throw new Error('Not connected to bank. Please link your account.');

  // Refresh 60 seconds before expiry
  if (Date.now() >= tokens.expires_at - 60_000) {
    const refreshed = await refreshTokens(tokens.refresh_token);
    return refreshed.access_token;
  }

  return tokens.access_token;
}

// ─── OAuth Flow ───────────────────────────────────────────────────────────────

export async function connectBank(): Promise<void> {
  const authUrl =
    `${AUTH_URL}/?` +
    new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      providers: 'uk-ob-all uk-oauth-all', // all sandbox banks
    }).toString();

  console.log('TrueLayer authUrl:', authUrl);
  const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

  if (result.type !== 'success') {
    throw new Error('Bank connection cancelled.');
  }

  const url = new URL(result.url);
  const code = url.searchParams.get('code');
  if (!code) throw new Error('No auth code returned from TrueLayer.');

  // Exchange code for tokens via Edge Function (client_secret stays server-side)
  const { data, error } = await supabase.functions.invoke('truelayer-token-exchange', {
    body: { action: 'exchange', code },
  });

  if (error) throw new Error(`Token exchange failed: ${error.message}`);

  const tokens: TrueLayerTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  await saveTokens(tokens);
}

export async function isBankConnected(): Promise<boolean> {
  const tokens = await loadTokens();
  return tokens !== null;
}

// ─── Data API ─────────────────────────────────────────────────────────────────

async function trueLayerGet<T>(path: string): Promise<T> {
  const accessToken = await getValidAccessToken();
  const response = await fetch(`${DATA_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`TrueLayer API error ${response.status}: ${JSON.stringify(err)}`);
  }

  const json = await response.json();
  return json.results as T;
}

export async function getAccounts(): Promise<Account[]> {
  return trueLayerGet<Account[]>('/accounts');
}

export async function getBalance(accountId: string): Promise<Balance> {
  const results = await trueLayerGet<Balance[]>(`/accounts/${accountId}/balance`);
  return results[0];
}

export async function getTransactions(
  accountId: string,
  from?: Date,
  to?: Date,
): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from.toISOString());
  if (to) params.set('to', to.toISOString());
  const query = params.toString() ? `?${params.toString()}` : '';
  return trueLayerGet<Transaction[]>(`/accounts/${accountId}/transactions${query}`);
}

// Fetches accounts + balances + transactions for all accounts in one call
export async function getAllBankingData(): Promise<
  { account: Account; balance: Balance; transactions: Transaction[] }[]
> {
  const accounts = await getAccounts();

  return Promise.all(
    accounts.map(async (account) => {
      const [balance, transactions] = await Promise.all([
        getBalance(account.account_id),
        getTransactions(account.account_id),
      ]);
      return { account, balance, transactions };
    }),
  );
}
