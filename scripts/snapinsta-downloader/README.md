# SnapInsta API Client

Auto-generated Python API client for downloading Instagram reels, videos, photos, and profiles from SnapInsta.

## Generated From

- **Run ID**: snapinsta-reel-download
- **HAR File**: ~/.reverse-api/runs/har/snapinsta-download/recording.har
- **Date**: 2026-02-26
- **Task**: Download Instagram reels video
- **Base URL**: https://snapinsta.to
- **Mode**: Agent (autonomous navigation with Playwright MCP)

## Installation

```bash
pip install requests
```

For browser automation (required for SnapInsta):
```bash
pip install playwright
npx playwright install chromium
```

## Usage

### Basic Usage (with Playwright MCP)

```python
from playwright.async_api import async_playwright
from snapinsta_downloader.api_client import SnapInstaClient

async def download_reel():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        client = SnapInstaClient(playwright_page=page)

        result = await client.download_reel(
            "https://www.instagram.com/reel/DEyGJqzSDiK/",
            output_path="/path/to/save/video.mp4"
        )
        print(result)
```

### Using with Playwright MCP (Agent Mode)

The client is designed to work with the Playwright MCP server for browser automation:

```python
from api_client import SnapInstaClient

# The client uses Playwright MCP tools:
# - playwright_navigate(url)
# - playwright_fill(selector, text)
# - playwright_click(selector)
# - playwright_get_attribute(selector, attr)

client = SnapInstaClient(playwright_page=page)
result = client.download_reel("https://www.instagram.com/reel/DEyGJqzSDiK/")
```

## Available Methods

### `download_reel(reel_url, output_path=None)`
Download an Instagram Reel by URL using browser automation.

**Args:**
- `reel_url`: The Instagram reel URL (must start with https://www.instagram.com/)
- `output_path`: Optional file path to save the video

**Returns:** Dict with:
- `success`: bool
- `video_url`: Direct download URL (expires after ~1 hour)
- `filename`: Suggested filename from JWT token
- `message`: Status message
- `original_url`: The Instagram reel URL

**Raises:**
- `ValueError`: For invalid Instagram URLs or missing download link
- `RuntimeError`: For browser automation errors

### `download_video(video_url, output_path=None)`
Alias for `download_reel()` - downloads any Instagram video.

### `download_profile_photos(profile_url)`
Download all photos from an Instagram profile.

### `check_url_validity(instagram_url)`
Check if an Instagram URL is valid and can be downloaded.

**Returns:** Dict with:
- `valid`: bool
- `can_download`: bool
- `url_type`: Type of Instagram content (reel, post, video, story, profile)

## API Endpoints

### POST /api/ajaxSearch
Main API endpoint for processing Instagram URLs.

**Request:**
```json
{
  "url": "https://www.instagram.com/reel/DEyGJqzSDiK/"
}
```

**Response:** Returns a JWT token that expires in ~1 hour. The token contains:
- `url`: The actual Instagram CDN video URL
- `filename`: Suggested filename
- `exp`: Expiration timestamp
- `iat`: Issue timestamp

### Download Flow

1. Browser navigates to https://snapinsta.to/en2
2. User fills Instagram URL into the input field
3. User clicks "Download" button
4. POST request to `/api/ajaxSearch` with Instagram URL
5. Response contains download link with JWT token
6. Browser navigates to `https://dl.snapcdn.app/get?token=...`
7. Video downloads directly from Instagram CDN

## Authentication

SnapInsta requires session-based authentication:
1. Session cookies established on page visit
2. CSRF token embedded in page HTML
3. Turnstile (Cloudflare captcha) verification may be required

**For automation, browser automation is required** because:
- The CSRF token expires quickly
- Session cookies must be maintained
- Turnstile verification may be required

## Agent Navigation Path

The agent autonomously performed these actions:
1. Navigated to https://snapinsta.to/en2
2. Located the "Paste URL Instagram" input field
3. Filled with Instagram reel URL: `https://www.instagram.com/reel/DEyGJqzSDiK/`
4. Clicked the "Download" button
5. Waited for processing and JWT token generation
6. Extracted download link with JWT token
7. Navigated to download URL: `https://dl.snapcdn.app/get?token=...`
8. Video downloaded from Instagram CDN

## JWT Token Structure

The download link contains a JWT token with this payload:

```json
{
  "url": "https://scontent.cdninstagram.com/...",
  "filename": "SnapInsta.to_AQOWkCXhMkyj0IPtrjue5F5a_jLGZteV1BQckOlv2H4hDlUnkxQSf4hvH6ufiKWVkAP0tDJZxsODSampaemm2VWa-SINqKe1bjMZrrs.mp4",
  "nbf": 1772107781,
  "exp": 1772111381,
  "iat": 1772107781
}
```

The token expires after ~1 hour (3600 seconds).

## Notes

- Generated from autonomous agent capture
- Browser automation required for reliable downloads
- JWT tokens expire after ~1 hour
- Respect Instagram's Terms of Service and copyright laws
- Test thoroughly before production use

## Error Handling

The client raises:
- `ValueError` for invalid Instagram URLs
- `ValueError` when download link not found (private video, invalid URL)
- `RuntimeError` for browser automation failures
- `requests.exceptions.RequestException` for network errors

## Example Output

```python
{
    'success': True,
    'video_url': 'https://dl.snapcdn.app/get?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'filename': 'SnapInsta.to_AQOWkCXhMkyj0IPtrjue5F5a_jLGZteV1BQckOlv2H4hDlUnkxQSf4hvH6ufiKWVkAP0tDJZxsODSampaemm2VWa-SINqKe1bjMZrrs.mp4',
    'message': 'Download complete: /path/to/video.mp4',
    'original_url': 'https://www.instagram.com/reel/DEyGJqzSDiK/',
    'download_path': '/path/to/video.mp4'
}
```

## Troubleshooting

**Issue:** "The authentication token is invalid"
**Solution:** This indicates the CSRF token has expired. Use a fresh browser session or page navigation.

**Issue:** "Could not find download link"
**Solution:** The video may be private or the service may be temporarily unavailable. Try again later.

**Issue:** "Browser automation failed"
**Solution:** Ensure Playwright is properly installed and the page element selectors match the current DOM structure.

## Limitations

- Requires Playwright MCP for browser automation
- Download links expire after ~1 hour
- May require manual intervention for heavily protected content
- Rate limiting may apply for multiple downloads

## License

This tool is provided for educational purposes. Please respect copyright laws and terms of service of Instagram and SnapInsta.
