import { Component, Input } from '@angular/core';
import { Category, CATEGORY_COLORS } from '../model/types';

@Component({
  selector: 'ui-category-tag',
  standalone: true,
  template: `
    <span class="icon-wrap" [style.background]="bgColor" [style.color]="color">
      <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        @switch (category) {

          @case ('식비') {
            <!-- Bowl with chopsticks / 밥그릇 + 젓가락 -->
            <g fill="currentColor">
              <!-- 그릇 몸통 -->
              <path d="M4 12 Q4 19 12 19 Q20 19 20 12 Z"/>
              <!-- 그릇 윗 타원 -->
              <ellipse cx="12" cy="12" rx="8" ry="2"/>
              <!-- 밥 (그릇 안 흰색 돔) -->
              <path d="M6.5 12 Q6.5 15.5 12 15.5 Q17.5 15.5 17.5 12 Z" fill="white" opacity="0.25"/>
              <!-- 젓가락 왼쪽 -->
              <rect x="8" y="3" width="1.3" height="8" rx="0.65" fill="currentColor" opacity="0.75"/>
              <!-- 젓가락 오른쪽 -->
              <rect x="14.7" y="3" width="1.3" height="8" rx="0.65" fill="currentColor" opacity="0.75"/>
              <!-- 그릇 하이라이트 -->
              <path d="M7 13.5 Q9 15 12 15" stroke="white" stroke-width="0.8" fill="none" opacity="0.3" stroke-linecap="round"/>
            </g>
          }

          @case ('배달') {
            <!-- 배달 오토바이 옆면 — 바퀴 2개 + 차체 + 박스 -->
            <g fill="currentColor">
              <!-- 뒷바퀴 -->
              <circle cx="6.5" cy="16.5" r="3.2"/>
              <circle cx="6.5" cy="16.5" r="1.4" fill="none" stroke="white" stroke-width="0.7" opacity="0.3"/>
              <!-- 앞바퀴 -->
              <circle cx="17.5" cy="16.5" r="3.2"/>
              <circle cx="17.5" cy="16.5" r="1.4" fill="none" stroke="white" stroke-width="0.7" opacity="0.3"/>
              <!-- 차체 프레임 -->
              <path d="M6.5 14.5 L9.5 10 L14.5 10 L17.5 14.5 Z" opacity="0.9"/>
              <!-- 배달 박스 -->
              <rect x="8.5" y="6" width="7" height="5" rx="1.2"/>
              <!-- 박스 중앙선 -->
              <line x1="12" y1="6" x2="12" y2="11" stroke="white" stroke-width="0.9" opacity="0.35"/>
              <!-- 핸들바 -->
              <path d="M16 10.5 L19 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="19" cy="8" r="1.2"/>
              <!-- 시트 -->
              <path d="M9.5 10 Q12 9 14.5 10" stroke="white" stroke-width="1.4" fill="none" opacity="0.4" stroke-linecap="round"/>
            </g>
          }

          @case ('카페') {
            <!-- 커피 머그컵 — 몸통 + 손잡이 + 증기 두 줄기 + 받침 -->
            <g fill="currentColor">
              <!-- 증기 왼쪽 -->
              <path d="M9 5.5 Q8 4 9 3 Q10 2 9 1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.5"/>
              <!-- 증기 오른쪽 -->
              <path d="M13 5.5 Q12 4 13 3 Q14 2 13 1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.5"/>
              <!-- 컵 몸통 -->
              <path d="M5 8 L6.2 18.5 Q6.3 19.5 7.3 19.5 L16.7 19.5 Q17.7 19.5 17.8 18.5 L19 8 Z"/>
              <!-- 손잡이 -->
              <path d="M19 11 Q22.5 11 22.5 14 Q22.5 17 19 17" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>
              <!-- 컵 윗면 (타원) -->
              <ellipse cx="12" cy="8" rx="7" ry="1.4" opacity="0.45"/>
              <!-- 컵 받침 접시 -->
              <ellipse cx="12" cy="20.5" rx="7.5" ry="1.2"/>
              <!-- 안쪽 하이라이트 -->
              <path d="M7.5 10 Q8 16 9 18" stroke="white" stroke-width="1" fill="none" opacity="0.2" stroke-linecap="round"/>
            </g>
          }

          @case ('쇼핑') {
            <!--
              쇼핑백 — 손잡이 두 개 달린 가방, 밑이 둥근 직사각형
            -->
            <g fill="currentColor">
              <!-- 가방 몸통 -->
              <path d="M5 9 L5.8 20 Q5.9 21 7 21 L17 21 Q18.1 21 18.2 20 L19 9 Z"/>
              <!-- 상단 바 -->
              <rect x="4" y="8" width="16" height="2" rx="1"/>
              <!-- 왼쪽 손잡이 -->
              <path d="M8.5 8 Q8.5 4.5 10 3.8 Q11 3.3 11.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
              <!-- 오른쪽 손잡이 -->
              <path d="M15.5 8 Q15.5 4.5 14 3.8 Q13 3.3 12.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
              <!-- 가방 하이라이트 라인 -->
              <path d="M9 13 Q9 15 12 15 Q15 15 15 13" stroke="white" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.3"/>
            </g>
          }

          @case ('교통') {
            <!--
              지하철/버스 정면 + 두 개 창문
            -->
            <g fill="currentColor">
              <!-- 차체 -->
              <rect x="4" y="5" width="16" height="13" rx="3.5"/>
              <!-- 창문 왼쪽 -->
              <rect x="6" y="8" width="4.5" height="4" rx="1.5" fill="white" opacity="0.75"/>
              <!-- 창문 오른쪽 -->
              <rect x="13.5" y="8" width="4.5" height="4" rx="1.5" fill="white" opacity="0.75"/>
              <!-- 전면 불빛 두 개 -->
              <ellipse cx="8" cy="15.5" rx="1.3" ry="0.9" fill="white" opacity="0.9"/>
              <ellipse cx="16" cy="15.5" rx="1.3" ry="0.9" fill="white" opacity="0.9"/>
              <!-- 중앙 노선 라인 -->
              <rect x="10.5" y="9.5" width="3" height="1" rx="0.5" fill="white" opacity="0.4"/>
              <!-- 바퀴 왼쪽 -->
              <circle cx="7.5" cy="20" r="1.8" fill="currentColor"/>
              <!-- 바퀴 오른쪽 -->
              <circle cx="16.5" cy="20" r="1.8" fill="currentColor"/>
            </g>
          }

          @case ('구독 서비스') {
            <!--
              스트리밍 플레이버튼 — 둥근 TV 화면 + 삼각 재생
            -->
            <g fill="currentColor">
              <!-- TV/화면 프레임 -->
              <rect x="2" y="4" width="20" height="14" rx="3"/>
              <!-- 화면 안쪽 (어두운 영역) -->
              <rect x="3.5" y="5.5" width="17" height="11" rx="2" fill="white" opacity="0.1"/>
              <!-- 재생 삼각형 -->
              <path d="M10 8.5 L10 15.5 L17 12 Z" fill="white" opacity="0.9"/>
              <!-- 스탠드 -->
              <rect x="9.5" y="18" width="5" height="1.5" rx="0.75"/>
              <rect x="7" y="19.5" width="10" height="1.3" rx="0.65"/>
            </g>
          }

          @case ('문화') {
            <!--
              영화 필름 클래퍼보드
            -->
            <g fill="currentColor">
              <!-- 보드 몸통 -->
              <rect x="3" y="9" width="18" height="13" rx="2.5"/>
              <!-- 클래퍼 윗면 -->
              <rect x="3" y="6" width="18" height="4" rx="2"/>
              <!-- 클래퍼 사선 줄무늬 -->
              <clipPath id="cp">
                <rect x="3" y="6" width="18" height="4" rx="2"/>
              </clipPath>
              <g clip-path="url(#cp)" fill="white" opacity="0.35">
                <rect x="3" y="6" width="3" height="4" transform="skewX(-15)"/>
                <rect x="9" y="6" width="3" height="4" transform="skewX(-15)"/>
                <rect x="15" y="6" width="3" height="4" transform="skewX(-15)"/>
              </g>
              <!-- 재생 삼각형 -->
              <path d="M10 13 L10 19 L16.5 16 Z" fill="white" opacity="0.8"/>
            </g>
          }

          @case ('미용') {
            <!--
              가위 — 두 링 + 두 날
            -->
            <g fill="currentColor">
              <!-- 왼쪽 링 -->
              <circle cx="6.5" cy="7.5" r="3"/>
              <circle cx="6.5" cy="7.5" r="1.3" fill="none" stroke="white" stroke-width="1.2" opacity="0.6"/>
              <!-- 오른쪽 링 -->
              <circle cx="6.5" cy="16.5" r="3"/>
              <circle cx="6.5" cy="16.5" r="1.3" fill="none" stroke="white" stroke-width="1.2" opacity="0.6"/>
              <!-- 날(블레이드) -->
              <path d="M8.8 8.8 L20 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
              <path d="M8.8 15.2 L20 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
              <!-- 교차점 -->
              <circle cx="14.5" cy="12" r="1" fill="currentColor" opacity="0.5"/>
            </g>
          }

          @case ('의료') {
            <!--
              십자 + 심장 합성 — 의료 십자를 둥근 방패 모양 안에
            -->
            <g fill="currentColor">
              <!-- 방패/원 배경 -->
              <circle cx="12" cy="12" r="9.5"/>
              <!-- 십자 세로 -->
              <rect x="10.5" y="6" width="3" height="12" rx="1.5" fill="white"/>
              <!-- 십자 가로 -->
              <rect x="6" y="10.5" width="12" height="3" rx="1.5" fill="white"/>
            </g>
          }

          @default {
            <!-- 시계 (기타) -->
            <g fill="currentColor">
              <circle cx="12" cy="12" r="9.5"/>
              <rect x="11.2" y="6.5" width="1.6" height="5.5" rx="0.8" fill="white"/>
              <rect x="11.2" y="11.2" width="5" height="1.6" rx="0.8" fill="white"/>
              <circle cx="12" cy="12" r="1.2" fill="white" opacity="0.6"/>
            </g>
          }

        }
      </svg>
    </span>
  `,
  styles: [`
    :host { display: contents; }
    .icon-wrap {
      width: 38px; height: 38px;
      border-radius: 12px;
      display: grid; place-items: center;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.2);
    }
    .icon-wrap::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 50%;
      background: linear-gradient(180deg, rgba(255,255,255,0.13) 0%, transparent 100%);
      pointer-events: none;
    }
    .icon-svg {
      width: 22px; height: 22px;
      position: relative;
      z-index: 1;
    }
    :root[data-theme="light"] .icon-wrap {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border: none;
      box-shadow: none;
    }
    :root[data-theme="light"] .icon-wrap::before { display: none; }
  `]
})
export class CategoryTag {
  @Input({ required: true }) category!: Category;

  get color(): string { return CATEGORY_COLORS[this.category] ?? '#8b95a1'; }

  get bgColor(): string {
    const hex = this.color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const r2 = Math.min(255, r + 40);
    const g2 = Math.min(255, g + 40);
    const b2 = Math.min(255, b + 40);
    return `linear-gradient(145deg, rgba(${r2},${g2},${b2},0.22) 0%, rgba(${r},${g},${b},0.10) 100%)`;
  }
}
