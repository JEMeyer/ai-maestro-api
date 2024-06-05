import { load } from 'cheerio';
import { writeFileSync } from 'fs';

const scrapeOllamaModels = async () => {
  try {
    // Fetch the HTML content of the Ollama library page
    const response = await fetch('https://ollama.com/library');

    if (response.ok) {
      const htmlContent = await response.text();
      // Load the HTML content into Cheerio
      const $ = load(htmlContent);

      // Define an array to hold the model information
      const modelNames: string[] = [];

      // Select the elements that contain the model information
      $('li.flex.items-baseline.border-b.border-neutral-200.py-6').each(
        (index, element) => {
          const name = $(element).find('h2 > span').text().trim();

          // Push the model name to the array - archived one we want to omit so just make sure no spaces
          if (!name.includes(' ')) modelNames.push(name);
        }
      );

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().slice(0, 10);

      // Generate the filename with today's date
      const filename = `modelNames_${today}.json`;

      // Write the modelNames array to a JSON file
      writeFileSync(filename, JSON.stringify(modelNames, null, 2));
      console.log(`Saved ${modelNames.length} model names to ${filename}`);
    } else {
      throw new Error('Failed to fetch the model data.');
    }
  } catch (error) {
    console.error('Error fetching or parsing the Ollama library page:', error);
  }
};

scrapeOllamaModels();
