import { supabase } from '../supabase';

// 관리자 이메일 목록
const ADMIN_EMAILS = ['rkdtjrgus16@gmail.com', 'demo@user.com'];

function isAdmin(email) {
  return ADMIN_EMAILS.includes(email);
}

function toUser(supabaseUser) {
  if (!supabaseUser) return null;
  return { email: supabaseUser.email, isAdmin: isAdmin(supabaseUser.email) };
}

// Supabase 오류 메시지 → 한국어 변환
function mapError(message = '') {
  if (message.includes('Invalid login credentials'))
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (message.includes('Email not confirmed'))
    return '이메일 인증이 필요합니다. 가입 시 받은 이메일을 확인해 주세요.';
  if (message.includes('User already registered'))
    return '이미 가입된 이메일입니다.';
  if (message.includes('Password should be at least'))
    return '비밀번호는 6자 이상이어야 합니다.';
  if (message.includes('Unable to validate email address'))
    return '유효하지 않은 이메일 형식입니다.';
  if (message.includes('over_email_send_rate_limit') || message.includes('rate limit'))
    return '이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.';
  if (message.includes('signup_disabled'))
    return '현재 회원가입이 비활성화되어 있습니다.';
  if (message.includes('weak_password'))
    return '비밀번호가 너무 단순합니다. 더 복잡한 비밀번호를 사용해 주세요.';
  if (message.includes('Network') || message.includes('fetch'))
    return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.';
  return message;
}

// 이메일 인증 대기 상태를 나타내는 특수 마커
export const EMAIL_PENDING = Symbol('EMAIL_PENDING');

export const supabaseAuth = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(mapError(error.message));
    // 이메일 확인이 필요한 경우 data.session === null
    if (!data.session) {
      return { __type: EMAIL_PENDING, email };
    }
    return toUser(data.user);
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(mapError(error.message));
    return toUser(data.user);
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async current() {
    const { data: { user } } = await supabase.auth.getUser();
    return toUser(user);
  },

  // AuthContext의 onChange 인터페이스와 동일: 콜백을 등록하고 unsubscribe 함수를 반환
  async onChange(cb) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        cb(toUser(session?.user ?? null));
      },
    );
    return () => subscription.unsubscribe();
  },
};
