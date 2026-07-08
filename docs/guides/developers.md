# Developers





## Compiling with ng-hpo-uikit

To guarantee a new build with the latest version, go to the `ng-hpo-uikit` repository and build

```bash
npm run build
```

Now ensure we are using this latest version
```bash
npm install ng-hpo-uikit@file:../ng-hpo-uikit/dist/ng-hpo-uikit/ --force
```


## storybook

Installed like this
```bash
npx nx g @nx/angular:storybook-configuration --project=ngx-phenoprofile
```
Running storybook (production build )
```bash
npx nx run ngx-phenoprofile:build-storybook
```
(interactive)
```bash
# rm -rf dist (if needed)
npx nx run ngx-phenoprofile:storybook
```
