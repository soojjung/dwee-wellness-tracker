import type { StickerRatio } from '@/types';
import {
  STICKER_RATIO_ASPECT,
  centerCropRect,
  expandBounds,
  opaqueBounds,
  stickerRatioForAspect,
} from './stickerFrame';

// 앨범 불러오기와 카메라 촬영이 같이 쓰는 브라우저(canvas) 쪽 헬퍼. 계산은 stickerFrame 에 있다.

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/** 누끼 경로는 비율 선택을 건너뛰므로 원본 사진 모양에서 배치 프레임을 추론한다. */
export async function ratioForImage(blob: Blob): Promise<StickerRatio> {
  try {
    const img = await loadImage(blob);
    return stickerRatioForAspect(img.width / img.height);
  } catch {
    return '1:1';
  }
}

/** 고른 비율에 맞춰 가운데 기준으로 잘라 JPEG 로 돌려준다. canvas 를 못 쓰면 null. */
export async function cropToRatio(blob: Blob, ratio: StickerRatio): Promise<Blob | null> {
  const img = await loadImage(blob);
  const { sx, sy, sw, sh } = centerCropRect(img.width, img.height, STICKER_RATIO_ASPECT[ratio]);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw);
  canvas.height = Math.round(sh);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92),
  );
}

// 경계는 이 크기로 줄인 사본에서 찾는다. 누끼 PNG 는 수천 px 일 수 있어 원본 전체를
// getImageData 하면 수십 MB 다. 줄이면 알파가 평균돼 외딴 티끌이 걸러지는 덤도 있다.
const TRIM_SCAN_MAX_SIDE = 512;
// 줄인 사본 기준 알파 하한 (0~255). 가장자리의 옅은 번짐은 버린다.
const TRIM_ALPHA_THRESHOLD = 12;
// 잘라낸 뒤 피사체가 프레임 끝에 딱 붙지 않게 두는 여백 (피사체 긴 변 대비).
const TRIM_PADDING_RATIO = 0.02;

/**
 * 누끼 PNG 의 투명 여백을 걷어 낸다. 카메라는 화면 전체를 찍으므로 피사체 둘레에 빈
 * 공간이 크게 남는데, 그대로 저장하면 스티커가 제 상자보다 작게 보이고 눈에 안 보이는
 * 영역까지 터치가 잡힌다. 어떤 이유로든 실패하면 원본을 그대로 돌려준다.
 */
export async function trimTransparentMargins(png: Blob): Promise<Blob> {
  try {
    const img = await loadImage(png);
    const scale = Math.min(1, TRIM_SCAN_MAX_SIDE / Math.max(img.width, img.height));
    const scanW = Math.max(1, Math.round(img.width * scale));
    const scanH = Math.max(1, Math.round(img.height * scale));
    const scan = document.createElement('canvas');
    scan.width = scanW;
    scan.height = scanH;
    const scanCtx = scan.getContext('2d', { willReadFrequently: true });
    if (!scanCtx) return png;
    scanCtx.drawImage(img, 0, 0, scanW, scanH);
    const found = opaqueBounds(
      scanCtx.getImageData(0, 0, scanW, scanH).data,
      scanW,
      scanH,
      TRIM_ALPHA_THRESHOLD,
    );
    if (!found) return png;

    const toFull = img.width / scanW;
    const padding = Math.max(found.width, found.height) * toFull * TRIM_PADDING_RATIO;
    const crop = expandBounds(found, scanW / img.width, padding, img.width, img.height);
    if (crop.width >= img.width && crop.height >= img.height) return png;

    const out = document.createElement('canvas');
    out.width = crop.width;
    out.height = crop.height;
    const outCtx = out.getContext('2d');
    if (!outCtx) return png;
    outCtx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    const trimmed = await new Promise<Blob | null>((resolve) =>
      out.toBlob((b) => resolve(b), 'image/png'),
    );
    return trimmed ?? png;
  } catch {
    return png;
  }
}
