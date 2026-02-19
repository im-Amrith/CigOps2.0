# CigOps 2.0 Frontend - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from the frontend directory**:
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `cigops-frontend` (or your preferred name)
   - In which directory is your code located? `./`
   - Want to modify settings? **N**

5. **Set environment variable**:
   ```bash
   vercel env add VITE_API_URL production
   ```
   Enter: `https://im-amrith-cigops.hf.space`

6. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Go to** [vercel.com](https://vercel.com) and login

2. **Click "Add New Project"**

3. **Import from Git**:
   - Select your GitHub repository: `im-Amrith/CigOps2.0`
   - Click "Import"

4. **Configure Project**:
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add variable:
     - Name: `VITE_API_URL`
     - Value: `https://im-amrith-cigops.hf.space`
   - Select all environments (Production, Preview, Development)

6. **Click "Deploy"**

## 🔧 Configuration Files

- **vercel.json** - Vercel configuration for SPA routing
- **.env.production** - Production environment variables
- **.env.example** - Example environment variables

## 🌐 Backend URL

Update the backend URL after backend deployment:
- **Development**: `http://localhost:8000`
- **Production**: `https://im-amrith-cigops.hf.space`

## 📝 Post-Deployment

After deployment, your frontend will be available at:
- Production: `https://your-project-name.vercel.app`
- Preview: `https://your-project-name-git-branch.vercel.app` (for each branch)

## 🔄 Automatic Deployments

Once connected to GitHub:
- **Production**: Automatic deployment on push to `main` branch
- **Preview**: Automatic deployment on push to any other branch

## 🛠️ Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Make sure backend CORS is configured to allow your Vercel domain
2. Backend should allow: `^https://.*\.vercel\.app$`

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Make sure variable names start with `VITE_`
- Redeploy after adding/changing environment variables
- Variables must be set for the correct environment (Production/Preview/Development)

## 📚 Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
