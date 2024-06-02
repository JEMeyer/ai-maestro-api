import axios from 'axios';
import { load } from 'cheerio';
import { v4 as uuidv4 } from 'uuid';

export const generateUUID = () => {
  return uuidv4();
};

export const scrapeOllamaModels = async () => {
  try {
    // Fetch the HTML content of the Ollama library page
    const { data } = await axios.get('https://ollama.com/library');

    // Load the HTML content into Cheerio
    const $ = load(data);

    // Define an array to hold the model information
    const models: { name: string; size: string }[] = [];

    // Select the elements that contain the model information
    $('.flex.items-baseline.border-b.border-neutral-200.py-6').each(
      (index, element) => {
        const name = $(element)
          .find(
            '.flex.items-center.mb-3.truncate.text-lg.font-medium.underline-offset-2.group-hover:underline.md:text-2xl span'
          )
          .text()
          .trim();
        const size = $(element)
          .find(
            '.inline-flex.items-center.rounded-md.bg-[#ddf4ff].px-2.py-[2px].text-xs.sm:text-[13px].font-medium.text-blue-600'
          )
          .text()
          .trim();

        // Push the model information to the array
        models.push({ name, size });
      }
    );

    // Log the list of models
    console.log(models);
  } catch (error) {
    console.error('Error fetching or parsing the Ollama library page:', error);
  }
};
