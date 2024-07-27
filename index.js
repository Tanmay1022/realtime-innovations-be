const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());

app.use(bodyParser.json());
app.post('/create', async (req, res) => {
  try {
    const data = req.body;
    const response = await db.collection('items').add(data);
    res.status(201).json({ message: `Document created with ID: ${response.id}`, id: response.id });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/read', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (error) {
    console.error('Error reading documents:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/read/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await db.collection('items').doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    res.status(200).json(doc.data());
  } catch (error) {
    console.error('Error reading document:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/update/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await db.collection('items').doc(id).update(data);
    res.status(200).json({ message: `Document with ID: ${id} updated` });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.collection('items').doc(id).delete();
    res.status(200).json({ message: `Document with ID: ${id} deleted` });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
