# Deployment Guide

## Netlify Deployment

This project is configured to deploy to Netlify. The deployment configuration is defined in `netlify.toml` at the root of the repository.

### Branch Configuration

**Production Branch:** `main`

The site should be deployed from the `main` branch for production deployments. If you encounter a deployment error like:

```
git ref refs/heads/[branch-name] does not exist or you do not have permission
Failed during stage 'preparing repo': git ref refs/heads/[branch-name] does not exist
```

This means Netlify is configured to deploy from a branch that doesn't exist in your repository.

### How to Fix Branch Configuration Issues

For a comprehensive troubleshooting guide, see [NETLIFY_BRANCH_ERROR_RESOLUTION.md](./NETLIFY_BRANCH_ERROR_RESOLUTION.md).

**Quick Fix:**

1. **Log in to Netlify Dashboard**
2. **Navigate to your site** → Site settings
3. **Go to Build & deploy** → Continuous Deployment → Build settings
4. **Update the Branch to deploy** field to `main` (or another existing branch)
5. **Save the changes**
6. **Trigger a new deployment** (Site settings → Deploys → Trigger deploy → Deploy site)

### Verifying Existing Branches

To see which branches exist in your repository, run:

```bash
git branch -a
```

Or check the branches on GitHub:
- Go to your repository on GitHub
- Click the branch dropdown (usually shows "main")
- All available branches will be listed

### Build Configuration

The build is configured in `netlify.toml`:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`

### Context-Specific Builds

The `netlify.toml` includes configurations for different deployment contexts:

- **Production:** Deploys from the main branch
- **Deploy Previews:** Automatic builds for pull requests
- **Branch Deploys:** Builds for other branches (if enabled)

### Environment Variables

Ensure the following environment variables are set in Netlify:

- Any API keys or secrets should be configured in Netlify UI (Site settings → Environment variables)
- Never commit `.env` or `.env.local` files to the repository

### Troubleshooting

**Build fails immediately:**
- Verify the branch exists in your repository
- Check that the branch name in Netlify matches exactly (case-sensitive)
- Ensure you have the necessary permissions to access the branch

**Build command fails:**
- Check that `package.json` has the correct build script
- Verify all dependencies are properly listed
- Review the build logs in Netlify for specific errors

**Serverless functions not working:**
- Ensure functions are in the `netlify/functions` directory
- Check function logs in Netlify dashboard
- Verify environment variables are set correctly
