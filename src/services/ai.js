// OpenAI 서비스 래퍼
// ─────────────────────────────────────────────────────────────
// ⚠️ 보안 주의:
// 이 모듈은 학습용 데모이므로 브라우저에서 직접 OpenAI 를 호출합니다
// (`dangerouslyAllowBrowser: true`). 운영 환경에서는 반드시
// Firebase Cloud Functions / 백엔드 프록시를 거쳐 키를 숨겨야 합니다.
//
// 키 우선순위:
//   1) .env 파일의 VITE_OPENAI_API_KEY  (가장 권장 - 키만 넣으면 바로 동작)
//   2) /settings 페이지에서 입력한 값 (localStorage 에 저장)
// ─────────────────────────────────────────────────────────────

import OpenAI from 'openai';

const KEY_STORAGE = 'shop:openai-key';
const MODEL_STORAGE = 'shop:openai-model';
const DEFAULT_MODEL = 'gpt-4o-mini';

// .env 의 자리표시자 값은 "키 없음"으로 취급
const PLACEHOLDER_KEY = '여기에_키_붙여넣기';

const ENV_KEY = (import.meta.env.VITE_OPENAI_API_KEY || '').trim();
const ENV_MODEL = (import.meta.env.VITE_OPENAI_MODEL || '').trim();

function envKeyValid() {
  return !!ENV_KEY && ENV_KEY !== PLACEHOLDER_KEY;
}

export function isEnvKey() {
  return envKeyValid();
}

export function getApiKey() {
  if (envKeyValid()) return ENV_KEY;
  return localStorage.getItem(KEY_STORAGE) || '';
}

export function setApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem(KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(KEY_STORAGE);
  }
}

export function getModel() {
  return (
    localStorage.getItem(MODEL_STORAGE) || ENV_MODEL || DEFAULT_MODEL
  );
}

export function setModel(model) {
  if (model && model.trim()) {
    localStorage.setItem(MODEL_STORAGE, model.trim());
  } else {
    localStorage.removeItem(MODEL_STORAGE);
  }
}

export function hasApiKey() {
  return !!getApiKey();
}

function getClient() {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      'OpenAI API 키가 설정되지 않았습니다. .env 파일의 VITE_OPENAI_API_KEY 에 키를 입력하고 서버를 재시작하거나, 우측 상단의 "설정" 페이지에서 키를 입력해 주세요.',
    );
  }
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

