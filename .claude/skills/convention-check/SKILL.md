---
name: convention-check
description: 커밋 전 변경된 코드를 검토한다. 코딩 컨벤션 준수 여부와 코드 품질을 점검한다.
disable-model-invocation: true
allowed-tools: Bash(git *)
---

# 커밋 전 컨벤션 검토

커밋 전에 변경된 코드가 코딩 컨벤션과 코드 품질 기준을 지키는지 검토합니다.

## 검토 기준

- [conventions.md](conventions.md)

## 진행 순서

1. 현재 브랜치에서 변경된 코드를 가져옵니다. (`git status`, `git diff`, `git diff --staged`)
2. `conventions.md`의 규칙을 기준으로 변경된 코드의 각 항목을 '통과' 또는 '개선 필요'로 표시합니다.
3. '개선 필요' 항목이 있으면 어떻게 수정해야 하는지 코드 예시와 함께 알려줍니다.
4. 모든 항목이 '통과'이면 "커밋 준비가 완료되었습니다."를 출력합니다.
