import type { bookmarksRepo, searchesRepo, usersRepo } from './db/repos.js';
import type { TenderService } from './tenders/service.js';

// Wiring passed to route registrars. Keeps handlers free of construction concerns and
// trivial to unit-test with fakes.
export interface AppDeps {
  users: ReturnType<typeof usersRepo>;
  bookmarks: ReturnType<typeof bookmarksRepo>;
  searches: ReturnType<typeof searchesRepo>;
  tenders: TenderService;
}
