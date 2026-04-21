
'use client';

import { addDoc, collection, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface DesignData {
  title: string;
  caption: string;
  theme: string;
  hashtags: string[];
  createdAt: Date;
  imageUrl?: string | null;
}

export function saveDesign(db: Firestore, userId: string, data: DesignData) {
    if (!userId || !db) return;
    
    const designsColRef = collection(db, "users", userId, "designs");

    addDoc(designsColRef, data)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: designsColRef.path,
                operation: 'create',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
}
