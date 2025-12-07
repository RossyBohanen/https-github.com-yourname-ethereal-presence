# ⚠️ IMPORTANT: Netlify UI Configuration Required

## Current Issue

The Netlify deployment is failing because it's configured to build from the branch `agent-logo-design-20f6`, which **does not exist** in this repository.

**Error Message:**
```
git ref refs/heads/agent-logo-design-20f6 does not exist or you do not have permission
Failed during stage 'preparing repo': git ref refs/heads/agent-logo-design-20f6 does not exist
```

**Full Error Log:**
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

## Required Action

A repository admin or Netlify site owner must update the Netlify deployment settings:

### Steps to Fix:

1. **Log in to Netlify** at https://app.netlify.com
2. **Select your site** from the dashboard
3. **Navigate to:** Site settings → Build & deploy → Continuous Deployment → Build settings
4. **Update the "Branch to deploy" field** from `agent-logo-design-20f6` to **`main`**
5. **Save** the changes
6. **Trigger a new deployment:**
   - Go to the Deploys tab
   - Click "Trigger deploy" → "Deploy site"

### Verification

After updating the branch setting:
- The next deployment should succeed
- You should see the build starting from the `main` branch
- Check the deploy log to confirm it shows: `Fetching branch: main`

## Why This Happened

The branch `agent-logo-design-20f6` likely was:
- A temporary agent/feature branch that has since been deleted or never existed
- Mistakenly set as the deployment branch in Netlify UI
- From a previous configuration that's no longer valid
- The result of an automated agent creating a temporary branch name

## Additional Information

The repository code has been updated with:
- Clear documentation in `netlify.toml` about the correct branch to use
- Comprehensive deployment guide in `docs/DEPLOYMENT.md`
- Context-specific build configurations for different deployment scenarios

These code changes will help prevent this issue in the future, but **the immediate fix requires updating the Netlify UI settings** as described above.

## Questions?

If you need help or don't have access to the Netlify dashboard, contact:
- The repository owner
- Your Netlify site administrator
- Check `docs/DEPLOYMENT.md` for more detailed troubleshooting steps
