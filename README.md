# Still in Development

# lightning-bolt-js

A middleware for slack bolt-js framework to help manage your sessions and installations

## Development

```bash
    yarn install
    yarn link

    # starts a tsc -w
    yarn dev


```

## Usage

```javascript
    // In your app instance
    installationStore: {
        storeInstallation: async (installation) => {
            return await lb.saveInstallation(installation.team.id, installation);
        },
        fetchInstallation: async (InstallQuery) => {
            return await lb.fetchInstallation(InstallQuery.teamId);
        },
    },

    .
    .
    .
    // Adds additional information to your context
    this.app.use((args) => lb.listen({ ...args }));
```
