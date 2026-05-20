import { auth } from '../config/firebase';

async function checkClaim(uid: string) {
  const user = await auth.getUser(uid);
  console.log('Custom claims:', user.customClaims);
}

checkClaim('i0XpO1RIgndEj2OZAWJ8cJCAO6a2');