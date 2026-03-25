require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ─────────────────────────────────────────
// HEALTH
// ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'allie-kat-command-center', ts: new Date().toISOString() });
});

// ─────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────
app.get('/products', async (req, res) => {
  const { data, error } = await supabase
    .from('cc_products')
    .select('*')
    .order('division')
    .order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/products', async (req, res) => {
  const { id, name, price, division, status, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const row = { id, name, price, division, status, notes };
  const { data, error } = await supabase
    .from('cc_products')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/products/:id', async (req, res) => {
  const { error } = await supabase
    .from('cc_products')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: req.params.id });
});

// ─────────────────────────────────────────
// ROADMAP
// ─────────────────────────────────────────
app.get('/roadmap', async (req, res) => {
  const { data, error } = await supabase
    .from('cc_roadmap')
    .select('*')
    .order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/roadmap', async (req, res) => {
  const { id, q, title, tags, status, sort_order } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const row = { id, q, title, tags: tags || [], status, sort_order: sort_order || 99 };
  const { data, error } = await supabase
    .from('cc_roadmap')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch('/roadmap/:id/status', async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase
    .from('cc_roadmap')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/roadmap/:id', async (req, res) => {
  const { error } = await supabase
    .from('cc_roadmap')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: req.params.id });
});

// ─────────────────────────────────────────
// MRR
// ─────────────────────────────────────────
app.get('/mrr', async (req, res) => {
  const { data, error } = await supabase
    .from('cc_mrr')
    .select('*')
    .order('month', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/mrr', async (req, res) => {
  const { month, amount } = req.body;
  if (!month) return res.status(400).json({ error: 'month required' });
  const { data, error } = await supabase
    .from('cc_mrr')
    .upsert({ month, amount: amount || 0 }, { onConflict: 'month' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/mrr/:month', async (req, res) => {
  const { error } = await supabase
    .from('cc_mrr')
    .delete()
    .eq('month', req.params.month);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: req.params.month });
});

// ─────────────────────────────────────────
// TRANCHES
// ─────────────────────────────────────────
app.get('/tranches', async (req, res) => {
  const { data, error } = await supabase
    .from('cc_tranches')
    .select('*')
    .order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/tranches', async (req, res) => {
  const { id, label, amount, use_for, status } = req.body;
  if (!label) return res.status(400).json({ error: 'label required' });
  const { data, error } = await supabase
    .from('cc_tranches')
    .upsert({ id, label, amount, use_for, status }, { onConflict: 'id' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/tranches/:id', async (req, res) => {
  const { error } = await supabase
    .from('cc_tranches')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: req.params.id });
});

// ─────────────────────────────────────────
// GRANTS
// ─────────────────────────────────────────
app.get('/grants', async (req, res) => {
  const { data, error } = await supabase
    .from('cc_grants')
    .select('*')
    .order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/grants', async (req, res) => {
  const { id, name, org, amount, status, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const { data, error } = await supabase
    .from('cc_grants')
    .upsert({ id, name, org, amount, status, notes }, { onConflict: 'id' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/grants/:id', async (req, res) => {
  const { error } = await supabase
    .from('cc_grants')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: req.params.id });
});

// ─────────────────────────────────────────
// SUBSCRIBERS
// ─────────────────────────────────────────
app.get('/subscribers', async (req, res) => {
  const { type } = req.query;
  let query = supabase.from('cc_subscribers').select('*').order('created_at');
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/subscribers', async (req, res) => {
  const { id, type, name, contact, plan, mrr_value, status, notes } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'name and type required' });
  const { data, error } = await supabase
    .from('cc_subscribers')
    .upsert({ id, type, name, contact, plan, mrr_value: mrr_value || 0, status, notes }, { onConflict: 'id' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/subscribers/:id', async (req, res) => {
  const { error } = await supabase
    .from('cc_subscribers')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: req.params.id });
});

// ─────────────────────────────────────────
// BOARD POSTS
// ─────────────────────────────────────────
app.get('/posts', async (req, res) => {
  const { data, error } = await supabase
    .from('cc_posts')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/posts', async (req, res) => {
  const { author, category, title, body, pinned } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title and body required' });
  const { data, error } = await supabase
    .from('cc_posts')
    .insert({ author, category, title, body, pinned: pinned || false, likes: 0 })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch('/posts/:id/pin', async (req, res) => {
  const { pinned } = req.body;
  const { data, error } = await supabase
    .from('cc_posts')
    .update({ pinned })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch('/posts/:id/like', async (req, res) => {
  // Read current likes, increment or decrement
  const { action } = req.body; // 'like' | 'unlike'
  const { data: post, error: fetchErr } = await supabase
    .from('cc_posts')
    .select('likes')
    .eq('id', req.params.id)
    .single();
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });
  const newLikes = Math.max(0, (post.likes || 0) + (action === 'like' ? 1 : -1));
  const { data, error } = await supabase
    .from('cc_posts')
    .update({ likes: newLikes })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/posts/:id', async (req, res) => {
  const { error } = await supabase
    .from('cc_posts')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: req.params.id });
});

// ─────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────
app.get('/messages', async (req, res) => {
  const { channel } = req.query;
  let query = supabase
    .from('cc_messages')
    .select('*')
    .order('created_at', { ascending: true });
  if (channel) query = query.eq('channel', channel);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/messages', async (req, res) => {
  const { channel, sender, text } = req.body;
  if (!channel || !sender || !text) return res.status(400).json({ error: 'channel, sender, text required' });
  const { data, error } = await supabase
    .from('cc_messages')
    .insert({ channel, sender, text })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/messages/:id', async (req, res) => {
  const { error } = await supabase
    .from('cc_messages')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: req.params.id });
});

// ─────────────────────────────────────────
// START
// ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Allie-Kat Command Center backend running on port ${PORT}`);
});
