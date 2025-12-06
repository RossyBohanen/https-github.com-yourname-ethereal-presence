# Vercel DNS Configuration Guide

## Issue: Preview Deployment Suffix Domain Configuration

### Problem
The Vercel deployment may fail with the following error:
```
The Preview Deployment Suffix domain "griefvrservice.com" doesn't point to Vercel nameservers.
```

### Root Cause
This error occurs when a custom domain suffix has been configured in Vercel for preview deployments, but the domain's DNS records don't point to Vercel's nameservers. This is a DNS configuration issue that cannot be resolved through code changes - it requires configuration in your DNS provider and Vercel dashboard.

### Resolution Steps

#### Option 1: Configure DNS Records (Recommended for Custom Domains)
If you want to use the custom domain `griefvrservice.com` for preview deployments:

1. **Access Your DNS Provider** (e.g., Cloudflare, GoDaddy, Namecheap)
   - Log into your DNS provider where `griefvrservice.com` is registered

2. **Update Nameservers**
   - Point your domain to Vercel's nameservers:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`
   
   OR configure A/CNAME records:
   - Add an A record: `76.76.21.21`
   - Add a CNAME record for `www`: `cname.vercel-dns.com`

3. **Verify Configuration in Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to your project settings
   - Go to "Domains" section
   - Verify that `griefvrservice.com` is properly configured

4. **Wait for DNS Propagation**
   - DNS changes can take up to 48 hours to propagate globally
   - Most changes take effect within a few minutes to hours

#### Option 2: Remove Custom Domain Suffix (Quick Fix)
If you don't need a custom domain for preview deployments:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project settings
3. Go to "Git" → "Preview Deployments"
4. Remove or update the "Preview Deployment Suffix" setting
5. Save changes

After removing the custom suffix, Vercel will use the default `.vercel.app` domain for preview deployments.

### Verification

After making DNS changes, verify the deployment:

1. Trigger a new deployment by pushing a commit
2. Check the deployment logs in Vercel
3. Verify that preview deployments complete successfully

### Additional Resources

- [Vercel DNS Documentation](https://vercel.com/docs/concepts/projects/custom-domains)
- [Vercel Nameservers Guide](https://vercel.com/docs/custom-domains#nameservers)
- [DNS Propagation Checker](https://www.whatsmydns.net/)

### Current Deployment Status

As of the latest check:
- **Production**: Deployed on Netlify from `main` branch ✅
- **Preview Deployments**: Available via Netlify ✅
- **Vercel**: DNS configuration required for custom domain

### Note

This repository is primarily configured for Netlify deployment (see `netlify.toml`). The Vercel deployment error is related to optional Vercel integration and does not affect the primary Netlify deployment pipeline.
