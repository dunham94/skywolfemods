import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 5174;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'dist')));

const serverDir = path.join(__dirname, '..', 'server');

const readJson = (filename) => {
  const filePath = path.join(serverDir, filename);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const writeJson = (filename, data) => {
  const filePath = path.join(serverDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get('/api/products', (req, res) => {
  try {
    res.json(readJson('products.json'));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler produtos' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const products = readJson('products.json');
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler produto' });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const products = readJson('products.json');
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Produto não encontrado' });
    products[index] = { ...products[index], ...req.body };
    writeJson('products.json', products);
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const products = readJson('products.json');
    const newProduct = { id: Date.now(), ...req.body };
    products.push(newProduct);
    writeJson('products.json', products);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const products = readJson('products.json');
    const filtered = products.filter(p => p.id !== parseInt(req.params.id));
    writeJson('products.json', filtered);
    res.json({ message: 'Produto removido' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

app.get('/api/pix', (req, res) => {
  try {
    res.json(readJson('pix.json'));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler configuração PIX' });
  }
});

app.put('/api/pix', (req, res) => {
  try {
    writeJson('pix.json', req.body);
    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar PIX' });
  }
});

app.get('/api/comprovantes', (req, res) => {
  try {
    res.json(readJson('comprovantes.json'));
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/comprovantes', (req, res) => {
  try {
    const comprovantes = readJson('comprovantes.json');
    const novo = { id: Date.now(), ...req.body };
    comprovantes.push(novo);
    writeJson('comprovantes.json', comprovantes);
    res.status(201).json(novo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar comprovante' });
  }
});

app.put('/api/comprovantes/:id', (req, res) => {
  try {
    const comprovantes = readJson('comprovantes.json');
    const index = comprovantes.findIndex(c => c.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Comprovante não encontrado' });
    comprovantes[index] = { ...comprovantes[index], ...req.body };
    writeJson('comprovantes.json', comprovantes);
    res.json(comprovantes[index]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar comprovante' });
  }
});

app.delete('/api/comprovantes/:id', (req, res) => {
  try {
    const comprovantes = readJson('comprovantes.json');
    const filtered = comprovantes.filter(c => c.id !== parseInt(req.params.id));
    writeJson('comprovantes.json', filtered);
    res.json({ message: 'Comprovante removido' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover comprovante' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`http://localhost:${PORT}/`);
});