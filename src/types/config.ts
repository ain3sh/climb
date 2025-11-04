/**
 * JungleCTL Configuration Types
 */

export interface AppConfig {
  registryUrl: string;
  cacheTTL: {
    servers: number;
    tools: number;
    groups: number;
    prompts: number;
  };
  theme: {
    primaryColor: 'blue' | 'green' | 'cyan' | 'magenta' | 'yellow';
    enableColors: boolean;
  };
  experimental: {
    enableSseSupport: boolean;
  };
}

export const DEFAULT_CONFIG: AppConfig = {
  registryUrl: 'http://127.0.0.1:8080',
  cacheTTL: {
    servers: 60000, // 60 seconds
    tools: 30000, // 30 seconds
    groups: 60000,
    prompts: 60000,
  },
  theme: {
    primaryColor: 'cyan',
    enableColors: true,
  },
  experimental: {
    enableSseSupport: false,
  },
};
