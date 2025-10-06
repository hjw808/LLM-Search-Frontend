import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import yaml from 'js-yaml';

interface BusinessConfig {
  name: string;
  url: string;
  location: string;
  aliases: string[];
  queries: {
    consumer: number;
    business: number;
  };
}

const CONFIG_PATH = join(process.cwd(), '..', 'ai-visibility-tester', 'config.yaml');
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET() {
  // If backend URL is set, use external backend (production mode)
  if (BACKEND_URL) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/config`);

      if (!response.ok) {
        throw new Error('Failed to fetch config from backend');
      }

      const config = await response.json();
      return NextResponse.json(config);
    } catch (error) {
      console.error('Error fetching config from backend:', error);
      return NextResponse.json(
        { error: 'Failed to read configuration' },
        { status: 500 }
      );
    }
  }

  // Local development mode - read from file system
  try {
    const configData = await readFile(CONFIG_PATH, 'utf-8');
    const config = yaml.load(configData) as Record<string, unknown>;

    const businessConfig: BusinessConfig = {
      name: (config.business_name as string) || '',
      url: (config.business_url as string) || '',
      location: (config.business_location as string) || 'Australia',
      aliases: (config.business_aliases as string[]) || [],
      queries: {
        consumer: (config.num_consumer_queries as number) || 10,
        business: (config.num_business_queries as number) || 10
      }
    };

    return NextResponse.json(businessConfig);
  } catch (error) {
    console.error('Error reading config:', error);
    return NextResponse.json(
      { error: 'Failed to read configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const businessConfig: BusinessConfig = await request.json();

  // If backend URL is set, use external backend (production mode)
  if (BACKEND_URL) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to save config to backend');
      }

      const result = await response.json();
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error saving config to backend:', error);
      return NextResponse.json(
        { error: 'Failed to save configuration' },
        { status: 500 }
      );
    }
  }

  // Local development mode - write to file system
  try {
    const yamlConfig = {
      business_name: businessConfig.name,
      business_url: businessConfig.url,
      business_location: businessConfig.location,
      business_aliases: businessConfig.aliases,
      num_consumer_queries: businessConfig.queries.consumer,
      num_business_queries: businessConfig.queries.business
    };

    const yamlString = yaml.dump(yamlConfig, {
      indent: 2,
      lineWidth: -1
    });

    await writeFile(CONFIG_PATH, yamlString, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}