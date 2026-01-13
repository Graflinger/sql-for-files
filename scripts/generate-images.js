#!/usr/bin/env node

/**
 * Social Media Image Generator
 *
 * Generates 3 social media images for SQL for Files:
 * 1. og-image.png (1200×630px) - For Facebook, LinkedIn, Slack, Discord
 * 2. twitter-image.png (1200×600px) - For Twitter/X
 * 3. screenshot.png (1280×720px) - App screenshot for directories
 *
 * Usage: node scripts/generate-images.js
 */

import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Image configurations
const images = [
  {
    name: "og-image",
    template: join(__dirname, "templates", "og-image.html"),
    output: join(projectRoot, "public", "og-image.png"),
    width: 1200,
    height: 630,
    description: "Open Graph image for Facebook, LinkedIn, Slack",
  },
  {
    name: "twitter-image",
    template: join(__dirname, "templates", "og-image.html"),
    output: join(projectRoot, "public", "twitter-image.png"),
    width: 1200,
    height: 600,
    description: "Twitter/X card image",
  },
];

async function generateImage(config) {
  console.log(`\n📸 Generating ${config.name}...`);
  console.log(`   Template: ${config.template}`);
  console.log(`   Size: ${config.width}×${config.height}px`);

  // Check if template exists
  if (!existsSync(config.template)) {
    throw new Error(`Template not found: ${config.template}`);
  }

  // Launch headless browser
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set viewport to exact dimensions
    await page.setViewport({
      width: config.width,
      height: config.height,
      deviceScaleFactor: 2, // 2x for retina displays (sharper images)
    });

    // Load the HTML template
    const templateUrl = `file://${config.template}`;
    await page.goto(templateUrl, {
      waitUntil: "networkidle0", // Wait for all resources to load
    });

    // Give fonts time to load
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Take screenshot
    await page.screenshot({
      path: config.output,
      type: "png",
      omitBackground: false,
    });

    console.log(`   ✅ Saved to: ${config.output}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log("🚀 SQL for Files - Social Media Image Generator\n");
  console.log(
    "Generating 2 images for Product Hunt, Twitter, and social sharing..."
  );

  const startTime = Date.now();

  try {
    // Generate all images sequentially
    for (const config of images) {
      await generateImage(config);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("\n✅ All images generated successfully!");
    console.log(`⏱️  Total time: ${duration}s\n`);

    console.log("📋 Next steps:");
    console.log("   1. Check /public folder for generated images");
    console.log("   2. Test with validators:");
    console.log(
      "      - Facebook: https://developers.facebook.com/tools/debug/"
    );
    console.log("      - Twitter: https://cards-dev.twitter.com/validator");
  } catch (error) {
    console.error("\n❌ Error generating images:", error.message);
    process.exit(1);
  }
}

main();
