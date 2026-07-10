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

For rapid iteration with the library, add the following to `package.json`
```json
 "ng-hpo-uikit": "file:../ng-hpo-uikit/dist/ng-hpo-uikit"
```
otherwise use

```json
  "ng-hpo-uikit": "github:P2GX/ng-hpo-uikit#dist-build",
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


## release




Add and commit the latest release
Push a tag

```bash
git tag v0.3.7 
git push origin v0.3.7