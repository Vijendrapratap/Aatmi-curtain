---
type: community
cohesion: 0.22
members: 14
---

# Server API & OpenRouter Gateway

**Cohesion:** 0.22 - loosely connected
**Members:** 14 nodes

## Members
- [[aistudioApiPlugin()]] - code - vite.config.ts
- [[aistudioMediaPlugin()]] - code - vite.config.ts
- [[api.ts]] - code - src/server/api.ts
- [[callOpenRouterInpaint()]] - code - src/server/openrouter.ts
- [[callOpenRouterRoomViz()]] - code - src/server/openrouter.ts
- [[callOpenRouterVision()]] - code - src/server/openrouter.ts
- [[ensureDataUri()]] - code - src/server/openrouter.ts
- [[getEffectiveOpenRouterKey()]] - code - src/server/openrouter.ts
- [[getGenAIClient()]] - code - src/server/api.ts
- [[getOrCreateBrandConfig()]] - code - src/server/api.ts
- [[openrouter.ts]] - code - src/server/openrouter.ts
- [[parseBase64Image()]] - code - src/server/api.ts
- [[testOpenRouterConnection()]] - code - src/server/openrouter.ts
- [[vite.config.ts]] - code - vite.config.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Server_API_&_OpenRouter_Gateway
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_AI Provider Adapters & Inpainting Routing]]
- 1 edge to [[_COMMUNITY_Brand Management & Studio State]]

## Top bridge nodes
- [[api.ts]] - degree 7, connects to 2 communities
- [[openrouter.ts]] - degree 8, connects to 1 community