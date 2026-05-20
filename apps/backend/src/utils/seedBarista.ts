import { db } from '../config/firebase';

async function seedBarista() {
  await db.collection('baristas').doc('i0XpO1RIgndEj2OZAWJ8cJCAO6a2').set({
    barista_id: 'i0XpO1RIgndEj2OZAWJ8cJCAO6a2',
    employee_id: 'EMP001',
    access_key: 'barista123',
    name: 'Barista 01',
    created_at: new Date(),
  });
  console.log('Barista seeded!');
}

seedBarista();