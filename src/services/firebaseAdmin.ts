import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// ✅ Função robusta para formatar chave privada
function formatPrivateKey(key: string): string {
    if (!key) return '';

    // 1. Remove aspas do início e fim (podem vir do .env)
    // 2. Converte \\n literal para newline real \n
    // 3. Remove aspas internas remanescentes
    // 4. Trim final para evitar espaços invisíveis
    const formatted = key
        .trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\\n/g, '\n')
        .replace(/"/g, '')
        .trim();

    if (formatted.includes('\\n')) {
        console.warn('⚠️ A chave ainda contém sequências "\\n" literais após a formatação.');
    }

    // Validação básica de PEM
    if (!formatted.includes('-----BEGIN PRIVATE KEY-----')) {
        console.warn('⚠️ A chave privada não parece estar no formato PEM (faltando header)');
    }

    return formatted;
}

// ✅ Validar variáveis de ambiente
function validateEnvVars() {
    const requiredVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(`Firebase Admin: Faltando variáveis [${missing.join(', ')}]`);
    }
}

let firebaseApp: App | null = null;

export function getFirebaseApp(): App {
    if (firebaseApp) return firebaseApp;

    try {
        const existingApps = getApps();
        if (existingApps.length > 0) {
            firebaseApp = existingApps[0];
            return firebaseApp;
        }

        validateEnvVars();

        const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY!);

        firebaseApp = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
            storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
        });

        console.log('🚀 Firebase Admin SDK inicializado com sucesso');
        return firebaseApp;

    } catch (error: any) {
        // Tratamento de erro silencioso no servidor mas informativo no log
        const errorMsg = error?.message || 'Erro desconhecido';
        console.error('❌ Falha ao inicializar Firebase Admin:', errorMsg);
        
        if (errorMsg.includes('PEM')) {
            console.error('💡 Dica: Verifique se a FIREBASE_PRIVATE_KEY no .env está entre aspas e usa \\n para quebras de linha.');
        }

        throw new Error('Erro na conexão com o banco de dados. Contate o suporte.');
    }
}

// ✅ Getters dinâmicos para evitar inicialização prematura
export const adminDb = {
    collection: (path: string) => getFirestore(getFirebaseApp()).collection(path),
    doc: (path: string) => getFirestore(getFirebaseApp()).doc(path),
    batch: () => getFirestore(getFirebaseApp()).batch(),
    runTransaction: (cb: any) => getFirestore(getFirebaseApp()).runTransaction(cb),
};

export const adminStorage = {
    bucket: (name?: string) => getStorage(getFirebaseApp()).bucket(name),
};

export function getFirebaseAuth() {
    return getAuth(getFirebaseApp());
}
