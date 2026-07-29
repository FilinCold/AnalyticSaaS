# EPICS — карта (зеркало ROADMAP)

> Детали шагов: [`docs/ROADMAP.md`](../docs/ROADMAP.md).  
> **Карточки реализации:** [`features/`](./features/README.md) (нумерованные папки 01–09).  
> Не дублировать сюда полный текст.

| Эпик | Папка features | Название | Зависит от |
|---|---|---|---|
| F0 | `01-bootstrap` | Bootstrap | — |
| F1 | `02-auth` | Auth | F0 |
| F2 | `03-research` | Research | F1 |
| F3 | `04-signals` | Signals | F2 |
| F4 | `05-scoring-domain` | Scoring domain | — (параллельно F3) |
| F5 | `06-pipeline-jobs` | Pipeline jobs | F3, F4 |
| F6 | `07-ideas-ui` | Ideas UI | F5 |
| F7 | `08-narrow-rescore` | Narrow/rescore | F6 |
| F8 | `09-vertical-slice-qa` | Vertical-slice QA | F7 |

Порядок: F0→F1→F2→F3→F4→F5→F6→F7→F8.
