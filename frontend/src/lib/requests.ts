import { api } from '@/lib/api';
import type {
  AdminDashboardData,
  Charity,
  DashboardData,
  Draw,
  Score,
  Subscription,
  Winner,
} from '@/types/api';

type SuccessResponse<T> = { success: boolean } & T;

const unwrap = <T,>(response: { data: SuccessResponse<T> }) => response.data;

export const authApi = {
  login: async (payload: { email: string; password: string }) => unwrap<{ token: string; user: unknown }>(await api.post('/api/auth/login', payload)),
  signup: async (payload: { fullName: string; email: string; password: string; charityId: string; charityContributionPercent: number }) =>
    unwrap<{ token: string; user: unknown }>(await api.post('/api/auth/signup', payload)),
  me: async () => unwrap<{ user: unknown }>(await api.get('/api/auth/me')),
  updatePreferences: async (payload: { charityId?: string; charityContributionPercent?: number }) =>
    unwrap<{ user: unknown }>(await api.patch('/api/auth/preferences', payload)),
  forgotPassword: async (payload: { email: string }) => unwrap<{ message: string }>(await api.post('/api/auth/forgot-password', payload)),
  resetPassword: async (payload: { token: string; password: string }) => unwrap<{ message: string }>(await api.post('/api/auth/reset-password', payload)),
};

export const charityApi = {
  list: async (q?: string) => unwrap<{ charities: Charity[] }>(await api.get('/api/charities', { params: q ? { q } : undefined })),
  detail: async (slug: string) => unwrap<{ charity: Charity }>(await api.get(`/api/charities/${slug}`)),
  create: async (payload: Partial<Charity>) => unwrap<{ charity: Charity }>(await api.post('/api/charities', payload)),
  update: async (id: string, payload: Partial<Charity>) => unwrap<{ charity: Charity }>(await api.patch(`/api/charities/${id}`, payload)),
  delete: async (id: string) => unwrap<{ message: string }>(await api.delete(`/api/charities/${id}`)),
};

export const dashboardApi = {
  user: async () => unwrap<{ dashboard: DashboardData }>(await api.get('/api/dashboard/me')),
  admin: async () => unwrap<{ dashboard: AdminDashboardData }>(await api.get('/api/dashboard/admin')),
};

export const scoreApi = {
  list: async () => unwrap<{ scores: Score[] }>(await api.get('/api/scores')),
  create: async (payload: { value: number; date: string }) => unwrap<{ score: Score }>(await api.post('/api/scores', payload)),
  update: async (id: string, payload: { value: number }) => unwrap<{ score: Score }>(await api.patch(`/api/scores/${id}`, payload)),
  remove: async (id: string) => unwrap<{ message: string }>(await api.delete(`/api/scores/${id}`)),
};

export const subscriptionApi = {
  me: async () => unwrap<{ subscription: Subscription | null }>(await api.get('/api/subscriptions/me')),
  activate: async (plan: 'MONTHLY' | 'YEARLY') => unwrap<{ subscription: Subscription }>(await api.post('/api/subscriptions/activate', { plan })),
  cancel: async () => unwrap<{ subscription: Subscription }>(await api.patch('/api/subscriptions/cancel')),
};

export const paymentApi = {
  createSubscriptionOrder: async (plan: 'MONTHLY' | 'YEARLY') =>
    unwrap<{ order: { razorpayOrderId: string; amountCents: number; currency: string; plan: 'MONTHLY' | 'YEARLY'; keyId: string } }>(
      await api.post('/api/payments/subscriptions/order', { plan }),
    ),
  verifySubscriptionPayment: async (payload: {
    plan: 'MONTHLY' | 'YEARLY';
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => unwrap<{ subscription: Subscription; duplicate?: boolean }>(await api.post('/api/payments/subscriptions/verify', payload)),
};

export const drawApi = {
  list: async () => unwrap<{ draws: Draw[] }>(await api.get('/api/draws')),
  simulate: async (logic: 'RANDOM' | 'MOST_FREQUENT' | 'LEAST_FREQUENT') => unwrap<{ simulation: { numbers: number[]; totalPoolCents: number; pool5Cents: number; pool4Cents: number; pool3Cents: number; jackpotCarryInCents: number; jackpotCarryOutCents: number; winners: Array<{ userId: string; matchCount: number; tier: string; amountCents: number }> } }>(await api.post('/api/draws/simulate', { logic })),
  publish: async (payload: { logic: 'RANDOM' | 'MOST_FREQUENT' | 'LEAST_FREQUENT'; month?: number; year?: number }) => unwrap<{ draw: Draw }>(await api.post('/api/draws/publish', payload)),
};

export const winnerApi = {
  mine: async () => unwrap<{ winnings: Winner[] }>(await api.get('/api/winners/me')),
  uploadProof: async (winnerId: string, formData: FormData) => unwrap<{ winner: Winner }>(await api.patch(`/api/winners/${winnerId}/proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
  list: async () => unwrap<{ winners: Winner[] }>(await api.get('/api/winners')),
  review: async (winnerId: string, payload: { verificationStatus: 'APPROVED' | 'REJECTED'; payoutStatus?: 'PENDING' | 'PAID' }) => unwrap<{ winner: Winner }>(await api.patch(`/api/winners/${winnerId}/review`, payload)),
};

export const adminApi = {
  users: async (q?: string) => unwrap<{ users: Array<Record<string, unknown>> }>(await api.get('/api/admin/users', { params: q ? { q } : undefined })),
  updateUser: async (userId: string, payload: Record<string, unknown>) => unwrap<{ user: Record<string, unknown> }>(await api.patch(`/api/admin/users/${userId}`, payload)),
  userScores: async (userId: string) => unwrap<{ scores: Score[] }>(await api.get(`/api/admin/users/${userId}/scores`)),
  updateUserScore: async (userId: string, scoreId: string, payload: { value: number }) => unwrap<{ score: Score }>(await api.patch(`/api/admin/users/${userId}/scores/${scoreId}`, payload)),
  subscriptions: async (status?: string) => unwrap<{ subscriptions: Subscription[] }>(await api.get('/api/admin/subscriptions', { params: status ? { status } : undefined })),
  updateSubscription: async (subscriptionId: string, status: string) => unwrap<{ subscription: Subscription }>(await api.patch(`/api/admin/subscriptions/${subscriptionId}/status`, { status })),
  donations: async () => unwrap<{ donations: Array<Record<string, unknown>> }>(await api.get('/api/admin/donations')),
  broadcast: async (payload: { subject: string; message: string }) => unwrap<{ result: unknown }>(await api.post('/api/admin/notifications/broadcast', payload)),
};

export const systemApi = {
  ping: async () => unwrap<{ status: string; time: string }>(await api.get('/api/ping')),
};
