# Netlify Branch Error Resolution Guide

## Problem Summary

Netlify deployment is failing with the error:
```
git ref refs/heads/agent-logo-design-20f6 does not exist
```

This error occurs during the "preparing repo" stage, preventing the build from starting.

## Root Cause

The Netlify site is configured to deploy from a branch (`agent-logo-design-20f6`) that does not exist in the GitHub repository. This typically happens when:

1. A temporary branch was created and later deleted
2. An automated agent/tool created a temporary branch name
3. The branch name was mistyped in Netlify settings
4. A previous deployment configuration is no longer valid

## Diagnosis Steps

### 1. Verify Available Branches

Check which branches exist in your repository:

**Via GitHub:**
- Go to your repository on GitHub
- Click the branch dropdown (usually shows "main" or current branch)
- All available branches will be listed

**Via Git Command Line:**
```bash
git branch -a
```

**Via GitHub API:**
```bash
git ls-remote --heads origin
```

### 2. Check Netlify Configuration

1. Log in to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **Build & deploy** → **Continuous Deployment**
4. Look at the **Branch to deploy** setting under **Build settings**

## Solution

### Option 1: Update Netlify to Use Main Branch (Recommended)

This is the recommended solution for production deployments:

1. **Log in to Netlify** at https://app.netlify.com
2. **Select your site** from the dashboard
3. **Navigate to:** Site settings → Build & deploy → Continuous Deployment → Build settings
4. **Update the "Branch to deploy" field** to **`main`**
5. **Save** the changes
6. **Trigger a new deployment:**
   - Go to the Deploys tab
   - Click "Trigger deploy" → "Deploy site"

### Option 2: Create the Missing Branch (Not Recommended)

Only use this if you specifically need to deploy from `agent-logo-design-20f6`:

```bash
# Create the branch from main
git checkout main
git checkout -b agent-logo-design-20f6
git push origin agent-logo-design-20f6
```

**Note:** This is not recommended unless you have a specific reason to use this branch name.

### Option 3: Use a Different Existing Branch

If you want to deploy from a branch other than `main`:

1. Verify the branch exists (see Diagnosis Steps above)
2. Follow Option 1 steps but use your preferred branch name instead of `main`

## Verification

After applying the solution:

1. **Check Deploy Log:**
   - Go to Netlify Deploys tab
   - Click on the latest deploy
   - Verify the log shows: `Fetching branch: main` (or your chosen branch)

2. **Verify Build Success:**
   - The build should proceed past the "preparing repo" stage
   - You should see:
     ```
     Build ready to start
     Fetching branch: main
     Starting to prepare the repo for build
     ```

3. **Test Deployment:**
   - Once the build completes, visit your site URL
   - Verify the site loads correctly

## Prevention

To prevent this issue in the future:

1. **Always use `main` branch for production deployments**
   - This is documented in `netlify.toml` and `docs/DEPLOYMENT.md`

2. **Document branch strategy**
   - Keep track of which branches are intended for production vs. development
   - Use branch protection rules on GitHub

3. **Review Netlify settings periodically**
   - Ensure deployment branch matches your intended configuration
   - Update documentation when changing deployment strategy

4. **Automated cleanup**
   - Delete old feature branches after merging
   - Don't rely on temporary branch names for production deployments

## Related Documentation

- [NETLIFY_CONFIGURATION_REQUIRED.md](../NETLIFY_CONFIGURATION_REQUIRED.md) - Quick reference for current issue
- [docs/DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [netlify.toml](../netlify.toml) - Build configuration (lines 1-6 include important notes)

## Error Log Reference

The full error log for this specific issue:

```
Line 0: Build ready to start
Line 1: build-image version: 8ebab867ddcee083308c896d1c35cd5e9bbcfbe5 (noble)
Line 2: buildbot version: 6f5f9443f6ed0ae0b6f7d33a8fbb9b39d22366c0
Line 3: Fetching cached dependencies
Line 4: Starting to download cache of 373.2MB (Last modified: 2025-12-05 00:56:48 +0000 UTC)
Line 5: Finished downloading cache in 635ms
Line 6: Starting to extract cache
Line 7: Failed during stage 'preparing repo': git ref refs/heads/agent-logo-design-20f6 does not exist
Line 8: Finished extracting cache in 5.658s
Line 9: Finished fetching cache in 6.367s
Line 10: Starting to prepare the repo for build
Line 11: git ref refs/heads/agent-logo-design-20f6 does not exist or you do not have permission
Line 12: Failing build: Failed to prepare repo
Line 13: Finished processing build request in 6.906s
```

## Support

If you need additional help:

1. **Check Netlify Documentation:**
   - [Netlify Deploy Settings](https://docs.netlify.com/configure-builds/get-started/)
   - [Branch Deploy Controls](https://docs.netlify.com/site-deploys/overview/#branch-deploy-controls)

2. **Contact Repository Owner:**
   - If you don't have access to Netlify dashboard
   - If you're unsure which branch should be used

3. **Check Repository Issues:**
   - Look for similar issues or create a new one
   - Include the full error log for context

## Quick Reference

**Problem:** `git ref refs/heads/agent-logo-design-20f6 does not exist`

**Quick Fix:** Update Netlify site settings to deploy from `main` branch instead

**Where to Fix:** Netlify Dashboard → Site settings → Build & deploy → Branch to deploy

**Expected Result:** Successful deployment from the `main` branch
