import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

import { keys } from './keys.js';
import { products } from './products.js';

const firebaseConfig = keys.firebase;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function validateAndInsertproducts(products) {
  if (!Array.isArray(products)) {
    throw new Error('products should be an array');
  }

  const productsCol = collection(db, 'products');

  for (const product of products) {
    if (!product.id) {
      product.id = crypto.randomUUID();
    }

    const productDoc = doc(productsCol, product.id);
    await setDoc(productDoc, product, { merge: true });
  }
}

validateAndInsertproducts(products)
  .then(() => console.log('products have been successfully inserted/updated'))
  .catch((error) => console.error('Error inserting/updating products:', error));
