# dns-cache-resolver

Welcome to **dns-cache**—a cutting-edge, lightweight DNS cache for Node.js, meticulously crafted in TypeScript. 🚀

## Features ✨

- **Configurable TTL** 🕒: Tailor the time-to-live (TTL) for cached entries, ensuring optimal freshness.
- **Maximum Entries** 📦: Control the cache size by setting a limit on the number of entries.
- **In-Memory DNS Resolution Caching** 🧠: Boost performance with swift, in-memory DNS lookups.
- **TypeScript Support** 💻: Enjoy type safety and predictability with full TypeScript support.

## Installation ⚙️

Install via npm with ease:

```bash
npm install dns-cache-resolver
```

## Usage 📘

Get started quickly with this example:

```typescript
import { DnsCache } from 'dns-cache';

const dnsCache = new DnsCache({
  ttl: 600, // Cache entries live for 600 seconds
  maxEntries: 100, // Maximum of 100 entries in the cache
});

// Lookup DNS and cache the result
const ip = await dnsCache.resolve('example.com');
console.log(`IP Address: ${ip}`);
```

## Configuration Options 🛠️

- `ttl` (number): Time-to-live for each cache entry in seconds.
- `maxEntries` (number): Maximum number of entries allowed in the cache.

## Example Usage 💡

Here's a more detailed example to illustrate how you can integrate `dns-cache` into your Node.js project:

```typescript
import { DnsCache } from 'dns-cache';

// Initialize the DNS cache with custom settings
const dnsCache = new DnsCache({
  ttl: 300, // Cache TTL set to 300 seconds
  maxEntries: 50, // Maximum cache entries set to 50
});

// Function to resolve DNS and utilize caching
async function getIpAddress(hostname: string) {
  try {
    const ip = await dnsCache.resolve(hostname);
    console.log(`IP address for ${hostname}: ${ip}`);
  } catch (error) {
    console.error(`Failed to resolve DNS for ${hostname}:`, error);
  }
}

// Example usage
getIpAddress('example.com');
getIpAddress('nodejs.org');
getIpAddress('github.com');
```

## Integrating with Axios Interceptor 🌐

To integrate `dns-cache` with an Axios interceptor, follow this example:

```typescript
import axios from 'axios';
import { DnsCache } from 'dns-cache';

// Initialize the DNS cache with custom settings
const dnsCache = new DnsCache({
  ttl: 300, // Cache TTL set to 300 seconds
  maxEntries: 50, // Maximum cache entries set to 50
});

// Create an Axios instance
const axiosInstance = axios.create();

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async config => {
    // Extract hostname from the URL
    const url = new URL(config.url || '');
    const hostname = url.hostname;

    try {
      // Lookup DNS and cache the result
      const ip = await dnsCache.resolve(hostname);
      // Replace hostname with IP address in the request URL
      config.url = config.url.replace(hostname, ip);
    } catch (error) {
      console.error(`Failed to resolve DNS for ${hostname}:`, error);
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Example request using the Axios instance
axiosInstance
  .get('https://example.com/api/data')
  .then(response => {
    console.log('Data:', response.data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
```

## Contributing 🤝

We welcome and appreciate your contributions! Feel free to open issues or submit pull requests on [GitHub](https://github.com/alesima/dns-cache-resolver).

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact 📬

Questions or feedback? Reach out to us at [alex@codingwithalex.com](mailto:alex@codingwithalex.com).

## Acknowledgements 🙏

A huge thanks to our contributors and users for their invaluable support and feedback!
