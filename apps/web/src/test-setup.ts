// IndexedDB for jsdom, so repository tests exercise the real `idb` code paths.
import 'fake-indexeddb/auto';
// The shared code registers its dayjs plugins at startup (src/dayjs.ts).
import '@/dayjs';
