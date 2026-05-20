import { auth } from '../config/firebase';

async function setBaristaClaim(uid: string) {
  await auth.setCustomUserClaims(uid, { role: 'barista' });
  console.log(`Barista claim set for uid: ${uid}`);
}

setBaristaClaim('i0XpO1RIgndEj2OZAWJ8cJCAO6a2');