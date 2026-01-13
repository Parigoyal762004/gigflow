# Deployment Guide

Deploy GigFlow to production with these instructions.

## Prerequisites

- GitHub repository (push your code)
- MongoDB Atlas account (cloud database)
- Vercel account (frontend) or similar
- Heroku/Railway/Render account (backend) or similar

## Backend Deployment (Node.js + Express)

### Option 1: Heroku (Easiest)

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku app**
   ```bash
   cd server
   heroku create your-app-name
   ```

3. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI="your_atlas_connection_string"
   heroku config:set JWT_SECRET="your_random_secret_key"
   heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
   heroku config:set NODE_ENV="production"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Verify**
   ```bash
   heroku logs --tail
   ```

### Option 2: Railway

1. Connect GitHub repository at [railway.app](https://railway.app)
2. Select `server` directory as root
3. Add `MONGODB_URI`, `JWT_SECRET`, etc. in Variables
4. Deploy automatically on push

### Option 3: Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Build: `npm install && npm start`
5. Add environment variables in dashboard
6. Deploy

### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Create a database user
4. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/gigflow`
5. Add your server's IP to IP Whitelist (or `0.0.0.0/0` for any)

**Connection string format**:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gigflow?retryWrites=true&w=majority
```

## Frontend Deployment (React + Vite)

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from project root**
   ```bash
   cd client
   vercel
   ```
   
   Select:
   - Framework: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Set environment variable**
   - Go to Vercel dashboard → Project Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-backend-domain.com`

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. Connect GitHub at [netlify.com](https://netlify.com)
2. Build command: `npm run build` (in `client` directory)
3. Publish directory: `dist`
4. Environment variable: `VITE_API_URL=https://your-backend-domain.com`
5. Deploy

### Option 3: GitHub Pages + Vercel

See [Vite deployment docs](https://vitejs.dev/guide/static-deploy.html)

## Post-Deployment Checklist

- [ ] Backend server is running and accessible
- [ ] MongoDB Atlas is configured and connection works
- [ ] Frontend can reach backend (check Network tab in DevTools)
- [ ] Socket.io connection works (check WS in Network tab)
- [ ] Create test account and post a gig
- [ ] Bid on the gig with another account
- [ ] Test hiring functionality
- [ ] Test real-time notifications
- [ ] HTTPS is enabled on both frontend and backend
- [ ] CORS is properly configured

## Environment Variables Checklist

### Server (.env)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gigflow?retryWrites=true&w=majority
JWT_SECRET=super_secure_random_key_at_least_32_chars_long
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Client (.env)

```env
VITE_API_URL=https://your-backend-domain.com
```

## Domain Configuration

### Backend

If using a custom domain like `api.gigflow.com`:

1. **Get backend URL** from Heroku/Railway/Render
2. **Add CNAME** in your domain registrar:
   ```
   api.gigflow.com → your-backend-url.herokuapp.com
   ```
3. **Update FRONTEND_URL** in backend env vars to match your frontend domain

### Frontend

If using custom domain like `gigflow.com`:

1. **Configure in Vercel/Netlify**: Domain settings
2. **Update VITE_API_URL** to your backend domain
3. **Redeploy**

## SSL/HTTPS

- **Vercel**: Automatic
- **Netlify**: Automatic
- **Heroku**: Automatic for *.herokuapp.com
- **Railway**: Automatic
- **Custom domain**: Use Let's Encrypt (free)

## Monitoring & Logs

### Heroku
```bash
heroku logs --tail
heroku logs -n 100  # Last 100 lines
```

### Railway
Dashboard → Logs tab

### Render
Dashboard → Logs

### Vercel
Dashboard → Function Logs (for Edge Functions)

## Common Issues & Solutions

### "CORS error in browser"

**Problem**: Frontend can't reach backend

**Solution**:
1. Check `FRONTEND_URL` in backend matches your frontend domain
2. Restart backend server
3. Clear browser cache
4. Check Network tab for actual error

### "MongoDB connection failed"

**Problem**: Can't connect to Atlas

**Solution**:
1. Verify connection string in `MONGODB_URI`
2. Check IP whitelist in MongoDB Atlas (add server's IP)
3. Verify username/password
4. Ensure cluster is running

### "Socket.io not connecting"

**Problem**: Real-time notifications don't work

**Solution**:
1. Check `FRONTEND_URL` in backend env vars
2. Verify WebSocket connections in Network tab (WS)
3. Check that server supports Socket.io (should be enabled)
4. Clear browser cache

### "Freelancer not getting hired notification"

**Problem**: Socket.io event not emitted

**Solution**:
1. Verify freelancer is connected (check logs for `join-user`)
2. Check frontend Socket.io client is initialized
3. Verify hiring request succeeded (check response)
4. Open browser DevTools → Network → WS to debug

### "Frontend stuck on loading state"

**Problem**: API requests timeout

**Solution**:
1. Check backend is running
2. Check network request in DevTools
3. Verify `VITE_API_URL` is correct
4. Check backend logs for errors

## Performance Optimization

### Backend
- Enable gzip compression
- Use connection pooling for MongoDB
- Add caching (Redis) for frequently accessed gigs
- Optimize database indexes

### Frontend
- Enable code splitting in Vite
- Use lazy loading for routes
- Optimize images
- Minify CSS/JS (automatic in production)

## Security Checklist

- [ ] JWT_SECRET is strong and random (32+ chars)
- [ ] HTTPS enabled everywhere
- [ ] CORS properly restricted to your frontend domain
- [ ] Password hashing with bcrypt (done)
- [ ] Environment variables not in version control (.gitignore)
- [ ] No console.log() statements with sensitive data
- [ ] Rate limiting on auth endpoints (optional)
- [ ] SQL injection prevention (using Mongoose)

## Backup & Recovery

### MongoDB Atlas

1. Go to Backup section
2. Enable automated backups
3. Configure backup schedule
4. Download snapshots if needed

### Code

Push to GitHub and maintain regular commits.

## Scaling

As user base grows:

1. **Database**: MongoDB Atlas vertical scaling
2. **Cache**: Add Redis for frequently accessed data
3. **CDN**: Use Cloudflare for static assets
4. **Load balancing**: Multiple backend instances
5. **File storage**: Use S3/Cloudinary for images (future)

## Post-Deployment Monitoring

1. **Set up error tracking**: Sentry or similar
2. **Monitor database**: MongoDB Atlas charts
3. **Check uptime**: UptimeRobot or similar
4. **Track performance**: New Relic, DataDog

## DNS Setup Example

```
Domain: gigflow.com

A Record:
  Host: @
  Value: [Vercel IP]
  TTL: 3600

CNAME Records:
  Host: www
  Value: cname.vercel-dns.com
  TTL: 3600

  Host: api
  Value: your-backend.herokuapp.com
  TTL: 3600
```

## Emergency Rollback

If something breaks:

**Backend (Heroku)**:
```bash
heroku releases
heroku rollback v123  # Replace with previous release
```

**Frontend (Vercel)**:
Dashboard → Deployments → Redeploy previous version

## Support

- Check server logs for errors
- Verify all environment variables are set
- Ensure database is accessible
- Test Socket.io connection manually

---

Good luck with deployment! 🚀
