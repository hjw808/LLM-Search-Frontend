# Frontend Deployment Guide - Vercel

## Prerequisites

1. **Backend API deployed** (see `../ai-visibility-tester/DEPLOYMENT.md`)
   - You should have a backend URL like: `https://your-app.up.railway.app`

2. **Vercel account** (https://vercel.com)
   - Sign up with GitHub for easier deployments

3. **Git repository**
   - Code should be pushed to GitHub

---

## Deployment Steps

### 1. Update Backend URL

Edit `vercel.json` and replace the placeholder URL:

```json
{
  "env": {
    "NEXT_PUBLIC_BACKEND_URL": "https://YOUR-ACTUAL-BACKEND-URL.up.railway.app"
  }
}
```

### 2. Push to GitHub

```bash
cd ai-visibility-webapp
git add .
git commit -m "Configure for production deployment"
git push
```

### 3. Deploy to Vercel

**Option A: Via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Select `ai-visibility-webapp` as root directory
5. Vercel will auto-detect Next.js
6. Click "Deploy"

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd ai-visibility-webapp
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: ai-visibility-webapp
# - Directory: ./
# - Override settings? No
```

### 4. Configure Environment Variables

In Vercel Dashboard:

1. Go to your project
2. Click "Settings" → "Environment Variables"
3. Add:
   ```
   NEXT_PUBLIC_BACKEND_URL = https://your-app.up.railway.app
   ```
4. Click "Save"
5. Redeploy from "Deployments" tab

### 5. Set Production Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS instructions

---

## Testing the Deployment

1. **Visit your Vercel URL**
   ```
   https://your-app.vercel.app
   ```

2. **Test the flow**
   - Configure business settings
   - Select AI providers
   - Run a test
   - View results

3. **Check logs**
   - Vercel Dashboard → Your Project → Logs
   - Look for errors or warnings

---

## Two Deployment Modes

### Mode 1: External Backend (Recommended for Production)

**What we just set up:**
```
Vercel (Next.js)  →  Railway (Python Backend)  →  Database
```

**Pros:**
- ✅ No timeout issues
- ✅ Scalable
- ✅ Keeps Python code

**Cons:**
- ❌ Two services to manage

**How to use:**
- The app automatically uses the external backend when `NEXT_PUBLIC_BACKEND_URL` is set
- Tests run on Railway, results sent back to frontend

---

### Mode 2: Local Backend (Development Only)

**For local development:**

```bash
# Terminal 1: Run Python backend
cd ai-visibility-tester/api
uvicorn main:app --reload --port 8000

# Terminal 2: Run Next.js frontend
cd ai-visibility-webapp
npm run dev
```

**Environment:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## Switching Between Modes

### Development (Local)
Create `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Production (Vercel)
Set environment variable in Vercel Dashboard:
```
NEXT_PUBLIC_BACKEND_URL=https://your-app.up.railway.app
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│  User's Browser                         │
└────────────┬────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  Vercel (Next.js Frontend)              │
│  - Static pages                         │
│  - API routes (proxy to backend)        │
└────────────┬───────────────────────────┘
             │  HTTP Request
             ▼
┌────────────────────────────────────────┐
│  Railway (FastAPI Backend)              │
│  - Python scripts                       │
│  - AI API calls                         │
│  - Background tasks                     │
└────────────┬───────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  PostgreSQL Database                    │
│  - Test results                         │
│  - Competitors                          │
│  - Queries & responses                  │
└────────────────────────────────────────┘
```

---

## Troubleshooting

### "Failed to fetch" error

**Problem:** Frontend can't reach backend

**Solutions:**
1. Check `NEXT_PUBLIC_BACKEND_URL` is set correctly
2. Verify backend is deployed and running
3. Check backend health: `curl https://your-backend.up.railway.app/api/health`
4. Check CORS settings in backend `api/main.py`

### Tests timing out

**Problem:** Vercel function timeout (10s hobby, 60s pro)

**Solution:**
- This is why we use external backend!
- Make sure you're using `/api/test/run-external` route
- Backend handles long-running tasks

### Environment variables not working

**Problem:** Changes don't take effect

**Solution:**
1. Environment variables require **redeploy**
2. Go to Deployments → Click "..." → Redeploy
3. Or push a new commit to trigger deployment

### Mixed content error (HTTP/HTTPS)

**Problem:** Can't call HTTP backend from HTTPS frontend

**Solution:**
- Ensure backend URL starts with `https://`
- Railway/Render provide HTTPS by default

---

## Cost Breakdown

### Vercel
- **Hobby Plan**: **FREE**
  - 100GB bandwidth
  - Unlimited deployments
  - Perfect for this app

- **Pro Plan**: **$20/month**
  - Only if you need:
    - Custom domains
    - More bandwidth
    - Team collaboration

### Recommended Total Cost

**Frontend (Vercel)**: $0/month
**Backend (Railway)**: $10/month
**Total**: **$10/month**

---

## Next Steps After Deployment

1. **Test thoroughly**
   - Run tests with different providers
   - Check all reports render correctly
   - Verify competitor extraction works

2. **Set up monitoring**
   - Enable Vercel Analytics
   - Monitor Railway logs
   - Set up alerts for errors

3. **Configure custom domain** (optional)
   - Buy domain from Namecheap/Google Domains
   - Add to Vercel project
   - Update DNS records

4. **Enable backups**
   - Railway auto-backs up PostgreSQL
   - Verify in Railway dashboard

---

## Security Checklist

- [ ] `NEXT_PUBLIC_BACKEND_URL` uses HTTPS
- [ ] API keys are in backend only (not frontend)
- [ ] CORS configured to allow only your Vercel domain
- [ ] Database backups enabled
- [ ] No sensitive data in git repository

---

## Support

**Issues?**
- Check Vercel logs: Dashboard → Your Project → Logs
- Check Railway logs: Dashboard → Your Service → Logs
- GitHub Issues: Create issue with logs

**Need help?**
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
