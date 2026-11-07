# dns-cache-resolver

**dns-cache-resolver** is a lightweight, performant DNS caching library for Node.js, designed with TypeScript for robust and type-safe applications. 🚀

## Why Use dns-cache-resolver? 🧐

- **Boost Performance**: Reduce repetitive DNS lookups with in-memory caching.
- **Customizable**: Configure cache behavior with flexible TTL and size options.
- **TypeScript First**: Enjoy the benefits of type safety and IDE autocompletion.
- **Plug-and-Play**: Simple to integrate into existing applications.

## Features ✨

- **Configurable TTL** 🕒: Set the time-to-live for cache entries.
- **Maximum Entries** 📦: Control the number of entries in the cache.
- **In-Memory Caching** 🧠: Speed up DNS resolutions with fast, local cache storage.
- **IPv4 and IPv6 Support** 🌍: Resolve addresses for both address families.
- **Timeout Handling** ⏱️: Avoid slow lookups with built-in resolution timeouts.

## Installation ⚙️

Install via npm:

```bash
npm install dns-cache-resolver
```

## Usage 📘

Here’s a quick example:

```typescript
import { DnsCache } from 'dns-cache-resolver';

// Initialize the DNS cache
const dnsCache = new DnsCache({
  ttl: 60000, // Cache entries live for 60 seconds
  maxEntries: 100, // Maximum of 100 cache entries
});

// Resolve a hostname and cache the result
const ip = await dnsCache.resolve('example.com');
console.log(`IP Address: ${ip}`);
```

## Configuration Options 🛠️

| Option      | Type    | Default | Description                                              |
|-------------|---------|---------|----------------------------------------------------------|
| `ttl`       | number  | 60000   | Time-to-live for cache entries in milliseconds.          |
| `maxEntries`| number  | 1000    | Maximum number of entries allowed in the cache.          |

## Examples 💡

### Basic Usage

```typescript
import { DnsCache } from 'dns-cache-resolver';

const dnsCache = new DnsCache({
  ttl: 30000, // 30 seconds TTL
  maxEntries: 50, // Limit to 50 cache entries
});

async function getIp(hostname: string) {
  try {
    const ip = await dnsCache.resolve(hostname);
    console.log(`Resolved IP for ${hostname}: ${ip}`);
  } catch (error) {
    console.error(`Error resolving ${hostname}:`, error.message);
  }
}

getIp('example.com');
getIp('nodejs.org');
```

### IPv4 and IPv6 Support

```typescript
const ipV4 = await dnsCache.resolve('example.com', 4); // IPv4
console.log(`IPv4: ${ipV4}`);

const ipV6 = await dnsCache.resolve('example.com', 6); // IPv6
console.log(`IPv6: ${ipV6}`);
```

### Integrating with Axios 🌐

You can use `dns-cache-resolver` with Axios by plugging the cache into the
agent's `lookup` function. This keeps TLS (SNI) and the `Host` header intact —
do NOT rewrite the URL hostname with the resolved IP:

```typescript
import axios from 'axios';
import * as https from 'https';
import { DnsCache } from 'dns-cache-resolver';

const dnsCache = new DnsCache({
  ttl: 30000,
  maxEntries: 100,
});

// Create an Axios instance with a cache-backed lookup
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    lookup: (hostname, options, callback) => {
      dnsCache
        .resolve(hostname)
        .then(address => callback(null, address, 4))
        .catch(callback);
    },
  }),
});

// Make a request
axiosInstance
  .get('https://example.com/api/data')
  .then(response => console.log('Response:', response.data))
  .catch(error => console.error('Error:', error.message));
```

### Clearing Cache

```typescript
dnsCache.clear(); // Remove all cached entries
dnsCache.remove('example.com', 4); // Remove specific entry for IPv4
```

### Listing Cache Entries

```typescript
const entries = dnsCache.list();
entries.forEach(([key, value]) => {
  console.log(`Key: ${key}, Address: ${value.address}, Expires At: ${value.expiresAt}`);
});
```

## Contributing 🤝

We’re excited to have your contributions! Whether it’s fixing bugs, adding features, or improving documentation, feel free to open issues or submit pull requests on [GitHub](https://github.com/alesima/dns-cache-resolver).

### How to Contribute

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License 📄

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact 📬

For questions, feedback, or suggestions, reach out to **[Alex Silva](mailto:hi@alexsilvas.com)**.

## Acknowledgements 🙏

A huge thanks to our contributors and users for their continuous support and feedback!
