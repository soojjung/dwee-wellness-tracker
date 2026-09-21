import type { StickerSource } from '@/types';

/**
 * 배치 상자(1:1 또는 세로 3:4) 안에 스티커 이미지를 어떻게 맞출지.
 *
 * - `photo`: 저장할 때 이미 그 비율로 정확히 잘라 둔 사진이라 상자를 꽉 채운다(cover).
 * - `sticker`: 누끼는 모양이 제각각이다. cover 로 채우면 상자 비율과 어긋난 만큼 가장자리가
 *   잘린다 — 기본 헤드셋(0.816)을 3:4(0.75) 상자에 넣으면 좌우가 4%씩 깎여 보였다. 통째로
 *   보이도록 상자 안에 맞춘다(contain).
 *
 * 꾸미기 화면(`PlacedSticker`)과 다이어리(`DiaryStickerViewLayer`)가 같은 값을 써야
 * 편집할 때 본 모양과 붙인 뒤 모양이 같다.
 */
export function stickerImageFit(source: StickerSource): 'object-cover' | 'object-contain' {
  return source === 'photo' ? 'object-cover' : 'object-contain';
}
