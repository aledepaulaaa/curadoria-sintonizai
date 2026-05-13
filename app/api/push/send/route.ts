import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { adminDb } from '@/src/services/firebaseAdmin';
import { NextResponse } from 'next/server';

const expo = new Expo();

export async function POST(req: Request) {
  try {
    const { titulo, mensagem, imagemUrl, userId, data } = await req.json();

    let tokens: string[] = [];

    if (userId) {
      // Busca token de um usuário específico
      const tokenDoc = await adminDb.collection('pushTokens').doc(userId).get();
      if (tokenDoc.exists) {
        tokens.push(tokenDoc.data()?.token);
      }
    } else {
      // Busca todos os tokens (broadcast)
      const snapshot = await adminDb.collection('pushTokens').get();
      snapshot.forEach(doc => {
        const token = doc.data()?.token;
        if (token) tokens.push(token);
      });
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: 'Nenhum token encontrado' });
    }

    const messages: ExpoPushMessage[] = [];
    for (const pushToken of tokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: titulo,
        body: mensagem,
        data: data || {},
        ...(imagemUrl && { _displayInForeground: true }), // Expo specific
      });
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Erro ao enviar chunk de push:', error);
      }
    }

    return NextResponse.json({ success: true, tickets });

  } catch (error) {
    console.error('Erro na API de Push:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
