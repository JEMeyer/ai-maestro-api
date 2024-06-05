import { load } from 'cheerio';
import { writeFileSync } from 'fs';

const modelNames = []; // Put any models missing sizes here

const scrapeModelSize = async (modelName: string) => {
  try {
    // Fetch the HTML content of the model page
    const response = await fetch(`https://ollama.com/library/${modelName}`);
    if (response.ok) {
      const htmlContent = await response.text();
      const $ = load(htmlContent);

      // Define a variable to hold the model size
      let modelSize = 0;

      // Select the element that contains the model size
      const sizeText = $(
        '.px-4.py-3.bg-neutral-50.flex.justify-between.items-center.text-xs.text-neutral-900 p'
      )
        .last()
        .text()
        .trim();

      // Extract the size value and convert to GB if necessary
      const sizeMatch = sizeText.match(/(\d+(\.\d+)?)(GB|MB)/);
      if (sizeMatch) {
        const sizeValue = parseFloat(sizeMatch[1]);
        const sizeUnit = sizeMatch[3];
        modelSize = sizeUnit === 'GB' ? sizeValue : sizeValue / 1000;
      }

      return { modelName, modelSize };
    } else {
      throw new Error('Failed to fetch the model data.');
    }
  } catch (error) {
    console.error(
      `Error fetching or parsing the page for model ${modelName}:`,
      error
    );
    return { modelName, modelSize: 0 };
  }
};

const scrapeAllModelSizes = async () => {
  const results: { modelName: string; modelSize: number }[] = [];
  for (const modelName of modelNames) {
    const result = await scrapeModelSize(modelName);
    results.push(result);
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(0, 10);

  // Generate the filename with today's date
  const filename = `modelsWithSizes_${today}.json`;

  // Write the results to a JSON file
  writeFileSync(filename, JSON.stringify(results, null, 2));
  console.log(`Saved model sizes to ${filename}`);
};

// Run the function
scrapeAllModelSizes();
