---
description: Add a Firebase feature (auth provider, Firestore query, Storage upload, etc.)
skill: build_firebase_feature
args: [feature_type]
---

### Auth Providers
When adding an auth provider, check `src/lib/firebase.ts` first, then:
1. Enable in Firebase Console → Authentication → Sign-in method
2. Add provider config to `src/lib/auth.ts`
3. Add sign-in function following existing pattern
4. After ANY sign-in, immediately write to `/users/{uid}` if doc doesn't exist

### Firestore Query Pattern
```typescript
// Always use typed returns
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { TeacherProfile } from '@/types/teacher'

export function useTeachers(verified: boolean) {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(
      collection(db, 'teachers'),
      where('verified', '==', verified)
    )
    const unsub = onSnapshot(q,
      (snap) => {
        setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() } as TeacherProfile)))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return unsub
  }, [verified])

  return { teachers, loading, error }
}
```

### Storage Upload Pattern (teacher docs, student media)
```typescript
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const storageRef = ref(storage, path)
  const task = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    task.on('state_changed',
      (snap) => onProgress?.(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref))
    )
  })
}
```

### ID Generation (YT-xxx, SY-xxx, FT-xxx)
```typescript
// src/lib/generateId.ts
export async function generateServiceId(
  role: 'teacher' | 'student',
  serviceLine: 'yeneta' | 'fidel'
): Promise<string> {
  const prefix = role === 'teacher'
    ? (serviceLine === 'yeneta' ? 'YT' : 'FT')
    : (serviceLine === 'yeneta' ? 'SY' : 'SF')

  // Use a Firestore counter doc to get sequential numbers
  // counters/{prefix} → { count: number }
  const counterRef = doc(db, 'counters', prefix)
  const next = await runTransaction(db, async (t) => {
    const snap = await t.get(counterRef)
    const n = (snap.data()?.count ?? 0) + 1
    t.set(counterRef, { count: n })
    return n
  })
  return `${prefix}-${String(next).padStart(3, '0')}`
}
```
