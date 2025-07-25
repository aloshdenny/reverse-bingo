# Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Supabase Setup Complete
- ✅ Database schema from `database.sql` executed
- ✅ Row Level Security policies enabled
- ✅ Real-time subscriptions working
- ✅ Edge Functions deployed (optional but recommended)

### 2. Environment Variables Ready
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository and click "Import"

3. **Configure Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add these variables:
     ```
     VITE_SUPABASE_URL = your_supabase_project_url
     VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## 🔧 Supabase Edge Functions (Optional)

For enhanced security, deploy the Edge Functions:

1. **Install Supabase CLI**
   ```bash
   npm install supabase --save-dev
   npx supabase login
   ```

2. **Link to Your Project**
   ```bash
   npx supabase link --project-ref your-project-ref
   ```

3. **Deploy Edge Functions**
   ```bash
   npx supabase functions deploy generate-clue
   npx supabase functions deploy generate-questions
   ```

## 🔒 Security Configuration

The app is configured with:
- ✅ No API keys exposed to frontend
- ✅ Secure Supabase RLS policies
- ✅ Edge Functions for sensitive operations
- ✅ Security headers via vercel.json
- ✅ CORS properly configured

## 🛠️ Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

## 📱 Performance Optimizations

The app includes:
- ✅ Code splitting and tree shaking
- ✅ Optimized bundle size
- ✅ Compressed assets
- ✅ Modern CSS with Tailwind
- ✅ Efficient real-time subscriptions

## 🐛 Troubleshooting

### Build Fails
- Check that all dependencies are in package.json
- Ensure environment variables are set
- Verify database schema is applied

### App Loads but Can't Create Rooms
- Verify Supabase environment variables
- Check database connection
- Ensure RLS policies allow operations

### Real-time Features Not Working
- Confirm Supabase real-time is enabled
- Check network connectivity
- Verify Supabase URL is correct

### Edge Functions Not Working
- Ensure functions are deployed
- Check function logs in Supabase dashboard
- Verify CORS configuration

## 📊 Monitoring

Monitor your deployment:
- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Dashboard**: Database and API usage
- **Browser DevTools**: Client-side performance

## 🎯 Next Steps After Deployment

1. **Test with Multiple Users**
   - Open multiple browser tabs/devices
   - Test room creation and joining
   - Verify real-time updates work

2. **Share Your Game**
   - Send the Vercel URL to friends
   - Create a room and share the code
   - Enjoy your AI-powered guessing game!

3. **Optional Enhancements**
   - Add OpenAI API key for enhanced AI features
   - Implement custom scoring system
   - Add game statistics and history

## 🆘 Support

If you encounter issues:
1. Check Vercel build logs
2. Inspect browser console for errors
3. Verify Supabase configuration
4. Test locally first with `npm run dev`

Your Akinator Bingo game is now ready for the world! 🎉 