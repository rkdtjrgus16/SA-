// 초기 시드 상품 데이터 - localStorage가 비어 있을 때 한 번만 주입됩니다.

export const SEED_PRODUCTS = [
  {
    id: 'p1',
    name: '에어리 무선 이어폰',
    price: 89000,
    image:
      'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp',
    description: '하루 종일 가벼운 착용감과 깨끗한 사운드를 제공하는 무선 이어폰입니다.',
    isHot: true,
    category: '전자',
    stock: 30,
  },
  {
    id: 'p2',
    name: '모던 데스크 램프',
    price: 42000,
    image:
      'https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/1.webp',
    description: '눈이 편안한 3단계 색온도 조절과 USB 충전 포트를 탑재한 LED 램프.',
    isHot: true,
    category: '인테리어',
    stock: 50,
  },
  {
    id: 'p3',
    name: '클래식 캔버스 백팩',
    price: 65000,
    image:
      'https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/1.webp',
    description: '15인치 노트북이 들어가는 데일리 백팩. 발수 코팅 처리.',
    isHot: false,
    category: '패션',
    stock: 20,
  },
  {
    id: 'p4',
    name: '오가닉 코튼 티셔츠',
    price: 24900,
    image:
      'https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/1.webp',
    description: '유기농 면 100%로 부드러운 촉감과 통기성이 우수한 베이직 티셔츠.',
    isHot: true,
    category: '패션',
    stock: 100,
  },
  {
    id: 'p5',
    name: '아로마 디퓨저 세트',
    price: 38000,
    image:
      'https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/1.webp',
    description: '천연 에센셜 오일 3종이 포함된 도자기 디퓨저 세트.',
    isHot: false,
    category: '인테리어',
    stock: 15,
  },
  {
    id: 'p6',
    name: '스테인리스 텀블러',
    price: 19800,
    image:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/1.webp',
    description: '12시간 보온/보냉이 가능한 이중벽 진공 단열 텀블러 500ml.',
    isHot: true,
    category: '생활',
    stock: 80,
  },
  {
    id: 'p7',
    name: '신선 사과 1.5kg',
    price: 18900,
    image:
      'https://cdn.dummyjson.com/product-images/groceries/apple/thumbnail.webp',
    description: '산지 직송 아삭하고 달콤한 국내산 사과. 선물용으로도 인기 만점.',
    isHot: true,
    category: '음식',
    stock: 60,
  },
  {
    id: 'p8',
    name: '국내산 천연 벌꿀 500g',
    price: 24000,
    image:
      'https://cdn.dummyjson.com/product-images/groceries/honey-jar/thumbnail.webp',
    description: '잡초 없는 청정 지역에서 채취한 아카시아 꿀. 첨가물 없는 100% 순수 벌꿀.',
    isHot: false,
    category: '음식',
    stock: 40,
  },
{
    id: 'p10',
    name: '한우 스테이크 200g',
    price: 38000,
    image:
      'https://cdn.dummyjson.com/product-images/groceries/beef-steak/thumbnail.webp',
    description: '1++ 등급 국내산 한우 스테이크. 두툼한 두께로 육즙이 풍부합니다. 냉장 직배송.',
    isHot: true,
    category: '음식',
    stock: 25,
  },
  {
    id: 'p11',
    name: '볶음 견과류 혼합 200g',
    price: 12500,
    image:
      'https://images.unsplash.com/photo-1543158181-1274e5362710?w=400&fit=crop',
    description: '아몬드·캐슈넛·호두·피칸을 황금 비율로 혼합. 무염 저온 볶음 가공.',
    isHot: false,
    category: '음식',
    stock: 70,
  },
];

export const SEED_REVIEWS = [
  {
    id: 'r1',
    productId: 'p1',
    userEmail: 'demo@user.com',
    rating: 5,
    text: '음질이 정말 만족스러워요. 노이즈 캔슬링도 훌륭합니다!',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'r2',
    productId: 'p1',
    userEmail: 'happy@buyer.com',
    rating: 4,
    text: '가격 대비 좋아요. 케이스가 조금 큰 것이 아쉽지만 만족합니다.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'r3',
    productId: 'p4',
    userEmail: 'demo@user.com',
    rating: 5,
    text: '핏도 좋고 너무 부드러워요. 색상별로 다 사고 싶네요.',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
];