// 안전한 JSON 파싱
function safeJSON(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // ```json ... ``` 형태로 감싸진 경우 처리
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) {
      try {
        return JSON.parse(m[1]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ─── 1) 상품 설명 자동 생성 ────────────────────────────────
export async function generateProductDescription({
  name,
  category,
  price,
  hints = '',
}) {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: getModel(),
    temperature: 0.8,
    messages: [
      {
        role: 'system',
        content:
          '당신은 한국어 쇼핑몰의 카피라이터입니다. 상품의 핵심 매력을 살린 2~3문장의 상품 설명을 작성합니다. 과장된 표현이나 이모지는 사용하지 않고, 자연스럽고 친근한 톤으로 작성하세요.',
      },
      {
        role: 'user',
        content: `상품명: ${name}
카테고리: ${category || '기타'}
가격: ${price ? price.toLocaleString() + '원' : '미정'}
${hints ? '추가 특징: ' + hints : ''}

위 정보로 매력적인 상품 설명을 2~3문장으로 작성해 주세요. 따옴표나 머리말 없이 본문만 출력하세요.`,
      },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() || '';
}

// ─── 2) 리뷰 요약 ─────────────────────────────────────────
export async function summarizeReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    return { summary: '', pros: [], cons: [], reviewCount: 0 };
  }

  const client = getClient();
  const reviewsText = reviews
    .map(
      (r, i) =>
        `${i + 1}. (별점 ${r.rating}점) ${r.text}`,
    )
    .join('\n');

  const completion = await client.chat.completions.create({
    model: getModel(),
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          '당신은 한국어 쇼핑몰의 리뷰 분석 도우미입니다. 입력된 리뷰들을 분석하여 다음 JSON 형식으로만 응답하세요: {"summary": "한 줄 요약 (1~2문장)", "pros": ["장점1", "장점2", ...], "cons": ["단점1", "단점2", ...]}. pros 와 cons 는 각각 최대 3개, 명사구나 짧은 문장으로 작성하세요. 단점이 없으면 빈 배열을 반환하세요.',
      },
      {
        role: 'user',
        content: `다음은 한 상품의 리뷰입니다. 종합 분석을 JSON 으로 응답해 주세요.\n\n${reviewsText}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  const parsed = safeJSON(raw) || {};
  return {
    summary: parsed.summary || '',
    pros: Array.isArray(parsed.pros) ? parsed.pros.slice(0, 5) : [],
    cons: Array.isArray(parsed.cons) ? parsed.cons.slice(0, 5) : [],
    reviewCount: reviews.length,
  };
}

// ─── 3) AI 상품 추천 (자연어 → 상품 ID + 설명) ───────────
export async function recommendProducts({ userMessage, products }) {
  const client = getClient();

  // 상품 카탈로그를 LLM 에게 컴팩트하게 전달
  const catalog = products
    .map(
      (p) =>
        `- id:${p.id} | ${p.name} | ${p.category || '기타'} | ${p.price.toLocaleString()}원${p.isHot ? ' | HOT' : ''} | ${(p.description || '').slice(0, 60)}`,
    )
    .join('\n');

  const completion = await client.chat.completions.create({
    model: getModel(),
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `당신은 한국어 쇼핑몰의 친절한 AI 큐레이터입니다.
사용자의 요청을 듣고 아래 상품 카탈로그에서 가장 적합한 상품 1~3개를 추천하세요.
반드시 다음 JSON 형식으로만 응답하세요:
{
  "message": "사용자에게 보여줄 친근한 답변 (한 줄, 추천 이유 포함)",
  "recommendations": [
    { "id": "상품id", "reason": "왜 이 상품을 추천하는지 한 문장" }
  ]
}
카탈로그에 없는 id 는 절대 만들지 마세요. 추천할 만한 상품이 없으면 recommendations 를 빈 배열로 두고 message 에 그 이유를 알려주세요.

[상품 카탈로그]
${catalog}`,
      },
      { role: 'user', content: userMessage },
    ],
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  const parsed = safeJSON(raw) || {};
  const validIds = new Set(products.map((p) => p.id));
  const recs = Array.isArray(parsed.recommendations)
    ? parsed.recommendations.filter((r) => r && validIds.has(r.id)).slice(0, 3)
    : [];
  return {
    message: parsed.message || '추천을 가져오지 못했어요. 다시 시도해 주세요.',
    recommendations: recs.map((r) => ({
      product: products.find((p) => p.id === r.id),
      reason: r.reason || '',
    })),
  };
}

// ─── 4) 고객 응대 도우미 (다중 턴 대화) ─────────────────
// 배송/반품/결제/회원 등 일반적인 CS 질문에 답하는 챗봇.
// 자체 정책이 들어 있는 system 프롬프트 + 대화 히스토리를 함께 전달합니다.
const SHOP_POLICY = `[마이샵 운영 정책]
- 배송: 평일 14시 이전 주문은 당일 출고, 평균 1~3일 내 도착 (도서·산간 +1~2일).
- 무료배송 기준: 50,000원 이상 주문 시 무료, 그 미만은 배송비 3,000원.
- 교환/반품: 상품 수령 후 7일 이내 가능. 단순 변심은 왕복 배송비 6,000원 고객 부담. 상품 불량/오배송은 무료.
- 환불: 반품 수거 확인 후 3영업일 이내 결제 수단으로 환불.
- 결제 수단: 신용/체크카드, 무통장입금, 카카오페이, 네이버페이.
- 회원: 가입 시 별도 비용 없음, 이메일/비밀번호로 가입 (데모에서는 demo@user.com / demo1234 로 로그인 가능).
- 고객센터 운영: 평일 10:00 ~ 18:00 (점심 12:00 ~ 13:00). 이메일 help@myshop.demo.
- AI 추천: 챗봇의 "상품 추천" 탭에서 자연어로 원하는 상품을 말하면 카탈로그에서 골라드립니다.`;

export async function customerServiceChat(history) {
  // history: [{ role: 'user' | 'assistant', content: string }, ...]
  const client = getClient();

  const messages = [
    {
      role: 'system',
      content: `당신은 한국어 인터넷 쇼핑몰 "마이샵"의 친절하고 정확한 CS 상담사입니다.
아래의 운영 정책을 기준으로 답하고, 정책에 없는 내용은 추측하지 말고
"정확한 안내가 필요하시면 help@myshop.demo 로 문의 주세요" 라고 안내하세요.
답변은 2~4문장으로 간결하게, 필요하면 줄바꿈으로 보기 좋게 정리하세요.
주문번호·개인정보는 절대 요구하지 말고, 일반적인 안내만 제공합니다.
상품 추천 요청이 들어오면 "오른쪽 위의 '상품 추천' 탭으로 전환해 주세요" 라고 안내하세요.

${SHOP_POLICY}`,
    },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  const completion = await client.chat.completions.create({
    model: getModel(),
    temperature: 0.5,
    messages,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
}
