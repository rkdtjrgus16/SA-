// 읽기 전용 모드: value(평균 별점)만 표시
// 인터랙티브 모드: onChange 전달 시 클릭으로 별점 선택 가능

export default function StarRating({
  value = 0,
  onChange,
  size = 20,
  showNumber = false,
}) {
  const rounded = Math.round(value * 2) / 2; // 0.5 단위 반올림
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === 'function';

  return (
    <span className={`stars ${interactive ? 'stars-interactive' : ''}`}>
      {stars.map((n) => {
        const filled = n <= rounded;
        const half = !filled && n - 0.5 === rounded;
        return (
          <button
            key={n}
            type="button"
            className={`star ${filled ? 'filled' : ''} ${half ? 'half' : ''}`}
            style={{ fontSize: size }}
            onClick={interactive ? () => onChange(n) : undefined}
            tabIndex={interactive ? 0 : -1}
            aria-label={`${n}점`}
            disabled={!interactive}
          >
            {half ? '⯨' : '★'}
          </button>
        );
      })}
      {showNumber && (
        <span className="stars-number">{value ? value.toFixed(1) : '0.0'}</span>
      )}
    </span>
  );
}
