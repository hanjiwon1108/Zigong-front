import { ChartOptions, Plugin } from 'chart.js';

function parseRgb(color: string): [number,number,number] | null {
  if (color.startsWith('#')) {
    const h = color.replace('#','');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  const m = color.match(/[\d.]+/g);
  if (m && m.length >= 3) return [parseInt(m[0]),parseInt(m[1]),parseInt(m[2])];
  return null;
}

// iOS 스타일 도넛 그라데이션 플러그인
export const doughnutGradientPlugin: Plugin<'doughnut'> = {
  id: 'doughnutGradient',
  beforeDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;

    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    const outerR = Math.min(chartArea.width, chartArea.height) / 2;
    const innerR = outerR * 0.78;
    if (outerR <= 0) return;

    meta.data.forEach((arc: any, i: number) => {
      const rawColor = (chart.data.datasets[0].backgroundColor as string[])[i];
      if (!rawColor || typeof rawColor !== 'string') return;
      const rgb = parseRgb(rawColor);
      if (!rgb) return;
      const [r, g, b] = rgb;
      if (isNaN(r) || isNaN(g) || isNaN(b)) return;

      // 방사형 그라데이션 (중심 → 바깥): 안쪽이 밝고 바깥이 선명
      const grad = ctx.createRadialGradient(cx, cy, innerR * 0.7, cx, cy, outerR + 2);
      const ri = Math.min(255, r + 90);
      const gi = Math.min(255, g + 90);
      const bi = Math.min(255, b + 90);
      grad.addColorStop(0,   `rgba(${ri},${gi},${bi},0.45)`);   // 안쪽: 밝고 투명
      grad.addColorStop(0.35,`rgba(${Math.min(255,r+40)},${Math.min(255,g+40)},${Math.min(255,b+40)},0.82)`); // 중간: vivid
      grad.addColorStop(0.7, `rgba(${r},${g},${b},0.94)`);       // 주 색상
      grad.addColorStop(1,   `rgba(${Math.max(0,r-40)},${Math.max(0,g-40)},${Math.max(0,b-40)},0.7)`); // 바깥: 어두움

      (arc as any).options.backgroundColor = grad;
      (arc as any).options.borderColor = `rgba(255,255,255,0.15)`;
      (arc as any).options.borderWidth = 2;
    });
  },
  afterDraw(chart) {
    // 도넛 위에 반투명 흰색 하이라이트 링 오버레이 (iOS 유리 상단 빛 반사)
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    const outerR = Math.min(chartArea.width, chartArea.height) / 2;
    const innerR = outerR * 0.78;
    ctx.save();
    // 상단 반원 하이라이트
    const highlightGrad = ctx.createLinearGradient(cx, cy - outerR, cx, cy + outerR * 0.2);
    highlightGrad.addColorStop(0,   'rgba(255,255,255,0.22)');
    highlightGrad.addColorStop(0.4, 'rgba(255,255,255,0.06)');
    highlightGrad.addColorStop(1,   'rgba(255,255,255,0)');

    ctx.beginPath();
    ctx.arc(cx, cy, outerR - 1, -Math.PI, 0); // 상단 반원
    ctx.arc(cx, cy, innerR + 1, 0, -Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = highlightGrad;
    ctx.fill();
    ctx.restore();
  }
};

const v = (name: string, fallback: string) => {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

const FONT = { family: 'Pretendard, -apple-system, sans-serif', size: 12, weight: 500 };

const tooltip = () => ({
  backgroundColor: v('--bg-card', '#ffffff'),
  titleColor: v('--text-1', '#191f28'),
  bodyColor: v('--text-2', '#4e5968'),
  borderColor: v('--divider', 'rgba(0,0,0,0.06)'),
  borderWidth: 1,
  padding: 12,
  cornerRadius: 12,
  displayColors: false,
  titleFont: { ...FONT, weight: 700 },
  bodyFont: FONT,
});

export const doughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '78%',
  rotation: -90,
  animation: {
    duration: 1100,
    easing: 'easeOutQuart',
    animateRotate: true,
    animateScale: true,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltip(),
      callbacks: {
        label: ctx => ` ${ctx.label}  ${(ctx.parsed as number).toLocaleString('ko-KR')}원`,
      }
    }
  },
  elements: {
    arc: {
      borderJoinStyle: 'round',
      borderWidth: 4,
      hoverOffset: 10,
    }
  }
};

export const barOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 650,
    easing: 'easeOutQuart'
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltip(),
      callbacks: { label: ctx => ` ${(ctx.parsed.y ?? 0).toLocaleString('ko-KR')}원` }
    }
  },
  scales: {
    x: {
      border: { display: false },
      ticks: { color: () => v('--text-3', '#8b95a1'), font: FONT, padding: 8 },
      grid: { display: false }
    },
    y: {
      beginAtZero: true,
      border: { display: false },
      ticks: {
        color: () => v('--text-3', '#8b95a1'),
        font: FONT,
        padding: 8,
        maxTicksLimit: 4,
        callback: val => `${(+val / 10000).toFixed(0)}만`
      },
      grid: { color: () => v('--divider', 'rgba(0,0,0,0.06)'), drawTicks: false }
    }
  }
};

export const lineOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 650,
    easing: 'easeOutQuart'
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltip(),
      callbacks: { label: ctx => ` ${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString('ko-KR')}원` }
    }
  },
  scales: {
    x: {
      border: { display: false },
      ticks: { color: () => v('--text-3', '#8b95a1'), font: FONT, padding: 8 },
      grid: { display: false }
    },
    y: {
      border: { display: false },
      ticks: {
        color: () => v('--text-3', '#8b95a1'),
        font: FONT,
        padding: 8,
        maxTicksLimit: 4,
        callback: val => {
          const n = +val;
          if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
          if (Math.abs(n) >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}천만`;
          if (Math.abs(n) >= 10_000) return `${(n / 10_000).toFixed(0)}만`;
          return `${n.toLocaleString('ko-KR')}`;
        }
      },
      grid: { color: () => v('--divider', 'rgba(0,0,0,0.06)'), drawTicks: false }
    }
  }
};
