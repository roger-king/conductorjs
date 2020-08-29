# Still in Development

# Conductor

An extension of slack bolt-js framework to help manage your sessions, installations, conversations, and channel event routing.

## Development

```bash
    yarn install
    yarn link

    # starts a tsc -w
    yarn dev

```

## Usage

```javascript        
        const receiver = new ExpressReceiver({ signingSecret: slackConfig.signingSecret });
        const router = receiver.router;
        
        const c = new Conductor({
            host: '127.0.0.1',
            router: router
        });
        
        this.app = new SlackApp({
            signingSecret: slackConfig.signingSecret,
            clientId: slackConfig.clientId,
            clientSecret: slackConfig.clientSecret,
            // stateSecret: 'super-duper-secret',
            scopes: slackConfig.scopes,
            // authorize: lb.authorize,
            // In your app instance
            installationStore: {
                storeInstallation: async (installation) => {
                    return await c.saveInstallation(installation.team.id, installation);
                },
                fetchInstallation: async (InstallQuery) => {
                    return await c.fetchInstallation(InstallQuery.teamId);
                },
            },
            receiver,
        });

        this.app.error(lb.handleError);
        this.app.use((args) => c.listen({ ...args }));
        this.app.use((args) => c.shouldProcess({ ...args }));
```
