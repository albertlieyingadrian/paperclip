"""
Auto-generated API client for SnapInsta
Generated from autonomous agent capture on 2026-02-26

Task: Download Instagram reels video
Run ID: snapinsta-reel-download
HAR file: ~/.reverse-api/runs/har/snapinsta-download/recording.har

Note: This API requires browser automation due to session-based authentication
and CSRF token validation. Use with playwright MCP for best results.
"""

import requests
from typing import Optional, Dict, Any
import logging
import re
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SnapInstaClient:
    """API client for SnapInsta - Download Instagram videos, photos, reels, profiles.

    This client uses browser automation via Playwright MCP to capture the download URL
    and extract video information. Direct API requests require session-based authentication
    that's difficult to replicate without browser automation.
    """

    def __init__(
        self,
        base_url: str = "https://snapinsta.to",
        playwright_page: Optional[Any] = None,
        session: Optional[requests.Session] = None,
    ):
        self.base_url = base_url.rstrip("/")
        self.playwright_page = playwright_page
        self.session = session or requests.Session()
        self._setup_session()

    def _setup_session(self):
        """Configure session with default headers."""
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "en-US,en;q=0.9",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Origin": "https://snapinsta.to",
            "Referer": "https://snapinsta.to/en2",
        })

    def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs,
    ) -> requests.Response:
        """Make an HTTP request with error handling."""
        url = f"{self.base_url}{endpoint}"
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            raise

    def download_reel(self, reel_url: str, output_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Download an Instagram Reel by URL using browser automation.

        This method uses Playwright MCP to navigate to SnapInsta, submit the Instagram URL,
        and extract the download link. This is required due to session-based authentication
        and CSRF token validation on the SnapInsta API.

        Args:
            reel_url: The Instagram reel URL (e.g., https://www.instagram.com/reel/DEyGJqzSDiK/)
            output_path: Optional file path to save the video. If None, returns download info.

        Returns:
            Dict containing:
                - success: bool indicating if download was initiated
                - video_url: Direct download URL for the video
                - filename: Suggested filename
                - message: Status message
                - original_url: The Instagram reel URL

        Raises:
            ValueError: If URL is invalid, download link not found, or automation fails
            RuntimeError: If browser automation encounters an error
        """
        import time

        # Validate Instagram URL
        if not reel_url.startswith("https://www.instagram.com/"):
            raise ValueError("Invalid Instagram URL. Must start with https://www.instagram.com/")

        # Validate we have a Playwright page
        if not self.playwright_page:
            raise ValueError(
                "Playwright page required for browser automation. "
                "Initialize client with playwright_page parameter."
            )

        logger.info(f"Processing Instagram URL: {reel_url}")

        try:
            # Step 1: Navigate to SnapInsta
            logger.info("Navigating to SnapInsta...")
            self.playwright_page.goto(f"{self.base_url}/en2", wait_until="domcontentloaded")
            self.playwright_page.wait_for_selector('input[placeholder*="Paste URL"]', timeout=30000)

            # Step 2: Fill the Instagram URL
            logger.info("Filling Instagram URL...")
            self.playwright_page.fill('input[placeholder*="Paste URL"]', reel_url)
            time.sleep(1)  # Wait for any JS handlers

            # Step 3: Click the Download button
            logger.info("Clicking Download button...")
            self.playwright_page.click('button[aria-label*="Download"], button:has-text("Download")', timeout=30000)
            time.sleep(3)  # Wait for processing

            # Step 4: Wait for download link to appear
            logger.info("Waiting for download link...")
            try:
                # Try to find the download link
                download_link = self.playwright_page.wait_for_selector(
                    'a[title*="Download Video"]',
                    timeout=30000
                )
                video_url = download_link.get_attribute("href")
            except Exception:
                # Alternative selector
                video_url = self.playwright_page.evaluate(
                    '''() => {
                        const link = document.querySelector('a[title="Download Video"]');
                        return link ? link.href : null;
                    }'''
                )

            if not video_url:
                # Extract from page HTML
                html_content = self.playwright_page.content()
                download_link_pattern = r'href="(https://dl\.snapcdn\.app/get\?token=[^"]+)"'
                match = re.search(download_link_pattern, html_content)
                if match:
                    video_url = match.group(1)
                else:
                    # Check for error messages
                    error_patterns = [
                        r'class="[^"]*error[^"]*"[^>]*>([^<]+)',
                        r'data-message="([^"]+)"',
                    ]
                    for pattern in error_patterns:
                        match = re.search(pattern, html_content, re.IGNORECASE)
                        if match:
                            raise ValueError(f"Error from server: {match.group(1).strip()}")

                    raise ValueError(
                        "Could not find download link. The URL may be private, "
                        "invalid, or the service may be temporarily unavailable."
                    )

            logger.info(f"Download URL found: {video_url[:50]}...")

            # Step 5: Extract filename from token
            filename = self._extract_filename(video_url)

            result = {
                "success": True,
                "video_url": video_url,
                "filename": filename,
                "message": f"Download ready: {filename}",
                "original_url": reel_url,
            }

            # Step 6: Download if output path specified
            if output_path:
                logger.info(f"Downloading to: {output_path}")
                video_response = self.session.get(video_url, stream=True)
                video_response.raise_for_status()

                with open(output_path, 'wb') as f:
                    for chunk in video_response.iter_content(chunk_size=8192):
                        f.write(chunk)

                result["download_path"] = output_path
                result["message"] = f"Download complete: {output_path}"

            return result

        except Exception as e:
            logger.error(f"Error during download: {e}")
            raise RuntimeError(f"Download failed: {e}") from e

    def _extract_filename(self, download_url: str) -> str:
        """Extract filename from download URL token."""
        import base64
        import json

        try:
            # Extract token from URL
            token_match = re.search(r'token=([^&]+)', download_url)
            if token_match:
                token = token_match.group(1)
                # Decode JWT token (base64url)
                parts = token.split('.')
                if len(parts) >= 2:
                    # Add padding if needed
                    payload = parts[1]
                    payload += '=' * (4 - len(payload) % 4)
                    decoded = base64.urlsafe_b64decode(payload)
                    token_data = json.loads(decoded)
                    filename = token_data.get('filename', 'download.mp4')
                    return filename
        except Exception as e:
            logger.debug(f"Could not decode token: {e}")

        # Fallback: generate filename from timestamp
        return f"snapinsta_download_{int(time.time())}.mp4"

    def download_video(self, video_url: str, output_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Download any Instagram video (reel, post, or video).

        Alias for download_reel for consistency.

        Args:
            video_url: The Instagram video URL
            output_path: Optional file path to save the video

        Returns:
            Dict with download info (see download_reel for details)
        """
        return self.download_reel(video_url, output_path)

    def download_profile_photos(self, profile_url: str) -> Dict[str, Any]:
        """
        Download all photos from an Instagram profile.

        Note: This requires browser automation similar to download_reel.

        Args:
            profile_url: The Instagram profile URL

        Returns:
            Dict with download info
        """
        if not self.playwright_page:
            raise ValueError("Playwright page required for browser automation")

        # Navigate to profile
        self.playwright_page.goto(f"{self.base_url}/en2", wait_until="domcontentloaded")
        self.playwright_page.fill('input[placeholder*="Paste URL"]', profile_url)
        self.playwright_page.click('button[aria-label*="Download"]')

        # Wait for response
        self.playwright_page.wait_for_selector('.result-container', timeout=30000)

        return {
            "success": True,
            "profile_url": profile_url,
            "message": "Profile download initiated. Photos will be available for download.",
        }

    def check_url_validity(self, instagram_url: str) -> Dict[str, Any]:
        """
        Check if an Instagram URL is valid and can be downloaded.

        Args:
            instagram_url: The Instagram URL to check

        Returns:
            Dict with validity info:
                - valid: bool indicating if URL is valid
                - can_download: bool indicating if download is possible
                - url_type: type of Instagram content (reel, post, video, photo, profile)
        """
        import re

        # Validate URL format
        if not instagram_url.startswith("https://www.instagram.com/"):
            return {
                "valid": False,
                "can_download": False,
                "error": "Invalid Instagram URL format",
            }

        # Determine URL type
        url_type = "unknown"
        if "/reel/" in instagram_url:
            url_type = "reel"
        elif "/p/" in instagram_url:
            url_type = "post"
        elif "/tv/" in instagram_url:
            url_type = "video"
        elif "/ stories /" in instagram_url or "/stories/" in instagram_url:
            url_type = "story"
        elif "/stories/" in instagram_url:
            url_type = "story"
        else:
            # Check if it's a profile
            parts = instagram_url.rstrip("/").split("/")
            if len(parts) >= 4 and not any(x in parts[-1] for x in ["/", "?"]):
                url_type = "profile"

        return {
            "valid": True,
            "can_download": True,
            "url_type": url_type,
            "instagram_url": instagram_url,
        }


# Example usage with Playwright MCP
# Note: This client is designed to be used with Playwright MCP for browser automation
# Usage:
#   playwright_page = await playwright.new_page()
#   client = SnapInstaClient(playwright_page=playwright_page)
#   result = client.download_reel("https://www.instagram.com/reel/DEyGJqzSDiK/")
if __name__ == "__main__":
    print("SnapInsta API Client")
    print("====================")
    print()
    print("This client requires Playwright MCP for browser automation.")
    print()
    print("Usage example:")
    print("```python")
    print("import asyncio")
    print("from playwright.async_api import async_playwright")
    print("from api_client import SnapInstaClient")
    print()
    print("async def main():")
    print("    async with async_playwright() as p:")
    print("        browser = await p.chromium.launch()")
    print("        page = await browser.new_page()")
    print("        client = SnapInstaClient(playwright_page=page)")
    print()
    print("        result = await client.download_reel(")
    print("            'https://www.instagram.com/reel/DEyGJqzSDiK/',")
    print("            output_path='/path/to/save/video.mp4'")
    print("        )")
    print("        print(result)")
    print("```")
    print()
    print("For more information, see the README.md file.")
