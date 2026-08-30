# Mermaid 다이어그램 규칙

GitHub 가 렌더할 수 없는 syntax 를 커밋하면 PR 본문·docs 페이지 모두 "Unable to render rich display" 파싱 에러로 깨진다. `docs-diagram-curator` 를 포함한 모든 문서 작업에서 아래 규칙을 준수.

## 1) flowchart 노드 라벨은 항상 큰따옴표

노드 라벨 안에 대괄호 `[]`, 소괄호 `()`, 중괄호 `{}`, 파이프 `|`, 화살표 텍스트 등이 조금이라도 들어가면 **반드시** 라벨을 큰따옴표로 감싼다.

```
❌ Detail[PhotoEditDetailScreen\n/home/customize/edit-photos/[slot]]
   → 내부 [slot] 이 새 노드 시작으로 파싱되어 broken

✅ Detail["PhotoEditDetailScreen\n/home/customize/edit-photos/[slot]"]
```

**적용 범위**: `[label]` (사각), `(label)` (라운드), `([label])` (스타디움), `[[label]]` (서브루틴), `[(label)]` (실린더), `{label}` (다이아몬드) 등 모든 노드 shape.

**Safe default**: 라벨에 특수문자 여부와 무관하게 항상 큰따옴표로 감싸는 것이 가장 안전. 나중에 라벨 수정 시 발생하는 회귀도 예방.

## 2) 엣지 라벨도 큰따옴표 권장

```
❌ A -->|사용자가 [확인] 탭| B
✅ A -->|"사용자가 [확인] 탭"| B
```

## 3) stateDiagram-v2 는 `[*]` 만 특별

start/end 마커 `[*]` 는 예약어. 상태 이름이나 전이 라벨에 다른 `[...]` 를 넣을 때 파서가 관대한 편이지만, 렌더러 버전에 따라 깨질 수 있으므로 **가급적 소괄호/전각 브라켓으로 치환**.

```
⚠️  CancelPrompt --> [*] : 팝업 [확인] → 종료
✅ CancelPrompt --> [*] : 팝업 (확인) → 종료
```

## 4) 이스케이프가 필요한 문자

라벨 안의 `"` 는 `#quot;` 또는 HTML 엔티티로 이스케이프. `<br/>` 은 그대로 사용 가능하지만 `\n` 도 지원.

## 5) 커밋 전 검증

Mermaid 블록이 포함된 파일을 새로 추가/수정할 때:

1. 로컬 렌더 확인이 어려우면 최소한 아래 grep 으로 unquoted 브라켓 패턴 자동 스캔:

```bash
awk '/^```mermaid/,/^```$/' <file> | grep -nE '^\s*\w+\[[^"]'
```

- 매치가 있으면 그 노드 라벨을 큰따옴표로 감싸 재검증.

2. GitHub 웹에서 PR body 나 파일 프리뷰가 "Unable to render rich display" 를 표시하면 즉시 원인 라인 확인.

## 6) 사용자에게 노출되는 실패 모드

이 규칙을 어기면 GitHub 는 파싱 에러 메시지와 함께 텍스트 소스를 그대로 노출한다:

```
Parse error on line 5:
...stomize/edit-photos/[slot]] Home --
-----------------------^
Expecting 'SQE', ..., got 'SQS'
```

`SQS` = Square Start (`[`). 이 메시지가 뜨면 항상 인용부호 누락이라고 보면 된다.
