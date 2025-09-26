# Deployment Configuration

This document explains how the site URL is configured for different deployment environments.

## Environment Variable Priority

The site URL is determined in the following order:

1. **`DEPLOY_PRIME_URL`** - Netlify's primary deploy URL (for previews and branch deploys)
2. **`SITE_URL`** - Custom environment variable for explicit URL override
3. **Default** - Falls back to `https://quint-lang.org`

## Deployment Environments

### Production
- Uses the default `https://quint-lang.org`
- Can be overridden by setting `SITE_URL` environment variable

### Netlify Deploy Previews (Pull Requests)
- Automatically uses `DEPLOY_PRIME_URL` provided by Netlify
- Format: `https://deploy-preview-{PR_NUMBER}--{SITE_NAME}.netlify.app`
- No manual configuration needed

### Netlify Branch Deploys
- Automatically uses `DEPLOY_PRIME_URL` provided by Netlify
- Format: `https://{BRANCH_NAME}--{SITE_NAME}.netlify.app`
- No manual configuration needed

### Local Development
- Create a `.env.local` file with:
  ```
  SITE_URL=http://localhost:3000
  ```

## Netlify Setup

1. **Automatic**: Netlify automatically provides `DEPLOY_PRIME_URL` for all deploy previews and branch deploys
2. **No configuration needed**: The code automatically detects and uses preview URLs
3. **Preview URLs**: Will automatically use the correct preview URL for RSS feeds, OpenGraph images, etc.

## Usage Examples

### RSS Feed URLs
The RSS feed will automatically generate correct URLs:
- Production: `https://quint-lang.org/blog-covers/post.jpg`
- Preview: `https://deploy-preview-123--site.netlify.app/blog-covers/post.jpg`

### OpenGraph Images
Social media previews will use the correct domain:
- Production: `https://quint-lang.org/og.jpg`
- Preview: `https://deploy-preview-123--site.netlify.app/og.jpg`

## Manual Override

If you need to override the URL for any environment, set the `SITE_URL` environment variable:

```bash
# In Netlify UI under Site Settings > Environment Variables
SITE_URL=https://custom-domain.com

# Or in your deployment system
export SITE_URL=https://custom-domain.com
```

This will take precedence over all automatic URL detection.