# GitHub Actions Workflow Setup Instructions

Due to GitHub App permission restrictions, the workflow files need to be added manually. Follow these steps to enable automated builds and releases.

## Quick Setup

### Option 1: Using the Provided Archive

1. Download `github-workflows.zip` from this directory
2. Extract the archive
3. Copy the extracted files to your local repository:
   ```bash
   # Extract the archive
   unzip github-workflows.zip
   
   # The files will be extracted to:
   # - .github/workflows/release.yml
   # - .github/workflows/ci.yml
   # - RELEASE.md
   # - CHANGELOG.md
   ```

4. Commit and push the files:
   ```bash
   git add .github/ RELEASE.md CHANGELOG.md
   git commit -m "Add GitHub Actions workflows for CI/CD"
   git push origin master
   ```

### Option 2: Manual File Creation

Create the following files in your repository:

#### 1. `.github/workflows/release.yml`

Location: `.github/workflows/release.yml`

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  build:
    name: Build ${{ matrix.os }}
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Electron app
        run: npm run build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: release-${{ matrix.os }}
          path: release/*
          retention-days: 5

  release:
    name: Create Release
    needs: build
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: artifacts
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          name: Release ${{ github.ref_name }}
          draft: false
          prerelease: false
          files: artifacts/**/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 2. `.github/workflows/ci.yml`

Location: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [master, main]
  pull_request:
    branches: [master, main]

jobs:
  test:
    name: Test on ${{ matrix.os }}
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
        node-version: [18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Build project
        run: npm run build:vite
```

#### 3. Copy RELEASE.md and CHANGELOG.md

Copy the `RELEASE.md` and `CHANGELOG.md` files from the archive or create them manually.

## Testing the Workflow

After adding the workflow files:

1. **Test CI Workflow**: Push a commit to master
   ```bash
   git add .
   git commit -m "Test CI workflow"
   git push origin master
   ```
   
   Check: https://github.com/drzo/bolt-llama-electron/actions

2. **Test Release Workflow**: Create and push a tag
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   
   This will trigger a full build for all platforms and create a GitHub Release.

## Creating Your First Release

Once the workflows are set up:

1. Update version in `package.json`:
   ```json
   {
     "version": "1.0.0"
   }
   ```

2. Update `CHANGELOG.md` with release notes

3. Commit changes:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Bump version to 1.0.0"
   git push origin master
   ```

4. Create and push tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

5. Monitor the build:
   - Go to: https://github.com/drzo/bolt-llama-electron/actions
   - Wait for all builds to complete (~10-15 minutes)
   - Check the Releases page for the new release

## Expected Build Artifacts

After a successful release build, you'll have:

- **macOS**: `.dmg` and `.zip` files
- **Linux**: `.AppImage` and `.deb` files  
- **Windows**: `.exe` installer

All artifacts will be automatically attached to the GitHub Release.

## Troubleshooting

### Workflow doesn't trigger
- Verify the workflow files are in `.github/workflows/`
- Check that you pushed the tag: `git push origin v1.0.0`
- Ensure the tag matches the pattern `v*.*.*`

### Build fails
- Check the Actions logs for errors
- Verify all dependencies are in `package.json`
- Test the build locally: `npm run build`

### No artifacts in release
- Check that the build jobs completed successfully
- Verify the artifact paths in the workflow match your build output
- Check the `release/` directory structure

## Alternative: Manual Build and Release

If you prefer not to use GitHub Actions:

1. Build locally for each platform
2. Create a GitHub Release manually
3. Upload the installers

See `RELEASE.md` for detailed manual release instructions.

---

**Need Help?**

- Check existing issues: https://github.com/drzo/bolt-llama-electron/issues
- Create a new issue with your question
- Include workflow logs if applicable
